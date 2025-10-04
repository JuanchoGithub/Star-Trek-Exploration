import React, { useRef } from 'react';
import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import EnergyAllocator from './EnergyAllocator';
import { isPosInIonStorm, isPosInNebula } from '../game/utils/sector';

interface ShipStatusProps {
    gameState: GameState;
    onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
    onToggleRedAlert: () => void;
    onEvasiveManeuvers: () => void;
    onSelectRepairTarget: (subsystem: 'hull' | keyof ShipSubsystems | null) => void;
    onToggleCloak: () => void;
    onTogglePointDefense: () => void;
    themeName: ThemeName;
}

const StatusBar: React.FC<{ label: string; value: number; max: number; colorClass: string; children?: React.ReactNode }> = ({ label, value, max, colorClass, children }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-bold flex items-center gap-1">{label} {children}</span>
        <span>{Math.round(value)} / {max}</span>
      </div>
      <div className="w-full bg-bg-paper-lighter rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const TacticalButton: React.FC<{
    label: string;
    status: string;
    colorClass: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ label, status, colorClass, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded w-full transition-colors hover:bg-bg-paper disabled:bg-bg-paper-lighter disabled:cursor-not-allowed disabled:opacity-60"
    >
        <span className="font-bold text-text-secondary uppercase tracking-wider pl-1">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${disabled ? 'text-text-disabled bg-gray-800' : colorClass}`}>{status}</span>
    </button>
);

const ReadOnlyStatusIndicator: React.FC<{ label: string; status: string; colorClass: string; }> = ({ label, status, colorClass }) => (
    <div className="flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded">
        <span className="font-bold text-text-secondary uppercase tracking-wider pl-1">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{status}</span>
    </div>
);


const ShipStatus: React.FC<ShipStatusProps> = ({ 
    gameState, onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget, onToggleCloak, onTogglePointDefense, themeName 
}) => {
  const { player, redAlert, currentSector } = gameState;
  const { ship } = player;
  const { TorpedoIcon, SecurityIcon, DilithiumIcon } = getFactionIcons(themeName);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cloakStatusText =
    ship.cloakState === 'cloaked' ? 'ACTIVE' :
    ship.cloakState === 'cloaking' ? 'ENGAGING' :
    ship.cloakState === 'decloaking' ? 'DECLOAKING' :
    ship.cloakCooldown > 0 ? `COOLING (${ship.cloakCooldown})` : 'INACTIVE';

  const cloakColor = 
    ship.cloakState === 'cloaked' ? 'text-accent-teal bg-teal-900 bg-opacity-50' : 
    (ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking' ? 'text-accent-yellow bg-yellow-900 bg-opacity-50' : 'text-text-disabled');

  const hullPercentage = (ship.hull / ship.maxHull) * 100;
  let hullColor = 'text-green-400';
  if (hullPercentage < 60) hullColor = 'text-yellow-400';
  if (hullPercentage < 25) hullColor = 'text-red-500';

  const engineFailureIndicator = ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5 ? (
    <span className="text-red-500 font-bold ml-2 animate-pulse">OFFLINE</span>
  ) : null;
  
  const lifeSupportFailureIndicator = ship.lifeSupportFailureTurn !== null ? (
    <span className="text-red-500 font-bold ml-2 animate-pulse">
        FAILING ({Math.max(0, 2 - (gameState.turn - ship.lifeSupportFailureTurn))})
    </span>
  ) : null;

    const allEntities = [...currentSector.entities, ship];
    const allShips = allEntities.filter(e => e.type === 'ship') as Ship[];
    const torpedoes = allEntities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];

    const shipsTargetingMe = allShips.filter(s => s.currentTargetId === ship.id);
    const incomingTorpedoes = torpedoes.filter(t => t.targetId === ship.id);
    const threatInfo = ship.threatInfo;

    const incomingTorpedoesByType = incomingTorpedoes.reduce((acc, torpedo) => {
        acc[torpedo.torpedoType] = (acc[torpedo.torpedoType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const inIonStorm = isPosInIonStorm(ship.position, currentSector);
    const inNebula = isPosInNebula(ship.position, currentSector);
    const inAsteroidField = currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y);


  return (
    <div className="panel-style p-3 flex flex-col h-full">
      <h3 className="text-lg font-bold text-secondary-light mb-2 flex-shrink-0">Ship Status</h3>
      <div 
        ref={scrollContainerRef}
        className="flex-grow space-y-2 overflow-y-auto pr-2"
      >
        <StatusBar label="Hull" value={ship.hull} max={ship.maxHull} colorClass="bg-accent-red" />
        <StatusBar 
            label={redAlert ? "Shields" : "Shields (OFFLINE)"} 
            value={redAlert ? ship.shields : 0} 
            max={ship.maxShields} 
            colorClass={redAlert ? "bg-secondary-main" : "bg-text-disabled"}
        />
        <StatusBar label="Reserve Power" value={ship.energy.current} max={ship.energy.max} colorClass="bg-accent-yellow" />
        <StatusBar label="Crew Morale" value={ship.crewMorale.current} max={ship.crewMorale.max} colorClass="bg-accent-sky" />
        
        <div className="flex justify-between items-center text-sm">
            <span className="font-bold flex items-center gap-1"><DilithiumIcon className="w-5 h-5 text-accent-pink"/> Dilithium</span>
            <span className="font-bold text-accent-pink">{ship.dilithium.current} / {ship.dilithium.max}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="font-bold flex items-center gap-1"><TorpedoIcon className="w-5 h-5 text-secondary-main"/> Torpedoes</span>
            <span className="font-bold text-accent-orange">{ship.torpedoes.current} / {ship.torpedoes.max}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="font-bold flex items-center gap-1"><SecurityIcon className="w-5 h-5 text-accent-red"/> Security</span>
            <span className="font-bold text-accent-orange">{ship.securityTeams.current} / {ship.securityTeams.max}</span>
        </div>
        
        <div className="mt-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Tactical Systems</h4>
            <div className="flex flex-col gap-2 mt-1">
                <TacticalButton
                    label="Red Alert"
                    status={redAlert ? 'ACTIVE' : 'STANDBY'}
                    colorClass={redAlert ? 'text-accent-red bg-red-900 bg-opacity-50' : 'text-text-disabled'}
                    onClick={onToggleRedAlert}
                />
                <TacticalButton
                    label="Evasive"
                    status={ship.evasive ? 'ENABLED' : 'DISABLED'}
                    colorClass={ship.evasive ? 'text-accent-green bg-green-900 bg-opacity-50' : 'text-text-disabled'}
                    onClick={onEvasiveManeuvers}
                    disabled={!redAlert || ship.subsystems.engines.health <= 0}
                />
                {ship.cloakingCapable && (
                     <TacticalButton
                        label="Cloak"
                        status={cloakStatusText}
                        colorClass={cloakColor}
                        onClick={onToggleCloak}
                        disabled={ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking' || (ship.cloakState === 'visible' && ship.cloakCooldown > 0)}
                    />
                )}
                 <TacticalButton
                    label="Point-Defense"
                    status={ship.pointDefenseEnabled ? 'ACTIVE' : 'INACTIVE'}
                    colorClass={ship.pointDefenseEnabled ? 'text-accent-orange bg-orange-900 bg-opacity-50' : 'text-text-disabled'}
                    onClick={onTogglePointDefense}
                />
            </div>
        </div>
        
        <div className="mt-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Environment</h4>
            <div className="flex flex-col gap-1 mt-1">
                <ReadOnlyStatusIndicator 
                    label="In Ion Storm"
                    status={inIonStorm ? 'YES' : 'NO'}
                    colorClass={inIonStorm ? 'text-accent-yellow bg-yellow-900 bg-opacity-50 animate-pulse' : 'text-text-disabled'}
                />
                <ReadOnlyStatusIndicator 
                    label="In Nebula"
                    status={inNebula ? 'YES' : 'NO'}
                    colorClass={inNebula ? 'text-purple-400 bg-purple-900 bg-opacity-50' : 'text-text-disabled'}
                />
                <ReadOnlyStatusIndicator 
                    label="In Asteroids"
                    status={inAsteroidField ? 'YES' : 'NO'}
                    colorClass={inAsteroidField ? 'text-gray-400 bg-gray-700 bg-opacity-50' : 'text-text-disabled'}
                />
            </div>
        </div>


        <div className="mt-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Threat Analysis</h4>
            <div className="flex flex-col gap-1 mt-1">
                <ReadOnlyStatusIndicator
                    label="Hostiles Targeting"
                    status={`${shipsTargetingMe.length}`}
                    colorClass={shipsTargetingMe.length > 0 ? 'text-accent-red bg-red-900 bg-opacity-50' : 'text-text-disabled'}
                />
                <ReadOnlyStatusIndicator
                    label="Inbound Torpedoes"
                    status={`${incomingTorpedoes.length}`}
                    colorClass={incomingTorpedoes.length > 0 ? 'text-accent-orange bg-orange-900 bg-opacity-50' : 'text-text-disabled'}
                />
                {Object.entries(incomingTorpedoesByType).map(([type, count]) => (
                    <div key={type} className="text-xs text-text-secondary pl-4 flex justify-between">
                        <span>- {type}</span>
                        <span className="font-bold">{count}</span>
                    </div>
                ))}
                {threatInfo && threatInfo.total > 0 && (
                    <>
                        <ReadOnlyStatusIndicator
                            label="Threat Pressure"
                            status={threatInfo.total.toFixed(2)}
                            colorClass={threatInfo.total > 0.5 ? 'text-accent-red' : (threatInfo.total > 0.2 ? 'text-accent-yellow' : 'text-text-secondary')}
                        />
                        {threatInfo.contributors.map(c => {
                            const source = allEntities.find(e => e.id === c.sourceId);
                            return (
                                <div key={c.sourceId} className="text-xs text-text-secondary pl-4 flex justify-between">
                                    <span>- {source?.name || 'Unknown'}</span>
                                    <span className="font-bold">{c.score.toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>

        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2">Damage Control</h4>
            <div className="flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded w-full mb-1">
                <span className="font-bold text-text-secondary uppercase tracking-wider pl-1">CURRENT TARGET</span>
                <span className={`font-bold px-2 py-0.5 rounded ${ship.repairTarget ? 'text-accent-yellow bg-yellow-900 bg-opacity-50' : 'text-text-disabled'}`}>
                    {ship.repairTarget ? ship.repairTarget.toUpperCase() : 'INACTIVE'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-1 mt-1">
                <button 
                    onClick={() => onSelectRepairTarget('hull')}
                    className={`flex justify-between items-center bg-black/30 px-2 py-0.5 rounded text-xs transition-colors hover:bg-black/60 ${player.ship.repairTarget === 'hull' ? 'ring-2 ring-accent-yellow' : ''}`}
                >
                    <span className="font-bold uppercase">HULL</span>
                    <span className={`font-bold ${hullColor}`}>{Math.round(hullPercentage)}%</span>
                </button>
                {(Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).map(key => {
                    const system = ship.subsystems[key];
                    if (system.maxHealth === 0) return null;
                    const healthPercentage = (system.health / system.maxHealth) * 100;
                    let color = 'text-green-400';
                    if (healthPercentage < 60) color = 'text-yellow-400';
                    if (healthPercentage < 25) color = 'text-red-500';

                    let failureIndicator = null;
                    if (key === 'engines' && engineFailureIndicator) {
                        failureIndicator = engineFailureIndicator;
                    } else if (key === 'lifeSupport' && lifeSupportFailureIndicator) {
                        failureIndicator = lifeSupportFailureIndicator;
                    }

                    return (
                        <button 
                            key={key} 
                            onClick={() => onSelectRepairTarget(key)}
                            className={`flex justify-between items-center bg-black/30 px-2 py-0.5 rounded text-xs transition-colors hover:bg-black/60 ${ship.repairTarget === key ? 'ring-2 ring-accent-yellow' : ''}`}
                        >
                            <span className="font-bold uppercase flex items-center">{key.substring(0,4)} {failureIndicator}</span>
                            <span className={`font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
      <div className="flex-shrink-0 mt-3">
          <EnergyAllocator allocation={ship.energyAllocation} onEnergyChange={onEnergyChange} themeName={themeName} />
      </div>
    </div>
  );
};

export default ShipStatus;