import React from 'react';
import { Badge } from 'react-bootstrap';

/**
 * Component to display WebSocket connection status
 */
const ConnectionStatus = ({ isConnected, connectionStatus }) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          variant: 'success',
          icon: 'ri-wifi-line',
          text: 'Connected',
          className: 'connected'
        };
      case 'connecting':
      case 'reconnecting':
        return {
          variant: 'warning',
          icon: 'ri-loader-line',
          text: 'Connecting...',
          className: 'connecting'
        };
      case 'disconnected':
      case 'error':
        return {
          variant: 'danger',
          icon: 'ri-wifi-off-line',
          text: 'Disconnected',
          className: 'disconnected'
        };
      default:
        return {
          variant: 'secondary',
          icon: 'ri-question-line',
          text: 'Unknown',
          className: 'unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`connection-status ${config.className}`}>
      <Badge 
        bg={config.variant} 
        className="d-flex align-items-center gap-1"
        title={`Real-time messaging: ${config.text}`}
      >
        <i className={`${config.icon} ${config.className === 'connecting' ? 'spin' : ''}`} 
           style={{ fontSize: '0.7rem' }}></i>
        <span style={{ fontSize: '0.65rem' }}>{config.text}</span>
      </Badge>
    </div>
  );
};

export default ConnectionStatus;