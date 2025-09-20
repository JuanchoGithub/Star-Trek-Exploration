import React from 'react';
import { Ship } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';

interface KlingonRamAnimationProps {
    source: Ship;
    target: Ship;
}

const KlingonRamAnimation: React.FC<KlingonRamAnimationProps> = ({ source, target }) => {
    const getShipIcon = (ship: Ship) => {
        const visualConfig = shipVisuals[ship.shipModel];
        const roleConfig = visualConfig?.roles[ship.shipRole] ?? visualConfig?.roles[visualConfig.defaultRole];
        const finalConfig = roleConfig ?? shipVisuals.Unknown.roles.Unknown!;
        return { Icon: finalConfig.icon, colorClass: finalConfig.colorClass };
    };

    const { Icon: SourceIcon, colorClass: sourceColor } = getShipIcon(source);
    const { Icon: TargetIcon, colorClass: targetColor } = getShipIcon(target);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 overflow-hidden panel-style border-2 border-accent-red animate-pulse">
            <div className="relative w-full h-full">
                {/* Target Ship */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ram-animation-target">
                    <TargetIcon className={`w-24 h-24 ${targetColor}`} />
                </div>

                {/* Source Ship */}
                <div className="absolute ram-animation-source">
                    <SourceIcon className={`w-20 h-20 ${sourceColor}`} />
                </div>
                
                {/* Explosion */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ram-animation-explosion" />
            </div>
        </div>
    );
};

export default KlingonRamAnimation;
