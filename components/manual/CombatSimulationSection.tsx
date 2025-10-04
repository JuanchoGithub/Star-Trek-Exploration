import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const ScenarioSimulatorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix A: The Scenario Simulator</SectionHeader>
        <p className="text-text-secondary mb-4">The Scenario Simulator is a powerful wargaming tool that allows Starfleet officers to construct and observe custom tactical situations. This is an invaluable resource for testing ship capabilities, understanding AI behavior, and honing your own command skills without risking the U.S.S. Endeavour.</p>
        
        <SubHeader>Accessing the Simulator</SubHeader>
        <p className="text-text-secondary mb-4">The simulator is accessible directly from the game's Main Menu.</p>
        
        <SubHeader>Phase 1: Setup Mode</SubHeader>
        <p className="text-text-secondary mb-4">This is the heart of the simulator, where you become the architect of your own battle. The screen is divided into the tactical map on the left and the control panel on the right.</p>
        <div className="space-y-3">
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-white">1. The Tactical Map & Sector Controls</h4>
                <p className="text-sm text-text-secondary">The large map on the left is a live preview of the sector where your simulation will take place.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Sector Type:</strong> Use this button to open a full-screen modal where you can select the environmental template for your battle, from empty space to dense nebulae or asteroid fields.</li>
                    <li><strong>Refresh:</strong> Each sector template is generated with a random "seed". Clicking Refresh generates a new layout using the same template but a different seed, allowing you to cycle through map variations.</li>
                </ul>
                </p>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-white">2. The Toolbox</h4>
                <p className="text-sm text-text-secondary">The right-hand panel contains all the tools needed to place and configure your forces.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Set Allegiance:</strong> Before placing a ship, you must select its allegiance. This determines who it will fight for. 'Player' is for dogfight mode, 'Ally' will fight alongside the player, 'Enemy' will fight against the player, and 'Neutral' will not participate.</li>
                    <li><strong>Ship Registry:</strong> This scrollable list contains every ship class in the simulation. Select a faction, then click on a ship class to arm your placement tool.</li>
                     <li><strong>Remove Ship:</strong> Select this tool to remove a previously placed ship from the map.</li>
                    <li><strong>Placement:</strong> With an allegiance and ship class selected, simply click on an empty cell on the tactical map to deploy that vessel.</li>
                </ul>
                </p>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-white">3. Starting the Simulation</h4>
                <p className="text-sm text-text-secondary">Once your ships are placed, you have two options:</p>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong className="text-accent-yellow">Start Spectate:</strong> This begins the simulation in a fully automated mode. All ships will be controlled by their respective AI doctrines. This is perfect for observing large-scale fleet engagements or testing how different ship compositions fare against each other.</li>
                    <li><strong className="text-accent-yellow">Start Dogfight:</strong> This mode requires you to have placed exactly one ship with the 'Player' allegiance. You will take direct command of this vessel, with the full player HUD at your disposal, fighting against any ships you designated as 'Enemy'.</li>
                </ul>
            </div>
        </div>

        <SubHeader>Phase 2: Running the Simulation</SubHeader>
        <p className="text-text-secondary mb-4">Once the simulation begins, your interface will change based on the mode you selected.</p>
        
        <div className="p-3 bg-bg-paper-lighter rounded mb-3">
            <h4 className="font-bold text-white">Spectate Mode</h4>
            <div className="text-sm text-text-secondary">
                 This is a read-only observation mode where all ships are controlled by the AI.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Playback Controls:</strong> At the bottom of the tactical map, you have full control over the simulation's flow. You can Play/Pause the automatic turn progression, step forward and backward one turn at a time, or use the slider to jump to any point in the battle's history. This allows for detailed turn-by-turn analysis.</li>
                    <li><strong>Layout:</strong> The screen is split between the tactical map on the left and a sidebar on the right.</li>
                    <li>
                        <strong>Ship Inspection (M.A.C.O. Update):</strong> Clicking on any ship on the map will select it for detailed analysis in the right-hand sidebar. The panel has been overhauled for maximum tactical clarity:
                        <ul className="list-[circle] list-inside ml-6 mt-1">
                            <li><strong>Numerical Readouts:</strong> All primary stats (Hull, Shields, etc.) are displayed as precise numbers rather than graphical bars.</li>
                            <li><strong>Targeting Intelligence:</strong> The panel shows what the selected ship is targeting ("Targeting Data") and which vessels are targeting it ("Targeted By").</li>
                            <li><strong>Subsystem Highlighting:</strong> The subsystem list visually indicates status. A <span className="text-red-500">red ring</span> highlights a system being targeted by an enemy, while a <span className="text-yellow-400">yellow ring</span> indicates a system undergoing repairs.</li>
                            <li><strong>Full Tactical Profile:</strong> The panel includes a complete breakdown of Threat Analysis, active environmental effects, and detailed status for all weapon systems, mirroring the advanced readouts of the main game.</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
         <div className="p-3 bg-bg-paper-lighter rounded">
            <h4 className="font-bold text-white">Dogfight Mode</h4>
            <p className="text-sm text-text-secondary">
                 This mode gives you direct control over your designated 'Player' ship.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Interface:</strong> The layout mirrors the main game. The tactical map is on the left, with your full Player HUD below it. A sidebar on the right contains your Ship Status panel and, if a target is selected, its detailed information panel. Refer to the "Bridge Interface" section for a full breakdown of these elements.</li>
                    <li><strong>Log:</strong> The combat log is available via a "Show Log" button, which opens it in a large modal window over the screen.</li>
                </ul>
            </p>
        </div>

    </div>
);

// FIX: Added the missing BattleReplayerSection component to be exported from this file.
export const BattleReplayerSection: React.FC = () => (
    <div>
        <SectionHeader>The Battle Replayer</SectionHeader>
        <p className="text-text-secondary mb-4">The Battle Replayer is a comprehensive after-action review system that allows you to analyze combat encounters. It is an invaluable tool for understanding AI behavior and refining your own tactical decisions.</p>
        
        <SubHeader>Accessing the Replayer</SubHeader>
        <p className="text-text-secondary mb-4">The "Battle Replayer" is accessible from the in-game Game Menu. It will only be available if a combat encounter has occurred in the current sector. The replayer history is automatically recorded, storing a complete snapshot of the last 100 turns of activity. This history is cleared when you warp to a new sector.</p>
        
        <SubHeader>Interface and Controls</SubHeader>
        <p className="text-text-secondary mb-4">The replayer interface provides a complete reconstruction of the battle:</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong>Playback Controls:</strong> At the bottom of the tactical map, you will find a full suite of controls, including a Play/Pause button for automatic playback, Previous/Next turn buttons, and a slider to jump to any specific turn in the recorded history.
            </li>
            <li>
                <strong>Interactive Tactical View:</strong> The main viewscreen shows the state of the sector for the selected turn. You can click on any ship on the map to select it for detailed analysis. Combat effects, such as phaser fire and torpedo impacts, will be animated for the selected turn.
            </li>
            <li>
                <strong>Detailed Status Panels:</strong> The right-hand sidebar is dedicated to providing an exhaustive breakdown of ship statuses.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>The top panel shows the status of your ship, the U.S.S. Endeavour.</li>
                    <li>The panel below it shows the detailed status of any ship you have selected on the map. This includes hull, shields, energy, all subsystem health percentages, resources, critical timers (e.g., life support failure), and any active tactical or environmental modifiers.</li>
                </ul>
            </li>
            <li>
                <strong>Turn Log:</strong> A button is available to show the full, verbose combat log for the currently selected turn, allowing for a line-by-line analysis of events.
            </li>
        </ul>
    </div>
);