"""
SmartPresence AI Service
FastAPI + ageitgey/face_recognition
Handles:
  POST /register-face      — Store face encodings for a student
  POST /recognize-classroom — Detect faces in a group photo, match against known students
"""

import io
import json
import base64
import logging
from typing import List, Optional

import face_recognition
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SmartPresence AI Service",
    description="Real face recognition for college attendance using ageitgey/face_recognition",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def load_image_from_bytes(data: bytes) -> np.ndarray:
    """Convert raw image bytes → RGB numpy array."""
    pil_img = Image.open(io.BytesIO(data)).convert("RGB")
    return np.array(pil_img)


def encoding_to_list(enc: np.ndarray) -> List[float]:
    """Convert numpy encoding to plain Python list for JSON."""
    return enc.tolist()


def list_to_encoding(lst: List[float]) -> np.ndarray:
    """Convert a plain list back to numpy encoding."""
    return np.array(lst, dtype=np.float64)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "ok", "service": "SmartPresence AI Service", "version": "1.0.0"}


@app.post("/register-face")
async def register_face(
    studentId: str = Form(...),
    photo: UploadFile = File(...),
):
    """
    Extract a 128-d face encoding from a single uploaded photo.
    Returns the encoding as a JSON list to be stored in MongoDB by the Node backend.

    Request (multipart/form-data):
      studentId: string
      photo: image file

    Response:
      { "studentId": str, "encoding": [float x 128] }
    """
    try:
        image_bytes = await photo.read()
        rgb_image = load_image_from_bytes(image_bytes)

        encodings = face_recognition.face_encodings(rgb_image)

        if len(encodings) == 0:
            raise HTTPException(
                status_code=422,
                detail="No face detected in the uploaded photo. Please use a clear, well-lit portrait."
            )

        if len(encodings) > 1:
            logger.warning(f"register-face: {len(encodings)} faces found for student {studentId}, using largest/first.")

        # Use the first (best) encoding
        encoding = encoding_to_list(encodings[0])

        logger.info(f"register-face: Encoding generated for student {studentId}")
        return {"studentId": studentId, "encoding": encoding}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"register-face error: {e}")
        raise HTTPException(status_code=500, detail=f"Face encoding failed: {str(e)}")


@app.post("/recognize-classroom")
async def recognize_classroom(
    classroomId: str = Form(...),
    students: str = Form(...),        # JSON: [{ studentId, name, encodings: [[...], ...] }]
    photo: UploadFile = File(...),
):
    """
    Detect all faces in a classroom group photo and match them against
    the stored encodings of enrolled students.

    Request (multipart/form-data):
      classroomId: string
      students:    JSON string — array of enrolled student objects
                   Each: { studentId, name, rollNumber, encodings: [[128 floats], ...] }
      photo:       classroom group image

    Response:
      {
        "classroomId": str,
        "facesDetected": int,
        "results": [
          {
            "studentId": str,
            "name": str,
            "rollNumber": str,
            "status": "present" | "absent",
            "confidence": float | null    (% similarity, null if absent)
          }
        ],
        "unknownFaces": int
      }
    """
    try:
        # ── 1. Parse enrolled students ────────────────────────────────────────
        try:
            enrolled = json.loads(students)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=422, detail=f"Invalid students JSON: {e}")

        if not enrolled:
            raise HTTPException(status_code=422, detail="No enrolled students provided.")

        # ── 2. Load group photo ───────────────────────────────────────────────
        image_bytes = await photo.read()
        rgb_image = load_image_from_bytes(image_bytes)

        logger.info(f"recognize-classroom: Processing photo for classroom {classroomId}, "
                    f"{len(enrolled)} enrolled students")

        # ── 3. Detect all face locations & encodings in classroom photo ───────
        # Use CNN model for accuracy, HOG is faster — default HOG for now
        face_locations = face_recognition.face_locations(rgb_image, model="hog")
        face_encodings_in_photo = face_recognition.face_encodings(rgb_image, face_locations)

        num_faces = len(face_encodings_in_photo)
        logger.info(f"recognize-classroom: Detected {num_faces} face(s) in classroom photo")

        # ── 4. Build known encodings for each enrolled student ────────────────
        #   Each student may have multiple registered encodings (3-5 samples)
        #   We'll try to match each detected face against all known encodings.

        # Convert stored lists → numpy arrays
        known_students = []
        for s in enrolled:
            raw_encs = s.get("encodings", [])
            if not raw_encs:
                # No encoding stored for this student → treat as absent
                known_students.append({
                    "studentId": s["studentId"],
                    "name": s.get("name", "Unknown"),
                    "rollNumber": s.get("rollNumber", ""),
                    "encodings": [],
                    "matched": False,
                    "confidence": None,
                })
                continue

            np_encs = [list_to_encoding(enc) for enc in raw_encs]
            known_students.append({
                "studentId": s["studentId"],
                "name": s.get("name", "Unknown"),
                "rollNumber": s.get("rollNumber", ""),
                "encodings": np_encs,
                "matched": False,
                "confidence": None,
            })

        # ── 5. Match each detected face against enrolled students ─────────────
        TOLERANCE = 0.50  # Lower = stricter match (0.6 is face_recognition default)
        unknown_face_count = 0

        for face_enc in face_encodings_in_photo:
            best_student_idx = None
            best_distance = 1.0  # Max possible L2 distance

            for idx, student in enumerate(known_students):
                if not student["encodings"]:
                    continue

                # Compare against all stored samples; take the minimum distance
                distances = face_recognition.face_distance(student["encodings"], face_enc)
                min_dist = float(np.min(distances))

                if min_dist < TOLERANCE and min_dist < best_distance:
                    best_distance = min_dist
                    best_student_idx = idx

            if best_student_idx is not None:
                # Mark this student as present (don't override if already matched)
                if not known_students[best_student_idx]["matched"]:
                    confidence = round((1.0 - best_distance) * 100, 1)
                    known_students[best_student_idx]["matched"] = True
                    known_students[best_student_idx]["confidence"] = confidence
                    logger.info(
                        f"  ✓ Matched: {known_students[best_student_idx]['name']} "
                        f"(distance={best_distance:.3f}, confidence={confidence}%)"
                    )
            else:
                unknown_face_count += 1
                logger.info(f"  ? Unknown face (best distance={best_distance:.3f})")

        # ── 6. Build result list ──────────────────────────────────────────────
        results = []
        for s in known_students:
            results.append({
                "studentId": s["studentId"],
                "name": s["name"],
                "rollNumber": s["rollNumber"],
                "status": "present" if s["matched"] else "absent",
                "confidence": s["confidence"],
                "faceRegistered": len(s["encodings"]) > 0,
            })

        present_count = sum(1 for r in results if r["status"] == "present")
        logger.info(
            f"recognize-classroom: {present_count}/{len(enrolled)} students marked present, "
            f"{unknown_face_count} unknown face(s)"
        )

        return {
            "classroomId": classroomId,
            "facesDetected": num_faces,
            "unknownFaces": unknown_face_count,
            "results": results,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"recognize-classroom error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
