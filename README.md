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

## Version 2.2 - The "Hazard & M.A.C.O." Update
*Release Date: Stardate 49755.2, 18:00 (September 29, 2025)*

A major update focusing on environmental hazards with the complete overhaul of Ion Storms, a Meticulous Analysis and Combat Overhaul (M.A.C.O.) of the simulator's tactical information displays, and numerous AI and stability improvements based on field reports.

### Summary of User Directives & Field Reports
> Analysis of simulation data and direct command feedback highlighted several areas for immediate improvement. Directives were issued to:
> *   Transform "Ion Storms" from a purely cosmetic effect into a genuine, unpredictable environmental hazard with a wide range of mechanical effects.
> *   Completely overhaul the tactical detail panel within the Scenario Simulator to provide maximum data clarity, replacing graphical bars with precise numerical readouts and adding detailed targeting and repair-status information.
> *   Correct a critical AI doctrine flaw where allied vessels would fail to engage hostile targets in simulations without a designated player ship.
> *   Address a series of high-priority bugs causing simulator crashes and UI display errors.
> *   Enhance combat logging to provide comprehensive, consolidated reports on environmental effects for all vessels.
> *   Ensure all documentation in the Player's Manual is updated to reflect these significant changes.

### Summary of Implemented Changes
*   **New Feature: Ion Storm Hazard Overhaul:**
    *   Ion Storms are now a dangerous environmental hazard. Each turn, every ship inside a storm is checked against 8 potential system failures. If any checks succeed, one is chosen at random and applied.
    *   New effects include hull damage, systems going offline, power drains, and torpedo misfires.
    *   Ion Storm visuals have been updated with a distinct greenish/yellow palette and increased density to create a more imposing tactical environment.
*   **Major Feature: Simulator M.A.C.O. (Meticulous Analysis and Combat Overhaul):**
    *   The `SimulatorShipDetailPanel` has been completely redesigned for data clarity, replacing graphical status bars with precise numerical readouts for Hull, Shields, and other resources.
    *   **New Subsystem Highlighting:** Subsystems are now highlighted with a red ring if they are being targeted by an enemy, and a yellow ring if they are being repaired by their own crew.
    *   **New Targeting Intelligence:** The panel now includes "Targeted By" and "Targeting Data" sections, providing a real-time list of who is targeting the selected ship and what the selected ship is targeting, respectively.
    *   Restored "Threat Analysis" and "Environment" sections to provide a complete tactical overview for any selected vessel.
*   **AI Doctrine Enhancement:**
    *   Corrected a critical flaw in AI logic. Allied vessels will now correctly engage hostile targets in simulations, even when no player ship is present. The `FederationAI` and `IndependentAI` have been significantly overhauled to support this.
*   **Enhanced Logging & UI Feedback:**
    *   Ion Storm effects are now logged for all ships. The log message has been consolidated to show the results of all 8 probability checks and the final, randomly selected outcome in a single, detailed report.
    *   The main `ShipStatus` panel now includes an "Environment" section, clearly indicating if the player is in an Ion Storm, Nebula, or Asteroid Field.
*   **Critical Bug Fixes & Stability Improvements:**
    *   Fixed multiple `Cannot read properties of undefined` errors that caused the simulator to crash when running in "Spectate" mode without a player ship.
    *   Resolved rendering bugs where Ion Storm effects were not visible on the tactical map or in the manual's sector preview.
    *   Corrected the `[object Object]` display bug in the simulator's detail panel.
*   **Code Quality & Maintainability:** Refactored the combat effects rendering layer to eliminate hardcoded grid constants, preventing future alignment bugs with weapon visuals.
*   **Documentation Update:** The Player's Manual, specifically the sections on Environmental Hazards and previous changelogs, has been updated to fully reflect the new, hazardous nature of Ion Storms.
