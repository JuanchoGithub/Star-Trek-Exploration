
import React from 'react';

const StarfieldBackground: React.FC = () => {
    const starCount = 200;
    
    // Inline style for the new drift animation
    const styleSheet = `
        @keyframes star-drift-animation {
            from {
                transform: translateY(-5vh);
            }
            to {
                transform: translateY(105vh);
            }
        }
    `;

    const stars = Array.from({ length: starCount }).map((_, i) => {
        const size = `${Math.random() * 2 + 1}px`;
        const style = {
            width: size,
            height: size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationName: 'star-drift-animation',
            animationDuration: `${50 + Math.random() * 100}s`,
            animationDelay: `-${Math.random() * 150}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
        };
        return <div key={i} className="star" style={style}></div>;
    });

    return (
        <div className="absolute inset-0 bg-black overflow-hidden z-0">
            <style>{styleSheet}</style>
            <div className="relative w-full h-full">
                {stars}
            </div>
        </div>
    );
};

export default StarfieldBackground;
