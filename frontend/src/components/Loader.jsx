import React from 'react';

const Loader = ({ fullScreen = false, transparent = false }) => {
    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
        }),
        ...(transparent ? {
            backgroundColor: 'rgba(15, 15, 26, 0.85)',
            backdropFilter: 'blur(4px)',
        } : {
            backgroundColor: '#0f0f1a',
        }),
    };

    const spinnerStyle = {
        width: fullScreen ? '60px' : '50px',
        height: fullScreen ? '60px' : '50px',
        border: fullScreen ? '4px' : '3px',
        borderStyle: 'solid',
        borderColor: 'rgba(229, 9, 20, 0.1)',
        borderTopColor: '#e50914',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    };

    return (
        <div style={containerStyle}>
            <div style={spinnerStyle} />
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </div>
    );
};

export default Loader;