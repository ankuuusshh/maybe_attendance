import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  backTo,
  backText = 'Back'
}) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="page-header-left">
        {backTo && (
          <button
            className="page-back-btn"
            onClick={() => (typeof backTo === 'string' ? navigate(backTo) : navigate(-1))}
          >
            <ArrowLeft size={16} />
            <span>{backText}</span>
          </button>
        )}
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge && <span className="page-badge-wrap">{badge}</span>}
        </div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
