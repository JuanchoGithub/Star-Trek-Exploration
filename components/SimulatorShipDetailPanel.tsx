import React from 'react';
import type { Entity, GameState, Ship, ShipSubsystems } from '../types';
import WireframeDisplay from './WireframeDisplay';
import { ThemeName } from '../hooks/useTheme';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { isPosInNebula } from '../game/utils/sector';

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

    const name = !isShip || (ship && !ship.scanned) ? 'Unknown Ship' : selectedEntity.name;
    
    const stats = ship ? shipClasses[ship.shipModel]?.[ship.shipClass] : null;

    const cloakStatus = ship?.cloakState === 'cloaked' ? 'ACTIVE' : ship?.cloakState === 'cloaking' ? 'ENGAGING' : 'INACTIVE';
    const cloakColor = ship?.cloakState === 'cloaked' ? 'text-accent-teal' : ship?.cloakState === 'cloaking' ? 'text-accent-yellow' : 'text-text-disabled';
    
    const engineFailureTurns = ship?.engineFailureTurn ? turn - ship.engineFailureTurn : null;
    const lifeSupportCountdown = ship?.lifeSupportFailureTurn ? Math.max(0, 2 - (turn - ship.lifeSupportFailureTurn)) : null;
    const captureRepairTurns = ship?.captureInfo ? 5 - (turn - ship.captureInfo.repairTurn) : null;
    
    const isInNebula = ship ? isPosInNebula(ship.position, gameState.currentSector) : false;
    const isInAsteroidField = ship ? gameState.currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y) : false;

    let energyGridContent: React.ReactNode = null;
    if (ship && stats) {
        const isRedAlert = ship.allegiance === 'enemy' || ship.allegiance === 'player' || ship.allegiance === 'ally';
        const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
        const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
        const generatedFromEngines = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;

        let totalConsumption = 0;
        const consumptionBreakdown: { label: string, value: number }[] = [];

        if (stats.systemConsumption.base > 0) {
            totalConsumption += stats.systemConsumption.base;
            consumptionBreakdown.push({ label: 'Core Systems', value: stats.systemConsumption.base });
        }

        for (const key in ship.subsystems) {
            const systemKey = key as keyof ShipSubsystems;
            if (ship.subsystems[systemKey].health > 0 && stats.systemConsumption[systemKey] > 0) {
                const consumption = stats.systemConsumption[systemKey];
                totalConsumption += consumption;
                consumptionBreakdown.push({ label: `${subsystemFullNames[systemKey]}`, value: consumption });
            }
        }

        if (isRedAlert && ship.shields > 0) {
            totalConsumption += 20;
            consumptionBreakdown.push({ label: 'Shields Up', value: 20 });
        }
        if (ship.evasive) {
            totalConsumption += 10;
            consumptionBreakdown.push({ label: 'Evasive Maneuvers', value: 10 });
        }
        if (ship.pointDefenseEnabled) {
            totalConsumption += 15;
            consumptionBreakdown.push({ label: 'Point-Defense Grid', value: 15 });
        }
        if (ship.repairTarget) {
            totalConsumption += 5;
            consumptionBreakdown.push({ label: 'Damage Control', value: 5 });
        }

        const netChange = generatedFromEngines - totalConsumption;

        energyGridContent = (
            <DetailSection title="Energy Grid">
                <DetailItem
                    label="Generation"
                    value={<span className="text-green-400">+{generatedFromEngines.toFixed(1)} / turn</span>}
                />
                <div className="pl-4 text-xs">
                    <DetailItem label="Base Output" value={stats.baseEnergyGeneration.toFixed(1)} />
                    <DetailItem label="Engine Allocation" value={`x${engineOutputMultiplier.toFixed(2)}`} />
                    <DetailItem label="Engine Efficiency" value={`${(engineEfficiency * 100).toFixed(0)}%`} />
                </div>
                
                <DetailItem
                    label="Consumption"
                    value={<span className="text-red-400">-{totalConsumption.toFixed(1)} / turn</span>}
                />
                <div className="pl-4 text-xs">
                    {consumptionBreakdown.map(item => (
                        <DetailItem key={item.label} label={item.label} value={`-${item.value.toFixed(1)}`} />
                    ))}
                </div>

                <DetailItem
                    label="Net Power"
                    value={
                        <span className={netChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)} / turn
                        </span>
                    }
                />
            </DetailSection>
        );
    }

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
                            {ship.isDerelict ? (
                                <StatusIndicator label="Status" value="DERELICT" color="text-red-500" />
                            ) : (
                                <StatusIndicator label="Status" value="OPERATIONAL" color="text-green-500" />
                            )}

                            {engineFailureTurns !== null && <StatusIndicator label="Engines Disabled" value={`${engineFailureTurns} Turns`} color="text-red-500 animate-pulse" />}
                            {lifeSupportCountdown !== null && <StatusIndicator label="Life Support" value={`${lifeSupportCountdown} Turns Left`} color="text-red-500 animate-pulse" />}
                            {captureRepairTurns !== null && captureRepairTurns > 0 && <StatusIndicator label="Captured" value={`${captureRepairTurns} Turns to Repair`} color="text-yellow-500" />}

                            {ship.statusEffects.map((effect, i) => (
                                 <StatusIndicator key={i} label="Plasma Burn" value={`${effect.damage} DMG (${effect.turnsRemaining}T left)`} color="text-orange-400" />
                            ))}
                        </DetailSection>
                        
                        <DetailSection title="Tactical Modifiers">
                             {isInNebula && <StatusIndicator label="Environment" value="IN NEBULA" color="text-purple-400" />}
                             {isInAsteroidField && <StatusIndicator label="Environment" value="IN ASTEROIDS" color="text-gray-400" />}
                             <StatusIndicator label="Evasive" value={ship.evasive ? 'ACTIVE' : 'INACTIVE'} color={ship.evasive ? 'text-accent-green' : 'text-text-disabled'} />
                             <StatusIndicator label="Point Defense" value={ship.pointDefenseEnabled ? 'ACTIVE (-40% Phaser Dmg)' : 'INACTIVE'} color={ship.pointDefenseEnabled ? 'text-accent-orange' : 'text-text-disabled'} />
                             {ship.cloakingCapable && <StatusIndicator label="Cloak" value={cloakStatus} color={cloakColor} />}
                             {ship.isStunned && <StatusIndicator label="Status" value="STUNNED" color="text-yellow-500" />}
                        </DetailSection>

                        <DetailSection title="Core Stats">
                            <DetailItem label="Hull" value={`${Math.round(ship.hull)} / ${ship.maxHull}`} />
                            <DetailItem label="Shields" value={`${Math.round(ship.shields)} / ${ship.maxShields}`} />
                            <DetailItem label="Reserve Power" value={`${Math.round(ship.energy.current)} / ${ship.energy.max}`} />
                        </DetailSection>
                        
                        {energyGridContent}

                        <DetailSection title="Resources">
                            <DetailItem label="Torpedoes" value={`${ship.torpedoes.current} / ${ship.torpedoes.max}`} />
                            <DetailItem label="Dilithium" value={`${ship.dilithium.current} / ${ship.dilithium.max}`} />
                            <DetailItem label="Security Teams" value={`${ship.securityTeams.current} / ${ship.securityTeams.max}`} />
                            <DetailItem label="Shuttlecraft" value={`${stats ? stats.shuttleCount : 'N/A'} craft`} />
                        </DetailSection>

                        <DetailSection title="Energy Allocation">
                            <DetailItem label="Weapons" value={<span className="text-red-400">{ship.energyAllocation.weapons}%</span>} />
                            <DetailItem label="Shields" value={<span className="text-cyan-400">{ship.energyAllocation.shields}%</span>} />
                            <DetailItem label="Engines" value={<span className="text-green-400">{ship.energyAllocation.engines}%</span>} />
                        </DetailSection>

                        <DetailSection title="Subsystems">
                            {(Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).map(key => {
                                const system = ship.subsystems[key];
                                if (system.maxHealth === 0) return null;
                                const healthPercentage = (system.health / system.maxHealth) * 100;
                                
                                let colorClass = 'text-green-400';
                                if (healthPercentage < 60) colorClass = 'text-yellow-400';
                                if (healthPercentage < 25) colorClass = 'text-red-500';
                                
                                const consumption = stats ? stats.systemConsumption[key] : 0;
                                const consumptionText = consumption > 0 ? `(-${consumption.toFixed(1)} pwr)` : '';
                                
                                return (
                                    <DetailItem
                                        key={key}
                                        label={subsystemFullNames[key]}
                                        value={
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-text-disabled w-16 text-right">{consumptionText}</span>
                                                <span className={`${colorClass} w-10 text-right`}>{Math.round(healthPercentage)}%</span>
                                            </div>
                                        }
                                    />
                                );
                            })}
                        </DetailSection>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShipDetailPanel;