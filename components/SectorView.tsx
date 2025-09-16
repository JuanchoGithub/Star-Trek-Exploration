import React from 'react';
import type { Entity, Ship, SectorState, Planet, TorpedoProjectile } from '../types';
import { PlayerShipIcon, KlingonBirdOfPreyIcon, RomulanWarbirdIcon, NavigationTargetIcon, WeaponIcon, ShieldIcon, EngineIcon, StarbaseIcon, AsteroidFieldIcon, NeutralShipIcon, EventBeaconIcon, UnknownShipIcon, OrionPirateShipIcon, TorpedoProjectileIcon } from './Icons';
import { planetTypes } from '../assets/planets/configs/planetTypes';

interface SectorViewProps {
  entities: Entity[];
  playerShip: Ship;
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  navigationTarget: { x: number; y: number } | null;
  onSetNavigationTarget: (pos: { x: number; y: number } | null) => void;
  targetEntity?: Entity;
  selectedSubsystem: 'weapons' | 'engines' | 'shields' | null;
  onSelectSubsystem: (subsystem: 'weapons' | 'engines' | 'shields') => void;
  sector: SectorState;
}

const getPath = (start: { x: number; y: number }, end: { x: number; y: number } | null): { x: number; y: number }[] => {
  if (!end) return [];
  const path: { x: number; y: number }[] = [];
  let current = { ...start };

  let safety = 0;
  while ((current.x !== end.x || current.y !== end.y) && safety < 30) {
    const dx = end.x - current.x;
    const dy = end.y - current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      current.x += Math.sign(dx);
    } else if (dy !== 0) {
      current.y += Math.sign(dy);
    } else if (dx !== 0) {
      current.x += Math.sign(dx);
    }
    path.push({ ...current });
    safety++;
  }
  return path;
};

const SubsystemTarget: React.FC<{
    subsystem: 'weapons' | 'engines' | 'shields';
    health: number;
    maxHealth: number;
    isSelected: boolean;
    positionClass: string;
    onSelect: () => void;
    children: React.ReactNode;
}> = ({ subsystem, health, maxHealth, isSelected, positionClass, onSelect, children }) => {
    const healthPercentage = (health / maxHealth) * 100;
    let color = 'text-green-400';
    if (healthPercentage < 60) color = 'text-yellow-400';
    if (healthPercentage < 25) color = 'text-red-500';

    return (
        <div
            className={`absolute ${positionClass} transform transition-all cursor-pointer p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 ${isSelected ? 'ring-2 ring-yellow-400' : 'ring-1 ring-gray-600'}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            title={`${subsystem.charAt(0).toUpperCase() + subsystem.slice(1)}: ${Math.round(healthPercentage)}%`}
        >
            <div className={color}>{children}</div>
        </div>
    );
};


const SectorView: React.FC<SectorViewProps> = ({ entities, playerShip, selectedTargetId, onSelectTarget, navigationTarget, onSetNavigationTarget, targetEntity, selectedSubsystem, onSelectSubsystem, sector }) => {
  const sectorSize = { width: 12, height: 10 };
  const gridCells = Array.from({ length: sectorSize.width * sectorSize.height });

  const allEntities = [
      ...entities, 
      {...playerShip, type: 'ship' as const}
  ];

  const path = getPath(playerShip.position, navigationTarget);

  return (
    <div className="bg-black border-2 border-cyan-400 p-2 rounded-r-md h-full relative">
      {sector.hasNebula && (
        <div className="absolute inset-0 bg-purple-900 opacity-30 z-0 pointer-events-none"></div>
      )}
      <div className="grid grid-cols-12 grid-rows-10 h-full gap-0 relative">
        {gridCells.map((_, index) => (
          <div key={index} className="border border-cyan-900 border-opacity-50"></div>
        ))}

        <div className="absolute inset-0 grid grid-cols-12 grid-rows-10 z-10">
            {gridCells.map((_, index) => {
                const x = index % sectorSize.width;
                const y = Math.floor(index / sectorSize.width);
                return (
                    <div
                        key={`cell-${x}-${y}`}
                        className="w-full h-full hover:bg-cyan-400 hover:bg-opacity-20 cursor-pointer"
                        onClick={() => onSetNavigationTarget({ x, y })}
                    />
                );
            })}
        </div>

        {navigationTarget && (
            <>
            {path.map((pos, i) => (
                <div key={`path-${i}`}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60"
                    style={{
                        left: `${(pos.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`,
                        top: `${(pos.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 20
                    }}
                />
            ))}
            <div
                className="absolute flex items-center justify-center text-yellow-400"
                style={{
                    left: `${(navigationTarget.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`,
                    top: `${(navigationTarget.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20
                }}
            >
                <NavigationTargetIcon className="w-8 h-8 animate-pulse" />
            </div>
            </>
        )}

        {allEntities.map((entity) => {
            const isSelected = entity.id === selectedTargetId;
            const isPlayer = entity.id === playerShip.id;

            let icon;
            let factionColor = 'text-gray-400';
            let entityName = entity.name;

            if (entity.type === 'torpedo_projectile') {
                 const torpedo = entity as TorpedoProjectile;
                 return (
                    <React.Fragment key={torpedo.id}>
                        {torpedo.path.map((pos, i) => (
                            <div key={`trail-${torpedo.id}-${i}`}
                                className="absolute w-1.5 h-1.5 torpedo-trail-dot"
                                style={{
                                    opacity: 0.1 + (i / torpedo.path.length) * 0.5,
                                    left: `${(pos.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`,
                                    top: `${(pos.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 25
                                }}
                            />
                        ))}
                        <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
                            style={{ left: `${(torpedo.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, top: `${(torpedo.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%` }}
                        >
                            <TorpedoProjectileIcon className="w-4 h-4" />
                        </div>
                    </React.Fragment>
                 );
            }
            if (entity.type === 'ship') {
                const shipEntity = entity as Ship;
                 if (isPlayer) {
                    icon = <PlayerShipIcon className="w-8 h-8"/>;
                } else if (!shipEntity.scanned) {
                    icon = <UnknownShipIcon className="w-8 h-8"/>;
                    entityName = 'Unknown Ship';
                } else {
                    // This logic determines the icon shape based on original faction, even if captured
                    if (shipEntity.name.includes('Klingon')) icon = <KlingonBirdOfPreyIcon className="w-8 h-8"/>;
                    else if (shipEntity.name.includes('Romulan')) icon = <RomulanWarbirdIcon className="w-8 h-8"/>;
                    else if (shipEntity.name.includes('Pirate')) icon = <OrionPirateShipIcon className="w-8 h-8"/>;
                    else icon = <NeutralShipIcon className="w-8 h-8"/>;
                }

                // This logic determines the color based on current faction
                if (shipEntity.faction === 'Federation') factionColor = 'text-blue-400';
                else if (shipEntity.faction === 'Klingon') factionColor = 'text-red-500';
                else if (shipEntity.faction === 'Romulan') factionColor = 'text-green-400';
                else if (shipEntity.faction === 'Pirate') factionColor = 'text-orange-500';
                else if (!shipEntity.scanned) factionColor = 'text-yellow-400';
                else factionColor = 'text-gray-300';

            } else if (entity.type === 'starbase') {
                icon = <StarbaseIcon className="w-12 h-12 text-cyan-300" />;
                factionColor = 'text-cyan-300';
            } else if (entity.type === 'asteroid_field') {
                icon = <AsteroidFieldIcon className="w-12 h-12 text-gray-500" />;
                 factionColor = 'text-gray-400';
            } else if (entity.type === 'event_beacon') {
                if (entity.isResolved) {
                    icon = <EventBeaconIcon className="w-8 h-8 text-gray-600" />;
                    factionColor = 'text-gray-600';
                } else {
                    icon = <EventBeaconIcon className="w-8 h-8 text-purple-400 animate-pulse" />;
                    factionColor = 'text-purple-400';
                }
            } else { // Planet
                const planet = entity as Planet;
                const planetConfig = planetTypes[planet.planetClass];
                if (planetConfig) {
                    const IconComponent = planetConfig.icon;
                    icon = <IconComponent className={`w-10 h-10 ${planetConfig.colorClass}`} />;
                } else {
                    // Fallback to M-class if config not found
                    const FallbackIcon = planetTypes['M'].icon;
                    icon = <FallbackIcon className={`w-10 h-10 ${planetTypes['M'].colorClass}`} />;
                }
            }
            
            return (
                <div
                    key={entity.id}
                    className={`absolute flex flex-col items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-30 ${!isPlayer ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{ left: `${(entity.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, top: `${(entity.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%` }}
                    onClick={(e) => {
                         e.stopPropagation();
                         if (!isPlayer && entity.type !== 'asteroid_field' && entity.type !== 'event_beacon') {
                            onSelectTarget(entity.id);
                         }
                    }}
                >
                    <div className={`relative ${factionColor}`}>
                        {icon}
                        {isSelected && (
                            <>
                                <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping"></div>
                                {targetEntity && targetEntity.type === 'ship' && targetEntity.scanned && (
                                    <>
                                    <SubsystemTarget subsystem="weapons" {...targetEntity.subsystems.weapons} isSelected={selectedSubsystem === 'weapons'} positionClass="-top-6 -left-3 -translate-x-1/2" onSelect={() => onSelectSubsystem('weapons')}><WeaponIcon className="w-5 h-5"/></SubsystemTarget>
                                    <SubsystemTarget subsystem="engines" {...targetEntity.subsystems.engines} isSelected={selectedSubsystem === 'engines'} positionClass="-top-6 -right-3 translate-x-1/2" onSelect={() => onSelectSubsystem('engines')}><EngineIcon className="w-5 h-5"/></SubsystemTarget>
                                    <SubsystemTarget subsystem="shields" {...targetEntity.subsystems.shields} isSelected={selectedSubsystem === 'shields'} positionClass="bottom-0 -right-5 translate-x-1/2" onSelect={() => onSelectSubsystem('shields')}><ShieldIcon className="w-5 h-5"/></SubsystemTarget>
                                    </>
                                )}
                            </>
                        )}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-300 rounded-full"></div>
                    </div>
                    <span className={`text-xs mt-1 font-bold ${factionColor} ${isSelected ? 'text-yellow-400' : ''}`}>{entityName}</span>
                    {entity.type === 'ship' && (
                        <div className="w-10 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: `${(entity.hull / entity.maxHull) * 100}%`}}></div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default SectorView;
