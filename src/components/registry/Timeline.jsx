/**
 * Timeline Component
 *
 * Vertical timeline for tracking application progress
 * JavaScript version for admin_dashboard
 */

import React from 'react';

const Timeline = ({ items }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-success',
          ring: 'border-success-subtle',
          line: 'bg-success bg-opacity-25',
          text: 'text-success',
          icon: 'text-white',
        };
      case 'current':
        return {
          dot: 'bg-primary',
          ring: 'border-primary-subtle',
          line: 'bg-secondary bg-opacity-25',
          text: 'text-primary',
          icon: 'text-white',
          pulse: true,
        };
      case 'pending':
        return {
          dot: 'bg-secondary bg-opacity-50',
          ring: 'border-secondary-subtle',
          line: 'bg-secondary bg-opacity-25',
          text: 'text-muted',
          icon: 'text-white',
        };
      case 'skipped':
        return {
          dot: 'bg-warning',
          ring: 'border-warning-subtle',
          line: 'bg-secondary bg-opacity-25',
          text: 'text-warning',
          icon: 'text-white',
        };
      default:
        return {
          dot: 'bg-secondary',
          ring: 'border-secondary-subtle',
          line: 'bg-secondary bg-opacity-25',
          text: 'text-muted',
          icon: 'text-white',
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="bi" width="12" height="12" fill="currentColor">
            <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" clipRule="evenodd" />
          </svg>
        );
      case 'current':
        return (
          <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style={{ width: '8px', height: '8px' }}></span>
        );
      case 'pending':
        return null;
      case 'skipped':
        return (
          <svg className="bi" width="12" height="12" fill="currentColor">
            <path fillRule="evenodd" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="timeline">
      <ul className="list-unstyled mb-0">
        {items.map((item, index) => {
          const styles = getStatusStyles(item.status);
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className="position-relative" style={{ paddingBottom: isLast ? 0 : '2rem' }}>
              {!isLast && (
                <span
                  className={`position-absolute ${styles.line}`}
                  style={{
                    left: '15px',
                    top: '32px',
                    width: '2px',
                    height: '100%',
                  }}
                />
              )}
              <div className="d-flex align-items-start gap-3 position-relative">
                <div className="position-relative flex-shrink-0">
                  <div
                    className={`rounded-circle ${styles.dot} border border-3 ${styles.ring} d-flex align-items-center justify-content-center ${styles.pulse ? 'animate-pulse' : ''}`}
                    style={{
                      width: '32px',
                      height: '32px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span className={styles.icon}>
                      {getStatusIcon(item.status)}
                    </span>
                  </div>
                </div>
                <div className="flex-fill">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className={`fw-semibold mb-0 ${styles.text}`}>
                      {item.title}
                    </p>
                    {item.date && (
                      <time className="small text-muted ms-2 text-nowrap">
                        {item.date}
                      </time>
                    )}
                  </div>
                  {item.description && (
                    <p className="small text-muted mb-0 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
