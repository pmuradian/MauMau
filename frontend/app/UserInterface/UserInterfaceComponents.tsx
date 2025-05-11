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

    return <MauButton onClick={onClick} style={{ backgroundColor: 'green' }}>
        {children}
    </MauButton>;
};

export const SecondaryButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <MauButton onClick={onClick} style={{ backgroundColor: 'white', color: 'green' }}>
        {children}
    </MauButton>;
};