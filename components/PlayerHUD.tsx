import React from 'react';
import type { GameState, Entity, PlayerTurnActions, Position, Planet } from '../types';
import CommandConsole from './CommandConsole';
import { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon } from '../assets/ui/icons';
import WireframeDisplay from './WireframeDisplay';
import { planetTypes } from '../assets/planets/configs/planetTypes';

interface PlayerHUDProps {
  gameState: GameState;
  onEndTurn: () => void;
  onFirePhasers: (targetId: string) => void;
  onLaunchTorpedo: (targetId:string) => void;
  target?: Entity;
  isDocked: boolean;
  onRechargeDilithium: () => void;
  onDockWithStarbase: () => void;
  onStarbaseRepairs: () => void;
  onResupplyTorpedoes: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onStartAwayMission: (planetId: string) => void;
  onHailTarget: () => void;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  isTurnResolving: boolean;
  onSendAwayTeam: (targetId: string, type: 'boarding' | 'strike') => void;
}

const SubsystemStatusDisplay: React.FC<{subsystem: {health: number, maxHealth: number}, name: string, icon: React.ReactNode}> = ({subsystem, name, icon}) => {
    if (subsystem.maxHealth === 0) return null;

    const healthPercentage = (subsystem.health / subsystem.maxHealth) * 100;
    let color = 'text-accent-green';
    if (healthPercentage < 60) color = 'text-accent-yellow';
    if (healthPercentage < 25) color = 'text-accent-red';

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
        <div className="bg-bg-paper p-3 rounded h-full flex flex-col">
            <div className="flex-grow grid grid-cols-[1fr_2fr] gap-3 items-center min-h-0">
                <div className="h-full w-full">
                     <WireframeDisplay target={target} />
                </div>
                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-accent-yellow mb-1 truncate" title={name}>Target: {name}</h3>
                    {isUnscannedShip ? (
                        <p className="text-sm text-text-disabled">Scan to reveal details.</p>
                    ) : (
                        <p className="text-sm text-text-disabled">{target.faction} {target.type}</p>
                    )}
                    
                    {target.type === 'planet' && target.scanned && (
                         <div className="text-sm mt-2">
                             <span className="text-text-secondary">Classification: </span>
                             <span>{planetTypes[target.planetClass]?.name || 'Unknown'}</span>
                         </div>
                    )}

                    {target.type === 'ship' && !isUnscannedShip && (
                        <>
                            <div className="text-sm mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                <span className="text-text-secondary">Hull:</span><span>{Math.round(target.hull)} / {target.maxHull}</span>
                                <span className="text-text-secondary">Shields:</span><span>{Math.round(target.shields)} / {target.maxShields}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-bg-paper-lighter">
                                <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Subsystems</h4>
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

const PlayerHUD: React.FC<PlayerHUDProps> = ({
    gameState, onEndTurn, onFirePhasers, onLaunchTorpedo,
    target, isDocked, onDockWithStarbase, onRechargeDilithium, onResupplyTorpedoes, onStarbaseRepairs,
    onScanTarget, onInitiateRetreat, onStartAwayMission, onHailTarget,
    playerTurnActions, navigationTarget, isTurnResolving, onSendAwayTeam,
}) => {
    const playerShip = gameState.player.ship;
    
    const canFire = playerShip.energy.current >= 10 && playerShip.subsystems.weapons.health > 0;
    const canLaunchTorpedo = playerShip.torpedoes.current > 0 && playerShip.subsystems.weapons.health > 0;
    const isTargetFriendly = target?.faction === 'Federation';
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const orbitingPlanet = gameState.currentSector.entities.find(e => e.type === 'planet' && Math.max(Math.abs(e.position.x - playerShip.position.x), Math.abs(e.position.y - playerShip.position.y)) <= 1) as Planet | undefined;
    const isAdjacentToStarbase = target?.type === 'starbase' && Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1;

    const getAwayMissionButtonState = () => {
        if (!orbitingPlanet) {
            return { disabled: true, text: '' }; // Should not render anyway
        }

        if (hasEnemy) {
            return { disabled: true, text: 'Cannot Beam Down: Hostiles Present' };
        }
        if (playerShip.subsystems.transporter.health <= 0) {
            return { disabled: true, text: 'Cannot Beam Down: Transporter Offline' };
        }
        if (orbitingPlanet.awayMissionCompleted) {
            return { disabled: true, text: 'Planet Surveyed' };
        }
        
        // Away missions are generally for M (Earth-like) and L (Marginal) class planets.
        const isMissionAvailableForPlanetType = ['M', 'L'].includes(orbitingPlanet.planetClass);
        if (!isMissionAvailableForPlanetType) {
            return { disabled: true, text: 'Unsuitable for Away Mission' };
        }

        return { disabled: false, text: 'Beam Down Away Team' };
    };

    const awayMissionState = getAwayMissionButtonState();

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Contextual Info & Operations */}
                <div className="flex flex-col space-y-2">
                    {target ? <TargetInfo target={target} /> : (
                         <div className="bg-bg-paper p-3 rounded h-full flex flex-col justify-center text-center">
                            <h3 className="text-lg font-bold text-text-secondary">No Target Selected</h3>
                            <p className="text-sm text-text-disabled">Click an object on the map to select it.</p>
                        </div>
                    )}
                    {isAdjacentToStarbase && !isDocked && (
                        <div className="bg-bg-paper p-3 rounded text-center">
                            <button onClick={onDockWithStarbase} className="w-full bg-primary-main hover:bg-primary-light text-primary-text font-bold py-2 px-4 rounded">Initiate Docking</button>
                        </div>
                    )}
                    {isDocked && (
                        <div className="bg-bg-paper p-3 rounded text-center">
                            <h3 className="text-lg font-bold text-secondary-light mb-3">Starbase Operations</h3>
                            <div className="space-y-2">
                                <button onClick={onStarbaseRepairs} className="w-full bg-primary-main hover:bg-primary-light text-primary-text font-bold py-2 px-4 rounded">Full Service Repairs & Recharge</button>
                                <button onClick={onRechargeDilithium} className="w-full bg-accent-pink hover:brightness-110 text-white font-bold py-2 px-4 rounded">Recharge Dilithium</button>
                                <button onClick={onResupplyTorpedoes} className="w-full bg-accent-cyan hover:brightness-110 text-white font-bold py-2 px-4 rounded">Resupply Torpedoes</button>
                            </div>
                        </div>
                    )}
                    {orbitingPlanet && (
                        <div className="bg-bg-paper p-3 rounded text-center">
                            <h3 className="text-lg font-bold text-accent-green mb-3">Planet Operations</h3>
                            <button 
                                onClick={() => orbitingPlanet && onStartAwayMission(orbitingPlanet.id)} 
                                className="w-full bg-accent-green hover:brightness-110 text-white font-bold py-2 px-4 rounded disabled:bg-bg-paper-lighter disabled:cursor-not-allowed"
                                disabled={awayMissionState.disabled}
                            >
                                {awayMissionState.text}
                            </button>
                        </div>
                    )}
                </div>

                {/* Column 2: Command & Control */}
                <div className="flex flex-col h-full">
                    <CommandConsole 
                        onEndTurn={onEndTurn}
                        onFirePhasers={() => target && onFirePhasers(target.id)}
                        onLaunchTorpedo={() => target && onLaunchTorpedo(target.id)}
                        onScanTarget={onScanTarget}
                        onInitiateRetreat={onInitiateRetreat}
                        onHailTarget={onHailTarget}
                        onSendAwayTeam={(type) => target && onSendAwayTeam(target.id, type)}
                        retreatingTurn={playerShip.retreatingTurn}
                        currentTurn={gameState.turn}
                        canFire={!!target && !isTargetFriendly && canFire}
                        canLaunchTorpedo={!!target && !isTargetFriendly && canLaunchTorpedo}
                        isTargetFriendly={!!isTargetFriendly}
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
                </div>
            </div>
        </>
    );
};

export default PlayerHUD;