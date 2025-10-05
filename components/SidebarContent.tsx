import React from 'react';
import { GameState, ShipSubsystems } from '../types';
import { ThemeName } from '../hooks/useTheme';
import ShipStatus from './ShipStatus';

// NOTE FOR FUTURE DEVS: This component was moved from App.tsx.
// Defining components inside other components is an anti-pattern in React.
// It can lead to performance issues (unnecessary re-renders) and state loss,
// as the component is re-created on every render of its parent.
// Please define all components at the top level of their own modules.

interface SidebarContentProps {
    gameState: GameState;
    selectedTargetId: string | null;
    onEnergyChange: (changedKey: 'weapons' | 'shields' | 'engines', value: number) => void;
    onToggleRedAlert: () => void;
    onEvasiveManeuvers: () => void;
    onSelectRepairTarget: (subsystem: 'hull' | keyof ShipSubsystems | null) => void;
    onToggleCloak: () => void;
    onTogglePointDefense: () => void;
    themeName: ThemeName;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
    gameState, selectedTargetId, onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget, onToggleCloak, onTogglePointDefense, themeName 
}) => (
    <ShipStatus 
        gameState={gameState} 
        selectedTargetId={selectedTargetId}
        onEnergyChange={onEnergyChange}
        onToggleRedAlert={onToggleRedAlert}
        onEvasiveManeuvers={onEvasiveManeuvers}
        onSelectRepairTarget={onSelectRepairTarget as any}
        onToggleCloak={onToggleCloak}
        onTogglePointDefense={onTogglePointDefense}
        themeName={themeName}
    />
);

export default SidebarContent;
