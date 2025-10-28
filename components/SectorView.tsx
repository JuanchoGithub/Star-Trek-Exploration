import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Entity, Ship, SectorState, Planet, TorpedoProjectile, Shuttle, Starbase, Mine, Position } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { starbaseTypes } from '../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { FederationShuttleIcon } from '../assets/ships/icons/federation';
import { NavigationTargetIcon } from '../assets/ui/icons';
import LcarsTargetingReticle from './LcarsTargetingReticle';
import KlingonTargetingReticle from './KlingonTargetingReticle';
import RomulanTargetingReticle from './RomulanTargetingReticle';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
import { canShipSeeEntity } from '../game/utils/visibility';
import { isDeepNebula, isDeepIonStorm } from '../game/utils/sector';
import { asteroidIcons } from '../assets/asteroids/icons';
import { cyrb53 } from '../game/utils/helpers';
import { getPath } from '../game/utils/ai';
import { PlasmaMineIcon } from '../assets/projectiles/icons';
import { useGameState } from '../contexts/GameStateContext';
import { useGameActions } from '../contexts/GameActionsContext';
import { useUIState } from '../contexts/UIStateContext';

// Hex Grid Geometry & Coordinate Conversion
const getHexProps = (q: number, r: number, size: number) => {
    const isOdd = q & 1;
    const cx = size * 1.5 * q;
    const cy = Math.sqrt(3) * size * (r + 0.5 * isOdd);

    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i);
        points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    }

    return { cx, cy, points: points.join(' ') };
};

const pixelToHex = (x: number, y: number, size: number) => {
    const q = x * (2/3) / size;
    const r = (-x / 3 + Math.sqrt(3)/3 * y) / size;
    
    // Convert axial to cube
    const cx = q;
    const cz = r;
    const cy = -cx - cz;

    // Round cube coordinates
    let rx = Math.round(cx);
    let ry = Math.round(cy);
    let rz = Math.round(cz);

    const x_diff = Math.abs(rx - cx);
    const y_diff = Math.abs(ry - cy);
    const z_diff = Math.abs(rz - cz);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    } else if (y_diff > z_diff) {
        ry = -rx - rz;
    } else {
        rz = -rx - ry;
    }
    
    // Convert cube back to odd-q offset
    const col = rx;
    const row = rz + (rx - (rx & 1)) / 2;
    return { x: col, y: row };
};

const Hexagon: React.FC<{
    q: number;
    r: number;
    points: string;
    className: string;
    onClick: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    title?: string;
}> = React.memo((props) => (
    <polygon {...props} />
));

const getHexPixelCoords = (pos: { x: number, y: number }, hexSize: number) => {
    const hexHeight = Math.sqrt(3) * hexSize;
    const x = hexSize * 1.5 * pos.x;
    const y = hexHeight * (pos.y + 0.5 * (pos.x & 1));
    return { x, y };
};

interface SectorViewProps {
  onCellClick?: (pos: { x: number; y: number }) => void;
  spectatorMode?: boolean;
  onMoveShip?: (shipId: string, newPos: { x: number; y: number }) => void;
  isResizing?: boolean;
  showTacticalOverlay?: boolean;
  
  // Props for simulator setup mode to bypass context
  sector?: SectorState;
  entities?: Entity[];
  playerShip?: Ship | null;
  selectedTargetId?: string | null;
  navigationTarget?: Position | null;
  onSelectTarget?: (id: string | null) => void;
  onSetNavigationTarget?: (pos: Position | null) => void;
}

const SectorView: React.FC<SectorViewProps> = (props) => {
  const { onCellClick, spectatorMode = false, onMoveShip, isResizing = false, showTacticalOverlay = false } = props;

  const contextGameState = useGameState();
  const contextGameActions = useGameActions();
  const contextUIState = useUIState();

  const sector = props.sector ?? contextGameState.gameState?.currentSector;
  const selectedTargetId = props.selectedTargetId !== undefined ? props.selectedTargetId : contextGameState.selectedTargetId;
  const navigationTarget = props.navigationTarget !== undefined ? props.navigationTarget : contextGameState.navigationTarget;
  const onSelectTarget = props.onSelectTarget ?? contextGameActions.onSelectTarget;
  const onSetNavigationTarget = props.onSetNavigationTarget ?? contextGameActions.onSetNavigationTarget;
  const playerShip = props.playerShip !== undefined ? props.playerShip : contextGameState.gameState?.player.ship;

  const allEntities = useMemo(() => {
    if (props.entities) {
      return props.entities;
    }
    if (contextGameState.gameState) {
      const player = contextGameState.gameState.player.ship;
      const gameEntities = contextGameState.gameState.currentSector.entities;
      if (player && player.id && !gameEntities.some(e => e.id === player.id)) {
        return [player, ...gameEntities];
      }
      return gameEntities;
    }
    return [];
  }, [props.entities, contextGameState.gameState]);

  const { themeName, entityRefs } = contextUIState;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hexSize, setHexSize] = useState(30);

  useEffect(() => {
    const updateSize = () => {
        if (containerRef.current) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            const sizeFromWidth = (offsetWidth / (11 * 1.5 + 0.5)) / 1.05;
            const sizeFromHeight = (offsetHeight / (10 * Math.sqrt(3) + Math.sqrt(3) / 2)) / 1.05;
            setHexSize(Math.min(sizeFromWidth, sizeFromHeight));
            setContainerSize({ width: offsetWidth, height: offsetHeight });
        }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  if (!sector) return null;
  
  const sectorSize = { width: 11, height: 10 };

  const hexGridProps = useMemo(() => {
    const grid: { q: number, r: number, points: string, cx: number, cy: number }[] = [];
    for (let q = 0; q < sectorSize.width; q++) {
        for (let r = 0; r < sectorSize.height; r++) {
            grid.push({ q, r, ...getHexProps(q, r, hexSize) });
        }
    }
    return grid;
  }, [hexSize, sectorSize.width, sectorSize.height]);

  const totalPixelWidth = (sectorSize.width * 1.5 + 0.5) * hexSize;
  const totalPixelHeight = (sectorSize.height * Math.sqrt(3) + Math.sqrt(3)/2) * hexSize;
  const xOffset = (containerSize.width - totalPixelWidth) / 2;
  const yOffset = (containerSize.height - totalPixelHeight) / 2;

  const computerHealthPercent = playerShip ? (playerShip.subsystems.computer.health / playerShip.subsystems.computer.maxHealth) * 100 : 100;
  const isNavDisabled = computerHealthPercent < 100;

  const handleGridInteraction = (x: number, y: number) => {
    if (onCellClick) {
        onCellClick({ x, y });
        return;
    }

    if (spectatorMode) {
        const entityAtPos = allEntities.find(e => e.position.x === x && e.position.y === y);
        if (entityAtPos) {
            onSelectTarget(selectedTargetId === entityAtPos.id ? null : entityAtPos.id);
        } else {
            onSelectTarget(null);
        }
        return;
    }

    if (navigationTarget && navigationTarget.x === x && navigationTarget.y === y) {
        onSetNavigationTarget(null);
        return;
    }

    const entityAtPos = allEntities.find(e => e.position.x === x && e.position.y === y);

    if ((!entityAtPos || entityAtPos.type === 'asteroid_field') && !isNavDisabled) {
        onSetNavigationTarget({ x, y });
    } else if (entityAtPos && playerShip && entityAtPos.id !== playerShip.id && entityAtPos.type !== 'event_beacon') {
        onSelectTarget(entityAtPos.id);
    }
  };

  const path = playerShip ? getPath(playerShip.position, navigationTarget) : [];

  const visibleEntities = playerShip ? allEntities.filter(entity => {
      if (entity.type === 'torpedo_projectile') {
          return true;
      }
      if (entity.type === 'ship' && ((entity as Ship).cloakState === 'cloaked' || (entity as Ship).cloakState === 'cloaking')) return false;
      if (entity.type === 'mine') {
          const mine = entity as Mine;
          if (playerShip.shipModel && !mine.visibleTo.includes(playerShip.shipModel)) {
              return false;
          }
      }
      return canShipSeeEntity(entity, playerShip, sector);
  }) : allEntities;
  
  const occupiedPositions = useMemo(() => 
    new Set(
      allEntities
        .filter(e => e.type !== 'asteroid_field' && e.type !== 'torpedo_projectile')
        .map(e => `${e.position.x},${e.position.y}`)
    )
  , [allEntities]);

  const groupTransformX = xOffset + hexSize;
  const groupTransformY = yOffset + hexSize * Math.sqrt(3) / 2;
  
const tacticalOverlayElements = useMemo(() => {
    const shouldShow = spectatorMode || showTacticalOverlay;
    if (!shouldShow || !selectedTargetId || containerSize.width === 0) return null;

    const selectedShip = allEntities.find(e => e.id === selectedTargetId && e.type === 'ship') as Ship | undefined;
    if (!selectedShip) return null;

    const allShips = allEntities.filter(e => e.type === 'ship') as Ship[];
    const shipsTargetingSelected = allShips.filter(s => s.id !== selectedShip.id && s.currentTargetId === selectedTargetId);
    const selectedShipTarget = allShips.find(s => s.id === selectedShip.currentTargetId);
    const selectedCoords = getHexPixelCoords(selectedShip.position, hexSize);

    return (
        <g transform={`translate(${groupTransformX}, ${groupTransformY})`}>
            {shipsTargetingSelected.map(ship => {
                const attackerCoords = getHexPixelCoords(ship.position, hexSize);
                return <line key={`in-${ship.id}`} x1={attackerCoords.x} y1={attackerCoords.y} x2={selectedCoords.x} y2={selectedCoords.y}
                    stroke="var(--color-accent-red)" strokeWidth="1.5" strokeDasharray="4 4"
                />;
            })}

            {selectedShipTarget && (() => {
                const targetCoords = getHexPixelCoords(selectedShipTarget.position, hexSize);
                return <line key={`out-${selectedShipTarget.id}`} x1={selectedCoords.x} y1={selectedCoords.y} x2={targetCoords.x} y2={targetCoords.y}
                    stroke="var(--color-accent-sky)" strokeWidth="1.5" strokeDasharray="5 2"
                />;
            })()}
        </g>
    );
}, [spectatorMode, showTacticalOverlay, selectedTargetId, allEntities, hexSize, containerSize, groupTransformX, groupTransformY]);

const torpedoesTargetingSelectedIds = useMemo(() => {
    const shouldShow = spectatorMode || showTacticalOverlay;
    if (!shouldShow || !selectedTargetId) return new Set<string>();
    const torpedoes = allEntities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    return new Set(torpedoes.filter(t => t.targetId === selectedTargetId).map(t => t.id));
}, [spectatorMode, showTacticalOverlay, selectedTargetId, allEntities]);

  return (
    <div ref={containerRef} className="bg-black border-2 border-border-light p-2 rounded-r-md h-full w-full relative">
      {themeName === 'klingon' && <div className="klingon-sector-grid-overlay" />}

      <svg width="100%" height="100%">
        <g transform={`translate(${groupTransformX}, ${groupTransformY})`}>
            {/* Background Grid */}
            <g className="hex-grid-bg">
                {hexGridProps.map(hex => (
                    <polygon key={`bg-${hex.q}-${hex.r}`} points={hex.points} />
                ))}
            </g>

            {/* Interactive Cells */}
            <g>
                {hexGridProps.map(hex => {
                    const isOccupied = occupiedPositions.has(`${hex.q},${hex.r}`);
                    const canNavigateTo = !isOccupied && !isNavDisabled && !spectatorMode;
                    const className = `hex-cell ${canNavigateTo ? 'navigable' : 'occupied'}`;
                    
                    return (
                        <Hexagon
                            key={`cell-${hex.q}-${hex.r}`}
                            q={hex.q}
                            r={hex.r}
                            points={hex.points}
                            className={className}
                            onClick={() => handleGridInteraction(hex.q, hex.r)}
                            onDragOver={(e) => { if (onMoveShip) e.preventDefault(); }}
                            onDrop={(e) => {
                                if (onMoveShip) {
                                    e.preventDefault();
                                    const shipId = e.dataTransfer.getData("shipId");
                                    if (shipId) onMoveShip(shipId, { x: hex.q, y: hex.r });
                                }
                            }}
                            title={isNavDisabled ? "Navigation computer is damaged" : isOccupied ? "Cell is occupied" : ""}
                        />
                    );
                })}
            </g>
            
            {tacticalOverlayElements}
        </g>
      </svg>
      
      <div className="absolute inset-0 z-10 pointer-events-none">
        {sector.nebulaCells.map(pos => {
          const isDeep = isDeepNebula(pos, sector);
          const { x, y } = getHexPixelCoords(pos, hexSize);
          const cellWidth = hexSize * 2;
          const cellHeight = hexSize * Math.sqrt(3);

          return (
            <div
              key={`nebula-${pos.x}-${pos.y}`}
              className="absolute"
              style={{
                top: `${y + groupTransformY}px`,
                left: `${x + groupTransformX}px`,
                width: `${cellWidth}px`,
                height: `${cellHeight}px`,
                transform: `translate(-${hexSize}px, -${hexSize * Math.sqrt(3) / 2}px)`
              }}
            >
              <div className="nebula-cell" />
              {isDeep && <div className="deep-nebula-overlay" />}
            </div>
          );
        })}
        {sector.ionStormCells.map(pos => {
          const isDeep = isDeepIonStorm(pos, sector);
          const { x, y } = getHexPixelCoords(pos, hexSize);
          const cellWidth = hexSize * 2;
          const cellHeight = hexSize * Math.sqrt(3);

          return (
            <div
              key={`ionstorm-${pos.x}-${pos.y}`}
              className="absolute"
              style={{
                top: `${y + groupTransformY}px`,
                left: `${x + groupTransformX}px`,
                width: `${cellWidth}px`,
                height: `${cellHeight}px`,
                transform: `translate(-${hexSize}px, -${hexSize * Math.sqrt(3) / 2}px)`
              }}
            >
              <div className="ion-storm-cell" />
              {isDeep && <div className="deep-ion-storm-overlay" />}
            </div>
          );
        })}
      </div>

       {containerSize.width > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
              <div style={{ transform: `translate(${groupTransformX}px, ${groupTransformY}px)` }}>
                {navigationTarget && (
                    <>
                    {path.map((pos, i) => {
                        const { x, y } = getHexPixelCoords(pos, hexSize);
                        return (
                            <div key={`path-${i}`}
                                className="absolute w-1 h-1 bg-accent-yellow rounded-full opacity-60"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    transform: `translate(-50%, -50%)`,
                                }}
                            />
                        )
                    })}
                    {(() => {
                        const { x, y } = getHexPixelCoords(navigationTarget, hexSize);
                        return (
                            <div
                                className="absolute flex items-center justify-center text-accent-yellow cursor-pointer pointer-events-auto"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    transform: `translate(-50%, -50%)`,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetNavigationTarget(null);
                                }}
                                title="Cancel Navigation"
                            >
                                <NavigationTargetIcon className="w-8 h-8 animate-pulse" />
                            </div>
                        );
                    })()}
                    </>
                )}

            {visibleEntities.map((entity) => {
                const { x: pixelX, y: pixelY } = getHexPixelCoords(entity.position, hexSize);

                let transformValue = `translate(-50%, -50%)`;

                if (entity.type === 'torpedo_projectile') {
                    const target = allEntities.find(e => e.id === (entity as TorpedoProjectile).targetId);
                    if (target) {
                        const { x: targetX, y: targetY } = getHexPixelCoords(target.position, hexSize);
                        const angle = Math.atan2(targetY - pixelY, targetX - pixelX) * 180 / Math.PI;
                        transformValue += ` rotate(${angle}deg)`;
                    }
                }

                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${pixelX}px`,
                    top: `${pixelY}px`,
                    transform: transformValue,
                    transition: isResizing ? 'none' : 'left 750ms ease-in-out, top 750ms ease-in-out, opacity 500ms ease-in-out, filter 500ms ease-in-out',
                };
                
                const isSelected = entity.id === selectedTargetId;
                const isPlayer = playerShip && entity.id === playerShip.id;

                let icon: React.ReactNode;
                let factionColor = 'text-gray-400';
                let entityName = entity.name;
                let isDestroyed = false;
                
                if (entity.type === 'ship') {
                    const ship = entity as Ship;
                    isDestroyed = ship.hull <= 0;

                    if (isDestroyed) {
                        style.opacity = 0.4;
                        style.filter = 'grayscale(1) brightness(0.5)';
                        entityName = `${entity.name} (Destroyed)`;
                    } else {
                        if (ship.cloakState === 'cloaked' || ship.cloakState === 'cloaking') {
                            style.opacity = 0.5;
                        }
                        if (ship.isDerelict) {
                            style.opacity = 0.6;
                            style.filter = 'grayscale(1)';
                            entityName = `${entity.name} (Derelict)`;
                        }
                    }
                }
                
                if (entity.type === 'torpedo_projectile') {
                    const torpedo = entity as TorpedoProjectile;
                    const torpedoConfig = torpedoStats[torpedo.torpedoType];
                    const TorpedoIcon = torpedoConfig.icon;
                    const isTargetingSelected = torpedoesTargetingSelectedIds.has(torpedo.id);

                    return (
                        <div
                            key={torpedo.id}
                            className={`absolute z-40 cursor-pointer pointer-events-auto ${isSelected ? 'ring-2 ring-accent-yellow rounded-full' : ''} ${isTargetingSelected ? 'animate-pulse' : ''}`}
                            style={style}
                            onClick={(e) => { e.stopPropagation(); onSelectTarget(entity.id); }}
                        >
                            <TorpedoIcon className={`w-6 h-6 ${torpedoConfig.colorClass} ${isTargetingSelected ? 'drop-shadow-[0_0_5px_#fff]' : ''}`} />
                        </div>
                    );
                }
                if (entity.type === 'mine') {
                    const mine = entity as Mine;
                    const isVisible = playerShip && mine.visibleTo.includes(playerShip.shipModel);
                    return (
                        <div
                            key={entity.id}
                            ref={el => { if (entityRefs.current) { entityRefs.current[entity.id] = el; } }}
                            className="absolute z-30"
                            style={style}
                        >
                            <div className="relative">
                                <PlasmaMineIcon className={`w-8 h-8 text-green-400 ${isVisible ? 'animate-pulse' : ''}`} style={{ filter: 'drop-shadow(0 0 5px var(--color-plasma-green))' }} />
                            </div>
                        </div>
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
                        
                        if (shipEntity.allegiance) {
                            switch(shipEntity.allegiance) {
                                case 'player': factionColor = 'text-green-400'; break;
                                case 'ally': factionColor = 'text-sky-400'; break;
                                case 'enemy': factionColor = 'text-red-500'; break;
                                case 'neutral': factionColor = 'text-yellow-400'; break;
                                default: factionColor = 'text-gray-400';
                            }
                        } else {
                            if (shipEntity.faction === 'Federation' && shipEntity.shipModel !== 'Federation') {
                                factionColor = shipVisuals.Federation.classes['Sovereign-class']!.colorClass;
                            } else {
                                factionColor = classConfig.colorClass;
                            }
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
                
                if (isDestroyed) {
                    factionColor = 'text-gray-600';
                }

                return (
                    <div
                        key={entity.id}
                        ref={el => { if (entityRefs.current) { entityRefs.current[entity.id] = el; } }}
                        className="absolute flex flex-col items-center justify-center z-30 pointer-events-auto"
                        style={style}
                        draggable={spectatorMode && onMoveShip && entity.type === 'ship'}
                        onDragStart={(e) => {
                            if (spectatorMode && onMoveShip && entity.type === 'ship') {
                                e.dataTransfer.setData("shipId", entity.id);
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isPlayer && !spectatorMode) {
                                if(navigationTarget) onSetNavigationTarget(null);
                                return;
                            }
                            handleGridInteraction(entity.position.x, entity.position.y);
                        }}
                    >
                        <div className={`relative ${factionColor}`}>
                            {icon}
                            {isSelected && !isDestroyed && (
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
                        {entity.type === 'ship' && !isDestroyed && (
                            <div className="w-10 h-1 bg-bg-paper-lighter rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-accent-green" style={{width: `${(entity.hull / entity.maxHull) * 100}%`}}></div>
                            </div>
                        )}
                    </div>
                );
            })}
              </div>
          </div>
      )}
    </div>
  );
};

export default SectorView;