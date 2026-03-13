import { useState } from 'react';
import './LayoutSelector.css';
import { PrimaryButton, SecondaryButton } from '../uicomponents/Buttons';
import {
    PortraitPreviewHorizontalTriplet,
    PortraitPreviewVerticalTriplet,
    PortraitPreviewVerticalTuple,
    PortraitPreviewSinglePage,
    PortraitPreviewFullPage
} from './PageLayouts/Portrait';

export type LayoutType = 'horizontal-triplet' | 'vertical-triplet' | 'vertical-tuple' | 'single-page' | 'full-page';

const layoutOptions: { id: LayoutType; name: string; preview: React.ComponentType }[] = [
    { id: 'horizontal-triplet', name: 'Horizontal Triplet', preview: PortraitPreviewHorizontalTriplet },
    { id: 'vertical-triplet', name: 'Vertical Triplet', preview: PortraitPreviewVerticalTriplet },
    { id: 'vertical-tuple', name: 'Vertical Stack', preview: PortraitPreviewVerticalTuple },
    { id: 'single-page', name: 'Single Image', preview: PortraitPreviewSinglePage },
    { id: 'full-page', name: 'Full Page', preview: PortraitPreviewFullPage }
];

interface LayoutSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLayout: (layout: LayoutType) => void;
}

export function LayoutSelector({ isOpen, onClose, onSelectLayout }: LayoutSelectorProps) {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('horizontal-triplet');

    if (!isOpen) return null;

    return (
        <div className="ls-overlay" onClick={onClose}>
            <div className="ls-modal" onClick={e => e.stopPropagation()}>
                <div className="ls-header">
                    <h2 className="ls-title">Choose Page Layout</h2>
                    <button className="ls-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="ls-grid">
                    {layoutOptions.map(({ id, name, preview: Preview }) => (
                        <div
                            key={id}
                            className={`ls-option${selectedLayout === id ? ' ls-option--selected' : ''}`}
                            onClick={() => setSelectedLayout(id)}
                        >
                            <div className="ls-preview">
                                <Preview />
                            </div>
                            <span className="ls-name">{name}</span>
                        </div>
                    ))}
                </div>

                <div className="ls-footer">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={() => { onSelectLayout(selectedLayout); onClose(); }}>
                        Add Page
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
