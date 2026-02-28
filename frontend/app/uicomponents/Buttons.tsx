import React from 'react';
import './Buttons.css';

const MauButton = ({
    children,
    onClick,
    className = '',
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}) => {
    return (
        <button className={`mau-btn ${className}`} onClick={onClick}>
            {children}
        </button>
    );
};

export const PrimaryButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <MauButton onClick={onClick} className="mau-btn--primary">{children}</MauButton>;
};

export const SecondaryButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <MauButton onClick={onClick} className="mau-btn--secondary">{children}</MauButton>;
};
