import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ status, text, showIcon = true, size = 'md' }) => {
  const normalized = (status || '').toLowerCase();

  let badgeClass = 'badge-neutral';
  let IconComponent = null;
  let label = text || status;

  if (normalized === 'present' || normalized === 'safe' || normalized === 'registered' || normalized === 'completed' || normalized === 'active') {
    badgeClass = 'badge-present';
    IconComponent = CheckCircle2;
  } else if (normalized === 'absent' || normalized === 'low' || normalized === 'not completed' || normalized === 'inactive') {
    badgeClass = 'badge-absent';
    IconComponent = XCircle;
  } else if (normalized === 'warning' || normalized === 'late' || normalized === 'needs review') {
    badgeClass = 'badge-warning';
    IconComponent = AlertTriangle;
  } else if (normalized === 'pending' || normalized === 'upcoming') {
    badgeClass = 'badge-neutral';
    IconComponent = Clock;
  } else if (normalized === 'verified' || normalized === 'high confidence') {
    badgeClass = 'badge-info';
    IconComponent = ShieldCheck;
  }

  return (
    <span className={`badge ${badgeClass} ${size === 'sm' ? 'badge-sm' : ''}`}>
      {showIcon && IconComponent && <IconComponent size={size === 'sm' ? 12 : 14} />}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
