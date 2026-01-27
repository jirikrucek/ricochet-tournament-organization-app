import React from 'react';
import { useTranslation } from 'react-i18next';

// Define the palette of "Sporty" colors
export const RACKET_COLORS = {
    red: '#ff2e2e',       // Vibrant Red (Matches 1,2)
    blue: '#2e8aff',      // Sky Blue (Matches 3,4)
    green: '#2eff6a',     // Neon Green (Matches 5,6)
    yellow: '#ffcc00',    // Golden Yellow (Matches 7,8)
    purple: '#cc2eff',    // Neon Purple (Matches 9,10)
    orange: '#ff8800',    // Bright Orange (Matches 11,12)
    pink: '#ff2e99',      // Hot Pink (Matches 13,14)
    cyan: '#00ffee',      // Electric Cyan (Matches 15,16)

    // Fallback/Generic
    gray: '#888888'
};

const RacketIcon = ({ color, size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
    >
        {/* Customized Racket Shape based on standard iconography */}
        <path d="M9 18l3 3 6-6a4.24 4.24 0 0 0-6-6l-3 3" />
        <path d="M12 21l-3-3m0 0l-5 5-2-2 5-5m2 2l-3-3a4.24 4.24 0 0 1 6-6l3 3" />
        {/* Simple strings effect */}
        <path d="M6 12l6-6" />
        <path d="M8 14l4-4" />
    </svg>
);

const RacketBadge = ({ colorKey = 'gray', text, isDual = false }) => {
    const color = RACKET_COLORS[colorKey] || RACKET_COLORS.gray;
    const { t } = useTranslation();

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(20, 20, 30, 0.6)',
            border: `1px solid ${color}`,
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: 600,
            boxShadow: `0 0 5px ${color}40`, // 40 is hex alpha
            marginTop: '4px'
        }}>
            <div style={{ display: 'flex' }}>
                <RacketIcon color={color} size={14} />
                {isDual && <div style={{ marginLeft: '-4px' }}><RacketIcon color={color} size={14} /></div>}
            </div>
            <span>{text}</span>
        </div>
    );
};

export default RacketBadge;
