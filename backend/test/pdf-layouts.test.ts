import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDropzones, type Rect } from '../pdf-layouts';

const contentArea: Rect = { x: 0, y: 0, width: 400, height: 600 };
const GAP = 8 * (72 / 96); // 6pt

describe('calculateDropzones', () => {
    describe('horizontal-triplet', () => {
        it('returns 3 dropzones', () => {
            const zones = calculateDropzones('horizontal-triplet', contentArea);
            assert.strictEqual(zones.length, 3);
        });

        it('top two dropzones are square (AR 1) and side-by-side', () => {
            const zones = calculateDropzones('horizontal-triplet', contentArea);
            assert.ok(Math.abs(zones[0].width - zones[0].height) < 0.01);
            assert.ok(Math.abs(zones[1].width - zones[1].height) < 0.01);
            assert.ok(Math.abs(zones[0].width - zones[1].width) < 0.01);
            assert.strictEqual(zones[0].y, zones[1].y);
            assert.ok(zones[1].x > zones[0].x);
        });

        it('bottom dropzone maintains AR 1.5', () => {
            const zones = calculateDropzones('horizontal-triplet', contentArea);
            const ar = zones[2].width / zones[2].height;
            assert.ok(Math.abs(ar - 1.5) < 0.01);
        });
    });

    describe('vertical-triplet', () => {
        it('returns 3 dropzones', () => {
            const zones = calculateDropzones('vertical-triplet', contentArea);
            assert.strictEqual(zones.length, 3);
        });

        it('left column is 40% of available width', () => {
            const zones = calculateDropzones('vertical-triplet', contentArea);
            const leftColWidth = (400 - GAP) * 0.4;
            assert.ok(Math.abs(zones[0].width - leftColWidth) < 0.01);
            assert.ok(Math.abs(zones[1].width - leftColWidth) < 0.01);
        });

        it('left dropzones are stacked with equal height', () => {
            const zones = calculateDropzones('vertical-triplet', contentArea);
            assert.ok(Math.abs(zones[0].height - zones[1].height) < 0.01);
            assert.ok(zones[1].y > zones[0].y);
        });

        it('right dropzone maintains AR 0.562', () => {
            const zones = calculateDropzones('vertical-triplet', contentArea);
            const ar = zones[2].width / zones[2].height;
            assert.ok(Math.abs(ar - 0.562) < 0.01);
        });

        it('left dropzones maintain AR 0.8', () => {
            const zones = calculateDropzones('vertical-triplet', contentArea);
            const ar0 = zones[0].width / zones[0].height;
            const ar1 = zones[1].width / zones[1].height;
            assert.ok(Math.abs(ar0 - 0.8) < 0.01);
            assert.ok(Math.abs(ar1 - 0.8) < 0.01);
        });
    });

    describe('vertical-tuple', () => {
        it('returns 2 dropzones', () => {
            const zones = calculateDropzones('vertical-tuple', contentArea);
            assert.strictEqual(zones.length, 2);
        });

        it('applies 12% top/bottom padding', () => {
            const zones = calculateDropzones('vertical-tuple', contentArea);
            const paddedTop = contentArea.height * 0.12;
            assert.ok(Math.abs(zones[0].y - paddedTop) < 0.01);
        });

        it('both dropzones maintain AR 1.5 and equal height', () => {
            const zones = calculateDropzones('vertical-tuple', contentArea);
            const ar0 = zones[0].width / zones[0].height;
            const ar1 = zones[1].width / zones[1].height;
            assert.ok(Math.abs(ar0 - 1.5) < 0.01);
            assert.ok(Math.abs(ar1 - 1.5) < 0.01);
            assert.ok(Math.abs(zones[0].height - zones[1].height) < 0.01);
        });
    });

    describe('full-page', () => {
        it('returns 1 dropzone filling entire content area', () => {
            const zones = calculateDropzones('full-page', contentArea);
            assert.strictEqual(zones.length, 1);
            assert.strictEqual(zones[0].x, 0);
            assert.strictEqual(zones[0].y, 0);
            assert.strictEqual(zones[0].width, 400);
            assert.strictEqual(zones[0].height, 600);
        });
    });

    describe('single-page', () => {
        it('returns 1 dropzone', () => {
            const zones = calculateDropzones('single-page', contentArea);
            assert.strictEqual(zones.length, 1);
        });

        it('maintains 0.7 aspect ratio', () => {
            const zones = calculateDropzones('single-page', contentArea);
            const ar = zones[0].width / zones[0].height;
            assert.ok(Math.abs(ar - 0.7) < 0.01);
        });

        it('is centered horizontally in content area', () => {
            const zones = calculateDropzones('single-page', contentArea);
            const leftSpace = zones[0].x - contentArea.x;
            const rightSpace = (contentArea.x + contentArea.width) - (zones[0].x + zones[0].width);
            assert.ok(Math.abs(leftSpace - rightSpace) < 0.01);
        });
    });

    describe('with offset content area', () => {
        it('respects content area position', () => {
            const offset: Rect = { x: 50, y: 100, width: 400, height: 600 };
            const zones = calculateDropzones('full-page', offset);
            assert.strictEqual(zones[0].x, 50);
            assert.strictEqual(zones[0].y, 100);
        });
    });
});
