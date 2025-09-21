import React from 'react';
import { Ship } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
import { FederationExplorerWireframe, FederationExplorerSaucerWireframe, FederationExplorerEngineeringWireframe } from '../../assets/ships/wireframes/federation';
import { FederationShuttleIcon } from '../../assets/ships/icons/federation';


interface FederationEvacuateAnimationProps {
    source: Ship;
}

const FederationEvacuateAnimation: React.FC<FederationEvacuateAnimationProps> = ({ source }) => {
    const shuttleCount = shipRoleStats[source.shipRole]?.shuttleCount || 1;
    const shuttles = Array.from({ length: shuttleCount });
    
    // Dynamically get wireframes from shipVisuals config, with fallbacks
    // FIX: Accessed ship visuals via ship class instead of non-existent role.
    const visualConfig = shipVisuals[source.shipModel]?.classes[source.shipClass];

    const FullWireframe = visualConfig?.wireframe || FederationExplorerWireframe;
    const SaucerWireframe = visualConfig?.saucerWireframe || FederationExplorerSaucerWireframe;
    const EngineeringWireframe = visualConfig?.engineeringWireframe || FederationExplorerEngineeringWireframe;


    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 overflow-hidden panel-style border-2 border-blue-400 animate-pulse">
            <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Full ship, visible at the start */}
                <div className="absolute w-48 h-48 fed-evac-ship-hold">
                    <FullWireframe />
                </div>

                {/* Broken parts, appear and drift */}
                <div className="absolute w-48 h-48 fed-evac-saucer-drift opacity-0">
                    <SaucerWireframe />
                </div>
                <div className="absolute w-48 h-48 fed-evac-engineering-drift opacity-0">
                    <EngineeringWireframe />
                </div>


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
