import React, { useState, useRef, useEffect } from 'react';
import type { GameState, Entity, PlayerTurnActions, Position, Planet, Ship, ShipSubsystems, Starbase } from '../types';
import CommandConsole from './CommandConsole';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import WireframeDisplay from './WireframeDisplay';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import LcarsDecoration from './LcarsDecoration';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import { ScienceIcon, ShuttleIcon } from '../assets/ui/icons';


interface PlayerHUDProps {
  gameState: GameState;
  onEndTurn: () => void;
  onFirePhasers: (targetId: string) => void;
  onLaunchTorpedo: (targetId:string) => void;
  onToggleCloak: () => void;
  target?: Entity;
  isDocked: boolean;
  onDockWithStarbase: () => void;
  onUndock: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onCancelRetreat: () => void;
  onStartAwayMission: (planetId: string) => void;
  onHailTarget: () => void;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  isTurnResolving: boolean;
  onSendAwayTeam: (targetId: string, type: 'boarding' | 'strike') => void;
  themeName: ThemeName;
  desperationMoveAnimation: {
      source: Ship;
      target?: Ship;
      type: string;
      outcome?: 'success' | 'failure';
  } | null;
  selectedSubsystem: keyof ShipSubsystems | null;
  onSelectSubsystem: (subsystem: keyof ShipSubsystems | null) => void;
  onEnterOrbit: (planetId: string) => void;
  orbitingPlanetId: string | null;
}

const subsystemAbbr: Record<keyof ShipSubsystems, string> = {
    weapons: 'WPN',
    engines: 'ENG',
    shields: 'SHD',
    transporter: 'TRN',
    pointDefense: 'LPD',
    computer: 'CPU',
    lifeSupport: 'LFS',
    shuttlecraft: 'SHTL',
};

const subsystemFullNames: Record<keyof ShipSubsystems, string> = {
    weapons: 'Weapons',
    engines: 'Engines',
    shields: 'Shields',
    transporter: 'Transporter',
    pointDefense: 'Point Defense',
    computer: 'Computer',
    lifeSupport: 'Life Support',
    shuttlecraft: 'Shuttlecraft',
};

const TargetInfo: React.FC<{
    target: Entity; 
    themeName: ThemeName;
    selectedSubsystem: keyof ShipSubsystems | null;
    onSelectSubsystem: (subsystem: keyof ShipSubsystems | null) => void;
    playerShip: Ship;
    hasEnemy: boolean;
    orbitingPlanetId: string | null;
    isTurnResolving: boolean;
    onScanTarget: () => void;
    onHailTarget: () => void;
    onStartAwayMission: (planetId: string) => void;
    onEnterOrbit: (planetId: string) => void;
    isDocked: boolean;
}> = ({
    target, themeName, selectedSubsystem, onSelectSubsystem, playerShip, hasEnemy, 
    orbitingPlanetId, isTurnResolving, onScanTarget, onHailTarget, onStartAwayMission, onEnterOrbit,
    isDocked
}) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setPickerVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isUnscannedShip = target.type === 'ship' && !target.scanned;
    const name = isUnscannedShip ? 'Unknown Ship' : target.name;
    const isFederation = themeName === 'federation';
    const isDockedAtStarbase = isDocked && target.type === 'starbase';

    const handleSelect = (key: keyof ShipSubsystems | null) => {
        onSelectSubsystem(key);
        setPickerVisible(false);
    };
    
    const isOrbiting = orbitingPlanetId === target.id;
    const isAdjacent = target.type === 'planet' ? Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1 : false;

    const getAwayMissionButtonState = () => {
        if (target.type !== 'planet') return { disabled: true, text: ''};
        
        if (hasEnemy) return { disabled: true, text: 'Cannot Begin Mission: Hostiles Present' };
        
        if (target.planetClass === 'J') {
             const shuttlecraft = playerShip.subsystems.shuttlecraft;
             // FIX: Check if shuttlecraft exists (for old saves) and if maxHealth is > 0 before division.
             if (!shuttlecraft || shuttlecraft.maxHealth === 0 || (shuttlecraft.health / shuttlecraft.maxHealth) < 0.5) {
                return { disabled: true, text: 'Cannot Begin Mission: Shuttlebay Damaged' };
            }
        } else {
            const transporter = playerShip.subsystems.transporter;
            // FIX: Check if transporter exists (for old saves) and if maxHealth is > 0 before division.
            if (!transporter || transporter.maxHealth === 0 || (transporter.health / transporter.maxHealth) < 0.5) {
                return { disabled: true, text: 'Cannot Begin Mission: Transporter Damaged' };
            }
        }
        if (target.awayMissionCompleted) return { disabled: true, text: 'Planet Surveyed' };
        return { disabled: false, text: 'Begin Away Mission' };
    };
    const awayMissionState = getAwayMissionButtonState();
    
    let targetingButtonText = 'Targeting: Hull';
    if (target.type === 'ship' && !isUnscannedShip) {
        const shipTarget = target as Ship;
        if (selectedSubsystem) {
            const subsystem = shipTarget.subsystems[selectedSubsystem];
            // FIX: Simplified check to resolve TypeScript type inference issues and prevent division by zero.
            if (subsystem && subsystem.maxHealth > 0) {
                const healthPercent = Math.round((subsystem.health / subsystem.maxHealth) * 100);
                targetingButtonText = `Targeting: ${subsystemFullNames[selectedSubsystem]} (${healthPercent}%)`;
            } else {
                targetingButtonText = `Targeting: ${subsystemFullNames[selectedSubsystem]} (N/A)`;
            }
        } else {
            const healthPercent = Math.round((shipTarget.hull / shipTarget.maxHull) * 100);
            targetingButtonText = `Targeting: Hull (${healthPercent}%)`;
        }
    }

    return (
        <div className="panel-style p-3 flex flex-col h-full">
            <div className="grid grid-cols-[auto_1fr] gap-3 items-start mb-2 pb-2 border-b border-border-dark flex-shrink-0">
                <div className="h-24 w-24 flex-shrink-0">
                     <WireframeDisplay target={target} />
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-accent-yellow mb-1 truncate" title={name}>
                        {isDockedAtStarbase ? `Docked at: ${target.name}` : `Target: ${name}`}
                    </h3>
                     {isDockedAtStarbase ? (
                        <p className="text-sm text-text-secondary italic">Automatic repairs and resupply in progress.</p>
                     ) : isUnscannedShip ? (
                        <p className="text-sm text-text-disabled">Scan to reveal details.</p>
                    ) : (
                        <>
                            <p className="text-sm text-text-disabled">{target.faction} {(target as Ship).shipRole}</p>
                            {target.type === 'ship' && <p className="text-sm text-text-primary">{(target as Ship).shipClass}</p>}
                        </>
                    )}
                    {target.type === 'ship' && !isUnscannedShip && !isDockedAtStarbase && (
                        <div className="text-sm mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
                            <span className="text-text-secondary">Hull:</span><span>{Math.round(target.hull)} / {target.maxHull}</span>
                            <span className="text-text-secondary">Shields:</span><span>{Math.round(target.shields)} / {target.maxShields}</span>
                        </div>
                     )}
                </div>
            </div>
            
            {isDockedAtStarbase ? (() => {
                const hullPercent = (playerShip.hull / playerShip.maxHull) * 100;
                const dilithiumPercent = (playerShip.dilithium.max > 0 ? playerShip.dilithium.current / playerShip.dilithium.max : 1) * 100;
                const torpedoPercent = (playerShip.torpedoes.max > 0 ? playerShip.torpedoes.current / playerShip.torpedoes.max : 1) * 100;

                const totalSubHealth = Object.values(playerShip.subsystems).reduce((sum, s) => sum + s.health, 0);
                const totalSubMaxHealth = Object.values(playerShip.subsystems).reduce((sum, s) => sum + s.maxHealth, 0);
                const subPercent = (totalSubMaxHealth > 0 ? totalSubHealth / totalSubMaxHealth : 1) * 100;

                // Weighted average: Hull (3), Subsystems (3), Dilithium (1), Torpedoes (1)
                const totalWeight = 8;
                const overallProgress = (
                    (hullPercent * 3) +
                    (subPercent * 3) +
                    (dilithiumPercent * 1) +
                    (torpedoPercent * 1)
                ) / totalWeight;

                const progressPercent = Math.min(100, Math.round(overallProgress));

                return (
                    <div className="flex-grow flex flex-col justify-center items-center p-4 space-y-4">
                        <h4 className="text-md font-bold text-text-secondary text-center">Overall Repair & Resupply Progress</h4>
                        <div className="w-full">
                             <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-text-secondary">Status</span>
                                <span className="font-mono text-xl text-accent-green">{progressPercent}% Complete</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-4 mt-1 border border-border-dark">
                                <div 
                                    className="bg-accent-green h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-text-disabled italic mt-2">
                            {progressPercent < 100 
                                ? "Repairs and resupply are proceeding automatically. Stand by." 
                                : "All systems nominal. Ship is fully repaired and resupplied."}
                        </p>
                    </div>
                );
            })() : (
                <div className="flex-grow flex flex-col justify-end space-y-2 overflow-y-auto pr-2">
                    {/* Ship Actions */}
                    {target.type === 'ship' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={onScanTarget} disabled={target.scanned || isTurnResolving} className="btn btn-accent yellow">Scan</button>
                            <button onClick={onHailTarget} disabled={isTurnResolving} className="btn btn-accent teal">Hail</button>
                        </div>
                    )}

                    {/* Planet Actions */}
                    {target.type === 'planet' && isAdjacent && !isOrbiting && (
                        <button onClick={() => onEnterOrbit(target.id)} className="w-full btn btn-primary">Enter Orbit</button>
                    )}
                    {target.type === 'planet' && isOrbiting && (
                        <div className="panel-style p-2 bg-bg-paper-lighter">
                            <h4 className="text-md font-bold text-accent-green mb-2 text-center">Orbital Operations</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={onScanTarget} disabled={target.scanned} className="w-full btn btn-accent yellow">Detailed Scan</button>
                                <button onClick={() => onStartAwayMission(target.id)} className="w-full btn btn-accent green" disabled={awayMissionState.disabled} title={awayMissionState.text}>
                                    Away Mission
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subsystem Targeting (for ships) */}
                    {target.type === 'ship' && !isUnscannedShip && (
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setPickerVisible(prev => !prev)}
                                className="w-full btn btn-secondary"
                            >
                                {targetingButtonText}
                            </button>
                            {isPickerVisible && (
                                <div ref={pickerRef} className="absolute bottom-full left-0 right-0 mb-2 w-full panel-style p-2 z-10">
                                    <h4 className="text-xs font-bold text-text-secondary mb-2 text-center uppercase tracking-wider">Select Subsystem Target</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleSelect(null)}
                                            className={`btn ${!selectedSubsystem ? 'btn-primary' : 'btn-secondary'} col-span-2 w-full text-sm`}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-bold">HULL</span>
                                                <span 
                                                    className={!isFederation ? (themeName === 'klingon' && selectedSubsystem ? 'text-gray-700' : 'text-gray-400') : ''}
                                                    style={isFederation ? { color: 'inherit' } : undefined}
                                                >
                                                    Default
                                                </span>
                                            </div>
                                        </button>
                                        {(Object.keys((target as Ship).subsystems) as Array<keyof ShipSubsystems>).map((key) => {
                                            const subsystem = (target as Ship).subsystems[key];
                                            if (subsystem.maxHealth === 0) return null;
                                            const healthPercentage = (subsystem.health / subsystem.maxHealth) * 100;
                                            
                                            let colorClass = 'text-green-400';
                                            let colorHex = '#4ade80';
                                            if (healthPercentage < 60) { colorClass = 'text-yellow-400'; colorHex = '#facc15'; }
                                            if (healthPercentage < 25) { colorClass = 'text-red-500'; colorHex = '#ef4444'; }

                                            if (isFederation) {
                                                colorHex = '#14532d'; // dark green
                                                if (healthPercentage < 60) { colorHex = '#b45309'; } // dark orange/brown
                                                if (healthPercentage < 25) { colorHex = '#7f1d1d'; } // dark red
                                            } else if (themeName === 'klingon') {
                                                const isSelected = selectedSubsystem === key;
                                                if (isSelected) { // Primary button: dark red bg, light text
                                                    colorClass = 'text-yellow-200'; // Healthy
                                                    if (healthPercentage < 60) { colorClass = 'text-yellow-300'; } // Medium
                                                    if (healthPercentage < 25) { colorClass = 'text-orange-400'; } // Damaged
                                                } else { // Secondary button: yellow bg, dark text
                                                    colorClass = 'text-green-800'; // Healthy
                                                    if (healthPercentage < 60) { colorClass = 'text-yellow-700'; } // Medium
                                                    if (healthPercentage < 25) { colorClass = 'text-red-800'; } // Damaged
                                                }
                                            }

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleSelect(key)}
                                                    className={`btn ${selectedSubsystem === key ? 'btn-primary' : 'btn-secondary'} w-full text-sm`}
                                                >
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="font-bold">{subsystemAbbr[key]}</span>
                                                        <span
                                                            className={!isFederation ? colorClass : ''}
                                                            style={isFederation ? { color: colorHex } : undefined}
                                                        >
                                                            {Math.round(healthPercentage)}%
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PlayerHUD: React.FC<PlayerHUDProps> = ({
    gameState, onEndTurn, onFirePhasers, onLaunchTorpedo, onToggleCloak,
    target, isDocked, onDockWithStarbase, onUndock,
    onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, onHailTarget,
    playerTurnActions, navigationTarget, isTurnResolving, onSendAwayTeam, themeName,
    desperationMoveAnimation, selectedSubsystem, onSelectSubsystem, onEnterOrbit, orbitingPlanetId
}) => {
    const playerShip = gameState.player.ship;
    
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const isAdjacentToStarbase = target?.type === 'starbase' && Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1;

    return (
        <div className="relative">
            {themeName === 'federation' && (
                <>
                    <LcarsDecoration type="label" label="TGT-PROC" className="top-0 left-1/4" seed={1} />
                    <LcarsDecoration type="numbers" className="top-0 right-1/4" seed={2} />
                    <LcarsDecoration type="label" label="CMD-SEQ" className="bottom-0 left-1/3" seed={3} />
                </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Contextual Info & Operations */}
                <div className="relative flex flex-col space-y-2">
                    <div className="flex-grow">
                        {target ? (
                            <TargetInfo 
                                target={target} 
                                themeName={themeName} 
                                selectedSubsystem={selectedSubsystem} 
                                onSelectSubsystem={onSelectSubsystem}
                                playerShip={playerShip}
                                hasEnemy={hasEnemy}
                                orbitingPlanetId={orbitingPlanetId}
                                isTurnResolving={isTurnResolving}
                                onScanTarget={onScanTarget}
                                onHailTarget={onHailTarget}
                                onStartAwayMission={onStartAwayMission}
                                onEnterOrbit={onEnterOrbit}
                                isDocked={isDocked}
                            />
                        ) : (
                            <div className="panel-style p-3 flex flex-col justify-center text-center h-full">
                                <h3 className="text-lg font-bold text-text-secondary">No Target Selected</h3>
                                <p className="text-sm text-text-disabled">Click an object on the map to select it.</p>
                            </div>
                        )}
                    </div>
                    {isAdjacentToStarbase && !isDocked && (
                        <div className="panel-style p-3 text-center flex-shrink-0">
                            <button onClick={onDockWithStarbase} className="w-full btn btn-primary">Initiate Docking</button>
                        </div>
                    )}
                    
                    {desperationMoveAnimation && (
                        <DesperationMoveAnimation 
                            animation={desperationMoveAnimation}
                        />
                    )}
                </div>

                {/* Column 2: Command & Control */}
                <div className="flex flex-col h-full">
                    <CommandConsole 
                        gameState={gameState}
                        onEndTurn={onEndTurn}
                        onFirePhasers={() => target && onFirePhasers(target.id)}
                        onLaunchTorpedo={() => target && onLaunchTorpedo(target.id)}
                        onInitiateRetreat={onInitiateRetreat}
                        onCancelRetreat={onCancelRetreat}
                        onSendAwayTeam={(type) => target && onSendAwayTeam(target.id, type)}
                        onToggleCloak={onToggleCloak}
                        retreatingTurn={playerShip.retreatingTurn}
                        currentTurn={gameState.turn}
                        hasTarget={!!target}
                        hasEnemy={hasEnemy}
                        playerTurnActions={playerTurnActions}
                        navigationTarget={navigationTarget}
                        playerShipPosition={playerShip.position}
                        isTurnResolving={isTurnResolving}
                        playerShip={playerShip}
                        target={target}
                        targeting={gameState.player.targeting}
                        themeName={themeName}
                        isDocked={isDocked}
                        onUndock={onUndock}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerHUD;