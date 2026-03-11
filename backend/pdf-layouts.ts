import { LayoutType } from './models/Photobook';

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// 8px gap = 6pt (8 * 72/96)
const GAP = 8 * (72 / 96);

export function calculateDropzones(layout: LayoutType, content: Rect): Rect[] {
    switch (layout) {
        case 'horizontal-triplet':
            return horizontalTriplet(content);
        case 'vertical-triplet':
            return verticalTriplet(content);
        case 'vertical-tuple':
            return verticalTuple(content);
        case 'full-page':
            return fullPage(content);
        case 'single-page':
            return singlePage(content);
        default:
            return fullPage(content);
    }
}

function horizontalTriplet(c: Rect): Rect[] {
    // Top row: 2 equal dropzones side-by-side
    // Bottom: 1 full-width dropzone with AR 1.5 (width/height)
    const topWidth = (c.width - GAP) / 2;
    const bottomHeight = c.width / 1.5;
    const topHeight = c.height - bottomHeight - GAP;

    return [
        { x: c.x, y: c.y, width: topWidth, height: topHeight },
        { x: c.x + topWidth + GAP, y: c.y, width: topWidth, height: topHeight },
        { x: c.x, y: c.y + topHeight + GAP, width: c.width, height: bottomHeight },
    ];
}

function verticalTriplet(c: Rect): Rect[] {
    // Left column (40%): 2 stacked dropzones
    // Right: 1 dropzone filling remaining width, full height
    const leftWidth = (c.width - GAP) * 0.4;
    const rightWidth = c.width - leftWidth - GAP;
    const leftZoneHeight = (c.height - GAP) / 2;

    return [
        { x: c.x, y: c.y, width: leftWidth, height: leftZoneHeight },
        { x: c.x, y: c.y + leftZoneHeight + GAP, width: leftWidth, height: leftZoneHeight },
        { x: c.x + leftWidth + GAP, y: c.y, width: rightWidth, height: c.height },
    ];
}

function verticalTuple(c: Rect): Rect[] {
    // 12% top/bottom padding, 2 stacked dropzones
    const vPad = c.height * 0.12;
    const innerHeight = c.height - 2 * vPad;
    const zoneHeight = (innerHeight - GAP) / 2;

    return [
        { x: c.x, y: c.y + vPad, width: c.width, height: zoneHeight },
        { x: c.x, y: c.y + vPad + zoneHeight + GAP, width: c.width, height: zoneHeight },
    ];
}

function fullPage(c: Rect): Rect[] {
    return [{ x: c.x, y: c.y, width: c.width, height: c.height }];
}

function singlePage(c: Rect): Rect[] {
    // AR 0.7 = width/height, fit within content area and center
    const arWidth = c.height * 0.7;
    if (arWidth <= c.width) {
        const xOffset = (c.width - arWidth) / 2;
        return [{ x: c.x + xOffset, y: c.y, width: arWidth, height: c.height }];
    }
    const arHeight = c.width / 0.7;
    const yOffset = (c.height - arHeight) / 2;
    return [{ x: c.x, y: c.y + yOffset, width: c.width, height: arHeight }];
}
