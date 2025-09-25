
import React from 'react';
import type { Entity, GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../types';
import WireframeDisplay from './WireframeDisplay';
import { ThemeName } from '../hooks/useTheme';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { isPosInNebula } from '../game/utils/sector';
import { AIDirector } from '../game/ai/AIDirector';
import { findClosestTarget } from '../game/utils/ai';

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

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary mt-3 mb-1 border-b border-border-dark">{title}</h4>
        <div className="space-y-1">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}:</span>
        <span className="font-bold text-text-primary text-right">{value}</span>
    </div>
);

const StatusIndicator: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}:</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

interface ShipDetailPanelProps {
    selectedEntity: Entity | null;
    themeName: ThemeName;
    turn: number;
    gameState: GameState;
}

const ShipDetailPanel: React.FC<ShipDetailPanelProps> = ({ selectedEntity, themeName, turn, gameState }) => {
    if (!selectedEntity) {
        return (
            <div className="panel-style p-3 h-full flex flex-col justify-center text-center">
                <h3 className="text-lg font-bold text-text-secondary">No Target Selected</h3>
                <p className="text-sm text-text-disabled">Click a ship on the map to view details.</p>
            </div>
        );
    }
    
    const isShip = selectedEntity.type === 'ship';
    const ship = isShip ? selectedEntity as Ship : null;

    let aiStance: string | null = null;
    if (ship && gameState && !ship.isDerelict) {
        const factionAI = AIDirector.getAIForFaction(ship.faction);
        const allShipsInSector = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        
        let potentialTargets: Ship[] = [];
        if (ship.allegiance === 'enemy') {
            potentialTargets = allShipsInSector.filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (ship.allegiance === 'ally' || ship.allegiance === 'player') {
            potentialTargets = allShipsInSector.filter(s => s.allegiance === 'enemy' && s.hull > 0);
        }

        // FIX: The determineStance method returns an object {stance, reason}. We only need the stance string here.
        aiStance = factionAI.determineStance(ship, potentialTargets).stance;
    }

    const name = !isShip || (ship && !ship.scanned) ? 'Unknown Ship' : selectedEntity.name;
    
    const stats = ship ? shipClasses[ship.shipModel]?.[ship.shipClass] : null;

    const cloakStatus = ship?.cloakState === 'cloaked' ? 'ACTIVE' : ship?.cloakState === 'cloaking' ? 'ENGAGING' : 'INACTIVE';
    const cloakColor = ship?.cloakState === 'cloaked' ? 'text-accent-teal' : ship?.cloakState === 'cloaking' ? 'text-accent-yellow' : 'text-text-disabled';
    
    const lifeSupportCountdown = ship?.lifeSupportFailureTurn ? Math.max(0, 2 - (turn - ship.lifeSupportFailureTurn)) : null;
    const captureRepairTurns = ship?.captureInfo ? 5 - (turn - ship.captureInfo.repairTurn) : null;
    
    const isInNebula = ship ? isPosInNebula(ship.position, gameState.currentSector) : false;
    const isInAsteroidField = ship ? gameState.currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y) : false;

    let shipsTargetingSelected: Ship[] = [];
    let incomingTorpedoes: TorpedoProjectile[] = [];
    let incomingTorpedoesByType: Record<string, number> = {};

    if (ship) {
        const allEntities = [...gameState.currentSector.entities, gameState.player.ship];
        const allShips = allEntities.filter(e => e.type === 'ship') as Ship[];
        const torpedoes = allEntities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
        
        shipsTargetingSelected = allShips.filter(s => s.currentTargetId === ship.id);
        incomingTorpedoes = torpedoes.filter(t => t.targetId === ship.id);
        
        incomingTorpedoesByType = incomingTorpedoes.reduce((acc, torpedo) => {
            acc[torpedo.torpedoType] = (acc[torpedo.torpedoType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    let systemsGridContent: React.ReactNode = null;
    let shieldRechargeRate = 0;

    if (ship && stats) {
        if (gameState.redAlert && ship.shields < ship.maxShields && ship.subsystems.shields.health > 0) {
            const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
            const powerToShieldsModifier = (ship.energyAllocation.shields / 33);
            const baseRegen = ship.maxShields * 0.10;
            shieldRechargeRate = baseRegen * powerToShieldsModifier * shieldEfficiency;
        }

        const isRedAlert = ship.allegiance === 'enemy' || ship.allegiance === 'player' || ship.allegiance === 'ally';

        const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
        const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
        const generatedFromEngines = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;
        
        const systemData = (Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).map(key => {
            const system = ship.subsystems[key];
            if (system.maxHealth === 0) return null;

            const healthPercentage = (system.health / system.maxHealth) * 100;
            
            let powerDelta = 0;
            if (key === 'engines') {
                powerDelta = generatedFromEngines;
            } else if (system.health > 0 && stats.systemConsumption[key] > 0) {
                powerDelta = -stats.systemConsumption[key];
            }

            return {
                key,
                name: subsystemFullNames[key],
                health: healthPercentage,
                powerDelta
            };
        }).filter(Boolean) as { key: keyof ShipSubsystems; name: string; health: number; powerDelta: number }[];

        const activeConsumption: { label: string, value: number }[] = [];
        if (stats.systemConsumption.base > 0) {
            activeConsumption.push({ label: 'Core Systems', value: -stats.systemConsumption.base });
        }
        if (isRedAlert && ship.shields > 0) {
            activeConsumption.push({ label: 'Shields Up', value: -20 * stats.energyModifier });
        }
        if (ship.evasive) {
            activeConsumption.push({ label: 'Evasive Maneuvers', value: -10 * stats.energyModifier });
        }
        if (ship.pointDefenseEnabled) {
            activeConsumption.push({ label: 'Point-Defense Grid', value: -15 * stats.energyModifier });
        }
        if (ship.repairTarget) {
            activeConsumption.push({ label: 'Damage Control', value: -5 * stats.energyModifier });
        }
         if (ship.cloakState === 'cloaked' || ship.cloakState === 'cloaking') {
            const cloakStats = shipClasses[ship.shipModel]?.[ship.shipClass];
            if (cloakStats) {
                let maintainCost = cloakStats.cloakEnergyCost.maintain;
                if (ship.customCloakStats) {
                    maintainCost = ship.customCloakStats.powerCost;
                }
                activeConsumption.push({ label: 'Cloak Engaged', value: -maintainCost * stats.energyModifier });
            }
        }
        
        const totalConsumption = systemData.reduce((sum, sys) => sum + (sys.powerDelta < 0 ? sys.powerDelta : 0), 0) 
                               + activeConsumption.reduce((sum, item) => sum + item.value, 0);

        const netChange = generatedFromEngines + totalConsumption;

        systemsGridContent = (
            <DetailSection title="Systems Status & Energy Grid">
                <div className="text-xs -mt-1 grid grid-cols-[2fr,1fr,1fr] gap-x-2 items-center font-bold text-text-secondary border-b border-border-dark pb-1">
                    <span>System</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Power Δ/turn</span>
                </div>
                <div className="text-sm space-y-1">
                    {systemData.map(sys => {
                        let healthColor = 'text-green-400';
                        if (sys.health < 60) healthColor = 'text-yellow-400';
                        if (sys.health < 25) healthColor = 'text-red-500';

                        const powerColor = sys.powerDelta > 0 ? 'text-green-400' : (sys.powerDelta < 0 ? 'text-red-400' : 'text-text-disabled');
                        const isRepairing = ship.repairTarget === sys.key;
                        
                        let repairInfo = null;
                        if (isRepairing) {
                            const system = ship.subsystems[sys.key];
                            if (system && system.maxHealth > 0) {
                                const repairPercentPerTurn = (5 / system.maxHealth) * 100;
                                repairInfo = <span className="text-green-400 text-xs ml-1">(+{repairPercentPerTurn.toFixed(1)}%/t)</span>;
                            }
                        }

                        return (
                            <div key={sys.key} className="grid grid-cols-[2fr,1fr,1fr] gap-x-2 items-center">
                                <span>{sys.name} {repairInfo}</span>
                                <span className={`text-center font-mono ${healthColor}`}>{Math.round(sys.health)}%</span>
                                <span className={`text-right font-mono ${powerColor}`}>
                                    {sys.powerDelta > 0 ? '+' : ''}{sys.powerDelta.toFixed(1)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {activeConsumption.length > 0 && (
                     <div className="text-sm mt-2 pt-1 border-t border-border-dark space-y-1">
                        {activeConsumption.map(item => (
                             <div key={item.label} className="grid grid-cols-[2fr,1fr,1fr] gap-x-2 items-center">
                                <span>{item.label}</span>
                                <span className="text-center font-mono text-text-disabled">-</span>
                                <span className="text-right font-mono text-red-400">{item.value.toFixed(1)}</span>
                            </div>
                        ))}
                     </div>
                )}
                
                <div className="text-sm mt-2 pt-1 border-t-2 border-border-main space-y-1">
                     <div className="grid grid-cols-[2fr,2fr] gap-x-2 font-bold">
                        <span>Total Generation:</span>
                        <span className="text-right text-green-400 font-mono">+{generatedFromEngines.toFixed(1)}</span>
                    </div>
                     <div className="grid grid-cols-[2fr,2fr] gap-x-2 font-bold">
                        <span>Total Consumption:</span>
                        <span className="text-right text-red-400 font-mono">{totalConsumption.toFixed(1)}</span>
                    </div>
                     <div className="grid grid-cols-[2fr,2fr] gap-x-2 font-bold text-base">
                        <span>Net Power:</span>
                        <span className={`text-right font-mono ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}
                        </span>
                    </div>
                </div>
            </DetailSection>
        );
    }
    
    const getShipStatusText = (): { text: string, color: string } => {
        if (!ship) return { text: 'N/A', color: 'text-text-disabled' };
        if (ship.isDerelict) return { text: 'DERELICT', color: 'text-red-600 animate-pulse' };
        if (lifeSupportCountdown !== null) return { text: 'CRITICAL (LIFE SUPPORT)', color: 'text-red-500 animate-pulse' };
        if (ship.hull / ship.maxHull < 0.25) return { text: 'CRITICAL (HULL)', color: 'text-red-500' };
        if (ship.subsystems.engines.health / ship.subsystems.engines.maxHealth < 0.5) return { text: 'DISABLED', color: 'text-orange-400' };
        if (ship.subsystems.weapons.health === 0) return { text: 'DISARMED', color: 'text-yellow-500' };
        if (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth < 0.3) return { text: 'WEAPONS CRITICAL', color: 'text-yellow-400' };
        
        return { text: 'OPERATIONAL', color: 'text-green-500' };
    };

    const shipStatus = getShipStatusText();

    return (
        <div className="panel-style p-3 h-full flex flex-col">
            <div className="grid grid-cols-[auto_1fr] gap-3 items-start mb-2 pb-2 border-b border-border-dark flex-shrink-0">
                <div className="h-24 w-24 flex-shrink-0">
                    <WireframeDisplay target={selectedEntity} />
                </div>
                <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-accent-yellow mb-1 truncate" title={name}>{name}</h3>
                     <p className="text-sm text-text-disabled">{selectedEntity.faction} {ship?.shipRole || 'Object'}</p>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {ship && (
                    <>
                        <DetailSection title="General">
                            <DetailItem label="Class" value={ship.shipClass} />
                            <DetailItem label="Position" value={`(${ship.position.x}, ${ship.position.y})`} />
                        </DetailSection>

                        <DetailSection title="Status">
                             <StatusIndicator label="Status" value={shipStatus.text} color={shipStatus.color} />
                            {lifeSupportCountdown !== null && <StatusIndicator label="Life Support" value={`${lifeSupportCountdown} Turns Left`} color="text-red-500 animate-pulse" />}
                            {captureRepairTurns !== null && captureRepairTurns > 0 && <StatusIndicator label="Captured" value={`${captureRepairTurns} Turns to Repair`} color="text-yellow-500" />}
                            {ship.isStunned && <StatusIndicator label="Stunned" value="YES" color="text-yellow-500" />}
                            {ship.statusEffects.map((effect, i) => (
                                 <StatusIndicator key={i} label="Plasma Burn" value={`${effect.damage} DMG (${effect.turnsRemaining}T left)`} color="text-orange-400" />
                            ))}
                        </DetailSection>

                        <DetailSection title="Core Stats">
                            <DetailItem 
                                label="Hull" 
                                value={
                                    <>
                                        {`${Math.round(ship.hull)} / ${ship.maxHull}`}
                                        {ship.repairTarget === 'hull' && (
                                            <span className="text-green-400 text-xs ml-2">(+5/t)</span>
                                        )}
                                    </>
                                } 
                            />
                            <DetailItem 
                                label="Shields" 
                                value={
                                    <>
                                        {`${Math.round(ship.shields)} / ${ship.maxShields}`}
                                        {shieldRechargeRate > 0 && (
                                            <span className="text-green-400 text-xs ml-2">(+{shieldRechargeRate.toFixed(1)}/t)</span>
                                        )}
                                    </>
                                } 
                            />
                            <DetailItem label="Reserve Power" value={`${Math.round(ship.energy.current)} / ${ship.energy.max}`} />
                            <DetailItem label="Torpedoes" value={`${ship.torpedoes.current} / ${ship.torpedoes.max}`} />
                            <DetailItem label="Dilithium" value={`${ship.dilithium.current} / ${ship.dilithium.max}`} />
                            <DetailItem label="Security Teams" value={`${ship.securityTeams.current} / ${ship.securityTeams.max}`} />
                            <DetailItem label="Shuttlecraft" value={`${stats ? stats.shuttleCount : 'N/A'} craft`} />
                        </DetailSection>
                        
                        <DetailSection title="Tactical Modifiers">
                            {ship.repairTarget && <StatusIndicator label="Damage Control" value={`REPAIRING ${ship.repairTarget.toUpperCase()}`} color="text-yellow-400" />}
                            {isInNebula && <StatusIndicator label="Environment" value="IN NEBULA" color="text-purple-400" />}
                            {isInAsteroidField && <StatusIndicator label="Environment" value="IN ASTEROIDS" color="text-gray-400" />}
                            {ship.cloakingCapable && <StatusIndicator label="Cloak" value={cloakStatus} color={cloakColor} />}
                            <StatusIndicator label="Evasive" value={ship.evasive ? 'ACTIVE' : 'INACTIVE'} color={ship.evasive ? 'text-accent-green' : 'text-text-disabled'} />
                            <StatusIndicator label="Point Defense" value={ship.pointDefenseEnabled ? 'ACTIVE (-40% Phaser Dmg)' : 'INACTIVE'} color={ship.pointDefenseEnabled ? 'text-accent-orange' : 'text-text-disabled'} />
                            {aiStance && (
                                <>
                                    <StatusIndicator label="Doctrine" value={aiStance.toUpperCase()} color="text-accent-yellow" />
                                    <DetailItem label="Allocation" value={
                                        <div className="flex justify-end gap-2 font-bold font-mono text-xs">
                                            <span className="text-red-400">W:{String(ship.energyAllocation.weapons).padStart(2, ' ')}</span>
                                            <span className="text-cyan-400">S:{String(ship.energyAllocation.shields).padStart(2, ' ')}</span>
                                            <span className="text-green-400">E:{String(ship.energyAllocation.engines).padStart(2, ' ')}</span>
                                        </div>
                                    } />
                                </>
                            )}
                        </DetailSection>

                        <DetailSection title="Threat Analysis">
                            <StatusIndicator
                                label="Targeted By"
                                value={`${shipsTargetingSelected.length} vessel(s)`}
                                color={shipsTargetingSelected.length > 0 ? 'text-accent-red' : 'text-text-disabled'}
                            />
                            <StatusIndicator
                                label="Inbound Torpedoes"
                                value={`${incomingTorpedoes.length}`}
                                color={incomingTorpedoes.length > 0 ? 'text-accent-orange' : 'text-text-disabled'}
                            />
                            {Object.entries(incomingTorpedoesByType).map(([type, count]) => (
                                <div key={type} className="text-xs text-text-secondary pl-4 flex justify-between">
                                    <span>- {type}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </DetailSection>

                        {systemsGridContent}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShipDetailPanel;
