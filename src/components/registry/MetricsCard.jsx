/**
 * MetricsCard Component
 *
 * Modern metrics display card with status indicators
 * JavaScript version for admin_dashboard
 */

import React from 'react';

const MetricsCard = ({
  icon,
  title,
  value,
  unit,
  status = 'info',
  statusText,
  description,
}) => {
  const statusColors = {
    good: {
      bg: 'bg-success bg-opacity-10',
      border: 'border-success',
      text: 'text-success',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-warning bg-opacity-10',
      border: 'border-warning',
      text: 'text-warning',
      icon: 'text-warning',
    },
    alert: {
      bg: 'bg-danger bg-opacity-10',
      border: 'border-danger',
      text: 'text-danger',
      icon: 'text-danger',
    },
    info: {
      bg: 'bg-info bg-opacity-10',
      border: 'border-info',
      text: 'text-info',
      icon: 'text-info',
    },
  };

  const colors = statusColors[status];

  return (
    <div
      className={`bg-white border ${colors.border} rounded-3 p-4 h-100 shadow-sm`}
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3 flex-fill">
          {icon && (
            <div className={`${colors.bg} p-2 rounded-3`}>
              <div className={colors.icon} style={{ fontSize: '1.25rem' }}>{icon}</div>
            </div>
          )}
          <div className="flex-fill overflow-hidden">
            <h6 className="text-muted mb-1 fw-normal">{title}</h6>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold text-dark text-truncate">{value}</span>
              {unit && <span className="text-muted small">{unit}</span>}
            </div>
          </div>
        </div>
      </div>

      {(statusText || description) && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          {statusText && (
            <div className={`d-flex align-items-center gap-2 px-3 py-1 rounded-2 ${colors.bg}`}>
              <div className={`${colors.icon}`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              <span className={`small fw-medium ${colors.text}`}>{statusText}</span>
            </div>
          )}
          {description && (
            <p className="text-muted small mb-0 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
