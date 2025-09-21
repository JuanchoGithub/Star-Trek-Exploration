import React, { useState } from 'react';
import type { GameState, ShipSubsystems } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import EnergyAllocator from './EnergyAllocator';
import LcarsDecoration from './LcarsDecoration';
import { ScienceIcon, ShuttleIcon } from '../assets/ui/icons';

interface StatusBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  children?: React.ReactNode;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, max, colorClass, children }) => {
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
  allocation: { weapons: number; shields: number; engines: number };
  maxShields: number;
  themeName: ThemeName;
}> = ({ subsystems, allocation, maxShields, themeName }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon, ScanIcon } = getFactionIcons(themeName);
    const weaponBonus = (20 * (allocation.weapons / 100)).toFixed(1);
    const shieldBonus = ((allocation.shields / 100) * (maxShields * 0.1)).toFixed(1);
    const engineBonus = (allocation.engines / 5).toFixed(0); // Represents a fictional evasion bonus for UI feedback

    const systems = [
        { name: 'WPN', fullName: 'Weapons', icon: <WeaponIcon className="w-5 h-5"/>, data: subsystems.weapons, bonus: `+${weaponBonus} DMG`, bonusColor: 'text-red-400' },
        { name: 'SHD', fullName: 'Shields', icon: <ShieldIcon className="w-5 h-5"/>, data: subsystems.shields, bonus: `+${shieldBonus} REG/t`, bonusColor: 'text-cyan-400' },
        { name: 'ENG', fullName: 'Engines', icon: <EngineIcon className="w-5 h-5"/>, data: subsystems.engines, bonus: `+${engineBonus} EVA`, bonusColor: 'text-green-400' },
        { name: 'SCN', fullName: 'Scanners', icon: <ScanIcon className="w-5 h-5"/>, data: subsystems.scanners, bonus: ``, bonusColor: '' },
        { name: 'CPU', fullName: 'Computer', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>, data: subsystems.computer, bonus: ``, bonusColor: '' },
        { name: 'LFS', fullName: 'Life Support', icon: <ScienceIcon className="w-5 h-5"/>, data: subsystems.lifeSupport, bonus: ``, bonusColor: '' },
        { name: 'TRN', fullName: 'Transporter', icon: <TransporterIcon className="w-5 h-5"/>, data: subsystems.transporter, bonus: ``, bonusColor: '' },
        { name: 'SHTL', fullName: 'Shuttlecraft', icon: <ShuttleIcon className="w-5 h-5"/>, data: subsystems.shuttlecraft, bonus: ``, bonusColor: '' },
    ];
    return (
        <div className="grid grid-cols-4 gap-1 mt-2">
            {systems.map(system => {
                 if (system.data.maxHealth === 0) return null;
                const healthPercentage = (system.data.health / system.data.maxHealth) * 100;
                let color = 'text-green-400';
                if (healthPercentage < 60) color = 'text-yellow-400';
                if (healthPercentage < 25) color = 'text-red-500';

                return (
                    <div key={system.name} className={`flex flex-col items-center p-1 rounded bg-bg-paper-lighter text-center`} title={system.fullName}>
                        <div className={color}>{system.icon}</div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-[11px] text-text-secondary truncate font-bold">{system.name}</span>
                            <span className={`text-[11px] font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                        </div>
                        {system.bonus && <span className={`text-[10px] font-bold ${system.bonusColor}`}>{system.bonus}</span>}
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
    title?: string;
}> = ({ label, status, colorClass, onClick, disabled = false, title }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded transition-colors ${onClick && !disabled ? 'cursor-pointer hover:bg-bg-paper' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={title ?? (disabled ? 'Action unavailable' : `Click to toggle ${label}`)}
    >
        <span className="font-bold text-text-secondary uppercase tracking-wider">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{status}</span>
    </div>
);


interface ShipStatusProps {
  gameState: GameState;
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onToggleRedAlert: () => void;
  onEvasiveManeuvers: () => void;
  onSelectRepairTarget: (subsystem: 'hull' | keyof ShipSubsystems) => void;
  themeName: ThemeName;
}

const ShipStatus: React.FC<ShipStatusProps> = ({ gameState, onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget, themeName }) => {
  const { ship } = gameState.player;
  const [isRepairListVisible, setRepairListVisible] = useState(false);
  const { TorpedoIcon, SecurityIcon } = getFactionIcons(themeName);

  const canTakeEvasive = gameState.redAlert && ship.subsystems.engines.health > 0;
  const hasDamagedSystems = ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth);

  const handleSelectRepair = (subsystem: 'hull' | keyof ShipSubsystems) => {
      onSelectRepairTarget(subsystem);
      setRepairListVisible(false);
  };
  
  const systemsToRepair = [
      { key: 'hull' as const, name: 'Hull', health: ship.hull, maxHealth: ship.maxHull, disabled: ship.hull === ship.maxHull },
      ...Object.entries(ship.subsystems).map(([key, value]) => ({
          key: key as keyof ShipSubsystems,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          ...value,
          disabled: value.health === value.maxHealth || value.maxHealth === 0,
      })).sort((a,b) => a.name.localeCompare(b.name))
  ];

  const redAlertTitle = "Raise shields for combat. Costs 15 energy to activate and drains reserve power each turn. When offline, shields are down and energy recharges.";
  const evasiveTitle = canTakeEvasive
    ? (ship.evasive ? "Evasive maneuvers active. Increases passive energy drain." : "Enable evasive maneuvers. Increases passive energy drain.")
    : "Cannot engage evasive: Red Alert must be active and engines undamaged.";
    
  const energyStatusIcon = gameState.redAlert ? 
        <span className="text-accent-red" title="Draining">▼</span> :
        (ship.energy.current < ship.energy.max ? <span className="text-accent-green" title="Recharging">▲</span> : null);

  return (
    <div className="panel-style p-3 h-full flex flex-col">
       {themeName === 'federation' && (
          <>
            <LcarsDecoration type="label" label="00A-PWR" className="top-2 right-2" seed={4} />
            <LcarsDecoration type="numbers" className="bottom-2 left-2" seed={5} />
          </>
      )}
      <h3 className="text-lg font-bold text-secondary-light mb-2 flex-shrink-0">U.S.S. Endeavour Systems</h3>
      
      <div className="flex-grow min-h-0 overflow-y-auto pr-2">
        <div className="mb-3 border-t border-b border-bg-paper-lighter py-2 space-y-1">
          <InteractiveStatusIndicator 
              label="Red Alert" 
              status={gameState.redAlert ? 'ACTIVE' : 'STANDBY'} 
              colorClass={gameState.redAlert ? 'text-accent-red animate-pulse bg-red-900 bg-opacity-50' : 'text-text-disabled'}
              onClick={onToggleRedAlert}
              title={redAlertTitle}
          />
          <InteractiveStatusIndicator 
              label="Evasive" 
              status={ship.evasive ? 'ENABLED' : 'DISABLED'} 
              colorClass={ship.evasive ? 'text-accent-green bg-green-900 bg-opacity-50' : 'text-text-disabled'}
              onClick={onEvasiveManeuvers}
              disabled={!canTakeEvasive}
              title={evasiveTitle}
          />
          <InteractiveStatusIndicator 
              label="Damage Control" 
              status={ship.repairTarget ? `REPAIRING ${ship.repairTarget.toUpperCase()}` : 'INACTIVE'} 
              colorClass={ship.repairTarget ? 'text-accent-yellow bg-yellow-900 bg-opacity-50' : 'text-text-disabled'}
              onClick={() => (hasDamagedSystems || ship.repairTarget) && setRepairListVisible(prev => !prev)}
              disabled={!hasDamagedSystems && !ship.repairTarget}
          />
          {isRepairListVisible && (
              <div className="bg-bg-paper p-2 rounded mt-2 border border-accent-yellow-darker">
                  <h4 className="text-xs font-bold text-accent-yellow mb-2 text-center">Assign Repair Crew</h4>
                  <div className="space-y-1">
                      {systemsToRepair.map(sys => {
                          if (sys.maxHealth === 0) return null;
                          const isAssigned = ship.repairTarget === sys.key;
                          return (
                              <button 
                                  key={sys.key} 
                                  onClick={() => handleSelectRepair(sys.key)} 
                                  disabled={sys.disabled && !isAssigned}
                                  className={`w-full text-left p-1 text-sm btn ${
                                      isAssigned 
                                      ? 'bg-accent-yellow-dark hover:bg-accent-yellow text-secondary-text' 
                                      : 'bg-accent-yellow-darker hover:brightness-110 text-white'
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
          <StatusBar label="Hull" value={ship.hull} max={ship.maxHull} colorClass="bg-accent-red" />
          <StatusBar 
              label={gameState.redAlert ? "Shields" : "Shields (OFFLINE)"} 
              value={gameState.redAlert ? ship.shields : 0} 
              max={ship.maxShields} 
              colorClass={gameState.redAlert ? "bg-secondary-main" : "bg-text-disabled"}
          />
          <StatusBar label="Reserve Power" value={ship.energy.current} max={ship.energy.max} colorClass="bg-accent-yellow">
              {energyStatusIcon}
          </StatusBar>
           <StatusBar label="Life Support Reserves" value={ship.lifeSupportReserves.current} max={ship.lifeSupportReserves.max} colorClass="bg-accent-green" />
          <div title="Dilithium crystals are used for warping and as an emergency power source.">
              <StatusBar label="Dilithium" value={ship.dilithium.current} max={ship.dilithium.max} colorClass="bg-accent-pink" />
          </div>
          <div className="flex justify-between items-center text-sm">
              <span className="font-bold">Torpedoes</span>
              <div className="flex items-center gap-1">
                  <TorpedoIcon className="w-5 h-5 text-secondary-main"/>
                  <span className="font-bold text-accent-orange">{ship.torpedoes.current} / {ship.torpedoes.max}</span>
              </div>
          </div>
          <div className="flex justify-between items-center text-sm">
              <span className="font-bold">Security Teams</span>
              <div className="flex items-center gap-1">
                  <SecurityIcon className="w-5 h-5 text-accent-red"/>
                  <span className="font-bold text-accent-orange">{ship.securityTeams.current} / {ship.securityTeams.max}</span>
              </div>
          </div>
          <SubsystemStatus 
              subsystems={ship.subsystems} 
              allocation={ship.energyAllocation}
              maxShields={ship.maxShields}
              themeName={themeName}
          />
        </div>
      </div>
       <div className="pt-3 flex-shrink-0">
        <EnergyAllocator 
            allocation={ship.energyAllocation} 
            onEnergyChange={onEnergyChange} 
            themeName={themeName}
        />
      </div>
    </div>
  );
};

export default ShipStatus;