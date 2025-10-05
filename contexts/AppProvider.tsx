
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameStateProvider } from './GameStateContext';
import { UIStateProvider, initialUIState } from './UIStateContext';
import { GameActionsProvider } from './GameActionsContext';
import { SAVE_GAME_KEY } from '../assets/configs/gameConstants';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // === FROM useGameLogic and App.tsx ===
    const [view, setView] = useState<'main-menu' | 'game' | 'simulator'>('main-menu');
    const gameLogic = useGameLogic();
    const { gameState, newGame, loadGame, importSave } = gameLogic;

    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showPlayerManual, setShowPlayerManual] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showReplayer, setShowReplayer] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    
    const [themeName, setTheme] = useState(initialUIState.themeName);
    
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState(initialUIState.sidebarWidth);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(initialUIState.bottomPanelHeight);
    
    // FIX: Added missing mobile sidebar state.
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    useEffect(() => localStorage.setItem('sidebarWidth', String(sidebarWidth)), [sidebarWidth]);
    useEffect(() => localStorage.setItem('bottomPanelHeight', String(bottomPanelHeight)), [bottomPanelHeight]);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // FIX: Defined entityRefs here instead of trying to get it from useGameLogic.
    const entityRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    useEffect(() => {
        document.body.className = `theme-${themeName}`;
        return () => { document.body.className = ''; }
    }, [themeName]);

    // === Game Actions (memoized) ===
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
        if(event.target) event.target.value = '';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleStartSimulator = useCallback(() => {
        setView('simulator');
    }, []);

    const handleExitToMainMenu = useCallback(() => {
        setView('main-menu');
        // Also reset transient UI state
        setShowGameMenu(false);
        setShowLogModal(false);
    }, []);

    // Memoize context values to prevent unnecessary re-renders
    const gameStateValue = useMemo(() => ({ ...gameLogic }), [gameLogic]);

    const gameActionsValue = useMemo(() => ({
        ...gameLogic,
        handleNewGame,
        handleLoadGame,
        handleImportSaveFromFile,
        handleFileChange,
        handleImportClick,
        handleStartSimulator,
        handleExitToMainMenu,
    }), [gameLogic, handleNewGame, handleLoadGame, handleImportSaveFromFile, handleFileChange, handleImportClick, handleStartSimulator, handleExitToMainMenu]);
    
    const uiStateValue = useMemo(() => ({
        view, setView,
        showGameMenu, setShowGameMenu,
        showPlayerManual, setShowPlayerManual,
        showLogModal, setShowLogModal,
        showReplayer, setShowReplayer,
        showChangelog, setShowChangelog,
        themeName, setTheme,
        isTouchDevice, isResizing, setIsResizing,
        sidebarWidth, setSidebarWidth,
        bottomPanelHeight, setBottomPanelHeight,
        fileInputRef,
        hasSaveGame: !!localStorage.getItem(SAVE_GAME_KEY),
        hasReplay: !!(gameState && gameState.replayHistory && gameState.replayHistory.length > 0),
        // FIX: Use the locally defined ref.
        entityRefs,
        currentView: gameLogic.currentView,
        // FIX: Added missing state.
        showMobileSidebar,
        // FIX: Added missing state setter.
        setShowMobileSidebar,
    }), [
        view, showGameMenu, showPlayerManual, showLogModal, showReplayer, showChangelog,
        themeName, isTouchDevice, isResizing, sidebarWidth, bottomPanelHeight, fileInputRef,
        // FIX: Corrected dependency array.
        gameState, gameLogic.currentView, showMobileSidebar
    ]);

    return (
        <GameStateProvider value={gameStateValue}>
            <GameActionsProvider value={gameActionsValue}>
                <UIStateProvider value={uiStateValue}>
                    {children}
                </UIStateProvider>
            </GameActionsProvider>
        </GameStateProvider>
    );
};
