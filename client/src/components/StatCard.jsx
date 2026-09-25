import React from 'react';
import './StatCard.css';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'purple'
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  progress = null,
  onClick
}) => {
  return (
    <div className={`stat-card ${onClick ? 'stat-card-clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-top">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
        </div>
        {Icon && (
          <div className={`stat-card-icon-wrap stat-icon-${color}`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {progress !== null && (
        <div className="stat-progress-bar">
          <div
            className={`stat-progress-fill stat-fill-${color}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-trend stat-trend-${trendType}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
