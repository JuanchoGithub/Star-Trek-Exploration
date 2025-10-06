import React from 'react';
import type { GameState, Entity, Ship, ShipSubsystems, Planet, Starbase, TorpedoProjectile, Mine, BeamWeapon, ProjectileWeapon } from '../../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';
import WireframeDisplay from './WireframeDisplay';
import { isPosInIonStorm, isPosInNebula } from '../game/utils/sector';
import { AIDirector } from '../game/ai/AIDirector';
import { getTorpedoHitChance } from '../game/utils/combat';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
import { ReadOnlyStatusIndicator, PhaserArrayStatus, TorpedoSystemStatus, subsystemAbbr } from './ShipStatus';

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

const ShipDetails: React.FC<{ship: Ship, turn: number, themeName: ThemeName, gameState: GameState}> = ({ ship, turn, themeName, gameState }) => {
    const { RepairIcon, TorpedoIcon, SecurityIcon, DilithiumIcon } = getFactionIcons(themeName);
    
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

            <div className="grid grid-cols-4 gap-2 text-xs text-center mt-1">
                <ResourceDisplay icon={<DilithiumIcon className="w-4 h-4 text-accent-pink"/>} label="Dilithium" value={ship.dilithium.current} max={ship.dilithium.max} />
                <ResourceDisplay icon={<TorpedoIcon className="w-4 h-4 text-accent-orange"/>} label="Torpedoes" value={ship.torpedoes.current} max={ship.torpedoes.max} />
                <ResourceDisplay icon={<SecurityIcon className="w-4 h-4 text-accent-red"/>} label="Security" value={ship.securityTeams.current} max={ship.securityTeams.max} />
                <ResourceDisplay icon={<RepairIcon className="w-4 h-4 text-accent-yellow"/>} label="Repairs" value={ship.repairPoints.current} max={ship.repairPoints.max} />
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
        <span className="font-bold">{value.toFixed(0)}/{max}</span>
    </div>
);

export default SimulatorShipDetailPanel;
