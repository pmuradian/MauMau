import { useState } from 'react';
import './Styles/layout-selector.css';
import './Styles/layout-previews.css';
import './Styles/paper.css';

export type LayoutType = 'horizontal-triplet' | 'vertical-triplet' | 'vertical-arrangement' | 'horizontal-arrangement' | 'single-image';

interface LayoutOption {
    id: LayoutType;
    name: string;
    description: string;
    preview: React.ReactNode;
}

const layoutOptions: LayoutOption[] = [
    {
        id: 'horizontal-triplet',
        name: 'Horizontal Triplet',
        description: 'Two images on top, one wide image below',
        preview: (
            <div className="layout-preview a4">
                <div className="row">
                    <div className="layout-preview-dropzone"></div>
                    <div className="layout-preview-dropzone"></div>
                </div>
                <div className="layout-preview-dropzone wide"></div>
            </div>
        )
    },
    {
        id: 'vertical-triplet',
        name: 'Vertical Triplet',
        description: 'Two images on left, one large image on right',
        preview: (
            <div className="layout-preview a4">
                <div className="row">
                    <div className="column">
                        <div className="layout-preview-dropzone"></div>
                        <div className="layout-preview-dropzone"></div>
                    </div>
                    <div className="layout-preview-dropzone large"></div>
                </div>
            </div>
        )
    },
    {
        id: 'vertical-arrangement',
        name: 'Vertical Stack',
        description: 'Two images stacked vertically',
        preview: (
            <div className="layout-preview a4">
                <div className="column">
                    <div className="layout-preview-dropzone"></div>
                    <div className="layout-preview-dropzone"></div>
                </div>
            </div>
        )
    },
    {
        id: 'horizontal-arrangement',
        name: 'Horizontal Stack',
        description: 'Two images side by side',
        preview: (
            <div className="layout-preview a4">
                <div className="row">
                    <div className="layout-preview-dropzone"></div>
                    <div className="layout-preview-dropzone"></div>
                </div>
            </div>
        )
    },
    {
        id: 'single-image',
        name: 'Single Image',
        description: 'One large image taking the full page',
        preview: (
            <div className="layout-preview a4">
                <div className="layout-preview-dropzone full"></div>
            </div>
        )
    }
];

interface LayoutSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLayout: (layout: LayoutType) => void;
}

export function LayoutSelector({ isOpen, onClose, onSelectLayout }: LayoutSelectorProps) {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('horizontal-triplet');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onSelectLayout(selectedLayout);
        onClose();
    };

    return (
        <div className="layout-selector-overlay">
            <div className="layout-selector-modal">
                <div className="layout-selector-header">
                    <h2>Choose Page Layout</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="layout-selector-content">
                    <div className="layout-options">
                        {layoutOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`layout-option ${selectedLayout === option.id ? 'selected' : ''}`}
                                onClick={() => setSelectedLayout(option.id)}
                            >
                                <div className="layout-option-preview">
                                    {option.preview}
                                </div>
                                <div className="layout-option-info">
                                    <h3>{option.name}</h3>
                                    <p>{option.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="layout-selector-footer">
                    <button className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="confirm-button" onClick={handleConfirm}>
                        Add Page
                    </button>
                </div>
            </div>
        </div>
    );
}