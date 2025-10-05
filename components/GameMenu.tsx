import React from 'react';

// NOTE FOR FUTURE DEVS: This component was moved from App.tsx.
// Defining components inside other components is an anti-pattern in React.
// It can lead to performance issues (unnecessary re-renders) and state loss,
// as the component is re-created on every render of its parent.
// Please define all components at the top level of their own modules.

interface GameMenuProps {
    onSaveGame: () => void;
    onLoadGame: () => void;
    onExportSave: () => void;
    onImportSave: () => void;
    onOpenManual: () => void;
    onClose: () => void;
    onExitToMainMenu: () => void;
    onOpenReplayer: () => void;
    hasReplay: boolean;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSaveGame, onLoadGame, onExportSave, onImportSave, onOpenManual, onClose, onExitToMainMenu, onOpenReplayer, hasReplay }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="panel-style p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-secondary-light mb-4 text-center">Game Menu</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onSaveGame} className="w-full btn btn-primary">Save</button>
                        <button onClick={onLoadGame} className="w-full btn btn-primary">Load</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onImportSave} className="w-full btn btn-accent green text-white">Import</button>
                        <button onClick={onExportSave} className="w-full btn btn-accent green text-white">Export</button>
                    </div>
                    <button onClick={onOpenManual} className="w-full btn btn-secondary">Player's Manual</button>
                    <button onClick={onOpenReplayer} disabled={!hasReplay} className="w-full btn btn-secondary">Battle Replayer</button>
                    <button onClick={onExitToMainMenu} className="w-full btn btn-tertiary">Exit to Main Menu</button>
                    <button onClick={onClose} className="w-full btn btn-tertiary">Close Menu</button>
                </div>
            </div>
        </div>
    );
};

export default GameMenu;
