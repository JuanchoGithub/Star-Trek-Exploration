
import React from 'react';
import type { GameState, Ship, ShipSubsystems } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';

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

const ReadOnlyStatusIndicator: React.FC<{ label: string; status: string; colorClass: string; }> = ({ label, status, colorClass }) => (
    <div className="flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded">
        <span className="font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{status}</span>
    </div>
);

const SubsystemStatus: React.FC<{ subsystems: ShipSubsystems; }> = ({ subsystems }) => (
    <div className="grid grid-cols-2 gap-1 mt-2">
        {(Object.keys(subsystems) as Array<keyof ShipSubsystems>).map(key => {
            const system = subsystems[key];
            // FIX: Add a null check for 'system' to prevent crashes when accessing properties on potentially undefined subsystems, which can occur when loading older save files.
            if (!system || system.maxHealth === 0) return null;
            const healthPercentage = (system.health / system.maxHealth) * 100;
            let color = 'text-green-400';
            if (healthPercentage < 60) color = 'text-yellow-400';
            if (healthPercentage < 25) color = 'text-red-500';

            return (
                <div key={key} className="flex justify-between items-center bg-black/30 px-2 py-0.5 rounded text-xs">
                    <span className="font-bold uppercase">{key.substring(0,4)}</span>
                    <span className={`font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                </div>
            );
        })}
    </div>
);

interface ReplayStatusPanelProps {
  gameState: GameState;
  themeName: ThemeName;
}

const ReplayStatusPanel: React.FC<ReplayStatusPanelProps> = ({ gameState, themeName }) => {
  const { player, turn, redAlert } = gameState;
  const { ship } = player;
  const { TorpedoIcon, SecurityIcon, DilithiumIcon } = getFactionIcons(themeName);
  
  const cloakStatusText =
    ship.cloakState === 'cloaked' ? 'ACTIVE' :
    ship.cloakState === 'cloaking' ? 'ENGAGING' :
    ship.cloakCooldown > 0 ? `RECHARGING (${ship.cloakCooldown})` : 'READY';

  const retreatStatusText = ship.retreatingTurn 
    ? `CHARGING (${ship.retreatingTurn - turn})`
    : 'NO';

  return (
    <div className="panel-style p-3 flex flex-col">
      <h3 className="text-lg font-bold text-secondary-light mb-2 flex-shrink-0">Player Status - Turn {turn}</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1">
            <ReadOnlyStatusIndicator 
                label="Red Alert" 
                status={redAlert ? 'ACTIVE' : 'STANDBY'} 
                colorClass={redAlert ? 'text-accent-red bg-red-900 bg-opacity-50' : 'text-text-disabled'}
            />
            <ReadOnlyStatusIndicator 
                label="Evasive" 
                status={ship.evasive ? 'ENABLED' : 'DISABLED'} 
                colorClass={ship.evasive ? 'text-accent-green bg-green-900 bg-opacity-50' : 'text-text-disabled'}
            />
            {ship.cloakingCapable && (
             <ReadOnlyStatusIndicator 
                label="Cloak" 
                status={cloakStatusText}
                colorClass={ship.cloakState === 'cloaked' ? 'text-accent-teal bg-teal-900 bg-opacity-50' : (ship.cloakState === 'cloaking' ? 'text-accent-yellow bg-yellow-900 bg-opacity-50' : 'text-text-disabled')}
            />
           )}
           <ReadOnlyStatusIndicator 
              label="Point Defense" 
              status={ship.pointDefenseEnabled ? 'ACTIVE' : 'INACTIVE'} 
              colorClass={ship.pointDefenseEnabled ? 'text-accent-orange bg-orange-900 bg-opacity-50' : 'text-text-disabled'}
            />
            <ReadOnlyStatusIndicator 
              label="Damage Control" 
              status={ship.repairTarget ? `REPAIRING ${ship.repairTarget.toUpperCase()}` : 'INACTIVE'} 
              colorClass={ship.repairTarget ? 'text-accent-yellow bg-yellow-900 bg-opacity-50' : 'text-text-disabled'}
            />
            <ReadOnlyStatusIndicator 
              label="Retreating" 
              status={retreatStatusText}
              colorClass={ship.retreatingTurn ? 'text-accent-yellow animate-pulse bg-yellow-900 bg-opacity-50' : 'text-text-disabled'}
            />
            <ReadOnlyStatusIndicator 
              label="Stunned" 
              status={ship.isStunned ? 'YES' : 'NO'}
              colorClass={ship.isStunned ? 'text-accent-orange bg-orange-900 bg-opacity-50' : 'text-text-disabled'}
            />
        </div>

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

        {ship.statusEffects.length > 0 && (
            <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2">Active Effects</h4>
                {ship.statusEffects.map((effect, i) => (
                     <ReadOnlyStatusIndicator 
                        key={i}
                        label={effect.type.replace('_', ' ').toUpperCase()}
                        status={`${effect.damage} DMG/T (${effect.turnsRemaining}T)`}
                        colorClass={'text-accent-red bg-red-900 bg-opacity-50'}
                    />
                ))}
            </div>
        )}

        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2">Subsystems</h4>
            <SubsystemStatus subsystems={ship.subsystems} />
        </div>
        
         <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2">Energy Allocation</h4>
            <div className="flex justify-between items-center text-sm bg-black/30 p-1 rounded">
                <span className="text-red-400 font-bold">WPN: {ship.energyAllocation.weapons}%</span>
                <span className="text-cyan-400 font-bold">SHD: {ship.energyAllocation.shields}%</span>
                <span className="text-green-400 font-bold">ENG: {ship.energyAllocation.engines}%</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ReplayStatusPanel;
