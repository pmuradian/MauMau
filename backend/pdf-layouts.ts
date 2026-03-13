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
    // Top row: 2 square dropzones (AR 1) side-by-side
    // Bottom: 1 full-width dropzone (AR 1.5)
    const topWidth = (c.width - GAP) / 2;
    const topHeight = topWidth; // AR 1 → square
    const bottomWidth = c.width;
    const bottomHeight = bottomWidth / 1.5; // AR 1.5

    const totalHeight = topHeight + GAP + bottomHeight;
    const scale = totalHeight > c.height ? c.height / totalHeight : 1;

    const sTopW = topWidth * scale;
    const sTopH = topHeight * scale;
    const sBottomW = bottomWidth * scale;
    const sBottomH = bottomHeight * scale;
    const sGap = GAP * scale;

    const xOffset = (c.width - sBottomW) / 2;
    const yOffset = (c.height - (sTopH + sGap + sBottomH)) / 2;

    return [
        { x: c.x + xOffset, y: c.y + yOffset, width: sTopW, height: sTopH },
        { x: c.x + xOffset + sTopW + sGap, y: c.y + yOffset, width: sTopW, height: sTopH },
        { x: c.x + xOffset, y: c.y + yOffset + sTopH + sGap, width: sBottomW, height: sBottomH },
    ];
}

function verticalTriplet(c: Rect): Rect[] {
    // Left column (40%): 2 stacked dropzones (AR 0.8 each)
    // Right: 1 dropzone (AR 0.562) filling remaining width
    const leftWidth = (c.width - GAP) * 0.4;
    const rightWidth = c.width - leftWidth - GAP;

    const leftZoneH = leftWidth / 0.8; // AR 0.8
    const rightH = rightWidth / 0.562; // AR 0.562

    const leftTotalH = 2 * leftZoneH + GAP;
    const maxH = Math.max(leftTotalH, rightH);
    const scale = maxH > c.height ? c.height / maxH : 1;

    const sLeftW = leftWidth * scale;
    const sLeftH = leftZoneH * scale;
    const sRightW = rightWidth * scale;
    const sRightH = rightH * scale;
    const sGap = GAP * scale;

    const leftColH = 2 * sLeftH + sGap;
    const yOffsetLeft = (c.height - leftColH) / 2;
    const yOffsetRight = (c.height - sRightH) / 2;
    const xOffset = (c.width - (sLeftW + sGap + sRightW)) / 2;

    return [
        { x: c.x + xOffset, y: c.y + yOffsetLeft, width: sLeftW, height: sLeftH },
        { x: c.x + xOffset, y: c.y + yOffsetLeft + sLeftH + sGap, width: sLeftW, height: sLeftH },
        { x: c.x + xOffset + sLeftW + sGap, y: c.y + yOffsetRight, width: sRightW, height: sRightH },
    ];
}

function verticalTuple(c: Rect): Rect[] {
    // 12% top/bottom padding, 2 stacked dropzones (AR 1.5 each)
    const vPad = c.height * 0.12;
    const innerHeight = c.height - 2 * vPad;

    const zoneH = c.width / 1.5; // AR 1.5
    const totalH = 2 * zoneH + GAP;
    const scale = totalH > innerHeight ? innerHeight / totalH : 1;

    const sZoneW = c.width * scale;
    const sZoneH = zoneH * scale;
    const sGap = GAP * scale;

    const xOffset = (c.width - sZoneW) / 2;
    const yOffset = vPad + (innerHeight - (2 * sZoneH + sGap)) / 2;

    return [
        { x: c.x + xOffset, y: c.y + yOffset, width: sZoneW, height: sZoneH },
        { x: c.x + xOffset, y: c.y + yOffset + sZoneH + sGap, width: sZoneW, height: sZoneH },
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
