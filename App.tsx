import React from 'react';
import AwayMissionDialog from './components/AwayMissionDialog';
import HailDialog from './components/HailDialog';
import EventDialog from './components/EventDialog';
import AwayMissionResultDialog from './components/AwayMissionResultDialog';
import PlayerManual from './components/PlayerManual';
import EventResultDialog from './components/EventResultDialog';
import RomulanDecoration from './components/RomulanDecoration';
import MainMenu from './components/MainMenu';
import ScenarioSimulator from './components/ScenarioSimulator';
import BattleReplayer from './components/BattleReplayer';
import Changelog from './components/Changelog';
import GameMenu from './components/GameMenu';
import GameUI from './components/GameUI';
import LogPanel from './components/LogPanel';
import { useUIState } from './contexts/UIStateContext';
import { useGameState } from './contexts/GameStateContext';
import { useGameActions } from './contexts/GameActionsContext';

const App: React.FC = () => {
    const {
        view,
        showGameMenu,
        showPlayerManual,
        showLogModal,
        setShowLogModal,
        showReplayer,
        showChangelog,
        themeName,
        fileInputRef,
    } = useUIState();

    const { gameState, activeAwayMission, activeHail, activeEvent, awayMissionResult, eventResult, targetEntity } = useGameState();
    const { handleFileChange, handleExitToMainMenu, onChooseAwayMissionOption, onCloseAwayMissionResult, onCloseHail, onChooseEventOption, onCloseEventResult } = useGameActions();

    if (view === 'main-menu') {
        return <MainMenu />;
    }
    
    if (view === 'simulator') {
        return <ScenarioSimulator onExit={handleExitToMainMenu} />;
    }

    if (!gameState) {
        // This can happen briefly when switching views
        return <div>Loading...</div>;
    }

    const { redAlert } = gameState;

    return (
        <div className={`h-screen w-screen bg-bg-default text-text-primary overflow-hidden relative font-sans ${redAlert ? 'red-alert-pulse' : ''} theme-${themeName}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            {themeName === 'romulan' && <RomulanDecoration />}
            {showPlayerManual && <PlayerManual />}
            {showChangelog && <Changelog />}
            {showReplayer && <BattleReplayer />}
            {showLogModal && <LogPanel logs={gameState.logs} onClose={() => setShowLogModal(false)} />}
            {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} themeName={themeName} />}
            {awayMissionResult && <AwayMissionResultDialog result={awayMissionResult} onClose={onCloseAwayMissionResult} />}
            {activeHail && targetEntity && <HailDialog hailData={activeHail} target={targetEntity} onClose={onCloseHail} />}
            {activeEvent && <EventDialog event={activeEvent.template} onChoose={onChooseEventOption} />}
            {eventResult && <EventResultDialog result={eventResult} onClose={onCloseEventResult} />}
            {showGameMenu && <GameMenu />}

            <GameUI />
        </div>
    );
};

export default App;