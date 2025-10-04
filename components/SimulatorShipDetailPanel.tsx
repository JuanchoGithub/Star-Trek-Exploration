import React from 'react';
import type { GameState, Entity, Ship, ShipSubsystems, Planet, Starbase, TorpedoProjectile, Mine, BeamWeapon, ProjectileWeapon } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import WireframeDisplay from './WireframeDisplay';
import { isPosInIonStorm, isPosInNebula } from '../game/utils/sector';
import { AIDirector } from '../game/ai/AIDirector';
import { getTorpedoHitChance } from '../game/utils/combat';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';

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

interface TargetInfoProps {
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
}

const SubsystemStatus: React.FC<{ 
    subsystems: ShipSubsystems;
    targetedSubsystems: Set<keyof ShipSubsystems>;
    repairTarget: 'hull' | keyof ShipSubsystems | null;
}> = ({ subsystems, targetedSubsystems, repairTarget }) => (
    <div className="grid grid-cols-2 gap-1 mt-1">
        {(Object.keys(subsystems) as Array<keyof ShipSubsystems>).map(key => {
            const system = subsystems[key];
            if (!system || system.maxHealth === 0) return null;
            const healthPercentage = (system.health / system.maxHealth) * 100;
            let color = 'text-green-400';
            if (healthPercentage < 60) color = 'text-yellow-400';
            if (healthPercentage < 25) color = 'text-red-500';

            const isTargeted = targetedSubsystems.has(key);
            const isBeingRepaired = repairTarget === key;

            let extraClasses = '';
            if (isTargeted) extraClasses += ' ring-2 ring-red-500';
            if (isBeingRepaired) extraClasses += ' ring-2 ring-yellow-400';
            // If targeted and repaired, threat takes visual precedence but we add a subtle background to indicate repair
            if (isTargeted && isBeingRepaired) extraClasses = 'ring-2 ring-red-500 bg-yellow-900/50';

            return (
                <div key={key} className={`flex justify-between items-center bg-black/30 px-2 py-0.5 rounded text-xs ${extraClasses}`}>
                    <span className="font-bold uppercase">{key.substring(0,4)}</span>
                    <span className={`font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
                </div>
            );
        })}
    </div>
);

interface SimulatorShipDetailPanelProps {
  selectedEntity: Entity | null;
  themeName: ThemeName;
  turn: number;
  gameState: GameState;
}

const PhaserArrayStatus: React.FC<{ ship: Ship, gameState: GameState, targetEntity: Entity | null }> = ({ ship, gameState, targetEntity }) => {
    const primaryPhaser = ship.weapons.find(w => w.type === 'beam') as BeamWeapon | undefined;
    
    if (ship.cloakState !== 'visible') {
        return <ReadOnlyStatusIndicator label="PHASERS" status="OFFLINE (CLOAKED)" colorClass="text-accent-red bg-red-900 bg-opacity-50" />;
    }
    if (ship.weaponFailureTurn && gameState.turn < ship.weaponFailureTurn) {
         return <ReadOnlyStatusIndicator label="PHASERS" status={`OFFLINE (ION STORM - ${ship.weaponFailureTurn - gameState.turn}T)`} colorClass="text-accent-red bg-red-900 bg-opacity-50" />;
    }
    if (!primaryPhaser) {
        return <ReadOnlyStatusIndicator label="PHASERS" status="NOT EQUIPPED" colorClass="text-text-disabled" />;
    }

    // Calculations
    const phaserEfficiency = ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth;
    const powerToWeapons = ship.energyAllocation.weapons / 100;
    const ionShockEffect = ship.statusEffects.find(e => e.type === 'ion_shock');

    let effectiveDamage = primaryPhaser.baseDamage;
    let effectiveRange = primaryPhaser.range;

    const damageModifiers: { label: string, value: string }[] = [];
    
    effectiveDamage *= powerToWeapons;
    effectiveDamage *= ship.energyModifier;
    damageModifiers.push({ label: `Power (${ship.energyAllocation.weapons}%)`, value: `x${(powerToWeapons * ship.energyModifier).toFixed(2)}`});

    effectiveDamage *= phaserEfficiency;
    if(phaserEfficiency < 1.0) damageModifiers.push({ label: 'Subsystem Health', value: `${Math.round(phaserEfficiency * 100)}%` });

    if (ship.pointDefenseEnabled) {
        effectiveDamage *= 0.6;
        effectiveRange -= 1;
        damageModifiers.push({ label: 'Point-Defense Grid', value: '-40% Dmg, -1 Rng' });
    }
    if (ionShockEffect && ionShockEffect.type === 'ion_shock') {
        effectiveDamage *= ionShockEffect.phaserDamageModifier;
        damageModifiers.push({ label: 'Ion Shock', value: `x${ionShockEffect.phaserDamageModifier}` });
    }
    
    const targetingInfo = ship.id === 'player' ? gameState.player.targeting : ship.targeting;
    if (targetingInfo && targetingInfo.entityId === targetEntity?.id && targetingInfo.consecutiveTurns > 1 && targetingInfo.subsystem) {
        let bonusPercent = 0;
        switch(targetingInfo.consecutiveTurns) {
            case 2: bonusPercent = 10; break;
            case 3: bonusPercent = 25; break;
            case 4: bonusPercent = 40; break;
            default: bonusPercent = 50; break;
        }
        if (bonusPercent > 0) {
            damageModifiers.push({ label: `Focus Fire (x${targetingInfo.consecutiveTurns})`, value: `+${bonusPercent}% ${subsystemAbbr[targetingInfo.subsystem] || 'Subsystem'} Dmg` });
        }
    }

    // Accuracy
    let effectiveAccuracy = 0.9;
    const accuracyModifiers: string[] = [];
    if (ship.evasive) {
        effectiveAccuracy *= 0.75;
        accuracyModifiers.push('Own Evasive Maneuvers (x0.75)');
    }
    
    const targetShip = targetEntity?.type === 'ship' ? targetEntity as Ship : null;
    if (targetShip?.evasive) {
        effectiveAccuracy *= 0.6;
        accuracyModifiers.push('Target Evasive (x0.60)');
    }

    if (targetEntity && isPosInNebula(targetEntity.position, gameState.currentSector)) {
        effectiveAccuracy *= 0.75;
        accuracyModifiers.push('Target in Nebula (x0.75)');
    }

    const asteroidPositions = new Set(gameState.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    if (targetEntity && asteroidPositions.has(`${targetEntity.position.x},${targetEntity.position.y}`)) {
        effectiveAccuracy *= 0.70;
        accuracyModifiers.push('Target in Asteroids (x0.70)');
    }

    if (primaryPhaser.name.toLowerCase().includes('disruptor') && !primaryPhaser.name.toLowerCase().includes('romulan')) {
        effectiveAccuracy *= 0.95;
        accuracyModifiers.push('Klingon Disruptor (x0.95)');
    }

    return (
        <div className="flex flex-col gap-1 mt-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Phaser Array Status</h5>
            <div className="text-xs bg-bg-paper-lighter p-2 rounded space-y-2">
                <div>
                    <div className="flex justify-between">
                        <span>Base Damage: <b>{primaryPhaser.baseDamage}</b></span>
                        <span>Base Range: <b>{primaryPhaser.range}</b></span>
                    </div>
                </div>
                <div>
                    <p className="font-bold">Active Modifiers:</p>
                    {damageModifiers.length > 0 ? (
                        <ul className="list-disc list-inside ml-2">
                            {damageModifiers.map(m => <li key={m.label}>{m.label}: <span className={`font-mono ${m.value.startsWith('+') ? 'text-green-400' : ''}`}>{m.value}</span></li>)}
                        </ul>
                    ) : (
                        <p className="italic text-text-disabled ml-2">Nominal</p>
                    )}
                </div>
                <div className="border-t border-border-dark pt-2">
                     <div className="flex justify-between font-bold text-accent-yellow">
                        <span>Effective Damage: <b>{Math.round(effectiveDamage)}</b></span>
                        <span>Effective Range: <b>{effectiveRange}</b></span>
                    </div>
                </div>
                 <div className="border-t border-border-dark pt-2">
                    <p className="font-bold">Accuracy Profile:</p>
                    <p>Base Accuracy: <b>90%</b></p>
                    {accuracyModifiers.length > 0 && (
                         <ul className="list-disc list-inside ml-2">
                            {accuracyModifiers.map(m => <li key={m}>{m}</li>)}
                        </ul>
                    )}
                    <p className="font-bold text-accent-yellow">Current Effective Accuracy: <b>{(effectiveAccuracy * 100).toFixed(1)}%</b></p>
                    <p className="text-text-disabled text-xs italic">(vs. current target)</p>
                 </div>
            </div>
        </div>
    );
};

const TorpedoSystemStatus: React.FC<{ ship: Ship, gameState: GameState }> = ({ ship, gameState }) => {
    const primaryLauncher = ship.weapons.find(w => w.type === 'projectile') as ProjectileWeapon | undefined;

    if (ship.cloakState !== 'visible') {
        return <ReadOnlyStatusIndicator label="TORPEDOES" status="OFFLINE (CLOAKED)" colorClass="text-accent-red bg-red-900 bg-opacity-50" />;
    }
    if (ship.weaponFailureTurn && gameState.turn < ship.weaponFailureTurn) {
         return <ReadOnlyStatusIndicator label="TORPEDOES" status={`OFFLINE (ION STORM - ${ship.weaponFailureTurn - gameState.turn}T)`} colorClass="text-accent-red bg-red-900 bg-opacity-50" />;
    }
    if ((ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) < 0.34) {
        return <ReadOnlyStatusIndicator label="TORPEDOES" status="OFFLINE (WPN DMG < 34%)" colorClass="text-accent-red bg-red-900 bg-opacity-50" />;
    }
    if (!primaryLauncher) {
        return <ReadOnlyStatusIndicator label="TORPEDOES" status="NOT EQUIPPED" colorClass="text-text-disabled" />;
    }
    
    const ammo = ship.ammo[primaryLauncher.ammoType];
    const ammoCount = ammo ? `${ammo.current} / ${ammo.max}` : '0 / 0';
    const torpedoConfig = torpedoStats[primaryLauncher.ammoType];

    return (
        <div className="flex flex-col gap-1 mt-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Torpedo System Status</h5>
            <div className="text-xs bg-bg-paper-lighter p-2 rounded space-y-2">
                 <div>
                    <div className="flex justify-between">
                        <span>Type: <b>{torpedoConfig.name}</b></span>
                        <span>Ammo: <b>{ammoCount}</b></span>
                    </div>
                     <div className="flex justify-between">
                        <span>Base Damage: <b>{torpedoConfig.damage}</b></span>
                        <span>Speed: <b>{torpedoConfig.speed} hex/turn</b></span>
                    </div>
                </div>
                 <div className="border-t border-border-dark pt-2">
                    <p className="font-bold">Accuracy Profile (vs. Stationary Target):</p>
                     <div className="flex justify-around text-center my-1">
                        {[1, 2, 3, 4].map(range => (
                            <div key={range}>
                                <div className="text-text-disabled">Rng {range}</div>
                                <div className="font-bold text-accent-sky">{getTorpedoHitChance(primaryLauncher.ammoType, range) * 100}%</div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="border-t border-border-dark pt-2">
                    <p className="font-bold">Tactical Notes:</p>
                    <ul className="list-disc list-inside ml-2">
                        <li>Accuracy is unaffected by Nebula or Evasive Maneuvers.</li>
                        <li>Can be intercepted by enemy Point-Defense systems.</li>
                        <li>Can be destroyed by collision in Asteroid Fields.</li>
                         {torpedoConfig.specialDamage?.type === 'plasma_burn' && (
                            <li className="text-accent-orange">Inflicts a Plasma Burn effect on hull impact.</li>
                        )}
                    </ul>
                 </div>
            </div>
        </div>
    );
};


const SimulatorShipDetailPanel: React.FC<SimulatorShipDetailPanelProps> = ({ selectedEntity, themeName, turn, gameState }) => {
  if (!selectedEntity) {
    return (
        <div className="panel-style p-3 flex flex-col h-full text-center justify-center">
            <h3 className="text-lg font-bold text-secondary-light">No Target Selected</h3>
            <p className="text-sm text-text-disabled">Click on a ship in the tactical view to see its details.</p>
        </div>
    );
  }

  return (
    <div className="panel-style p-3 flex flex-col h-full">
        <div className="flex-shrink-0 grid grid-cols-[auto_1fr] gap-3 items-start mb-2 pb-2 border-b border-border-dark">
            <div className="h-20 w-20 flex-shrink-0">
                <WireframeDisplay target={selectedEntity} />
            </div>
            <div className="flex flex-col justify-center">
                <h3 className="text-base font-bold text-accent-yellow mb-1 truncate" title={selectedEntity.name}>{selectedEntity.name}</h3>
                {selectedEntity.type === 'ship' && <p className="text-xs text-text-disabled">{(selectedEntity as Ship).shipClass}</p>}
                {selectedEntity.type === 'planet' && <p className="text-xs text-text-disabled">{(selectedEntity as Planet).planetClass}-Class Planet</p>}
                <p className="text-xs text-text-disabled">{selectedEntity.faction}</p>
            </div>
        </div>
        
        <div className="flex-grow min-h-0 overflow-y-auto pr-2 space-y-2">
            {selectedEntity.type === 'ship' ? (
                <ShipDetails ship={selectedEntity as Ship} turn={turn} themeName={themeName} gameState={gameState} />
            ) : selectedEntity.type === 'planet' ? (
                <PlanetDetails planet={selectedEntity as Planet} />
            ) : selectedEntity.type === 'starbase' ? (
                <StarbaseDetails starbase={selectedEntity as Starbase} />
            ) : selectedEntity.type === 'torpedo_projectile' ? (
                <TorpedoDetails torpedo={selectedEntity as TorpedoProjectile} gameState={gameState} />
            ) : selectedEntity.type === 'mine' ? (
                <MineDetails mine={selectedEntity as Mine} />
            ) : (
                <p className="text-text-secondary text-center p-4">No detailed information available for this entity type.</p>
            )}
        </div>
    </div>
  );
};

const ReadOnlyStatusIndicator: React.FC<{ label: string; status: string; colorClass: string; }> = ({ label, status, colorClass }) => (
    <div className="flex justify-between items-center text-xs p-1 bg-bg-paper-lighter rounded">
        <span className="font-bold text-text-secondary uppercase tracking-wider pl-1">{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded ${colorClass}`}>{status}</span>
    </div>
);

const ShipDetails: React.FC<{ship: Ship, turn: number, themeName: ThemeName, gameState: GameState}> = ({ ship, turn, themeName, gameState }) => {
    const { TorpedoIcon, SecurityIcon, DilithiumIcon } = getFactionIcons(themeName);
    
    const allEntities: Entity[] = [...gameState.currentSector.entities];
    if (gameState.player.ship && gameState.player.ship.id) {
        if (!allEntities.some(e => e.id === gameState.player.ship.id)) {
            allEntities.push(gameState.player.ship);
        }
    }
    const allShips = allEntities.filter(e => e.type === 'ship') as Ship[];
    const targetOfSelected = allShips.find(s => s.id === ship.currentTargetId);
    
    const shipsTargetingMe = allShips.filter(s => s.currentTargetId === ship.id);
    const torpedoes = allEntities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    
    // FIX: Re-calculate AI targeting decision for display, as it's not stored on the ship object.
    const targetedSubsystems = new Set<keyof ShipSubsystems>();
    shipsTargetingMe.forEach(s => {
        // Player ship targeting info for dogfight mode is not available
        if (s.allegiance !== 'player') {
            const factionAI = AIDirector.getAIForFaction(s.faction);
            // 'ship' is the entity being detailed, which is the target of 's'
            const targetedSub = factionAI.determineSubsystemTarget(s, ship);
            if (targetedSub) {
                targetedSubsystems.add(targetedSub);
            }
        }
    });

    const incomingTorpedoes = torpedoes.filter(t => t.targetId === ship.id);
    const threatInfo = ship.threatInfo;
    const incomingTorpedoesByType = incomingTorpedoes.reduce((acc, torpedo) => {
        acc[torpedo.torpedoType] = (acc[torpedo.torpedoType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const inIonStorm = isPosInIonStorm(ship.position, gameState.currentSector);
    const inNebula = isPosInNebula(ship.position, gameState.currentSector);
    const inAsteroidField = gameState.currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y);

    const cloakStatusText =
        ship.cloakState === 'cloaked' ? 'ACTIVE' :
        ship.cloakState === 'cloaking' ? `ENGAGING (${ship.cloakTransitionTurnsRemaining})` :
        ship.cloakState === 'decloaking' ? `DISENGAGING (${ship.cloakTransitionTurnsRemaining})` :
        ship.cloakCooldown > 0 ? `RECHARGING (${ship.cloakCooldown})` : 'INACTIVE';
    
    const retreatStatusText = ship.retreatingTurn ? `CHARGING (${ship.retreatingTurn - turn})` : 'NO';

    return (
         <>
            <ReadOnlyStatus label="Hull" value={`${Math.round(ship.hull)} / ${ship.maxHull}`} />
            <ReadOnlyStatus label="Shields" value={`${Math.round(ship.shields)} / ${ship.maxShields}`} />
            <ReadOnlyStatus label="Reserve Power" value={`${Math.round(ship.energy.current)} / ${ship.energy.max}`} />
            <ReadOnlyStatus label="Crew Morale" value={`${Math.round(ship.crewMorale.current)} / ${ship.crewMorale.max}`} />

            <div className="grid grid-cols-3 gap-2 text-xs text-center mt-1">
                <ResourceDisplay icon={<DilithiumIcon className="w-4 h-4 text-accent-pink"/>} label="Dilithium" value={ship.dilithium.current} max={ship.dilithium.max} />
                <ResourceDisplay icon={<TorpedoIcon className="w-4 h-4 text-accent-orange"/>} label="Torpedoes" value={ship.torpedoes.current} max={ship.torpedoes.max} />
                <ResourceDisplay icon={<SecurityIcon className="w-4 h-4 text-accent-red"/>} label="Security" value={ship.securityTeams.current} max={ship.securityTeams.max} />
            </div>

            {ship.statusEffects.length > 0 && (
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mt-2">Active Effects</h4>
                    {ship.statusEffects.map((effect, i) => {
                        let statusText = '';
                        if (effect.type === 'plasma_burn') {
                            statusText = `${effect.damage} DMG/T (${effect.turnsRemaining}T)`;
                        } else if (effect.type === 'ion_shock') {
                            statusText = `Phaser Dmg x${effect.phaserDamageModifier} (${effect.turnsRemaining}T)`;
                        }
                        return <ReadOnlyStatus key={i} label={effect.type.replace('_', ' ').toUpperCase()} value={statusText} />;
                    })}
                </div>
            )}
            
            <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mt-2">Subsystems</h4>
                <SubsystemStatus subsystems={ship.subsystems} targetedSubsystems={targetedSubsystems} repairTarget={ship.repairTarget} />
            </div>
            
            <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mt-2">Energy Allocation</h4>
                <div className="flex justify-between items-center text-sm bg-black/30 p-1 rounded">
                    <span className="text-red-400 font-bold">WPN: {ship.energyAllocation.weapons}%</span>
                    <span className="text-cyan-400 font-bold">SHD: {ship.energyAllocation.shields}%</span>
                    <span className="text-green-400 font-bold">ENG: {ship.energyAllocation.engines}%</span>
                </div>
            </div>

            <PhaserArrayStatus ship={ship} gameState={gameState} targetEntity={targetOfSelected} />
            <TorpedoSystemStatus ship={ship} gameState={gameState} />

            <div className="mt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Environment</h4>
                <div className="flex flex-col gap-1 mt-1">
                    <ReadOnlyStatusIndicator 
                        label="In Ion Storm"
                        status={inIonStorm ? 'YES' : 'NO'}
                        colorClass={inIonStorm ? 'text-accent-yellow bg-yellow-900 bg-opacity-50 animate-pulse' : 'text-text-disabled'}
                    />
                    <ReadOnlyStatusIndicator 
                        label="In Nebula"
                        status={inNebula ? 'YES' : 'NO'}
                        colorClass={inNebula ? 'text-purple-400 bg-purple-900 bg-opacity-50' : 'text-text-disabled'}
                    />
                    <ReadOnlyStatusIndicator 
                        label="In Asteroids"
                        status={inAsteroidField ? 'YES' : 'NO'}
                        colorClass={inAsteroidField ? 'text-gray-400 bg-gray-700 bg-opacity-50' : 'text-text-disabled'}
                    />
                </div>
            </div>

             <div className="mt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Targeting Data</h4>
                {targetOfSelected ? (
                    <div className="text-xs text-text-secondary pl-2">
                        <p><b>Name:</b> {targetOfSelected.name}</p>
                        <p><b>Class:</b> {targetOfSelected.shipClass}</p>
                        <p><b>Faction:</b> {targetOfSelected.faction}</p>
                        <p><b>Coords:</b> ({targetOfSelected.position.x}, {targetOfSelected.position.y})</p>
                        {(() => {
                            let targetedSubsystem: keyof ShipSubsystems | null = null;
                            if (ship.allegiance === 'player') {
                                targetedSubsystem = gameState.player.targeting?.subsystem || null;
                            } else if (targetOfSelected) {
                                const factionAI = AIDirector.getAIForFaction(ship.faction);
                                targetedSubsystem = factionAI.determineSubsystemTarget(ship, targetOfSelected);
                            }
                            
                            return (
                                <p><b>Focus:</b> <span className="text-yellow-400 font-bold">{(targetedSubsystem && subsystemAbbr[targetedSubsystem]) || 'Hull'}</span></p>
                            );
                        })()}
                    </div>
                ) : (
                    <p className="text-xs text-text-disabled italic pl-2">No target</p>
                )}
            </div>

            <div className="mt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Threat Analysis (Targeted By)</h4>
                {shipsTargetingMe.length > 0 ? (
                    <ul className="text-xs text-text-secondary pl-2 space-y-1">
                        {shipsTargetingMe.map(s => (
                            <li key={s.id} className="border-b border-border-dark last:border-b-0 py-1">
                                <p><b>{s.name}</b> ({s.shipClass}, {s.faction})</p>
                                <p><b>Coords:</b> ({s.position.x}, {s.position.y})</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-text-disabled italic pl-2">Not targeted by any vessels.</p>
                )}
                {incomingTorpedoes.length > 0 && (
                     <div className="mt-1">
                        <ReadOnlyStatusIndicator
                            label="Inbound Torpedoes"
                            status={`${incomingTorpedoes.length}`}
                            colorClass={'text-accent-orange bg-orange-900 bg-opacity-50'}
                        />
                         {Object.entries(incomingTorpedoesByType).map(([type, count]) => (
                            <div key={type} className="text-xs text-text-secondary pl-2 flex justify-between">
                                <span>- {type}</span>
                                <span className="font-bold">{String(count)}</span>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </>
    );
};

const PlanetDetails: React.FC<{planet: Planet}> = ({ planet }) => (
    <div className="p-2 text-sm">
        <p><span className="font-bold text-text-secondary">Class:</span> {planet.planetClass}</p>
        <p><span className="font-bold text-text-secondary">Status:</span> {planet.awayMissionCompleted ? 'Surveyed' : 'Unsurveyed'}</p>
    </div>
);
const StarbaseDetails: React.FC<{starbase: Starbase}> = ({ starbase }) => (
    <div className="p-2 text-sm">
        <p><span className="font-bold text-text-secondary">Type:</span> {starbase.starbaseType.replace('_', ' ')}</p>
        <ReadOnlyStatus label="Hull" value={`${Math.round(starbase.hull)} / ${starbase.maxHull}`} />
    </div>
);
const TorpedoDetails: React.FC<{torpedo: TorpedoProjectile, gameState: GameState}> = ({ torpedo, gameState }) => {
    const target = [...gameState.currentSector.entities, gameState.player.ship].find(e => e.id === torpedo.targetId);
    return (
        <div className="p-2 text-sm space-y-1">
            <p><span className="font-bold text-text-secondary">Type:</span> {torpedo.torpedoType}</p>
            <p><span className="font-bold text-text-secondary">Target:</span> {target?.name || 'Unknown'}</p>
            <p><span className="font-bold text-text-secondary">Speed:</span> {torpedo.speed} hex/turn</p>
            <p><span className="font-bold text-text-secondary">Damage:</span> {torpedo.damage}</p>
        </div>
    );
};
const MineDetails: React.FC<{mine: Mine}> = ({ mine }) => {
    return (
        <div className="p-2 text-sm space-y-1">
            <p><span className="font-bold text-text-secondary">Type:</span> {mine.torpedoType} Mine</p>
            <p><span className="font-bold text-text-secondary">Damage:</span> {mine.damage}</p>
            {mine.specialDamage && <p><span className="font-bold text-text-secondary">Special:</span> {mine.specialDamage.type}</p>}
        </div>
    );
}

const ReadOnlyStatus: React.FC<{label: string, value: string | number}> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="font-bold text-text-secondary">{label}:</span>
        <span className="font-bold text-text-primary text-right">{value}</span>
    </div>
);

const ResourceDisplay: React.FC<{icon: React.ReactNode, label: string, value: number, max: number}> = ({ icon, label, value, max }) => (
    <div className="bg-black/30 p-1 rounded flex flex-col items-center">
        <div className="flex items-center gap-1 text-xs">{icon} {label}</div>
        <span className="font-bold">{value}/{max}</span>
    </div>
);

export default SimulatorShipDetailPanel;