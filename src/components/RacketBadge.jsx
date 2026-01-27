import React from 'react';

// Define the palette of "Sporty" colors
export const PRESET_COLORS = {
    red: '#ff2e2e',       // Matches 1,2
    blue: '#2e8aff',      // Matches 3,4
    green: '#2eff6a',     // Matches 5,6
    yellow: '#ffcc00',    // Matches 7,8
    purple: '#cc2eff',    // Matches 9,10
    orange: '#ff8800',    // Matches 11,12
    pink: '#ff2e99',      // Matches 13,14
    cyan: '#00ffee',      // Matches 15,16
    gray: '#888888'
};

export const RacketIcon = ({ color, size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} // Enhanced glow
    >
        {/* Simple Badminton Racket Icon */}
        <circle cx="12" cy="10" r="5" />
        <path d="M12 15L12 21" />
        <path d="M10 21L14 21" />
        <path d="M12 5L12 15" strokeOpacity="0.3" />
        <path d="M8 10L16 10" strokeOpacity="0.3" />
    </svg>
);

const RacketBadge = ({ colorKey, colorHex, text, isDual = false, onlyIcon = false }) => {
    // Priority: colorHex -> colorKey map -> default gray
    const finalColor = colorHex || (colorKey ? PRESET_COLORS[colorKey] : PRESET_COLORS.gray) || PRESET_COLORS.gray;

    if (onlyIcon) {
        return <RacketIcon color={finalColor} size={14} />;
    }

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(20, 20, 30, 0.4)',
            border: `1px solid ${finalColor}66`, // alpha for border
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: 700,
            boxShadow: `0 0 8px ${finalColor}20`,
        }}>
            <div style={{ display: 'flex' }}>
                <RacketIcon color={finalColor} size={14} />
                {isDual && <div style={{ marginLeft: '-6px', opacity: 0.8 }}><RacketIcon color={finalColor} size={14} /></div>}
            </div>
            {text && <span>{text}</span>}
        </div>
    );
};

export default RacketBadge;
