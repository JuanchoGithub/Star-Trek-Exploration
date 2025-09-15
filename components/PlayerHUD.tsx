import React from 'react';
import type { GameState, Entity, Ship } from '../types';
import ShipStatus from './ShipStatus';
import EnergyAllocator from './EnergyAllocator';
import CommandConsole from './CommandConsole';

interface PlayerHUDProps {
  gameState: GameState;
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onEndTurn: () => void;
  onFirePhasers: (targetId: string) => void;
  onLaunchTorpedo: (targetId: string) => void;
  onCycleTargets: () => void;
  onEvasiveManeuvers: () => void;
  target?: Entity;
  currentView: 'sector' | 'quadrant';
  onSetView: (view: 'sector' | 'quadrant') => void;
  isDocked: boolean;
  onRechargeDilithium: () => void;
  onDockWithStarbase: () => void;
  isRepairMode: boolean;
  onInitiateDamageControl: () => void;
  onSelectRepairTarget: (subsystem: 'weapons' | 'engines' | 'shields' | 'hull') => void;
  onResupplyTorpedoes: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onStartAwayMission: () => void;
  onHailTarget: () => void;
}

const TargetInfo: React.FC<{target: Entity}> = ({target}) => {
    if (target.type === 'ship' && !target.scanned) {
        return <div className="bg-gray-900 p-3 rounded mt-4"><h3 className="text-lg font-bold text-yellow-300 mb-1">Target: Unknown Ship</h3><p className="text-sm text-gray-400">Scan to reveal details.</p></div>
    }
    
    let stats = null;
    if (target.type === 'ship') {
        stats = (
            <div className="text-sm mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-400">Hull:</span><span>{Math.round(target.hull)} / {target.maxHull}</span>
                <span className="text-gray-400">Shields:</span><span>{Math.round(target.shields)} / {target.maxShields}</span>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 p-3 rounded mt-4">
            <h3 className="text-lg font-bold text-yellow-300 mb-1">Target: {target.name}</h3>
            {stats}
        </div>
    );
};

const RepairPanel: React.FC<{onSelectRepairTarget: (subsystem: 'weapons' | 'engines' | 'shields' | 'hull') => void; ship: Ship; onCancel: () => void}> = ({onSelectRepairTarget, ship, onCancel}) => {
    const systems = [
        { key: 'hull', name: 'Hull', health: ship.hull, maxHealth: ship.maxHull, disabled: ship.hull === ship.maxHull },
        { key: 'weapons', name: 'Weapons', ...ship.subsystems.weapons, disabled: ship.subsystems.weapons.health === ship.subsystems.weapons.maxHealth },
        { key: 'engines', name: 'Engines', ...ship.subsystems.engines, disabled: ship.subsystems.engines.health === ship.subsystems.engines.maxHealth },
        { key: 'shields', name: 'Shields', ...ship.subsystems.shields, disabled: ship.subsystems.shields.health === ship.subsystems.shields.maxHealth },
    ] as const;

    return (
        <div className="bg-gray-900 p-3 rounded mt-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">Damage Control</h3>
            <div className="space-y-2">
                {systems.map(sys => (
                    <button key={sys.key} onClick={() => onSelectRepairTarget(sys.key)} disabled={sys.disabled}
                        className="w-full text-left p-2 font-bold rounded bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Repair {sys.name} ({Math.round(sys.health)}/{sys.maxHealth})
                    </button>
                ))}
            </div>
             <button onClick={onCancel} className="w-full mt-2 p-2 font-bold rounded bg-gray-500 hover:bg-gray-400">Exit Repair Mode</button>
        </div>
    )
};


const PlayerHUD: React.FC<PlayerHUDProps> = ({
    gameState,
    onEnergyChange,
    onEndTurn,
    onFirePhasers,
    onLaunchTorpedo,
    onCycleTargets,
    onEvasiveManeuvers,
    target,
    currentView,
    onSetView,
    isDocked,
    onRechargeDilithium,
    onDockWithStarbase,
    isRepairMode,
    onInitiateDamageControl,
    onSelectRepairTarget,
    onResupplyTorpedoes,
    onScanTarget,
    onInitiateRetreat,
    onStartAwayMission,
    onHailTarget,
}) => {

    const playerShip = gameState.player.ship;
    const canFire = playerShip.energy.current >= 10 && playerShip.subsystems.weapons.health > 0;
    const canLaunchTorpedo = playerShip.torpedoes.current > 0 && playerShip.subsystems.weapons.health > 0;
    const canCycleTargets = gameState.currentSector.entities.filter(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate')).length > 1;
    const canTakeEvasive = playerShip.energy.current >= 20 && playerShip.subsystems.engines.health > 0;
    const isTargetFriendly = target?.faction === 'Federation';
    const isTargetHostile = target?.faction === 'Klingon' || target?.faction === 'Romulan' || target?.faction === 'Pirate';
    const hasDamagedSystems = playerShip.hull < playerShip.maxHull || Object.values(playerShip.subsystems).some(s => s.health < s.maxHealth);
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const isOrbitingPlanet = gameState.currentSector.entities.find(e => e.type === 'planet' && Math.max(Math.abs(e.position.x - playerShip.position.x), Math.abs(e.position.y - playerShip.position.y)) <= 1);


    return (
        <div className="bg-gray-800 border-2 border-blue-400 p-2 rounded-md h-full flex flex-col">
            <div className="flex justify-around mb-2">
                <button onClick={() => onSetView('sector')} className={`px-4 py-1 rounded font-bold ${currentView === 'sector' ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-gray-300'}`}>Sector View</button>
                <button onClick={() => onSetView('quadrant')} className={`px-4 py-1 rounded font-bold ${currentView === 'quadrant' ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-gray-300'}`}>Quadrant Map</button>
            </div>
            
            <div className="overflow-y-auto pr-2 flex-grow">
                <ShipStatus gameState={gameState} />
                <EnergyAllocator allocation={playerShip.energyAllocation} onEnergyChange={onEnergyChange} />
                
                {target && <TargetInfo target={target} />}

                {target?.type === 'starbase' && !isDocked && (
                    <div className="bg-gray-900 p-3 rounded mt-4 text-center">
                        <button onClick={onDockWithStarbase} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Initiate Docking</button>
                    </div>
                )}
        
                {isDocked && (
                    <div className="bg-gray-900 p-3 rounded mt-4 text-center">
                        <h3 className="text-lg font-bold text-blue-300 mb-3">Starbase Operations</h3>
                        <div className="space-y-2">
                            <button onClick={onRechargeDilithium} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Recharge Dilithium</button>
                            <button onClick={onResupplyTorpedoes} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">Resupply Torpedoes</button>
                        </div>
                    </div>
                )}

                {isOrbitingPlanet && !hasEnemy && (
                    <div className="bg-gray-900 p-3 rounded mt-4 text-center">
                        <h3 className="text-lg font-bold text-green-300 mb-3">Planet Operations</h3>
                        <button onClick={onStartAwayMission} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Beam Down Away Team</button>
                    </div>
                )}

            </div>

            <div className="mt-auto pt-2">
                 {isRepairMode ? (
                    <RepairPanel ship={playerShip} onSelectRepairTarget={onSelectRepairTarget} onCancel={onInitiateDamageControl} />
                ) : (
                    <CommandConsole 
                        onEndTurn={onEndTurn}
                        onFirePhasers={() => target && onFirePhasers(target.id)}
                        onLaunchTorpedo={() => target && onLaunchTorpedo(target.id)}
                        onCycleTargets={onCycleTargets}
                        onEvasiveManeuvers={onEvasiveManeuvers}
                        onInitiateDamageControl={onInitiateDamageControl}
                        onScanTarget={onScanTarget}
                        onInitiateRetreat={onInitiateRetreat}
                        onHailTarget={onHailTarget}
                        retreatingTurn={playerShip.retreatingTurn}
                        currentTurn={gameState.turn}
                        isRepairMode={isRepairMode}
                        canFire={!!target && !isTargetFriendly && canFire}
                        canLaunchTorpedo={!!target && !isTargetFriendly && canLaunchTorpedo}
                        canCycleTargets={canCycleTargets}
                        canTakeEvasive={canTakeEvasive}
                        torpedoCount={playerShip.torpedoes.current}
                        isQuadrantView={currentView === 'quadrant'}
                        isTargetFriendly={!!isTargetFriendly}
                        isTargetHostile={!!isTargetHostile}
                        hasDamagedSystems={hasDamagedSystems}
                        isTargetScanned={!!target?.scanned}
                        hasTarget={!!target}
                        hasEnemy={hasEnemy}
                    />
                )}
            </div>
        </div>
    );
};

export default PlayerHUD;