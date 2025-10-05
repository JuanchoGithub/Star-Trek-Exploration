import React from 'react';
import { useGameActions } from '../contexts/GameActionsContext';
import { useUIState } from '../contexts/UIStateContext';

const GameMenu: React.FC = () => {
    const { saveGame, handleLoadGame, exportSave, handleImportClick, handleExitToMainMenu } = useGameActions();
    const { setShowGameMenu, setShowPlayerManual, setShowReplayer, hasReplay } = useUIState();

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="panel-style p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-secondary-light mb-4 text-center">Game Menu</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={saveGame} className="w-full btn btn-primary">Save</button>
                        <button onClick={handleLoadGame} className="w-full btn btn-primary">Load</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleImportClick} className="w-full btn btn-accent green text-white">Import</button>
                        <button onClick={exportSave} className="w-full btn btn-accent green text-white">Export</button>
                    </div>
                    <button onClick={() => { setShowPlayerManual(true); setShowGameMenu(false); }} className="w-full btn btn-secondary">Player's Manual</button>
                    <button onClick={() => { setShowReplayer(true); setShowGameMenu(false); }} disabled={!hasReplay} className="w-full btn btn-secondary">Battle Replayer</button>
                    <button onClick={handleExitToMainMenu} className="w-full btn btn-tertiary">Exit to Main Menu</button>
                    <button onClick={() => setShowGameMenu(false)} className="w-full btn btn-tertiary">Close Menu</button>
                </div>
            </div>
        </div>
    );
};

export default GameMenu;
