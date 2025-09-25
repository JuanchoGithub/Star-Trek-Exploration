# Star Trek: Vibe Exploration

A browser-based, turn-based game where you captain a Federation starship. Explore the galaxy, manage your ship and crew, and navigate complex diplomatic and combat encounters.

## Key Features

*   **Deep, Turn-Based Tactical Combat:** Manage energy allocation, target enemy subsystems, and utilize a variety of weapon systems.
*   **Dynamic Galaxy Exploration:** Navigate a procedurally generated quadrant map, with each sector offering unique challenges and opportunities based on its location and factional control.
*   **Rich Thematic Experience:** Choose from multiple UI themes (Federation, Klingon, Romulan) that alter the entire visual and auditory experience.
*   **Complex Ship Management:** Monitor your ship's hull, shields, energy, and the health of over eight critical subsystems. Make tough decisions about repairs and resource allocation.
*   **Narrative Events & Away Missions:** Encounter derelict ships, answer distress calls, and send away teams to investigate strange new worlds, with outcomes determined by your choices and your officers' skills.
*   **Advanced AI:** Face off against distinct faction AIs with unique doctrines, from the honorable but aggressive Klingons to the cunning and cautious Romulans.
*   **Scenario Simulator & Battle Replayer:** Test your skills and analyze your strategies with a powerful wargaming tool that lets you design, observe, and review any combat scenario.

---

## Gameplay & Manual

For a complete guide to gameplay mechanics, ship registries, tactical doctrines, and lore, please refer to the in-game **Player's Manual**. It is accessible from the main menu and the in-game menu.

---

# Simulation Changelog

## Version 1.7 - AI & Cloaking Overhaul
*Release Date: Stardate 49740.1, 09:00 (September 26, 2025)*

A significant update focused on enhancing strategic depth by overhauling AI behavior, cloaking mechanics, and derelict ship interactions.

### Summary of User Directives & Field Reports
> Analysis of recent combat logs indicated a lack of tactical depth in several key areas. Cloaking was a binary state, offering no risk or trade-off. Derelict vessels were static battlefield objects rather than strategic assets. AI, while improved, lacked the ability to track threats it could not directly see or manage complex states like boarding.
>
> A directive was issued to introduce a suite of features to address these shortcomings, focusing on risk-reward mechanics for cloaking, making derelicts a capturable objective, and enhancing the AI's situational awareness and tactical repertoire.

### Summary of Implemented Changes
*   **Complex Cloaking Mechanics:**
    *   Cloaking is now a multi-turn process, making ships vulnerable during the transition.
    *   A new **Shield Recalibration** feature prevents shields from being immediately raised after decloaking, forcing a tactical cooldown.
    *   Taking damage while engaging a cloak now adds permanent **Instability** to the device, reducing its reliability for the remainder of combat.
*   **Enhanced Boarding & Derelict Capture:**
    *   A new multi-turn boarding process for capturing derelict ships has been implemented.
    *   Capturing a derelict requires a resource cost (Dilithium and a Security Team) and several turns, after which the vessel is brought back online as an ally.
    *   AI fleets will now attempt to capture derelicts if the opportunity arises.
*   **Advanced AI Tactical Awareness:**
    *   AI ships now track their `currentTargetId` and the `lastAttackerPosition`.
    *   This allows the AI to respond to unseen threats (e.g., a cloaked ship firing torpedoes) by moving away from the last known point of attack.
    *   The `SectorView` now provides visual feedback on targeting, showing lines between an attacker and its target.
*   **Energy Management Overhaul:**
    *   The logic for using Dilithium crystals for emergency power has been refined, including a risk of consequential subsystem damage on use.
*   **General Enhancements & Fixes:**
    *   Captains can now properly undock from starbases, which is now a turn-ending action.
    *   The save/load system has been refactored into a dedicated module to improve robustness and simplify future data migrations.
    *   Minor layout adjustments have been made to the Player HUD for better readability.

## Version 1.6.2 - Save Game Compatibility Patch
*Release Date: Stardate 49735.6, 11:00 (September 25, 2025)*

A maintenance release to ensure backward compatibility with older save game files, preventing crashes related to newly added ship subsystems.

### Summary of User Directives & Field Reports
> Field reports indicated a critical runtime error occurring when loading save games from older simulation versions. The error, `TypeError: Cannot read properties of undefined (reading 'maxHealth')`, was traced to the `PlayerHUD` component attempting to access ship subsystems (specifically `shuttlecraft` and `transporter`) that did not exist in the older data structure.
> 
> A high-priority directive was issued to patch the simulation to handle these legacy save files gracefully and prevent game-breaking crashes for long-term players.

### Summary of Implemented Changes
*   **Bug Fix - Legacy Save Compatibility:** The `PlayerHUD.tsx` component has been updated to perform robust checks before accessing subsystem properties.
*   **Defensive Coding Implementation:** The `getAwayMissionButtonState` function now verifies the existence of the `shuttlecraft` and `transporter` subsystems on the player's ship object before attempting to read their `health` or `maxHealth` values. This prevents runtime errors when loading save files created prior to the introduction of these systems.
*   **Improved Stability:** This patch ensures that all players, regardless of when their game was started, can load their progress without encountering crashes related to evolving data structures.

## Version 1.6.1 - Tactical Clarity Update
*Release Date: Stardate 49733.1, 10:00 (September 24, 2025)*

A quality-of-life patch addressing two critical pieces of user feedback regarding shield mechanics and the tactical display of defeated vessels.

### Summary of User Directives & Field Reports
> Engineering reports a persistent malfunction in shield regeneration protocols; depleted shields were failing to recharge from zero, a critical flaw in defensive systems. Additionally, the bridge crew reported tactical confusion due to destroyed vessels not being visually distinct from active combatants. Immediate rectification was ordered to ensure system reliability and combat effectiveness.

### Summary of Implemented Changes
*   **Bug Fix - Shield Regeneration:** Corrected a logical flaw in the end-of-turn processing. A faulty condition was preventing shield regeneration from initiating if a ship's shields were at 0. This has been fixed, and shields will now correctly begin recharging from a fully depleted state, provided the ship is at Red Alert with a functional shield generator.
*   **New Feature - Visual State for Destroyed Ships:**
    *   **Tactical View:** Ships with a hull value of 0 or less are now visually marked as destroyed. They will appear grayed-out and semi-transparent on the `SectorView`, and their health bar will be hidden to provide clear, immediate feedback on their status.
    *   **Command Console:** All offensive action buttons (Fire Phasers, Launch Torpedo, etc.) in the `CommandConsole` are now disabled when a destroyed ship is targeted. This prevents wasted actions and streamlines target selection during combat.

## Version 1.6 - The Phased Combat & AI Overhaul
*Release Date: Stardate 49732.5, 15:00 (September 24, 2025)*

A major update focusing on a more dynamic, cinematic combat experience through a new phased turn system. This release also introduces a significantly more advanced AI, a modernized mobile UI, and a suite of enhanced visual effects.

### Summary of User Directives & Field Reports
> Analysis of previous simulation logs indicated that the turn-based combat system, while functional, lacked dynamism. All actions resolved simultaneously, leading to a static and sometimes confusing battlefield. Feedback also highlighted that AI opponents were predictable, failing to adapt their strategies to changing combat conditions.
>
> Furthermore, with increasing deployment on touch-enabled PADDs, the primary user interface was reported as clunky and difficult to operate on smaller screens. A full modernization was ordered to improve mobile usability. Finally, a general directive was issued to enhance the visual fidelity of combat to better represent the tactical situation.

### Summary of Implemented Changes
*   **New Phased Turn System:** Combat is now resolved in a logical, sequential order instead of all at once. The new turn manager processes actions in distinct phases (Point-Defense, Energy Management, Movement, Torpedo Launch, Phaser Fire, Projectile Movement), creating a more cinematic and easier-to-follow battle flow.
*   **Advanced AI Doctrine Overhaul:**
    *   AI ships now operate under a dynamic 'Stance' system (Aggressive, Defensive, Balanced, Recovery), intelligently reallocating power and choosing actions based on their current situation and factional doctrine.
    *   Hostile AI will now strategically target specific ship subsystems to exploit weaknesses, such as Klingons targeting weapons or Romulans targeting engines.
    *   AI vessels now manage energy and repair critical systems when out of combat, ensuring they are better prepared for subsequent encounters.
*   **Tactical Viewscreen Enhancements:**
    *   Entity rendering has been upgraded to use dynamic pixel-based positioning, resulting in smooth, animated movement on the tactical grid.
    *   Nebula cells are now rendered with subtle animations, creating a more vibrant and atmospheric battlefield.
    *   Torpedoes now leave a visible trail, making their paths and trajectories clear at a glance.
*   **Modernized Mobile UI/UX:**
    *   For touch-enabled devices, the main sidebar has been replaced with a floating "Systems" button that opens an intuitive, full-height slide-out overlay panel.
    *   The "Sector View" and "Quadrant Map" buttons have been redesigned into a clean, vertical stack to the left of the viewscreen, improving ergonomics and screen real estate.
*   **Enhanced Combat Visual Effects:**
    *   Phaser beam animations are now multi-stage, featuring a distinct draw, hold, and fade phase for a more impactful feel.
    *   New shield and hull impact animations provide clear visual feedback for where damage is being dealt.
    *   Point-defense lasers now render as a visible defensive beam, showing their interception attempts.

## Version 1.5.2 - AI Resource Management & UI Polish
*Release Date: Stardate 49728.1, 20:00 (September 23, 2025)*

Introduced intelligent, out-of-combat AI behavior for resource management and repairs. Addressed several UI layout and rendering bugs for a smoother user experience.

### Summary of User Directives & Field Reports
> User directive specified that AI vessels should exhibit more strategic behavior outside of direct combat. When no enemies are nearby, they should attempt to conserve power, initiate repairs on damaged systems, and generally prepare for their next engagement. If threats approach, they must immediately return to a combat-ready state.
>
> Additionally, a visual glitch was reported where the decorative, pulsating border of status panels would incorrectly scroll along with the panel's text content, breaking the UI's fixed-frame aesthetic.

### Summary of Implemented Changes
*   **New AI 'Recovery' Stance:**
    *   AI ships will now automatically enter a 'Recovery' stance when no enemies are within a 10-unit radius.
    *   In this stance, ships divert all non-essential power to their engines to maximize energy generation and recharge their reserve batteries.
    *   Damage control teams are automatically assigned to repair the most critically damaged system, followed by hull repairs.
    *   The AI will immediately exit Recovery mode and re-allocate power for combat the moment an enemy vessel closes to within 10 units.
*   **UI Layout & Scrolling Fixes:**
    *   Corrected the layout of the `SimulatorShipDetailPanel`. The component was refactored to have a fixed outer frame with the panel styling and an independent, internally scrolling div for its content, preventing the border from moving.
    *   Restructured the "Dogfight" mode sidebar in the `ScenarioSimulator`. The Player and Target status panels are now in separate containers, allowing them to scroll independently and resolving an issue where scrolling one would move both.

## Version 1.5.1 - Critical Systems & Bug Fixes
*Release Date: Stardate 49727.4, 16:00 (September 23, 2025)*

A rapid-response patch addressing several critical bugs reported from the field, focusing on combat mechanics, AI resource management, and UI clarity.

### Summary of User Directives & Field Reports
> Field reports indicated multiple system malfunctions during combat scenarios:
> *   The 'Unknown Contact' icon was failing to display, revealing ship identities prematurely.
> *   Enemy vessels were observed operating indefinitely with zero reserve power and no dilithium, violating established energy mechanics.
> *   A critical flaw in the damage model was causing ships with moderately damaged engines (e.g., 24% health) to become derelict, a state that should only result from total life support failure.
> *   UI feedback for engine failure was unclear, causing confusion when movement commands were unavailable.
>
> Immediate rectification of these issues was ordered.

### Summary of Implemented Changes
*   **Bug Fix - Unknown Contact Icon:** Corrected the rendering logic in the `SectorView` component. The system now properly checks if a ship is unscanned *before* selecting an icon, ensuring unidentified contacts display the correct sensor blip.
*   **Bug Fix - AI Energy & Dilithium Consumption:** Overhauled the end-of-turn energy management logic in `turnManager.ts` for all NPC ships. AI vessels with an energy deficit will now correctly consume one dilithium for an emergency recharge. If no dilithium is available, their power will drop to zero, and the life-support failure countdown will begin as intended.
*   **Bug Fix - Derelict Ship Logic:** Corrected a critical bug where engine damage was incorrectly linked to life support failure. The two-turn countdown to a ship becoming derelict now ONLY begins when the Life Support subsystem's health reaches 0.
*   **New UI - System Failure Indicators:** To improve tactical clarity, new visual indicators have been added to the `ShipStatus` panel:
    *   A red, flashing `"OFFLINE"` indicator now appears next to the Impulse Engines when their health is below 50%.
    *   A red, flashing `"FAILING (xT)"` timer appears next to Life Support when the two-turn derelict countdown is active.

## Version 1.5 - The Energy & Simulation Overhaul
*Release Date: Stardate 49725.1, 11:00 (September 23, 2025)*

A fundamental redesign of ship energy management systems, a comprehensive overhaul of the Scenario Simulator, and a full update to the Player's Manual to document these extensive changes.

### Summary of User Directives
> User mandated a complete revamp of the game's energy management to introduce a more granular, tactical model. This included dynamic power generation based on engine allocation and damage, passive power consumption for all individual ship components, and updated AI doctrines to utilize these new mechanics. Subsequently, a series of directives called for a major overhaul of the Scenario Simulator to include a detailed ship information panel mirroring the Battle Replayer, full combat animation support, and a more intuitive UI/UX for 'Spectate' mode. Finally, a complete documentation update was ordered for the Player's Manual to reflect all new features and mechanics.

### Summary of Implemented Changes
*   **New Dynamic Energy Grid:**
    *   A ship's energy generation is now determined by a baseline value (scaled by class) and amplified by power allocated to engines (from 50% at 0% allocation to 200% at 100% allocation).
    *   Engine damage now directly reduces energy generation, making engines a critical tactical target.
    *   Every major ship system now has a passive energy cost. Disabling or destroying a system frees up its power for other functions.
    *   AI doctrines for all factions have been updated to a three-way Weapons/Shields/Engines power allocation system.
*   **Scenario Simulator Overhaul:**
    *   Added a detailed, scrollable ship information panel, providing a comprehensive tactical readout of any selected vessel.
    *   The information panel includes a full breakdown of the new energy grid, showing generation, consumption, and net power balance.
    *   Restored all combat animations (phasers, torpedoes, explosions) to the simulator.
    *   Redesigned 'Spectate' mode with a split-view UI for simultaneous log and ship detail viewing, and implemented intuitive click-to-deselect controls.
*   **Main Menu Redesign:** The main menu was streamlined for clarity, removing the sub-menu and adding direct-access buttons for the Manual and Changelog.
*   **Comprehensive Manual Update:**
    *   Added brand-new sections detailing the features and UI of the 'Scenario Simulator' and 'Battle Replayer'.
    *   The 'Entity Registry' was updated to include a detailed "Energy Profile" for every ship, showing baseline generation and passive consumption for each system.
    *   All relevant mechanics sections were updated to reflect the new energy management system.

## Version 1.4.1 - Simulation Updates
*Release Date: Stardate 49722.8, 18:00 (September 22, 2025)*

A comprehensive overhaul of the Scenario Simulator, implementing numerous user-requested features for improved functionality, consistency, and tactical clarity.

### Summary of User Directives
> User requested a massive overhaul of the Scenario Simulator to bring it up to par with the main game's quality and functionality. Key directives included:
> *   **Visual Consistency:** The setup screen's tactical map needed to be a live, persistent preview of the actual battle map, not just a placeholder.
> *   **Predictable Generation:** Sector generation needed to be controlled by a persistent seed, with a "Refresh" button to allow cycling through layouts.
> *   **Clearer Tactical Readout:** Ship icons needed to be colored by their assigned allegiance (Player, Enemy, etc.) for at-a-glance clarity, rather than by their faction.
> *   **Functional AI:** AI needed to be "fixed" to respect allegiance over hard-coded faction behavior, allowing for scenarios like Federation vs. Federation battles.
> *   **UI/UX Overhaul:** The cumbersome sector dropdown was to be replaced with a rich modal window. The dogfight UI needed to be enhanced with the player's full `ShipStatus` panel.
> *   **Critical Bug Fixes:** A persistent, frustrating bug preventing the combat log from scrolling needed to be definitively resolved. Additionally, targeting and layout responsiveness issues were to be corrected.

### Summary of Implemented Changes
*   **New Simulator Setup Flow:** The setup screen now generates a full, seed-based preview of the selected sector. This exact sector state, including its seed and entity placement, is now preserved and used when the simulation begins. A "Refresh" button has been added to generate new map layouts on demand.
*   **Allegiance-Based Systems:** The `SectorView` now colors ships based on their simulator allegiance. The core AI logic for the Federation faction was overhauled to engage in combat if assigned as an 'enemy', enabling more flexible scenarios. The player's `CommandConsole` was also updated to allow targeting based on allegiance, not just faction.
*   **Comprehensive UI/UX Overhaul:**
    *   The sector dropdown was replaced with a full-screen modal displaying previews and detailed descriptions of each sector template.
    *   The simulator layout is now fully responsive, correctly scaling the map and stacking UI elements on smaller screens.
    *   In "Dogfight" mode, the player now has access to the full `ShipStatus` panel in a new sidebar for complete control.
    *   The combat log in both Dogfight and Spectator modes was moved into a modal/panel with a definitive fix for the long-standing scrolling issue, using a robust flexbox layout to correctly constrain its height.
*   **Core Logic Refactoring:** The `useScenarioLogic` hook was refactored to support the new seed-based, persistent sector generation, improving the simulator's stability and predictability.

## Version 1.4 - Battle Replayer
*Release Date: Stardate 49722.3, 14:00 (September 22, 2025)*

A comprehensive after-action review system has been added to the simulation for advanced tactical analysis.

### Summary of User Directives
> User requested a comprehensive 'Battle Replayer' to analyze combat encounters. Initial requests focused on basic playback, but follow-up directives expanded the scope to include fully interactive, detailed inspection of any ship's status on any given turn. This included demands for a verbose turn-by-turn combat log and a complete tactical readout showing every subsystem, resource, timer, and active modifier.

### Summary of Implemented Changes
*   **New 'Battle Replayer' Feature:** A new "Battle Replayer" is now accessible from the Game Menu after any combat encounter.
*   **Automatic Recording:** The simulation now automatically records a complete snapshot of the sector state at the end of every turn, storing the last 100 turns of activity. This history is cleared upon warping to a new sector.
*   **Full Playback Controls:** The replayer includes a turn slider, play/pause functionality, and step-by-step controls to review the engagement turn-by-turn.
*   **Interactive Tactical View:** You can now click on any ship within the replayer's Sector View to select it for detailed analysis.
*   **Comprehensive Status Panels:** Detailed, scrollable panels provide an exhaustive, real-time breakdown of every variable for both your ship and the selected target for any specific turn. This includes hull, shields, energy, all subsystem health percentages, resources, critical timers (e.g., life support failure), and active tactical modifiers (e.g., nebula cover, stun effects).
*   **Expandable Log Viewer:** A new "Show Full Log" button opens a large, scrollable overlay, allowing you to read the detailed event log for the selected turn while still viewing the tactical map.

## Version 1.3.2 - Energy Rebalancing
*Release Date: Stardate 49721.8, 09:00 (September 22, 2025)*

Overhaul of the ship energy economy based on operational feedback.

### Field Report & Directive
> "...some ships have too low energy and dilithium... make the energy requirements equivalent on all ships... if a galaxy class ship's phasers consume 20 units, an intrepid class should consume 50% of that, and the phasers should do 50% of damage... this modifier works both for phaser, point defense systems and any energy requirements consumption."

### Summary of Implemented Changes
*   **Energy Modifier System:** Introduced a new `energyModifier` stat for every ship class, calculated based on its total durability (Hull + Shields). The Sovereign-class serves as the 1.0x baseline.
*   **Scaled Energy Consumption:** All actions that consume Reserve Power (phasers, torpedoes, repairs, etc.) now have their costs scaled by this modifier.
*   **Scaled Damage Output:** Phaser damage is now also scaled by the `energyModifier` to maintain combat balance.
*   **Proportional Resource Pools:** Each ship's maximum Reserve Power and Dilithium stores were rebalanced based on its `energyModifier`.