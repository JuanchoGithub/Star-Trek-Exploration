import React from 'react';
import type { Ship, Subsystem } from '../types';
import { WeaponIcon, EngineIcon, ShieldIcon } from './Icons';

interface ShipStatusProps {
  ship: Ship;
  isRepairMode: boolean;
  onSelectRepairTarget: (system: 'weapons' | 'engines' | 'shields') => void;
}

const StatusBar: React.FC<{ label: string; value: number; max: number; color: string; }> = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm">
      <span className="font-bold">{label}</span>
      <span>{value} / {max}</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
      <div
        className={`${color} h-4 rounded-full transition-all duration-300`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const SubsystemBar: React.FC<{
  label: string;
  system: Subsystem;
  isRepairMode: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}> = ({ label, system, isRepairMode, onSelect, icon }) => {
  const healthPercentage = (system.health / system.maxHealth) * 100;
  let bgColor = 'bg-green-500';
  if (healthPercentage < 60) bgColor = 'bg-yellow-500';
  if (healthPercentage < 25) bgColor = 'bg-red-500';
  
  const isDamaged = healthPercentage < 100;
  const canRepair = isRepairMode && isDamaged;

  return (
    <div 
        className={`flex items-center gap-2 p-1 rounded ${canRepair ? 'cursor-pointer hover:bg-blue-800 ring-2 ring-yellow-400 animate-pulse' : ''}`}
        onClick={canRepair ? onSelect : undefined}
        title={canRepair ? `Repair ${label}` : `${label} Status`}
    >
      <div className="text-blue-300 w-5">{icon}</div>
      <div className="flex-grow bg-gray-700 rounded-full h-3.5">
        <div 
          className={`${bgColor} h-3.5 rounded-full transition-all duration-300`}
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>
      <span className="text-xs font-bold text-gray-300 w-10 text-right">{Math.round(healthPercentage)}%</span>
    </div>
  );
};


const ShipStatus: React.FC<ShipStatusProps> = ({ ship, isRepairMode, onSelectRepairTarget }) => {
  return (
    <div className="bg-gray-900 p-3 rounded">
      <h3 className="text-lg font-bold text-blue-300 mb-2">Ship Status: {ship.name}</h3>
      <div className="space-y-3">
        <StatusBar label="Hull Integrity" value={ship.hull} max={ship.maxHull} color="bg-green-500" />
        <StatusBar label="Fore Shields" value={ship.shields.fore} max={ship.maxShields.fore} color="bg-cyan-500" />
        <div className="pt-2 mt-2 border-t border-gray-700 space-y-1">
          <SubsystemBar label="Weapons" system={ship.subsystems.weapons} icon={<WeaponIcon className="w-5 h-5"/>} isRepairMode={isRepairMode} onSelect={() => onSelectRepairTarget('weapons')} />
          <SubsystemBar label="Engines" system={ship.subsystems.engines} icon={<EngineIcon className="w-5 h-5"/>} isRepairMode={isRepairMode} onSelect={() => onSelectRepairTarget('engines')} />
          <SubsystemBar label="Shields" system={ship.subsystems.shields} icon={<ShieldIcon className="w-5 h-5"/>} isRepairMode={isRepairMode} onSelect={() => onSelectRepairTarget('shields')} />
        </div>
      </div>
       <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-x-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-bold">Photon Torpedoes:</span>
          <span className="text-orange-400 font-bold">{ship.torpedoes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Dilithium Crystals:</span>
          <span className="text-pink-400 font-bold">{ship.dilithium}</span>
        </div>
      </div>
    </div>
  );
};

export default ShipStatus;