import React, { useState, useEffect, useMemo } from 'react';

// A simple PRNG to keep it deterministic for a given seed
const cyrb53 = (str: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const seededRandom = (seed: number) => {
    let state = seed;
    return () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
};

interface LcarsDecorationProps {
    type: 'numbers' | 'label';
    label?: string;
    className?: string; // For positioning
    seed?: number;
}

const LcarsDecoration: React.FC<LcarsDecorationProps> = ({ type, label, className = '', seed = 0 }) => {
    const [displayValue, setDisplayValue] = useState('');
    const rand = useMemo(() => seededRandom(cyrb53(String(seed))), [seed]);

    useEffect(() => {
        if (type === 'numbers') {
            const generateRandomNumber = () => {
                const part1 = String(Math.floor(rand() * 90000) + 10000);
                const part2 = String(Math.floor(rand() * 900) + 100);
                return `${part1}.${part2}`;
            };
            const interval = setInterval(() => {
                setDisplayValue(generateRandomNumber());
            }, 150 + rand() * 200); // Stagger updates
            setDisplayValue(generateRandomNumber()); // Initial value
            return () => clearInterval(interval);
        } else {
            setDisplayValue(label || 'SYS');
        }
    }, [type, label, rand]);
    
    return (
        <div className={`lcars-decoration ${className}`}>
            {displayValue}
        </div>
    );
};

export default LcarsDecoration;
