import React, { type CSSProperties } from 'react';

const MauButton = ({
    children,
    onClick,
    style,
}: {
    children: React.ReactNode;
    onClick: () => void;
    style?: CSSProperties; // Make style prop optional
}) => {
    const defaultStyle: CSSProperties = {
        padding: '10px 20px',
        backgroundColor: 'green',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    };

    // Merge defaultStyle with user-provided style
    const mergedStyle = { ...defaultStyle, ...style };

    return (
        <button style={mergedStyle} onClick={onClick}>
            {children}
        </button>
    );
};

export const PrimaryButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {

    return <MauButton onClick={onClick} style={{ backgroundColor: '#77A0A0', color: '#333333' }}>
        {children}
    </MauButton>;
};

export const SecondaryButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <MauButton onClick={onClick} style={{ backgroundColor: '#A68B77', color: '#555555' }}>
        {children}
    </MauButton>;
};

import { useState, useEffect } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}