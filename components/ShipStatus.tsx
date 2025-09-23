import React from 'react';
import type { GameState, ShipSubsystems } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import EnergyAllocator from './EnergyAllocator';

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

const SubsystemStatus: React.FC<{ 
    subsystems: ShipSubsystems; 
    repairTarget: 'hull' | keyof ShipSubsystems | null; 
    onSelect: (target: keyof ShipSubsystems) => void; 
}> = ({ subsystems, repairTarget, onSelect }) => (
    <div className="grid grid-cols-2 gap-1 mt-2">
        {(Object.keys(subsystems) as Array<keyof ShipSubsystems>).map(key => {
            const system = subsystems[key];
            if (system.maxHealth === 0) return null;
            const healthPercentage = (system.health / system.maxHealth) * 100;
            let color = 'text-green-400';
            if (healthPercentage < 60) color = 'text-yellow-400';
            if (healthPercentage < 25) color = 'text-red-500';

            return (
                <button 
                    key={key} 
                    onClick={() => onSelect(key)}
                    className={`flex justify-between items-center bg-black/30 px-2 py-0.5 rounded text-xs transition-colors hover:bg-black/60 ${repairTarget === key ? 'ring-2 ring-accent-yellow' : ''}`}
                >
                    <span className="font-bold uppercase">{key.substring(0,4)}</span>
                    <span className={`font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                </button>
            );
        })}
    </div>
);

const ShipStatus: React.FC<ShipStatusProps> = ({ 
    gameState, onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget, onToggleCloak, onTogglePointDefense, themeName 
}) => {
  const { player, redAlert } = gameState;
  const { ship } = player;
  const { TorpedoIcon, SecurityIcon, DilithiumIcon } = getFactionIcons(themeName);

  return (
    <div className="panel-style p-3 flex flex-col h-full">
      <h3 className="text-lg font-bold text-secondary-light mb-2 flex-shrink-0">Ship Status</h3>
      <div className="flex-grow space-y-2 overflow-y-auto pr-2">
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
            <div className="grid grid-cols-2 gap-2 mt-1">
                <button onClick={onToggleRedAlert} className={`btn ${redAlert ? 'btn-primary' : 'btn-secondary'}`}>Red Alert</button>
                <button onClick={onEvasiveManeuvers} disabled={!redAlert || ship.subsystems.engines.health <= 0} className={`btn ${ship.evasive ? 'btn-primary' : 'btn-secondary'}`}>Evasive</button>
                {ship.cloakingCapable && (
                     <button onClick={onToggleCloak} disabled={ship.cloakState === 'cloaking' || (ship.cloakState === 'visible' && ship.cloakCooldown > 0)} className={`btn ${ship.cloakState !== 'visible' ? 'btn-primary' : 'btn-secondary'}`}>
                        {ship.cloakState === 'cloaked' ? 'Decloak' : 'Cloak'}
                    </button>
                )}
                 <button onClick={onTogglePointDefense} className={`btn ${ship.pointDefenseEnabled ? 'btn-primary' : 'btn-secondary'}`}>Point-Defense</button>
            </div>
        </div>

        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2">Damage Control</h4>
            <div className="grid grid-cols-2 gap-1 mt-1">
                 <button 
                    onClick={() => onSelectRepairTarget('hull')}
                    className={`btn btn-secondary text-xs ${player.ship.repairTarget === 'hull' ? 'ring-2 ring-accent-yellow' : ''}`}
                >
                    Repair Hull
                </button>
            </div>
            <SubsystemStatus subsystems={ship.subsystems} repairTarget={ship.repairTarget} onSelect={(key) => onSelectRepairTarget(key)} />
        </div>
      </div>
      <div className="flex-shrink-0 mt-3">
          <EnergyAllocator allocation={ship.energyAllocation} onEnergyChange={onEnergyChange} themeName={themeName} />
      </div>
    </div>
  );
};

export default ShipStatus;
