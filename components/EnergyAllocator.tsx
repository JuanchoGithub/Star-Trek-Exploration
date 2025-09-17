import React from 'react';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';

interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onDistributeEvenly: () => void;
  themeName: ThemeName;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; }> = ({ label, value, onChange, icon }) => (
  <div className="flex items-center space-x-2">
    <span className="text-secondary-light" title={label}>{icon}</span>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-bg-paper-lighter rounded-lg appearance-none cursor-pointer accent-accent-orange"
    />
    <span className="text-accent-orange font-bold w-10 text-right">{value}%</span>
  </div>
);


const EnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange, onDistributeEvenly, themeName }) => {
  const { WeaponIcon, ShieldIcon, EngineIcon } = getFactionIcons(themeName);
  return (
    <div className="panel-style p-3">
      <h3 className="text-lg font-bold text-secondary-light mb-3">Energy Allocation</h3>
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
      <div className="mt-4 text-center">
        <button 
            onClick={onDistributeEvenly} 
            className="text-xs text-secondary-light hover:text-secondary-main border border-border-main rounded-full px-3 py-1 transition-colors"
        >
            Distribute Evenly
        </button>
      </div>
    </div>
  );
};

export default EnergyAllocator;