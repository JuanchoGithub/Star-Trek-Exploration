
import React from 'react';
import type { Entity, Ship, SectorState, Planet, TorpedoProjectile, Shuttle, Starbase } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { starbaseTypes } from '../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { FederationShuttleIcon } from '../assets/ships/icons/federation';
import { NavigationTargetIcon } from '../assets/ui/icons';
import { ThemeName } from '../hooks/useTheme';
import LcarsTargetingReticle from './LcarsTargetingReticle';
import KlingonTargetingReticle from './KlingonTargetingReticle';
import RomulanTargetingReticle from './RomulanTargetingReticle';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
// FIX: Corrected import from canPlayerSeeEntity to canShipSeeEntity.
import { canShipSeeEntity } from '../game/utils/visibility';
import { isDeepNebula } from '../game/utils/sector';
import { asteroidIcons } from '../assets/asteroids/icons';
import { cyrb53 } from '../game/utils/helpers';

interface SectorViewProps {
  entities: Entity[];
  playerShip: Ship;
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  navigationTarget: { x: number; y: number } | null;
  onSetNavigationTarget: (pos: { x: number; y: number } | null) => void;
  sector: SectorState;
  themeName: ThemeName;
  onCellClick?: (pos: { x: number; y: number }) => void;
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

const SectorView: React.FC<SectorViewProps> = ({ entities, playerShip, selectedTargetId, onSelectTarget, navigationTarget, onSetNavigationTarget, sector, themeName, onCellClick }) => {
  const sectorSize = { width: 12, height: 10 };
  const gridCells = Array.from({ length: sectorSize.width * sectorSize.height });

  const allEntities = [
      ...entities, 
      ...(playerShip ? [{...playerShip, type: 'ship' as const}] : [])
  ];

  const computerHealthPercent = playerShip ? (playerShip.subsystems.computer.health / playerShip.subsystems.computer.maxHealth) * 100 : 100;
  const isNavDisabled = computerHealthPercent < 100;

  const handleGridInteraction = (x: number, y: number) => {
    if (onCellClick) {
        onCellClick({ x, y });
        return;
    }

    // Cancel navigation if clicking the currently set target
    if (navigationTarget && navigationTarget.x === x && navigationTarget.y === y) {
        onSetNavigationTarget(null);
        return;
    }

    const entityAtPos = allEntities.find(e => e.position.x === x && e.position.y === y && e.id !== playerShip?.id);

    // If the cell is empty or contains an asteroid field, treat it as a navigation target
    if ((!entityAtPos || entityAtPos.type === 'asteroid_field') && !isNavDisabled) {
        onSetNavigationTarget({ x, y });
    } else if (entityAtPos && entityAtPos.type !== 'event_beacon') {
        // If it contains another interactable entity (ship, planet), select it for targeting/info
        onSelectTarget(entityAtPos.id);
    }
    // Clicks on event beacons or occupied cells (for navigation) are ignored here.
  };

  const path = playerShip ? getPath(playerShip.position, navigationTarget) : [];

  const visibleEntities = playerShip ? allEntities.filter(entity => {
      if (entity.type === 'ship' && (entity as Ship).cloakState === 'cloaked') return false;
      // FIX: Corrected function call from canPlayerSeeEntity to canShipSeeEntity.
      return canShipSeeEntity(entity, playerShip, sector);
  }) : allEntities;


  return (
    <div className="bg-black border-2 border-border-light p-2 rounded-r-md h-full relative">
      {themeName === 'klingon' && <div className="klingon-sector-grid-overlay" />}
      
      {/* Background grid for borders and click handlers */}
      <div className="grid grid-cols-12 grid-rows-10 h-full gap-0 relative z-0">
        {gridCells.map((_, index) => {
          const x = index % sectorSize.width;
          const y = Math.floor(index / sectorSize.width);
          return (
            <div
              key={`cell-${x}-${y}`}
              className={`border border-border-dark border-opacity-50 ${!isNavDisabled ? 'hover:bg-secondary-light hover:bg-opacity-20 cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleGridInteraction(x, y)}
              title={isNavDisabled ? "Navigation computer is damaged" : ""}
            />
          );
        })}
      </div>

      {/* Absolutely positioned layer for nebula effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {sector.nebulaCells.map(pos => {
          const isDeep = isDeepNebula(pos, sector);
          const topPercent = (pos.y / sectorSize.height) * 100;
          const leftPercent = (pos.x / sectorSize.width) * 100;
          const widthPercent = 100 / sectorSize.width;
          const heightPercent = 100 / sectorSize.height;

          return (
            <div
              key={`nebula-${pos.x}-${pos.y}`}
              className="absolute"
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              <div className="nebula-cell" />
              {isDeep && <div className="deep-nebula-overlay" />}
            </div>
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

      {visibleEntities.map((entity) => {
          const isSelected = entity.id === selectedTargetId;
          const isPlayer = playerShip && entity.id === playerShip.id;

          let icon: React.ReactNode;
          let factionColor = 'text-gray-400';
          let entityName = entity.name;
          let transformStyle = { transform: `translate(-50%, -50%)` };
          
          let wrapperClass = 'transition-opacity duration-500';
          if (entity.type === 'ship') {
              const ship = entity as Ship;
              if (ship.cloakState === 'cloaked' || ship.cloakState === 'cloaking') {
                  wrapperClass += ' opacity-50';
              }
              if (ship.isDerelict) {
                  wrapperClass += ' opacity-60 grayscale';
                  entityName = `${entity.name} (Derelict)`;
              }
          }

          if (entity.type === 'torpedo_projectile') {
               const torpedo = entity as TorpedoProjectile;
               const target = allEntities.find(e => e.id === torpedo.targetId);
               if (target) {
                  const angle = Math.atan2(target.position.y - entity.position.y, target.position.x - entity.position.x) * 180 / Math.PI;
                  transformStyle = { transform: `translate(-50%, -50%) rotate(${angle}deg)` };
               }
               
               const torpedoConfig = torpedoStats[torpedo.torpedoType];
               const TorpedoIcon = torpedoConfig.icon;

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
                          <TorpedoIcon className={`w-6 h-6 ${torpedoConfig.colorClass}`} />
                      </div>
                  </React.Fragment>
               );
          }
          if (entity.type === 'ship') {
              const shipEntity = entity as Ship;
              
              if (!shipEntity.scanned && !isPlayer) {
                  const config = shipVisuals.Unknown.classes['Unknown']!;
                  const IconComponent = config.icon;
                  icon = <IconComponent className="w-8 h-8"/>;
                  factionColor = config.colorClass;
                  entityName = 'Unknown Contact';
              } else {
                  const visualConfig = shipVisuals[shipEntity.shipModel];
                  const classConfig = visualConfig?.classes[shipEntity.shipClass] ?? shipVisuals.Unknown.classes['Unknown']!;
                  const IconComponent = classConfig.icon;
                  icon = <IconComponent className="w-8 h-8"/>;
                  
                  if (shipEntity.faction === 'Federation' && shipEntity.shipModel !== 'Federation') {
                      factionColor = shipVisuals.Federation.classes['Sovereign-class']!.colorClass;
                  } else {
                      factionColor = classConfig.colorClass;
                  }
              }

          } else if (entity.type === 'shuttle') {
              icon = <FederationShuttleIcon className="w-6 h-6" />;
              factionColor = shipVisuals.Federation.classes['Sovereign-class']!.colorClass;
          } else if (entity.type === 'starbase') {
              const starbase = entity as Starbase;
              const config = starbaseTypes[starbase.starbaseType];
              const IconComponent = config.icon;
              icon = <IconComponent className="w-12 h-12" />;
              factionColor = config.colorClass;
          } else if (entity.type === 'asteroid_field') {
              const iconIndex = cyrb53(entity.id, 1) % asteroidIcons.length;
              const IconComponent = asteroidIcons[iconIndex];
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
                  const FallbackIcon = planetTypes['M'].icon;
                  icon = <FallbackIcon className={`w-10 h-10 ${planetTypes['M'].colorClass}`} />;
              }
          }
          
          return (
              <div
                  key={entity.id}
                  className={`absolute flex flex-col items-center justify-center transition-all duration-300 z-30 cursor-pointer ${wrapperClass}`}
                  style={{ 
                      left: `${(entity.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, 
                      top: `${(entity.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%`,
                      ...transformStyle
                  }}
                  onClick={(e) => {
                       e.stopPropagation();
                       if (isPlayer) {
                           if(navigationTarget) onSetNavigationTarget(null);
                           return;
                       }
                       // All entity clicks are now routed through the main handler
                       handleGridInteraction(entity.position.x, entity.position.y);
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
                          </>
                      )}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-300 rounded-full"></div>
                  </div>
                  {!isPlayer && entity.type !== 'asteroid_field' && <span className={`text-xs mt-1 font-bold ${factionColor} ${isSelected ? 'text-accent-yellow' : ''}`}>{entityName}</span>}
                  {entity.type === 'ship' && (
                      <div className="w-10 h-1 bg-bg-paper-lighter rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-accent-green" style={{width: `${(entity.hull / entity.maxHull) * 100}%`}}></div>
                      </div>
                  )}
              </div>
          );
      })}
    </div>
  );
};

export default SectorView;