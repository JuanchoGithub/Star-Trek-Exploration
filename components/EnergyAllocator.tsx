
import React from 'react';
import { WeaponIcon, ShieldIcon, EngineIcon } from './Icons';

interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; }> = ({ label, value, onChange, icon }) => (
  <div className="flex items-center space-x-2">
    <span className="text-blue-300" title={label}>{icon}</span>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
    />
    <span className="text-orange-400 font-bold w-10 text-right">{value}%</span>
  </div>
);


const EnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange }) => {
  return (
    <div className="bg-gray-900 p-3 rounded">
      <h3 className="text-lg font-bold text-blue-300 mb-3">Energy Allocation</h3>
      <div className="space-y-3">
        <Slider 
          label="Weapons"
          icon={<WeaponIcon className="w-6 h-6"/>}
          value={allocation.weapons}
          onChange={(e) => onEnergyChange('weapons', parseInt(e.target.value, 10))}
        />
        <Slider 
          label="Shields"
          icon={<ShieldIcon className="w-6 h-6"/>}
          value={allocation.shields}
          onChange={(e) => onEnergyChange('shields', parseInt(e.target.value, 10))}
        />
        <Slider
          label="Engines"
          icon={<EngineIcon className="w-6 h-6"/>}
          value={allocation.engines}
          onChange={(e) => onEnergyChange('engines', parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
};

export default EnergyAllocator;
