import React, { useState } from 'react';
import type { GameState, ShipSubsystems } from '../types';
import { WeaponIcon, ShieldIcon, EngineIcon, TorpedoIcon, DilithiumIcon, TransporterIcon, SecurityIcon } from '../assets/ui/icons';
import EnergyAllocator from './EnergyAllocator';

interface StatusBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, max, colorClass }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-bold">{label}</span>
        <span>{Math.round(value)} / {max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const SubsystemStatus: React.FC<{
  subsystems: ShipSubsystems;
  allocation: { weapons: number; shields: number; engines: number };
  maxShields: number;
}> = ({ subsystems, allocation, maxShields }) => {
    const weaponBonus = (20 * (allocation.weapons / 100)).toFixed(1);
    const shieldBonus = ((allocation.shields / 100) * (maxShields * 0.1)).toFixed(1);
    const engineBonus = (allocation.engines / 5).toFixed(0); // Represents a fictional evasion bonus for UI feedback

    const systems = [
        { name: 'Weapons', icon: <WeaponIcon className="w-5 h-5"/>, data: subsystems.weapons, bonus: `+${weaponBonus} DMG`, bonusColor: 'text-red-400' },
        { name: 'Shields', icon: <ShieldIcon className="w-5 h-5"/>, data: subsystems.shields, bonus: `+${shieldBonus} REG/t`, bonusColor: 'text-cyan-400' },
        { name: 'Engines', icon: <EngineIcon className="w-5 h-5"/>, data: subsystems.engines, bonus: `+${engineBonus} EVA`, bonusColor: 'text-green-400' },
        { name: 'Transport', icon: <TransporterIcon className="w-5 h-5"/>, data: subsystems.transporter, bonus: ``, bonusColor: '' },
    ];
    return (
        <div className="grid grid-cols-4 gap-2 mt-3">
            {systems.map(system => {
                const healthPercentage = (system.data.health / system.data.maxHealth) * 100;
                let color = 'text-green-400';
                if (healthPercentage < 60) color = 'text-yellow-400';
                if (healthPercentage < 25) color = 'text-red-500';
                if (system.name === 'Transport') {
                    color = healthPercentage > 50 ? 'text-purple-400' : 'text-yellow-400';
                     if (healthPercentage < 25) color = 'text-red-500';
                }

                return (
                    <div key={system.name} className={`flex flex-col items-center p-2 rounded bg-gray-800`}>
                        <div className={color}>{system.icon}</div>
                        <span className="text-xs mt-1 text-gray-300">{system.name}</span>
                        <span className={`text-sm font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                        <span className={`text-xs font-bold ${system.bonusColor}`}>{system.bonus}</span>
                    </div>
                );
            })}
        </div>
    );
}

const InteractiveStatusIndicator: React.FC<{
    label: string;
    status: string;
    colorClass: string;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ label, status, colorClass, onClick, disabled = false }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`flex justify-between items-center text-xs p-1 bg-gray-800 rounded transition-colors ${onClick && !disabled ? 'cursor-pointer hover:bg-gray-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={disabled ? 'Action unavailable' : `Click to toggle ${label}`}
    >
        <span className="font-bold text-gray-300 uppercase tracking-wider">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{status}</span>
    </div>
);


interface ShipStatusProps {
  gameState: GameState;
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onDistributeEvenly: () => void;
  onToggleRedAlert: () => void;
  onEvasiveManeuvers: () => void;
  onSelectRepairTarget: (subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => void;
}

const ShipStatus: React.FC<ShipStatusProps> = ({ gameState, onEnergyChange, onDistributeEvenly, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget }) => {
  const { ship } = gameState.player;
  const [isRepairListVisible, setRepairListVisible] = useState(false);

  const canTakeEvasive = ship.energy.current >= 20 && ship.subsystems.engines.health > 0;
  const hasDamagedSystems = ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth);

  const handleSelectRepair = (subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => {
      onSelectRepairTarget(subsystem);
      setRepairListVisible(false);
  };
  
  const systemsToRepair = [
      { key: 'hull' as const, name: 'Hull', health: ship.hull, maxHealth: ship.maxHull, disabled: ship.hull === ship.maxHull },
      { key: 'weapons' as const, name: 'Weapons', ...ship.subsystems.weapons, disabled: ship.subsystems.weapons.health === ship.subsystems.weapons.maxHealth },
      { key: 'engines' as const, name: 'Engines', ...ship.subsystems.engines, disabled: ship.subsystems.engines.health === ship.subsystems.engines.maxHealth },
      { key: 'shields' as const, name: 'Shields', ...ship.subsystems.shields, disabled: ship.subsystems.shields.health === ship.subsystems.shields.maxHealth },
      { key: 'transporter' as const, name: 'Transporter', ...ship.subsystems.transporter, disabled: ship.subsystems.transporter.health === ship.subsystems.transporter.maxHealth },
  ];

  return (
    <div className="bg-gray-900 p-3 rounded h-full flex flex-col">
      <h3 className="text-lg font-bold text-blue-300 mb-2">U.S.S. Endeavour Systems</h3>
      
      <div className="mb-3 border-t border-b border-gray-700 py-2 space-y-1">
        <InteractiveStatusIndicator 
            label="Red Alert" 
            status={gameState.redAlert ? 'ACTIVE' : 'STANDBY'} 
            colorClass={gameState.redAlert ? 'text-red-400 animate-pulse bg-red-900 bg-opacity-50' : 'text-gray-400'}
            onClick={onToggleRedAlert}
        />
        <InteractiveStatusIndicator 
            label="Evasive" 
            status={ship.evasive ? 'ENABLED' : 'DISABLED'} 
            colorClass={ship.evasive ? 'text-green-300 bg-green-900 bg-opacity-50' : 'text-gray-400'}
            onClick={onEvasiveManeuvers}
            disabled={!canTakeEvasive}
        />
        <InteractiveStatusIndicator 
            label="Damage Control" 
            status={ship.repairTarget ? `REPAIRING ${ship.repairTarget.toUpperCase()}` : 'INACTIVE'} 
            colorClass={ship.repairTarget ? 'text-yellow-300 bg-yellow-900 bg-opacity-50' : 'text-gray-400'}
            onClick={() => (hasDamagedSystems || ship.repairTarget) && setRepairListVisible(prev => !prev)}
            disabled={!hasDamagedSystems && !ship.repairTarget}
        />
         {isRepairListVisible && (
            <div className="bg-gray-800 p-2 rounded mt-2 border border-yellow-700">
                <h4 className="text-xs font-bold text-yellow-300 mb-2 text-center">Assign Repair Crew</h4>
                <div className="space-y-1">
                    {systemsToRepair.map(sys => {
                        const isAssigned = ship.repairTarget === sys.key;
                        return (
                            <button 
                                key={sys.key} 
                                onClick={() => handleSelectRepair(sys.key)} 
                                disabled={sys.disabled && !isAssigned}
                                className={`w-full text-left p-1 text-sm font-bold rounded transition-colors ${
                                    sys.disabled && !isAssigned
                                    ? 'bg-gray-600 disabled:cursor-not-allowed text-gray-400'
                                    : isAssigned 
                                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black' 
                                    : 'bg-yellow-700 hover:bg-yellow-600 text-white'
                                }`}
                            >
                                {isAssigned ? 'Cancel:' : 'Assign:'} {sys.name} ({Math.round(sys.health)}/{sys.maxHealth})
                            </button>
                        )
                    })}
                </div>
            </div>
        )}
      </div>

      <div className="space-y-3">
        <StatusBar label="Hull" value={ship.hull} max={ship.maxHull} colorClass="bg-red-500" />
        <StatusBar label="Shields" value={ship.shields} max={ship.maxShields} colorClass="bg-cyan-500" />
        <StatusBar label="Energy" value={ship.energy.current} max={ship.energy.max} colorClass="bg-yellow-500" />
        <StatusBar label="Dilithium" value={ship.dilithium.current} max={ship.dilithium.max} colorClass="bg-pink-500" />
        <div className="flex justify-between items-center text-sm">
            <span className="font-bold">Torpedoes</span>
            <div className="flex items-center gap-1">
                <TorpedoIcon className="w-5 h-5 text-cyan-400"/>
                <span className="font-bold text-orange-400">{ship.torpedoes.current} / {ship.torpedoes.max}</span>
            </div>
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="font-bold">Security Teams</span>
            <div className="flex items-center gap-1">
                <SecurityIcon className="w-5 h-5 text-red-400"/>
                <span className="font-bold text-orange-400">{ship.securityTeams.current} / {ship.securityTeams.max}</span>
            </div>
        </div>
        <SubsystemStatus 
            subsystems={ship.subsystems} 
            allocation={ship.energyAllocation}
            maxShields={ship.maxShields}
        />
      </div>
       <div className="mt-auto pt-3">
        <EnergyAllocator 
            allocation={ship.energyAllocation} 
            onEnergyChange={onEnergyChange} 
            onDistributeEvenly={onDistributeEvenly}
        />
      </div>
    </div>
  );
};

export default ShipStatus;