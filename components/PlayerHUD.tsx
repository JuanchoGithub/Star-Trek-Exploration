import React, { useState } from 'react';
import type { GameState, Entity, Ship, PlayerTurnActions, Position } from '../types';
import CommandConsole from './CommandConsole';
import { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon } from './Icons';
import WireframeDisplay from './WireframeDisplay';

interface PlayerHUDProps {
  gameState: GameState;
  onEndTurn: () => void;
  onFirePhasers: (targetId: string) => void;
  onLaunchTorpedo: (targetId:string) => void;
  onEvasiveManeuvers: () => void;
  target?: Entity;
  isDocked: boolean;
  onRechargeDilithium: () => void;
  onDockWithStarbase: () => void;
  onStarbaseRepairs: () => void;
  onSelectRepairTarget: (subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => void;
  onResupplyTorpedoes: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onStartAwayMission: () => void;
  onHailTarget: () => void;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  isTurnResolving: boolean;
  onSendAwayTeam: (targetId: string, type: 'boarding' | 'strike') => void;
}

const SubsystemStatusDisplay: React.FC<{subsystem: {health: number, maxHealth: number}, name: string, icon: React.ReactNode}> = ({subsystem, name, icon}) => {
    if (subsystem.maxHealth === 0) return null;

    const healthPercentage = (subsystem.health / subsystem.maxHealth) * 100;
    let color = 'text-green-400';
    if (healthPercentage < 60) color = 'text-yellow-400';
    if (healthPercentage < 25) color = 'text-red-400';

    return (
        <div className={`flex items-center gap-2 ${color}`}>
            {icon}
            <span className="flex-grow">{name}</span>
            <span className="font-bold">{Math.round(healthPercentage)}%</span>
        </div>
    )
}

const TargetInfo: React.FC<{target: Entity}> = ({target}) => {
    const isUnscannedShip = target.type === 'ship' && !target.scanned;
    const name = isUnscannedShip ? 'Unknown Ship' : target.name;

    return (
        <div className="bg-gray-900 p-3 rounded h-full flex flex-col">
            <div className="flex-grow grid grid-cols-[1fr_2fr] gap-3 items-center min-h-0">
                <div className="h-full w-full">
                     <WireframeDisplay target={target} />
                </div>
                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-yellow-300 mb-1 truncate" title={name}>Target: {name}</h3>
                    {isUnscannedShip ? (
                        <p className="text-sm text-gray-400">Scan to reveal details.</p>
                    ) : (
                        <p className="text-sm text-gray-500">{target.faction} {target.type}</p>
                    )}
                    
                    {target.type === 'ship' && !isUnscannedShip && (
                        <>
                            <div className="text-sm mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                <span className="text-gray-400">Hull:</span><span>{Math.round(target.hull)} / {target.maxHull}</span>
                                <span className="text-gray-400">Shields:</span><span>{Math.round(target.shields)} / {target.maxShields}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Subsystems</h4>
                                <div className="space-y-1 text-sm">
                                <SubsystemStatusDisplay subsystem={target.subsystems.weapons} name="Weapons" icon={<WeaponIcon className="w-5 h-5"/>} />
                                <SubsystemStatusDisplay subsystem={target.subsystems.engines} name="Engines" icon={<EngineIcon className="w-5 h-5"/>} />
                                <SubsystemStatusDisplay subsystem={target.subsystems.shields} name="Shields" icon={<ShieldIcon className="w-5 h-5"/>} />
                                <SubsystemStatusDisplay subsystem={target.subsystems.transporter} name="Transporter" icon={<TransporterIcon className="w-5 h-5"/>} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const RepairPanel: React.FC<{
    onSelectRepairTarget: (subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => void; 
    ship: Ship; 
    onCancel: () => void;
}> = ({ onSelectRepairTarget, ship, onCancel }) => {
    const systems = [
        { key: 'hull', name: 'Hull', health: ship.hull, maxHealth: ship.maxHull, disabled: ship.hull === ship.maxHull },
        { key: 'weapons', name: 'Weapons', ...ship.subsystems.weapons, disabled: ship.subsystems.weapons.health === ship.subsystems.weapons.maxHealth },
        { key: 'engines', name: 'Engines', ...ship.subsystems.engines, disabled: ship.subsystems.engines.health === ship.subsystems.engines.maxHealth },
        { key: 'shields', name: 'Shields', ...ship.subsystems.shields, disabled: ship.subsystems.shields.health === ship.subsystems.shields.maxHealth },
        { key: 'transporter', name: 'Transporter', ...ship.subsystems.transporter, disabled: ship.subsystems.transporter.health === ship.subsystems.transporter.maxHealth },
    ] as const;

    return (
        <div className="bg-gray-900 p-3 rounded h-full">
            <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">Assign Repair Crew</h3>
            <div className="space-y-2">
                {systems.map(sys => {
                    const isAssigned = ship.repairTarget === sys.key;
                    return (
                        <button 
                            key={sys.key} 
                            onClick={() => onSelectRepairTarget(sys.key)} 
                            disabled={sys.disabled && !isAssigned}
                            className={`w-full text-left p-2 font-bold rounded transition-colors ${
                                sys.disabled && !isAssigned
                                ? 'bg-gray-600 disabled:cursor-not-allowed text-gray-400'
                                : isAssigned 
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-black' 
                                : 'bg-yellow-700 hover:bg-yellow-600'
                            }`}
                        >
                            {isAssigned ? 'Cancel Repair:' : 'Assign to:'} {sys.name} ({Math.round(sys.health)}/{sys.maxHealth})
                        </button>
                    )
                })}
            </div>
             <button onClick={onCancel} className="w-full mt-2 p-2 font-bold rounded bg-gray-500 hover:bg-gray-400">Close Panel</button>
        </div>
    )
};

const PlayerHUD: React.FC<PlayerHUDProps> = ({
    gameState, onEndTurn, onFirePhasers, onLaunchTorpedo, onEvasiveManeuvers,
    target, isDocked, onDockWithStarbase, onRechargeDilithium, onResupplyTorpedoes, onStarbaseRepairs,
    onSelectRepairTarget,
    onScanTarget, onInitiateRetreat, onStartAwayMission, onHailTarget,
    playerTurnActions, navigationTarget, isTurnResolving, onSendAwayTeam,
}) => {
    const playerShip = gameState.player.ship;
    const [isRepairPanelOpen, setRepairPanelOpen] = useState(false);

    const canFire = playerShip.energy.current >= 10 && playerShip.subsystems.weapons.health > 0;
    const canLaunchTorpedo = playerShip.torpedoes.current > 0 && playerShip.subsystems.weapons.health > 0;
    const canTakeEvasive = playerShip.energy.current >= 20 && playerShip.subsystems.engines.health > 0;
    const isTargetFriendly = target?.faction === 'Federation';
    const hasDamagedSystems = playerShip.hull < playerShip.maxHull || Object.values(playerShip.subsystems).some(s => s.health < s.maxHealth);
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const isOrbitingPlanet = gameState.currentSector.entities.find(e => e.type === 'planet' && Math.max(Math.abs(e.position.x - playerShip.position.x), Math.abs(e.position.y - playerShip.position.y)) <= 1);
    const isAdjacentToStarbase = target?.type === 'starbase' && Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1;

    const handleSelectRepairTarget = (subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => {
        onSelectRepairTarget(subsystem);
        setRepairPanelOpen(false);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Contextual Info & Operations */}
                <div className="flex flex-col space-y-2">
                    {target ? <TargetInfo target={target} /> : (
                         <div className="bg-gray-900 p-3 rounded h-full flex flex-col justify-center text-center">
                            <h3 className="text-lg font-bold text-gray-400">No Target Selected</h3>
                            <p className="text-sm text-gray-500">Click an object on the map to select it.</p>
                        </div>
                    )}
                    {isAdjacentToStarbase && !isDocked && (
                        <div className="bg-gray-900 p-3 rounded text-center">
                            <button onClick={onDockWithStarbase} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Initiate Docking</button>
                        </div>
                    )}
                    {isDocked && (
                        <div className="bg-gray-900 p-3 rounded text-center">
                            <h3 className="text-lg font-bold text-blue-300 mb-3">Starbase Operations</h3>
                            <div className="space-y-2">
                                <button onClick={onStarbaseRepairs} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Full Service Repairs & Recharge</button>
                                <button onClick={onRechargeDilithium} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded">Recharge Dilithium</button>
                                <button onClick={onResupplyTorpedoes} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">Resupply Torpedoes</button>
                            </div>
                        </div>
                    )}
                    {isOrbitingPlanet && !hasEnemy && (
                        <div className="bg-gray-900 p-3 rounded text-center">
                            <h3 className="text-lg font-bold text-green-300 mb-3">Planet Operations</h3>
                            <button onClick={onStartAwayMission} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Beam Down Away Team</button>
                        </div>
                    )}
                </div>

                {/* Column 2: Command & Control */}
                <div className="flex flex-col h-full">
                    {isRepairPanelOpen ? (
                        <RepairPanel 
                            ship={playerShip} 
                            onSelectRepairTarget={handleSelectRepairTarget} 
                            onCancel={() => setRepairPanelOpen(false)} 
                        />
                    ) : (
                        <CommandConsole 
                            onEndTurn={onEndTurn}
                            onFirePhasers={() => target && onFirePhasers(target.id)}
                            onLaunchTorpedo={() => target && onLaunchTorpedo(target.id)}
                            onEvasiveManeuvers={onEvasiveManeuvers}
                            onInitiateDamageControl={() => setRepairPanelOpen(true)}
                            onScanTarget={onScanTarget}
                            onInitiateRetreat={onInitiateRetreat}
                            onHailTarget={onHailTarget}
                            onSendAwayTeam={(type) => target && onSendAwayTeam(target.id, type)}
                            retreatingTurn={playerShip.retreatingTurn}
                            currentTurn={gameState.turn}
                            canFire={!!target && !isTargetFriendly && canFire}
                            canLaunchTorpedo={!!target && !isTargetFriendly && canLaunchTorpedo}
                            canTakeEvasive={canTakeEvasive}
                            isTargetFriendly={!!isTargetFriendly}
                            hasDamagedSystems={hasDamagedSystems}
                            isTargetScanned={!!target?.scanned}
                            hasTarget={!!target}
                            hasEnemy={hasEnemy}
                            playerTurnActions={playerTurnActions}
                            navigationTarget={navigationTarget}
                            playerShipPosition={playerShip.position}
                            isTurnResolving={isTurnResolving}
                            playerShip={playerShip}
                            target={target}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default PlayerHUD;
