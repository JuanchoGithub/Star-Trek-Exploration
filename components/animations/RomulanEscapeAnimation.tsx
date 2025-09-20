import React from 'react';
import { Ship } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';

interface RomulanEscapeAnimationProps {
    source: Ship;
    outcome: 'success' | 'failure';
}

const RomulanEscapeAnimation: React.FC<RomulanEscapeAnimationProps> = ({ source, outcome }) => {
    const getShipIcon = (ship: Ship) => {
        const visualConfig = shipVisuals[ship.shipModel];
        const roleConfig = visualConfig?.roles[ship.shipRole] ?? visualConfig?.roles[visualConfig.defaultRole];
        const finalConfig = roleConfig ?? shipVisuals.Unknown.roles.Unknown!;
        return { Icon: finalConfig.icon, colorClass: finalConfig.colorClass };
    };

    const { Icon: SourceIcon, colorClass: sourceColor } = getShipIcon(source);

    const animationClass = outcome === 'success' ? 'success' : 'failure';

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 overflow-hidden panel-style border-2 border-accent-green animate-pulse">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Romulan Ship */}
                <div className={`absolute romulan-escape-ship ${animationClass}`}>
                    <SourceIcon className={`w-24 h-24 ${sourceColor}`} />
                </div>
                
                {/* Explosion for failure */}
                {outcome === 'failure' && (
                    <div className="absolute romulan-escape-explosion" />
                )}
            </div>
        </div>
    );
};

export default RomulanEscapeAnimation;