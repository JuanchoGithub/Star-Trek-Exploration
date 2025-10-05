import React, { createContext, useContext, useRef } from 'react';
import { ThemeName } from '../hooks/useTheme';

export interface UIStateContextValue {
    view: 'main-menu' | 'game' | 'simulator';
    setView: React.Dispatch<React.SetStateAction<'main-menu' | 'game' | 'simulator'>>;
    showGameMenu: boolean;
    setShowGameMenu: React.Dispatch<React.SetStateAction<boolean>>;
    showPlayerManual: boolean;
    setShowPlayerManual: React.Dispatch<React.SetStateAction<boolean>>;
    showLogModal: boolean;
    setShowLogModal: React.Dispatch<React.SetStateAction<boolean>>;
    showReplayer: boolean;
    setShowReplayer: React.Dispatch<React.SetStateAction<boolean>>;
    showChangelog: boolean;
    setShowChangelog: React.Dispatch<React.SetStateAction<boolean>>;
    themeName: ThemeName;
    setTheme: React.Dispatch<React.SetStateAction<ThemeName>>;
    isTouchDevice: boolean;
    isResizing: boolean;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    sidebarWidth: number;
    setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
    bottomPanelHeight: number;
    setBottomPanelHeight: React.Dispatch<React.SetStateAction<number>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    hasSaveGame: boolean;
    hasReplay: boolean;
    entityRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
    currentView: 'sector' | 'quadrant';
    showMobileSidebar: boolean;
    setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_HUD_HEIGHT = 240;
const MAX_HUD_HEIGHT = 500;

export const initialUIState = {
    view: 'main-menu' as const,
    showGameMenu: false,
    showPlayerManual: false,
    showLogModal: false,
    showReplayer: false,
    showChangelog: false,
    themeName: 'federation' as ThemeName,
    isTouchDevice: false,
    isResizing: false,
    sidebarWidth: (() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('sidebarWidth') : '320';
        return saved ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, parseInt(saved, 10))) : 320;
    })(),
    bottomPanelHeight: (() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('bottomPanelHeight') : '288';
        return saved ? Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, parseInt(saved, 10))) : 288;
    })(),
    hasSaveGame: false,
    hasReplay: false,
    currentView: 'sector' as const,
    showMobileSidebar: false,
};

const defaultState: UIStateContextValue = {
    ...initialUIState,
    setView: () => {},
    setShowGameMenu: () => {},
    setShowPlayerManual: () => {},
    setShowLogModal: () => {},
    setShowReplayer: () => {},
    setShowChangelog: () => {},
    setTheme: () => {},
    setIsResizing: () => {},
    setSidebarWidth: () => {},
    setBottomPanelHeight: () => {},
    fileInputRef: { current: null },
    entityRefs: { current: {} },
    setShowMobileSidebar: () => {},
};

export const UIStateContext = createContext<UIStateContextValue>(defaultState);

export const UIStateProvider = UIStateContext.Provider;

export const useUIState = () => {
  return useContext(UIStateContext);
};
