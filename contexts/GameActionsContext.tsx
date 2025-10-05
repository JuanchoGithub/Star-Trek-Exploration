import React, { createContext, useContext } from 'react';
import { GameState, QuadrantPosition, ActiveAwayMissionOption, EventTemplateOption, ShipSubsystems } from '../types';

export interface GameActionsContextValue {
    onEnergyChange: (changedKey: 'weapons' | 'shields' | 'engines', value: number) => void;
    onEndTurn: (actionsOverride?: any) => Promise<void>;
    onFireWeapon: (weaponId: string, targetId: string) => void;
    onEvasiveManeuvers: () => void;
    onSelectTarget: (id: string | null) => void;
    onSetNavigationTarget: (pos: { x: number; y: number } | null) => void;
    onSetView: (view: 'sector' | 'quadrant') => void;
    onWarp: (pos: QuadrantPosition) => void;
    onDockWithStarbase: () => void;
    onUndock: () => void;
    onSelectRepairTarget: (subsystem: 'hull' | keyof ShipSubsystems | null) => void;
    onScanTarget: () => void;
    onInitiateRetreat: () => void;
    onCancelRetreat: () => void;
    onStartAwayMission: (planetId: string) => void;
    onChooseAwayMissionOption: (option: ActiveAwayMissionOption) => void;
    onHailTarget: () => Promise<void>;
    onCloseHail: () => void;
    onSelectSubsystem: (subsystem: keyof ShipSubsystems | null) => void;
    onChooseEventOption: (option: EventTemplateOption) => void;
    saveGame: () => void;
    loadGame: () => void;
    exportSave: () => void;
    importSave: (jsonString: string) => void;
    onDistributeEvenly: () => void;
    onSendAwayTeam: (targetId: string, type: 'boarding' | 'strike') => void;
    onToggleRedAlert: () => void;
    onCloseAwayMissionResult: () => void;
    onCloseEventResult: () => void;
    onScanQuadrant: (pos: QuadrantPosition) => void;
    onEnterOrbit: (planetId: string) => void;
    onToggleCloak: () => void;
    onTogglePointDefense: () => void;
    newGame: () => void;
    handleNewGame: () => void;
    handleLoadGame: () => void;
    handleImportSaveFromFile: (jsonString: string) => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleImportClick: () => void;
    handleStartSimulator: () => void;
    handleExitToMainMenu: () => void;
}

const defaultActions: GameActionsContextValue = {
    onEnergyChange: () => {},
    onEndTurn: async () => {},
    onFireWeapon: () => {},
    onEvasiveManeuvers: () => {},
    onSelectTarget: () => {},
    onSetNavigationTarget: () => {},
    onSetView: () => {},
    onWarp: () => {},
    onDockWithStarbase: () => {},
    onUndock: () => {},
    onSelectRepairTarget: () => {},
    onScanTarget: () => {},
    onInitiateRetreat: () => {},
    onCancelRetreat: () => {},
    onStartAwayMission: () => {},
    onChooseAwayMissionOption: () => {},
    onHailTarget: async () => {},
    onCloseHail: () => {},
    onSelectSubsystem: () => {},
    onChooseEventOption: () => {},
    saveGame: () => {},
    loadGame: () => {},
    exportSave: () => {},
    importSave: () => {},
    onDistributeEvenly: () => {},
    onSendAwayTeam: () => {},
    onToggleRedAlert: () => {},
    onCloseAwayMissionResult: () => {},
    onCloseEventResult: () => {},
    onScanQuadrant: () => {},
    onEnterOrbit: () => {},
    onToggleCloak: () => {},
    onTogglePointDefense: () => {},
    newGame: () => {},
    handleNewGame: () => {},
    handleLoadGame: () => {},
    handleImportSaveFromFile: () => {},
    handleFileChange: () => {},
    handleImportClick: () => {},
    handleStartSimulator: () => {},
    handleExitToMainMenu: () => {},
};

export const GameActionsContext = createContext<GameActionsContextValue>(defaultActions);

export const GameActionsProvider = GameActionsContext.Provider;

export const useGameActions = () => {
    return useContext(GameActionsContext);
};
