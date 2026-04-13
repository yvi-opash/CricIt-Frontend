import React from 'react';
import './Style/Loadnig.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  fullScreen = false
}) => {
  return (
    <div className={`loading-container ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="cricket-pitch">
        <div className="pitch-line"></div>
        <div className="running-batsman"></div>
        <div className="running-batsman batsman-2"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading;