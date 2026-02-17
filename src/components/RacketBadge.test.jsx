import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import RacketBadge, { RacketIcon, PRESET_COLORS } from './RacketBadge';

describe('RacketBadge', () => {
    describe('Color Priority Logic', () => {
        it('should use explicit colorHex even when colorKey is provided', () => {
            const { container } = render(
                <RacketBadge colorHex="#123456" colorKey="red" />
            );
            const svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('stroke', '#123456');
        });

        it('should use colorKey from PRESET_COLORS when no colorHex', () => {
            const { container } = render(
                <RacketBadge colorKey="blue" />
            );
            const svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('stroke', PRESET_COLORS.blue);
        });

        it('should fallback to gray when no color props provided', () => {
            const { container } = render(
                <RacketBadge />
            );
            const svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('stroke', PRESET_COLORS.gray);
        });
    });

    describe('Rendering Modes', () => {
        it('should render only icon when onlyIcon is true', () => {
            const { container } = render(
                <RacketBadge onlyIcon={true} colorKey="red" />
            );
            const svg = container.querySelector('svg');
            const badgeContainer = container.querySelector('div[style*="inline-flex"]');

            expect(svg).toBeInTheDocument();
            expect(badgeContainer).not.toBeInTheDocument();
        });

        it('should render full badge with container when onlyIcon is false', () => {
            const { container } = render(
                <RacketBadge colorKey="red" />
            );
            const svg = container.querySelector('svg');
            const badgeContainer = container.querySelector('div[style*="inline-flex"]');

            expect(svg).toBeInTheDocument();
            expect(badgeContainer).toBeInTheDocument();
            // Verify badge styling is present
            expect(badgeContainer).toHaveStyle({ display: 'inline-flex' });
        });
    });

    describe('Dual Icon Display', () => {
        it('should render two icons when isDual is true', () => {
            const { container } = render(
                <RacketBadge isDual={true} colorKey="red" />
            );
            const svgs = container.querySelectorAll('svg');
            expect(svgs).toHaveLength(2);
        });

        it('should render single icon when isDual is false', () => {
            const { container } = render(
                <RacketBadge isDual={false} colorKey="red" />
            );
            const svgs = container.querySelectorAll('svg');
            expect(svgs).toHaveLength(1);
        });
    });

    describe('Text Display', () => {
        it('should display text when text prop is provided', () => {
            const { container } = render(
                <RacketBadge text="M1" colorKey="red" />
            );
            const textElement = container.querySelector('span');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveTextContent('M1');
        });

        it('should not render text element when text prop is undefined', () => {
            const { container } = render(
                <RacketBadge colorKey="red" />
            );
            const textElement = container.querySelector('span');
            expect(textElement).not.toBeInTheDocument();
        });
    });
});

describe('RacketIcon', () => {
    it('should render SVG with correct color', () => {
        const { container } = render(
            <RacketIcon color="#ff0000" />
        );
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('stroke', '#ff0000');
    });

    it('should respect size prop', () => {
        const { container } = render(
            <RacketIcon color="#ff0000" size={24} />
        );
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
    });
});
