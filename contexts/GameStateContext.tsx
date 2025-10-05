import React, { createContext, useContext } from 'react';
import { GameState, ActiveAwayMission, EventTemplate, ActiveHail, PlayerTurnActions, Entity } from '../types';
import { GameAction } from '../game/state/gameReducer';

export interface GameStateContextValue {
    gameState: GameState | null;
    dispatch: React.Dispatch<GameAction>;
    selectedTargetId: string | null;
    navigationTarget: { x: number; y: number } | null;
    activeAwayMission: ActiveAwayMission | null;
    activeHail: ActiveHail | null;
    targetEntity?: Entity;
    playerTurnActions: PlayerTurnActions;
    activeEvent: { beaconId: string; template: EventTemplate } | null;
    isWarping: boolean;
    isTurnResolving: boolean;
    awayMissionResult: { log: string; status: 'success' | 'failure'; changes: { resource: any; amount: number }[] } | null;
    eventResult: string | null;
    desperationMoveAnimation: { source: any; target?: any; type: string; outcome?: 'success' | 'failure' } | null;
}

const defaultState: GameStateContextValue = {
    gameState: null,
    dispatch: () => {},
    selectedTargetId: null,
    navigationTarget: null,
    activeAwayMission: null,
    activeHail: null,
    targetEntity: undefined,
    playerTurnActions: {},
    activeEvent: null,
    isWarping: false,
    isTurnResolving: false,
    awayMissionResult: null,
    eventResult: null,
    desperationMoveAnimation: null,
};

export const GameStateContext = createContext<GameStateContextValue>(defaultState);

export const GameStateProvider = GameStateContext.Provider;

export const useGameState = () => useContext(GameStateContext);
