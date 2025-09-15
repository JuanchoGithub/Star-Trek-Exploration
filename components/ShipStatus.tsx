import React from 'react';
import type { GameState, ShipSubsystems } from '../types';
import { WeaponIcon, ShieldIcon, EngineIcon, TorpedoIcon, DilithiumIcon } from './Icons';
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
    ];
    return (
        <div className="grid grid-cols-3 gap-2 mt-3">
            {systems.map(system => {
                const healthPercentage = (system.data.health / system.data.maxHealth) * 100;
                let color = 'text-green-400';
                if (healthPercentage < 60) color = 'text-yellow-400';
                if (healthPercentage < 25) color = 'text-red-500';

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

interface ShipStatusProps {
  gameState: GameState;
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onDistributeEvenly: () => void;
}

const ShipStatus: React.FC<ShipStatusProps> = ({ gameState, onEnergyChange, onDistributeEvenly }) => {
  const { ship } = gameState.player;
  const evasiveText = ship.evasive ? <span className="text-green-400 font-bold ml-2">(Evasive)</span> : null;

  return (
    <div className="bg-gray-900 p-3 rounded h-full flex flex-col">
      <h3 className="text-lg font-bold text-blue-300 mb-3">U.S.S. Endeavour Systems</h3>
      <div className="space-y-3">
        <StatusBar label="Hull" value={ship.hull} max={ship.maxHull} colorClass="bg-red-500" />
        <StatusBar label="Shields" value={ship.shields} max={ship.maxShields} colorClass="bg-cyan-500" />
        <StatusBar label="Energy" value={ship.energy.current} max={ship.energy.max} colorClass="bg-yellow-500" />
        <StatusBar label="Dilithium" value={ship.dilithium.current} max={ship.dilithium.max} colorClass="bg-pink-500" />
        <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Torpedoes</span>
            <div className="flex items-center gap-1">
                <TorpedoIcon className="w-5 h-5 text-cyan-400"/>
                <span className="font-bold text-orange-400">{ship.torpedoes.current} / {ship.torpedoes.max}</span>
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