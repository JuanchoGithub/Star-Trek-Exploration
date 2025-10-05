import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import AwayMissionDialog from './components/AwayMissionDialog';
import HailDialog from './components/HailDialog';
import EventDialog from './components/EventDialog';
import AwayMissionResultDialog from './components/AwayMissionResultDialog';
import { useTheme } from './hooks/useTheme';
import PlayerManual from './components/PlayerManual';
import EventResultDialog from './components/EventResultDialog';
import RomulanDecoration from './components/RomulanDecoration';
import MainMenu from './components/MainMenu';
import ScenarioSimulator from './components/ScenarioSimulator';
import { SAVE_GAME_KEY } from './assets/configs/gameConstants';
import BattleReplayer from './components/BattleReplayer';
import Changelog from './components/Changelog';
import GameMenu from './components/GameMenu';
import GameUI from './components/GameUI';
import LogPanel from './components/LogPanel';

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_HUD_HEIGHT = 240;
const MAX_HUD_HEIGHT = 500;

const App: React.FC = () => {
    const [view, setView] = useState<'main-menu' | 'game' | 'simulator'>('main-menu');
    const { 
        gameState, selectedTargetId, navigationTarget, currentView,
        activeAwayMission, activeHail, targetEntity, playerTurnActions, activeEvent,
        isWarping, isTurnResolving, awayMissionResult, eventResult, desperationMoveAnimation,
        onEnergyChange, onEndTurn, onFireWeapon, onEvasiveManeuvers, 
        onSelectTarget, onSetNavigationTarget, onSetView, onWarp, onDockWithStarbase, 
        onSelectRepairTarget, onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, 
        onChooseAwayMissionOption, onHailTarget, onCloseHail, onSelectSubsystem, 
        onChooseEventOption, saveGame, loadGame, exportSave, importSave, onDistributeEvenly, 
        onSendAwayTeam, onToggleRedAlert, onCloseAwayMissionResult, onCloseEventResult, 
        onScanQuadrant, onEnterOrbit, onToggleCloak, onTogglePointDefense, newGame, onUndock
    } = useGameLogic();

    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showPlayerManual, setShowPlayerManual] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showReplayer, setShowReplayer] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const { theme, themeName, setTheme } = useTheme('federation');
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('sidebarWidth');
        return saved ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, parseInt(saved, 10))) : 320;
    });
    const [bottomPanelHeight, setBottomPanelHeight] = useState(() => {
        const saved = localStorage.getItem('bottomPanelHeight');
        return saved ? Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, parseInt(saved, 10))) : 288;
    });
    
    useEffect(() => localStorage.setItem('sidebarWidth', String(sidebarWidth)), [sidebarWidth]);
    useEffect(() => localStorage.setItem('bottomPanelHeight', String(bottomPanelHeight)), [bottomPanelHeight]);

    const handleVerticalResize = useCallback((movementX: number) => {
        setSidebarWidth(prev => Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, prev - movementX)));
    }, []);

    const handleHorizontalResize = useCallback((movementY: number) => {
        setBottomPanelHeight(prev => Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, prev - movementY)));
    }, []);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const entityRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const handleNewGame = useCallback(() => {
        localStorage.removeItem(SAVE_GAME_KEY);
        newGame();
        setView('game');
    }, [newGame]);

    const handleLoadGame = useCallback(() => {
        loadGame();
        setView('game');
    }, [loadGame]);

    const handleImportSaveFromFile = useCallback((jsonString: string) => {
        importSave(jsonString);
        setView('game');
        setShowGameMenu(false);
    }, [importSave]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                handleImportSaveFromFile(text);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleStartSimulator = useCallback(() => {
        setView('simulator');
    }, []);

    const handleExitToMainMenu = useCallback(() => {
        setView('main-menu');
    }, []);

    useEffect(() => {
        document.body.className = `theme-${themeName}`;
        return () => { document.body.className = ''; }
    }, [themeName]);

    if (view === 'main-menu') {
        return (
            <>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                <MainMenu
                    onNewGame={handleNewGame}
                    onLoadGame={handleLoadGame}
                    onStartSimulator={handleStartSimulator}
                    onImportSave={handleImportClick}
                    onOpenManual={() => setShowPlayerManual(true)}
                    onOpenChangelog={() => setShowChangelog(true)}
                    hasSaveGame={!!localStorage.getItem(SAVE_GAME_KEY)}
                    themeName={themeName}
                    setTheme={setTheme}
                />
                {showPlayerManual && <PlayerManual onClose={() => setShowPlayerManual(false)} themeName={themeName} />}
                {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
            </>
        );
    }
    
    if (view === 'simulator') {
        return <ScenarioSimulator onExit={handleExitToMainMenu} />;
    }

    const { redAlert } = gameState;

    return (
        <div className={`h-screen w-screen bg-bg-default text-text-primary overflow-hidden relative ${theme.font} ${redAlert ? 'red-alert-pulse' : ''} theme-${themeName}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            {themeName === 'romulan' && <RomulanDecoration />}
            {showPlayerManual && <PlayerManual onClose={() => setShowPlayerManual(false)} themeName={themeName} />}
            {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
            {showReplayer && <BattleReplayer history={gameState.replayHistory || []} onClose={() => setShowReplayer(false)} themeName={themeName} />}
            {showLogModal && <LogPanel logs={gameState.logs} onClose={() => setShowLogModal(false)} />}
            {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} themeName={themeName} />}
            {awayMissionResult && <AwayMissionResultDialog result={awayMissionResult} onClose={onCloseAwayMissionResult} />}
            {activeHail && targetEntity && <HailDialog hailData={activeHail} target={targetEntity} onClose={onCloseHail} />}
            {activeEvent && <EventDialog event={activeEvent.template} onChoose={onChooseEventOption} />}
            {eventResult && <EventResultDialog result={eventResult} onClose={onCloseEventResult} />}
            {showGameMenu && (
                <GameMenu
                    onSaveGame={saveGame}
                    onLoadGame={handleLoadGame}
                    onExportSave={exportSave}
                    onImportSave={handleImportClick}
                    onOpenManual={() => { setShowPlayerManual(true); setShowGameMenu(false); }}
                    onClose={() => setShowGameMenu(false)}
                    onExitToMainMenu={handleExitToMainMenu}
                    onOpenReplayer={() => { setShowReplayer(true); setShowGameMenu(false); }}
                    hasReplay={!!gameState.replayHistory && gameState.replayHistory.length > 0}
                />
            )}

            <GameUI
                gameState={gameState}
                themeName={themeName}
                setTheme={setTheme}
                currentView={currentView}
                onSetView={onSetView}
                isWarping={isWarping}
                entityRefs={entityRefs}
                selectedTargetId={selectedTargetId}
                onSelectTarget={onSelectTarget}
                navigationTarget={navigationTarget}
                onSetNavigationTarget={onSetNavigationTarget}
                isResizing={isResizing}
                onWarp={onWarp}
                onScanQuadrant={onScanQuadrant}
                handleHorizontalResize={handleHorizontalResize}
                handleVerticalResize={handleVerticalResize}
                setIsResizing={setIsResizing}
                bottomPanelHeight={bottomPanelHeight}
                sidebarWidth={sidebarWidth}
                targetEntity={targetEntity}
                isDocked={gameState.isDocked}
                playerTurnActions={playerTurnActions}
                isTurnResolving={isTurnResolving}
                desperationMoveAnimation={desperationMoveAnimation}
                onEndTurn={onEndTurn}
                onFireWeapon={onFireWeapon}
                onDockWithStarbase={onDockWithStarbase}
                onUndock={onUndock}
                onScanTarget={onScanTarget}
                onInitiateRetreat={onInitiateRetreat}
                onCancelRetreat={onCancelRetreat}
                onStartAwayMission={onStartAwayMission}
                onHailTarget={onHailTarget}
                onSendAwayTeam={onSendAwayTeam}
                onSelectSubsystem={onSelectSubsystem}
                onEnterOrbit={onEnterOrbit}
                orbitingPlanetId={gameState.orbitingPlanetId}
                onToggleCloak={onToggleCloak}
                onTogglePointDefense={onTogglePointDefense}
                onEnergyChange={onEnergyChange}
                onToggleRedAlert={onToggleRedAlert}
                onEvasiveManeuvers={onEvasiveManeuvers}
                onSelectRepairTarget={onSelectRepairTarget}
                setShowLogModal={setShowLogModal}
                setShowGameMenu={setShowGameMenu}
                isTouchDevice={isTouchDevice}
            />
        </div>
    );
};

export default App;
