import { useState, type CSSProperties } from 'react';
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

const styles: { [key: string]: CSSProperties } = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        minWidth: 700,
        width: '60vw',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
        background: '#161819'
    },
    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: 600
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: 24,
        cursor: 'pointer',
        padding: 0,
        color: '#666'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        padding: 20,
        overflowY: 'auto'
    },
    option: {
        border: '2px solid #e0e0e0',
        borderRadius: 8,
        padding: 10,
        cursor: 'pointer',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    optionSelected: {
        borderColor: '#007acc',
        background: '#f0f8ff'
    },
    preview: {
        width: '100%',
        aspectRatio: '0.7071',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    name: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: 500,
        color: '#333'
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        padding: '16px 20px',
        borderTop: '1px solid #e0e0e0',
        background: '#f8f9fa'
    },
    cancelBtn: {
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        background: '#e9ecef',
        cursor: 'pointer'
    },
    confirmBtn: {
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        background: '#007acc',
        color: 'white',
        cursor: 'pointer'
    }
};

interface LayoutSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLayout: (layout: LayoutType) => void;
}

export function LayoutSelector({ isOpen, onClose, onSelectLayout }: LayoutSelectorProps) {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('horizontal-triplet');

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Choose Page Layout</h2>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div style={styles.grid}>
                    {layoutOptions.map(({ id, name, preview: Preview }) => (
                        <div
                            key={id}
                            style={{ ...styles.option, ...(selectedLayout === id ? styles.optionSelected : {}) }}
                            onClick={() => setSelectedLayout(id)}
                        >
                            <div style={styles.preview}>
                                <Preview />
                            </div>
                            <span style={styles.name}>{name}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button style={styles.confirmBtn} onClick={() => { onSelectLayout(selectedLayout); onClose(); }}>
                        Add Page
                    </button>
                </div>
            </div>
        </div>
    );
}