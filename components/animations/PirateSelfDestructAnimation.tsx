import React from 'react';
import { Ship } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';

interface PirateSelfDestructAnimationProps {
    source: Ship;
}

const PirateSelfDestructAnimation: React.FC<PirateSelfDestructAnimationProps> = ({ source }) => {
    const getShipIcon = (ship: Ship) => {
        const visualConfig = shipVisuals[ship.shipModel];
        const roleConfig = visualConfig?.roles[ship.shipRole] ?? visualConfig?.roles[visualConfig.defaultRole];
        const finalConfig = roleConfig ?? shipVisuals.Unknown.roles.Unknown!;
        return { Icon: finalConfig.icon, colorClass: finalConfig.colorClass };
    };

    const { Icon: SourceIcon, colorClass: sourceColor } = getShipIcon(source);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 overflow-hidden panel-style border-2 border-accent-orange animate-pulse">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Pirate Ship */}
                <div className="absolute pirate-self-destruct-ship">
                    <SourceIcon className={`w-24 h-24 ${sourceColor}`} />
                </div>
                
                {/* Explosion */}
                <div className="absolute pirate-self-destruct-explosion" />
            </div>
        </div>
    );
};

export default PirateSelfDestructAnimation;