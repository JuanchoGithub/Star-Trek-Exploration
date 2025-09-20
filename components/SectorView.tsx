import React from 'react';
import type { Entity, Ship, SectorState, Planet, TorpedoProjectile, Shuttle } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { starbaseType } from '../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { FederationShuttleIcon } from '../assets/ships/icons/federation';
import { TorpedoProjectileIcon } from '../assets/projectiles/icons';
import { NavigationTargetIcon, WeaponIcon, ShieldIcon, EngineIcon } from '../assets/ui/icons';
import { ThemeName } from '../hooks/useTheme';
import LcarsTargetingReticle from './LcarsTargetingReticle';
import KlingonTargetingReticle from './KlingonTargetingReticle';
import RomulanTargetingReticle from './RomulanTargetingReticle';


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
  themeName: ThemeName;
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

const getPercentageCoords = (gridPos: { x: number; y: number }, sectorSize: {width: number, height: number}) => {
    const x = (gridPos.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2);
    const y = (gridPos.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2);
    return { x: `${x}%`, y: `${y}%` };
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
    let color = 'text-accent-green';
    if (healthPercentage < 60) color = 'text-accent-yellow';
    if (healthPercentage < 25) color = 'text-accent-red';

    return (
        <div
            className={`absolute ${positionClass} transform transition-all cursor-pointer p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 ${isSelected ? 'ring-2 ring-accent-yellow' : 'ring-1 ring-text-disabled'}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            title={`${subsystem.charAt(0).toUpperCase() + subsystem.slice(1)}: ${Math.round(healthPercentage)}%`}
        >
            <div className={color}>{children}</div>
        </div>
    );
};


const SectorView: React.FC<SectorViewProps> = ({ entities, playerShip, selectedTargetId, onSelectTarget, navigationTarget, onSetNavigationTarget, targetEntity, selectedSubsystem, onSelectSubsystem, sector, themeName }) => {
  const sectorSize = { width: 12, height: 10 };
  const gridCells = Array.from({ length: sectorSize.width * sectorSize.height });

  const allEntities = [
      ...entities, 
      {...playerShip, type: 'ship' as const}
  ];

  const handleCellClick = (x: number, y: number) => {
    if (navigationTarget && navigationTarget.x === x && navigationTarget.y === y) {
        onSetNavigationTarget(null); // Clicked the same target again, cancel it.
    } else {
        // Prevent setting navigation target on top of another entity
        const entityAtPos = allEntities.find(e => e.position.x === x && e.position.y === y && e.id !== playerShip.id);
        if (!entityAtPos) {
            onSetNavigationTarget({ x, y });
        }
    }
  };

  const path = getPath(playerShip.position, navigationTarget);

  return (
    <div className="bg-black border-2 border-border-light p-2 rounded-r-md h-full relative">
      {themeName === 'klingon' && <div className="klingon-sector-grid-overlay" />}
      {sector.hasNebula && (
        <div className="absolute inset-0 bg-accent-purple opacity-30 z-0 pointer-events-none"></div>
      )}
      <div className="grid grid-cols-12 grid-rows-10 h-full gap-0 relative">
        {gridCells.map((_, index) => (
          <div key={index} className="border border-border-dark border-opacity-50"></div>
        ))}

        <div className="absolute inset-0 grid grid-cols-12 grid-rows-10 z-10">
            {gridCells.map((_, index) => {
                const x = index % sectorSize.width;
                const y = Math.floor(index / sectorSize.width);
                return (
                    <div
                        key={`cell-${x}-${y}`}
                        className="w-full h-full hover:bg-secondary-light hover:bg-opacity-20 cursor-pointer"
                        onClick={() => handleCellClick(x, y)}
                    />
                );
            })}
        </div>
         <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-20 overflow-visible">
            {(() => {
                if (!selectedTargetId) return null;
                const selectedEntity = allEntities.find(e => e.id === selectedTargetId);
                if (!selectedEntity || selectedEntity.type !== 'torpedo_projectile') return null;
                
                const torpedo = selectedEntity as TorpedoProjectile;
                const target = allEntities.find(e => e.id === torpedo.targetId);
                if (!target) return null;

                const start = getPercentageCoords(torpedo.position, sectorSize);
                const end = getPercentageCoords(target.position, sectorSize);
                
                return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--color-accent-yellow)" strokeWidth="1" strokeDasharray="4 4" />;
            })()}
        </svg>

        {navigationTarget && (
            <>
            {path.map((pos, i) => (
                <div key={`path-${i}`}
                    className="absolute w-1 h-1 bg-accent-yellow rounded-full opacity-60"
                    style={{
                        left: `${(pos.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`,
                        top: `${(pos.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 20
                    }}
                />
            ))}
            <div
                className="absolute flex items-center justify-center text-accent-yellow cursor-pointer"
                style={{
                    left: `${(navigationTarget.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`,
                    top: `${(navigationTarget.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSetNavigationTarget(null);
                }}
                title="Cancel Navigation"
            >
                <NavigationTargetIcon className="w-8 h-8 animate-pulse" />
            </div>
            </>
        )}

        {allEntities.map((entity) => {
            const isSelected = entity.id === selectedTargetId;
            const isPlayer = entity.id === playerShip.id;

            let icon: React.ReactNode;
            let factionColor = 'text-gray-400';
            let entityName = entity.name;
            let transformStyle = { transform: `translate(-50%, -50%)` };

            if (entity.type === 'torpedo_projectile') {
                 const torpedo = entity as TorpedoProjectile;
                 const target = allEntities.find(e => e.id === torpedo.targetId);
                 if (target) {
                    const angle = Math.atan2(target.position.y - entity.position.y, target.position.x - entity.position.x) * 180 / Math.PI;
                    transformStyle = { transform: `translate(-50%, -50%) rotate(${angle}deg)` };
                 }

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
                            className={`absolute z-40 cursor-pointer ${isSelected ? 'ring-2 ring-accent-yellow rounded-full' : ''}`}
                            style={{ 
                                left: `${(torpedo.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, 
                                top: `${(torpedo.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                                ...transformStyle 
                            }}
                             onClick={(e) => { e.stopPropagation(); onSelectTarget(entity.id); }}
                        >
                            <TorpedoProjectileIcon className="w-6 h-6 text-accent-orange" />
                        </div>
                    </React.Fragment>
                 );
            }
            if (entity.type === 'ship') {
                const shipEntity = entity as Ship;
                
                if (!shipEntity.scanned && !isPlayer) {
                    const config = shipVisuals.Unknown.roles.Unknown!;
                    const IconComponent = config.icon;
                    icon = <IconComponent className="w-8 h-8"/>;
                    factionColor = config.colorClass;
                    entityName = 'Unknown Contact';
                } else {
                    const visualConfig = shipVisuals[shipEntity.shipModel];
                    const roleConfig = visualConfig?.roles[shipEntity.shipRole] ?? visualConfig?.roles[visualConfig.defaultRole];
                    const finalConfig = roleConfig ?? shipVisuals.Unknown.roles.Unknown!;
                    const IconComponent = finalConfig.icon;
                    icon = <IconComponent className="w-8 h-8"/>;
                    
                    // A successfully boarded ship's faction is changed to Federation, but its model remains the same.
                    // We use this to identify captured ships and color them appropriately.
                    if (shipEntity.faction === 'Federation' && shipEntity.shipModel !== 'Federation') {
                        // This is a captured ship. Use Federation color.
                        factionColor = shipVisuals.Federation.roles.Explorer!.colorClass;
                    } else {
                        // This is a player ship, an allied federation ship, or an enemy ship. Use its model's color.
                        factionColor = finalConfig.colorClass;
                    }
                }

            } else if (entity.type === 'shuttle') {
                icon = <FederationShuttleIcon className="w-6 h-6" />;
                factionColor = shipVisuals.Federation.roles.Explorer!.colorClass;
            } else if (entity.type === 'starbase') {
                const IconComponent = starbaseType.icon;
                icon = <IconComponent className="w-12 h-12" />;
                factionColor = starbaseType.colorClass;
            } else if (entity.type === 'asteroid_field') {
                const IconComponent = asteroidType.icon;
                icon = <IconComponent className="w-12 h-12" />;
                factionColor = asteroidType.colorClass;
            } else if (entity.type === 'event_beacon') {
                const IconComponent = beaconType.icon;
                if (entity.isResolved) {
                    icon = <IconComponent className="w-8 h-8 text-text-disabled" />;
                    factionColor = 'text-text-disabled';
                } else {
                    icon = <IconComponent className="w-8 h-8 animate-pulse" />;
                    factionColor = beaconType.colorClass;
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
                    className={`absolute flex flex-col items-center justify-center transition-all duration-300 z-30 cursor-pointer`}
                    style={{ 
                        left: `${(entity.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, 
                        top: `${(entity.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                        ...transformStyle
                    }}
                    onClick={(e) => {
                         e.stopPropagation();
                         if (isPlayer) {
                             if(navigationTarget) onSetNavigationTarget(null);
                         } else if (entity.type !== 'asteroid_field' && entity.type !== 'event_beacon') {
                            onSelectTarget(entity.id);
                         }
                    }}
                >
                    <div className={`relative ${factionColor}`}>
                        {icon}
                        {isSelected && (
                            <>
                                {themeName === 'federation' ? (
                                    <LcarsTargetingReticle />
                                ) : themeName === 'klingon' ? (
                                    <KlingonTargetingReticle />
                                ) : themeName === 'romulan' ? (
                                    <RomulanTargetingReticle />
                                ) : (
                                    <div className="absolute inset-0 border-2 border-accent-yellow rounded-full animate-ping"></div>
                                )}

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
                    <span className={`text-xs mt-1 font-bold ${factionColor} ${isSelected ? 'text-accent-yellow' : ''}`}>{entityName}</span>
                    {entity.type === 'ship' && (
                        <div className="w-10 h-1 bg-bg-paper-lighter rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-accent-green" style={{width: `${(entity.hull / entity.maxHull) * 100}%`}}></div>
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