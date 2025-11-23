/**
 * InfoCard Component
 *
 * Display key-value information in a modern card layout
 * JavaScript version for admin_dashboard
 */

import React from 'react';

const InfoCard = ({ title, items, icon, action }) => {
  return (
    <div className="bg-white rounded-3 border shadow-sm">
      <div className="p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            {icon && (
              <div className="bg-primary bg-opacity-10 rounded-3 p-2 d-flex align-items-center justify-center" style={{ width: '40px', height: '40px' }}>
                <div className="text-primary">{icon}</div>
              </div>
            )}
            <h5 className="fw-semibold text-dark mb-0">{title}</h5>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          )}
        </div>

        {/* Content Grid */}
        <div className="row g-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={item.fullWidth ? 'col-12' : 'col-md-6'}
            >
              <div className="mb-1">
                <dt className="small text-uppercase text-muted fw-medium mb-1" style={{ letterSpacing: '0.5px' }}>
                  {item.label}
                </dt>
                <dd className="d-flex align-items-center gap-2 mb-0">
                  {item.icon && <span className="text-muted">{item.icon}</span>}
                  <span className="fw-medium text-dark">{item.value || '—'}</span>
                </dd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
