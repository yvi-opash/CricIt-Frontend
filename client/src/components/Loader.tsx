import React from 'react';
import './Style/Loader.css'

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Analyzing Pitch', 
  fullScreen = false
}) => {
  return (
    <div className={`loading-container ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="modern-loader">
        <div className="loader-circle"></div>
        <div className="loader-inner-circle"></div>
        <div className="loader-ball"></div>
      </div>
      <div className="loader-text">{message}...</div>
    </div>
  );
};

export default Loading;