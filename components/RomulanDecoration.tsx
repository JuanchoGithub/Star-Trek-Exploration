import React from 'react';

const romulanGlyphs = ['Rh', 'Ih', 'Hw', 'Yn', 'Aeh', 'Lh', 'Fv', 'Uu', 'Vv', 'Kk', 'Ss', 'Rr'];
const getGlyphString = (seed: number, length: number): string => {
    let result = '';
    let currentSeed = seed;
    for (let i = 0; i < length; i++) {
        currentSeed = (currentSeed * 16807 + 12345) % 2147483647;
        result += romulanGlyphs[currentSeed % romulanGlyphs.length] + (i % 3 === 2 ? '  ' : ' ');
    }
    return result.trim();
}

const CentralSchematic = () => (
    <svg style={{ left: '50%', top: '50%', width: '30vw', height: '30vh', transform: 'translate(-50%, -50%)', opacity: 0.15 }}>
        <g stroke="var(--color-plasma-green)" strokeWidth="1" fill="none">
            {/* Head */}
            <path d="M 50 10 C 40 25, 40 40, 50 55 C 60 40, 60 25, 50 10 Z" />
            <line x1="50" y1="10" x2="50" y2="55" />
            {/* Wings */}
            <path d="M 50 55 L 10 90" />
            <path d="M 50 55 L 90 90" />
            <path d="M 50 45 L 20 80" />
            <path d="M 50 45 L 80 80" />
            <path d="M 50 35 C 20 30, 20 70, 45 80" />
            <path d="M 50 35 C 80 30, 80 70, 55 80" />
            <line x1="45" y1="80" x2="55" y2="80" />
        </g>
    </svg>
);

const TopLeft = () => (
    <svg style={{ top: '1rem', left: '1rem', width: '250px', height: '150px' }}>
        <path d="M 240 2 L 15 2 L 2 15 L 2 140" />
        <path d="M 235 7 L 20 7 L 7 20 L 7 135" className="border-inner" />
        <rect x="15" y="20" width="200" height="20" fill="var(--color-darker-green)" stroke="var(--color-dark-green)" strokeWidth="1" />
        <text x="20" y="34">{getGlyphString(1, 4)}</text>
        <text x="20" y="60">{getGlyphString(2, 8)}</text>
        <text x="20" y="75">{getGlyphString(3, 8)}</text>
        <text x="20" y="90">{getGlyphString(4, 8)}</text>
    </svg>
);

const TopRight = () => (
    <svg style={{ top: '1rem', right: '1rem', width: '250px', height: '150px' }}>
        <path d="M 10 2 L 235 2 L 248 15 L 248 140" />
        <path d="M 15 7 L 230 7 L 243 20 L 243 135" className="border-inner" />
        <rect x="30" y="20" width="40" height="15" fill="var(--color-dark-green)" stroke="var(--color-dark-green)" strokeWidth="1" />
        <text x="35" y="32">{getGlyphString(5, 2)}</text>
         <rect x="80" y="20" width="40" height="15" fill="var(--color-dark-green)" stroke="var(--color-dark-green)" strokeWidth="1" />
        <text x="85" y="32">{getGlyphString(6, 2)}</text>
    </svg>
);

const BottomLeft = () => (
    <svg style={{ bottom: '1rem', left: '1rem', width: '250px', height: '150px' }}>
        <path d="M 2 10 L 2 135 L 15 148 L 240 148" />
        <path d="M 7 15 L 7 130 L 20 143 L 235 143" className="border-inner" />
         <polygon points="20,20 80,20 65,40 5,40" fill="var(--color-dark-green)" />
         <text x="25" y="34">{getGlyphString(7, 3)}</text>
         <polygon points="90,20 150,20 135,40 75,40" fill="var(--color-darker-green)" />
         <text x="95" y="34">{getGlyphString(8, 3)}</text>
         <polygon points="20,50 80,50 65,70 5,70" fill="var(--color-darker-green)" />
         <text x="25" y="64">{getGlyphString(9, 3)}</text>
    </svg>
);

const BottomRight = () => (
     <svg style={{ bottom: '1rem', right: '1rem', width: '250px', height: '150px' }}>
        <path d="M 248 10 L 248 135 L 235 148 L 10 148" />
        <path d="M 243 15 L 243 130 L 230 143 L 15 143" className="border-inner" />
        <rect x="20" y="20" width="210" height="100" fill="none" stroke="var(--color-dark-green)" strokeWidth="1"/>
        <line x1="20" y1="70" x2="230" y2="70" stroke="var(--color-dark-green)" strokeWidth="1" />
        <text x="25" y="35">{getGlyphString(10, 8)}</text>
        <text x="25" y="50" fill="var(--color-lime-green)">{getGlyphString(11, 8)}</text>
        <text x="25" y="85">{getGlyphString(12, 8)}</text>
        <text x="25" y="100" fill="var(--color-lime-green)">{getGlyphString(13, 8)}</text>
    </svg>
);

export const RomulanDecoration: React.FC = () => {
    return (
        <div className="romulan-frame-decoration" aria-hidden="true">
            <CentralSchematic />
            <TopLeft />
            <TopRight />
            <BottomLeft />
            <BottomRight />
        </div>
    );
};

export default RomulanDecoration;
