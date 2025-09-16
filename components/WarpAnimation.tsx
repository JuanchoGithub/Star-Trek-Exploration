import React from 'react';

const WarpAnimation: React.FC = () => {
    const starCount = 100;
    const stars = Array.from({ length: starCount }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
        };
        return <div key={i} className="star" style={style}></div>;
    });

    return (
        <div className="warp-container rounded-r-md">
            <div className="stars-perspective">
                {stars}
            </div>
            <div className="warp-flash"></div>
        </div>
    );
};

export default WarpAnimation;