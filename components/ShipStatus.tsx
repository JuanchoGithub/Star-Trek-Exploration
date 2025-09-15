import React from 'react';
import type { GameState, ShipSubsystems, Ship } from '../types';
import { WeaponIcon, ShieldIcon, EngineIcon, TorpedoIcon } from './Icons';

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

const SubsystemStatus: React.FC<{subsystems: ShipSubsystems}> = ({ subsystems }) => {
    const systems = [
        { name: 'Weapons', icon: <WeaponIcon className="w-5 h-5"/>, data: subsystems.weapons },
        { name: 'Shields', icon: <ShieldIcon className="w-5 h-5"/>, data: subsystems.shields },
        { name: 'Engines', icon: <EngineIcon className="w-5 h-5"/>, data: subsystems.engines },
    ];
    return (
        <div className="grid grid-cols-3 gap-2 mt-3">
            {systems.map(system => {
                const healthPercentage = (system.data.health / system.data.maxHealth) * 100;
                let color = 'text-green-400';
                if (healthPercentage < 60) color = 'text-yellow-400';
                if (healthPercentage < 25) color = 'text-red-500';

                return (
                    <div key={system.name} className={`flex flex-col items-center p-2 rounded bg-gray-800 ${color}`}>
                        {system.icon}
                        <span className="text-xs mt-1">{system.name}</span>
                        <span className="text-xs font-bold">{Math.round(healthPercentage)}%</span>
                    </div>
                );
            })}
        </div>
    );
}

interface ShipStatusProps {
  gameState: GameState;
}

const ShipStatus: React.FC<ShipStatusProps> = ({ gameState }) => {
  const { ship } = gameState.player;
  const evasiveText = ship.evasive ? <span className="text-green-400 font-bold ml-2">(Evasive)</span> : null;

  return (
    <div className="bg-gray-900 p-3 rounded">
      <h3 className="text-lg font-bold text-blue-300 mb-3">U.S.S. Endeavour Status {evasiveText}</h3>
      <div className="space-y-3">
        <StatusBar label="Hull" value={ship.hull} max={ship.maxHull} colorClass="bg-red-500" />
        <StatusBar label="Shields" value={ship.shields} max={ship.maxShields} colorClass="bg-cyan-500" />
        <StatusBar label="Energy" value={ship.energy.current} max={ship.energy.max} colorClass="bg-yellow-500" />
        <StatusBar label="Crew Morale" value={ship.crewMorale.current} max={ship.crewMorale.max} colorClass="bg-purple-500" />
        <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Torpedoes</span>
            <div className="flex items-center gap-1">
                <TorpedoIcon className="w-5 h-5 text-cyan-400"/>
                <span className="font-bold text-orange-400">{ship.torpedoes.current} / {ship.torpedoes.max}</span>
            </div>
        </div>
        <SubsystemStatus subsystems={ship.subsystems} />
      </div>
    </div>
  );
};

export default ShipStatus;
