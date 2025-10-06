import React, { useState, useEffect, useMemo } from 'react';
import { seededRandom, cyrb53 } from '../game/utils/helpers';

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
