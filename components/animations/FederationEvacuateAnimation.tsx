
import React from 'react';
import { Ship } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
import { FederationShuttleIcon } from '../../assets/ships/icons/federation';


interface FederationEvacuateAnimationProps {
    source: Ship;
}

const FederationEvacuateAnimation: React.FC<FederationEvacuateAnimationProps> = ({ source }) => {
    const shuttleCount = shipRoleStats[source.shipRole]?.shuttleCount || 1;
    const shuttles = Array.from({ length: shuttleCount });
    
    // Dynamically get wireframes from shipVisuals config
    const visualConfig = shipVisuals[source.shipModel]?.classes[source.shipClass];

    // The user is right. A ship like the Defiant or Intrepid shouldn't break into another ship's parts.
    // We will check if the specific separation wireframes are defined in the config.
    const canSeparate = !!visualConfig?.saucerWireframe && !!visualConfig?.engineeringWireframe;

    // Use the specific wireframes if they exist.
    const FullWireframe = visualConfig?.wireframe;
    const SaucerWireframe = visualConfig?.saucerWireframe;
    const EngineeringWireframe = visualConfig?.engineeringWireframe;

    // If we can't even find the base wireframe, don't render the animation.
    if (!FullWireframe) {
        return null;
    }

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 overflow-hidden panel-style border-2 border-blue-400 animate-pulse">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Full ship, visible at the start. It will fade out. */}
                <div className="absolute w-48 h-48 fed-evac-ship-hold">
                    <FullWireframe />
                </div>

                {/* Broken parts, which only appear and drift if the ship class is configured to separate. */}
                {canSeparate && SaucerWireframe && EngineeringWireframe && (
                    <>
                        <div className="absolute w-48 h-48 fed-evac-saucer-drift opacity-0">
                            <SaucerWireframe />
                        </div>
                        <div className="absolute w-48 h-48 fed-evac-engineering-drift opacity-0">
                            <EngineeringWireframe />
                        </div>
                    </>
                )}

                {/* Shuttles launching */}
                {shuttles.map((_, i) => (
                    <div key={i} className={`absolute fed-evac-shuttle-${(i % 5) + 1}`}>
                        <FederationShuttleIcon className="w-6 h-6 text-blue-300" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FederationEvacuateAnimation;
