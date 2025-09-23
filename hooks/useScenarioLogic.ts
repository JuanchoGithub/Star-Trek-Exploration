
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Ship, LogEntry, SectorState, ScenarioMode, PlayerTurnActions, Position, Entity, ShipSubsystems } from '../types';
import { sectorTemplates } from '../assets/galaxy/sectorTemplates';
import { shipClasses, ShipClassStats } from '../assets/ships/configs/shipClassStats';
import { uniqueId } from '../game/utils/ai';
import { seededRandom, cyrb53 } from '../game/utils/helpers';
import { resolveTurn as resolveSimulatorTurn } from '../game/turn/simulatorTurnManager';
import { useTheme } from './useTheme';

const createSector = (templateId: string): SectorState => {
    const template = sectorTemplates.find(t => t.id === templateId) || sectorTemplates[0];
    const seed = `sim_${Date.now()}`;
    const rand = seededRandom(cyrb53(seed));
    return {
        templateId, seed, entities: [], visited: true,
        hasNebula: rand() < (template.hasNebulaChance || 0),
        nebulaCells: [], factionOwner: 'None', isScanned: true,
    };
};

const createShip = (shipClass: ShipClassStats, faction: Ship['shipModel'], allegiance: Ship['allegiance'], position: Position): Ship => {
    const newShip: Ship = {
        id: uniqueId(), name: `${faction} ${shipClass.role}`, type: 'ship', shipModel: faction,
        shipClass: shipClass.name, shipRole: shipClass.role, faction: faction, position, hull: shipClass.maxHull,
        maxHull: shipClass.maxHull, shields: 0, maxShields: shipClass.maxShields,
        energy: { current: shipClass.energy.max, max: shipClass.energy.max },
        energyAllocation: { weapons: 50, shields: 50, engines: 0 },
        torpedoes: { current: shipClass.torpedoes.max, max: shipClass.torpedoes.max },
        subsystems: JSON.parse(JSON.stringify(shipClass.subsystems)),
        securityTeams: { current: shipClass.securityTeams.max, max: shipClass.securityTeams.max },
        dilithium: { current: 0, max: 0 }, scanned: true, evasive: false, retreatingTurn: null,
        crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: 'border-gray-400',
        lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0,
        isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null,
        isDerelict: false, captureInfo: null, pointDefenseEnabled: false, statusEffects: [],
        allegiance, cloakingCapable: shipClass.cloakingCapable,
        // FIX: Added missing energyModifier property.
        energyModifier: shipClass.energyModifier,
    };
    if (allegiance === 'player' || allegiance === 'ally') {
        newShip.logColor = 'border-blue-400';
    } else if (allegiance === 'enemy') {
        newShip.logColor = 'border-red-400';
    }
    return newShip;
};
// Expose creation functions for setup component
(window as any).scenario = { createSector, createShip };

export const useScenarioLogic = (initialShips: Ship[], sectorTemplateId: string, scenarioMode: ScenarioMode) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isRunning, setIsRunning] = useState(true);
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<Position | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    useEffect(() => {
        if (scenarioMode === 'setup' || gameState) return;

        const newSector = createSector(sectorTemplateId);
        const playerShip = initialShips.find(s => s.allegiance === 'player');
        
        // Give ships full energy and shields up if hostile
        initialShips.forEach(ship => {
            ship.energy.current = ship.energy.max;
            if (ship.allegiance === 'enemy' || ship.allegiance === 'ally' || (playerShip && ship.allegiance === 'player')) {
                ship.shields = ship.maxShields;
            }
        });

        newSector.entities = initialShips;
        
        const initialState: GameState = {
            player: {
                ship: playerShip || createShip(shipClasses.Federation['Sovereign-class'], 'Federation', 'player', {x: -1, y: -1}),
                position: { qx: 0, qy: 0 },
                crew: [],
            },
            quadrantMap: [[newSector]],
            currentSector: newSector,
            turn: 1,
            logs: [{ id: uniqueId(), turn: 1, sourceId: 'system', sourceName: 'Simulator', message: 'Scenario initialized.', color: 'border-gray-500', isPlayerSource: false }],
            gameOver: false,
            gameWon: false,
            redAlert: true,
            combatEffects: [],
            isRetreatingWarp: false,
            usedAwayMissionSeeds: [],
            desperationMoveAnimations: [],
            orbitingPlanetId: null,
        };
        setGameState(initialState);
        setLogs(initialState.logs);
    }, [scenarioMode, initialShips, sectorTemplateId, gameState]);

    const addLog = useCallback((logData: Omit<LogEntry, 'id' | 'turn'>) => {
        setLogs(prev => {
            const newLog: LogEntry = {
                id: `log_${Date.now()}_${Math.random()}`,
                turn: gameState?.turn ?? 0,
                ...logData
            };
            const nextLogs = [...prev, newLog];
            if (nextLogs.length > 200) {
                return nextLogs.slice(nextLogs.length - 200);
            }
            return nextLogs;
        });
    }, [gameState?.turn]);

    const onEndTurn = useCallback(() => {
        if (isTurnResolving || !gameState) return;
        setIsTurnResolving(true);
        
        const result = resolveSimulatorTurn(gameState, playerTurnActions, navigationTarget, selectedTargetId, addLog);

        setGameState(result.nextGameState);
        setLogs(prevLogs => {
            const logMap = new Map(prevLogs.map(l => [l.id, l]));
            result.nextGameState.logs.forEach(l => logMap.set(l.id, l));
            return Array.from(logMap.values());
        });
        setNavigationTarget(result.newNavigationTarget);
        setSelectedTargetId(result.newSelectedTargetId);
        setPlayerTurnActions({});

        setTimeout(() => setIsTurnResolving(false), 200);
    }, [isTurnResolving, gameState, playerTurnActions, navigationTarget, selectedTargetId, addLog]);
    
    const onSelectTarget = useCallback((id: string | null) => setSelectedTargetId(id), []);
    const onSetNavigationTarget = useCallback((pos: Position | null) => setNavigationTarget(pos), []);
    
    const onFirePhasers = useCallback((targetId: string) => {
        if (isTurnResolving) return;
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'phasers', targetId } }));
    }, [isTurnResolving]);

    const onLaunchTorpedo = useCallback((targetId: string) => {
        if (isTurnResolving || playerTurnActions.hasLaunchedTorpedo) return;
        setPlayerTurnActions(prev => ({...prev, hasLaunchedTorpedo: true}));
    }, [isTurnResolving, playerTurnActions]);

    const onSelectSubsystem = (subsystem: keyof ShipSubsystems | null) => {};
    const onEnergyChange = () => {};
    const onToggleCloak = () => {};
    const onTogglePointDefense = () => {};


    return {
        gameState: gameState ? { ...gameState, logs } : null,
        isRunning,
        togglePause: () => setIsRunning(prev => !prev),
        endSimulation: () => setGameState(null),
        setGameState,
        setLogs,
        onEndTurn,
        selectedTargetId, onSelectTarget,
        navigationTarget, onSetNavigationTarget,
        playerTurnActions,
        isTurnResolving,
        desperationMoveAnimation: gameState?.desperationMoveAnimations[0] || null,
        targetEntity: gameState?.currentSector.entities.find(e => e.id === selectedTargetId),
        onFirePhasers, onLaunchTorpedo,
        onSelectSubsystem, onEnergyChange, onToggleCloak, onTogglePointDefense,
    };
};
