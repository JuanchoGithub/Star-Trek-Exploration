import React from 'react';
import type { Entity, Ship } from '../types';
import { PlanetIcon, PlayerShipIcon, EnemyShipIcon, NavigationTargetIcon } from './Icons';

interface SectorViewProps {
  entities: Entity[];
  playerShip: Ship;
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  navigationTarget: { x: number; y: number } | null;
  onSetNavigationTarget: (pos: { x: number; y: number } | null) => void;
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


const SectorView: React.FC<SectorViewProps> = ({ entities, playerShip, selectedTargetId, onSelectTarget, navigationTarget, onSetNavigationTarget }) => {
  const sectorSize = { width: 12, height: 10 };
  const gridCells = Array.from({ length: sectorSize.width * sectorSize.height });

  const allEntities = [
      ...entities, 
      {...playerShip, type: 'ship' as const}
  ];

  const path = getPath(playerShip.position, navigationTarget);

  return (
    <div className="bg-black border-2 border-cyan-400 p-2 rounded-md h-[450px]">
      <div className="grid grid-cols-12 grid-rows-10 h-full gap-0 relative">
        {/* Background Grid */}
        {gridCells.map((_, index) => (
          <div key={index} className="border border-cyan-900 border-opacity-50"></div>
        ))}

        {/* Clickable Overlay for Navigation */}
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

        {/* Navigation Path and Target */}
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

        {/* Entities */}
        {allEntities.map((entity) => {
            const isSelected = entity.id === selectedTargetId;
            const isPlayer = entity.id === playerShip.id;

            let icon;
            let factionColor = 'text-gray-400';
            if (entity.type === 'ship') {
                if (isPlayer) {
                    icon = <PlayerShipIcon className="w-8 h-8"/>;
                    factionColor = 'text-blue-400';
                } else {
                    icon = <EnemyShipIcon className="w-8 h-8"/>;
                    factionColor = 'text-red-500';
                }
            } else {
                icon = <PlanetIcon className="w-10 h-10 text-green-500" />;
            }
            
            return (
                <div
                    key={entity.id}
                    className={`absolute flex flex-col items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-30 ${!isPlayer ? 'cursor-pointer' : 'cursor-pointer'}`}
                    style={{ left: `${(entity.position.x / sectorSize.width) * 100 + (100 / sectorSize.width / 2)}%`, top: `${(entity.position.y / sectorSize.height) * 100 + (100 / sectorSize.height / 2)}%` }}
                    onClick={(e) => {
                         e.stopPropagation(); // Prevent grid click when clicking on an entity
                         if (isPlayer) {
                            onSetNavigationTarget(null); // Clicking player ship cancels navigation
                         } else {
                            onSelectTarget(entity.id);
                         }
                    }}
                >
                    <div className={`relative ${factionColor}`}>
                        {icon}
                        {isSelected && (
                            <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping"></div>
                        )}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-300 rounded-full"></div>
                    </div>
                    <span className={`text-xs mt-1 font-bold ${factionColor} ${isSelected ? 'text-yellow-400' : ''}`}>{entity.name}</span>
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
