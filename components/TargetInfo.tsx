import React, { useState, useRef, useEffect } from 'react';
import type { Entity, Ship, ShipSubsystems, Planet, Weapon, BeamWeapon, ProjectileWeapon } from '../types';
import WireframeDisplay from './WireframeDisplay';
import { useGameState } from '../contexts/GameStateContext';
import { useGameActions } from '../contexts/GameActionsContext';
import { useUIState } from '../contexts/UIStateContext';

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

const TargetInfo: React.FC = () => {
    const { gameState, targetEntity, playerTurnActions, isTurnResolving } = useGameState();
    const { onSelectSubsystem, onScanTarget, onHailTarget, onStartAwayMission, onEnterOrbit } = useGameActions();
    const { themeName } = useUIState();

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
    
    if (!gameState) return null;
    const { player, isDocked } = gameState;
    const playerShip = player.ship;

    if (!targetEntity) {
        return (
            <div className="panel-style p-3 flex flex-col justify-center text-center h-full">
                <h3 className="text-lg font-bold text-text-secondary">No Target Selected</h3>
                <p className="text-sm text-text-disabled">Click an object on the map to select it.</p>
            </div>
        );
    }
    const target = targetEntity;

    const isUnscannedShip = target.type === 'ship' && !target.scanned;
    const name = isUnscannedShip ? 'Unknown Ship' : target.name;
    const isFederation = themeName === 'federation';
    const isDockedAtStarbase = isDocked && target.type === 'starbase';

    const handleSelect = (key: keyof ShipSubsystems | null) => {
        onSelectSubsystem(key);
        setPickerVisible(false);
    };
    
    const isOrbiting = gameState.orbitingPlanetId === target.id;
    const isAdjacent = target.type === 'planet' ? Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1 : false;
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));

    const getAwayMissionButtonState = () => {
        if (target.type !== 'planet') return { disabled: true, text: ''};
        
        if (hasEnemy) return { disabled: true, text: 'Cannot Begin Mission: Hostiles Present' };
        
        if ((target as Planet).planetClass === 'J') {
             const shuttlecraft = playerShip.subsystems.shuttlecraft;
             if (shuttlecraft && typeof shuttlecraft.health === 'number' && typeof shuttlecraft.maxHealth === 'number') {
                if (shuttlecraft.maxHealth <= 0 || (shuttlecraft.health / shuttlecraft.maxHealth) < 0.5) {
                    return { disabled: true, text: 'Cannot Begin Mission: Shuttlebay Damaged' };
                }
             } else {
                 return { disabled: true, text: 'Cannot Begin Mission: Shuttlebay Damaged' };
             }
        } else {
            const transporter = playerShip.subsystems.transporter;
            if (transporter && typeof transporter.health === 'number' && typeof transporter.maxHealth === 'number') {
                if (transporter.maxHealth <= 0 || (transporter.health / transporter.maxHealth) < 0.5) {
                    return { disabled: true, text: 'Cannot Begin Mission: Transporter Damaged' };
                }
            } else {
                return { disabled: true, text: 'Cannot Begin Mission: Transporter Damaged' };
            }
        }
        if ((target as Planet).awayMissionCompleted) return { disabled: true, text: 'Planet Surveyed' };
        return { disabled: false, text: 'Begin Away Mission' };
    };
    const awayMissionState = getAwayMissionButtonState();
    
    const selectedWeapon = playerTurnActions.firedWeaponId ? playerShip.weapons.find(w => w.id === playerTurnActions.firedWeaponId) : null;
    const isTorpedoSelected = selectedWeapon?.type === 'projectile';
    const selectedSubsystem = player.targeting?.subsystem || null;
    let targetingButtonText = "Target Subsystem";
    if (isTorpedoSelected) {
        targetingButtonText = "Subsystem Targeting N/A";
    } else if (selectedSubsystem) {
        targetingButtonText = `Targeting: ${subsystemAbbr[selectedSubsystem]}`;
    }

    return (
        <div className="panel-style p-3 h-full flex flex-col">
            <div className="grid grid-cols-[auto_1fr] gap-3 items-start mb-2 pb-2 border-b border-border-dark flex-shrink-0">
                <div className="h-24 w-24 flex-shrink-0">
                    <WireframeDisplay target={target} />
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-accent-yellow mb-1 truncate" title={name}>{name}</h3>
                    {target.type === 'ship' && !isUnscannedShip && <p className="text-sm text-text-disabled">{(target as Ship).shipClass}</p>}
                    {target.type === 'planet' && <p className="text-sm text-text-disabled">{(target as Planet).planetClass}-Class Planet</p>}
                    <p className="text-sm text-text-disabled">{target.faction}</p>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                 {isUnscannedShip && (
                    <div className="text-center p-4">
                        <p className="text-text-secondary mb-4">Detailed information unavailable. A targeted scan is required.</p>
                        <button onClick={onScanTarget} className="w-full btn btn-secondary">Scan Target (5 Pwr)</button>
                    </div>
                )}
                {target.type === 'ship' && target.scanned && (
                    <>
                        <div className="grid grid-cols-2 gap-x-4">
                            <div><span className="text-text-secondary">Hull:</span> <span className="font-bold">{Math.round(target.hull)} / {target.maxHull}</span></div>
                            <div><span className="text-text-secondary">Shields:</span> <span className="font-bold">{Math.round(target.shields)} / {target.maxShields}</span></div>
                        </div>
                        {isFederation ? (
                            <div className="relative">
                                <button
                                    ref={buttonRef}
                                    onClick={() => setPickerVisible(!isPickerVisible)}
                                    className="w-full btn btn-tertiary mt-2"
                                    disabled={isTorpedoSelected}
                                    title={isTorpedoSelected ? "Subsystem targeting is not available for torpedoes." : "Target a specific subsystem"}
                                >
                                    {targetingButtonText}
                                </button>
                                {isPickerVisible && (
                                    <div ref={pickerRef} className="absolute z-10 w-full mt-1 bg-bg-paper-lighter border-2 border-border-main rounded-md p-2 grid grid-cols-2 gap-2">
                                        <button onClick={() => handleSelect(null)} className={`btn btn-accent red ${!selectedSubsystem ? 'ring-2 ring-white' : ''}`}>Hull</button>
                                        {(Object.keys(subsystemAbbr) as Array<keyof ShipSubsystems>).map(key => {
                                            const subsystem = (target as Ship).subsystems[key];
                                            const isDisabled = !subsystem || subsystem.health <= 0 || subsystem.maxHealth <= 0;
                                            return (
                                                <button key={key} onClick={() => handleSelect(key)} disabled={isDisabled} className={`btn btn-tertiary ${selectedSubsystem === key ? 'ring-2 ring-white' : ''}`}>
                                                    {subsystemAbbr[key]}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                             <DetailSection title="Subsystems">
                                <div className="grid grid-cols-4 gap-1">
                                     {(Object.keys(subsystemAbbr) as Array<keyof ShipSubsystems>).map(key => {
                                         const subsystem: { health: number, maxHealth: number } | undefined = (target as Ship).subsystems[key as keyof ShipSubsystems];
                                         if (!subsystem || subsystem.maxHealth === 0) return <div key={key} />;

                                         const healthPercentage = (subsystem.health / subsystem.maxHealth) * 100;
                                         let colorClass = 'bg-accent-green';
                                         if (healthPercentage < 60) colorClass = 'bg-accent-yellow';
                                         if (healthPercentage < 25) colorClass = 'bg-accent-red';

                                         return (
                                             <button 
                                                key={key}
                                                onClick={() => onSelectSubsystem(key)}
                                                disabled={isTorpedoSelected}
                                                className={`p-1 rounded text-center transition-colors ${selectedSubsystem === key && !isTorpedoSelected ? 'ring-2 ring-white' : ''} ${isTorpedoSelected ? 'cursor-not-allowed opacity-50' : 'hover:bg-bg-paper-lighter'}`}
                                                title={isTorpedoSelected ? 'Subsystem targeting unavailable for torpedoes' : `${subsystemFullNames[key]}: ${Math.round(healthPercentage)}%`}
                                             >
                                                 <div className="text-xs font-bold text-text-secondary">{subsystemAbbr[key]}</div>
                                                 <div className="w-full bg-black h-2 rounded-full mt-1 overflow-hidden">
                                                     <div className={`${colorClass} h-full`} style={{width: `${healthPercentage}%`}}></div>
                                                 </div>
                                             </button>
                                         );
                                     })}
                                 </div>
                             </DetailSection>
                        )}
                        
                    </>
                )}

                 {target.type === 'planet' && (
                    <div className="space-y-2 mt-2">
                        {!isOrbiting && isAdjacent && !hasEnemy && (
                            <button onClick={() => onEnterOrbit(target.id)} disabled={isTurnResolving} className="w-full btn btn-secondary">Enter Orbit</button>
                        )}
                        {isOrbiting && (
                             <button onClick={() => onStartAwayMission(target.id)} disabled={awayMissionState.disabled || isTurnResolving} title={awayMissionState.text} className="w-full btn btn-primary">{awayMissionState.text}</button>
                        )}
                    </div>
                 )}
                 {target.type === 'starbase' && isDockedAtStarbase && (
                    <div className="text-center p-2">
                        <h4 className="font-bold text-lg text-green-400">Docked</h4>
                        <p className="text-sm text-text-secondary">All systems undergoing repair and resupply.</p>
                    </div>
                )}
            </div>

             {target.type === 'ship' && target.scanned && (
                <div className="flex-shrink-0 border-t border-border-dark pt-2 mt-2">
                    <button onClick={onHailTarget} className="w-full btn btn-accent sky text-white">Hail Vessel</button>
                </div>
            )}
        </div>
    );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-2 mb-1">{title}</h4>
        {children}
    </div>
);


export default TargetInfo;
