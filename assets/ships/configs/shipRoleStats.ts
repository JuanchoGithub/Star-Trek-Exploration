import type { ShipRole } from '../../../types';
import { shipClasses, type ShipClassStats } from './shipClassStats';

// This file defines the archetype stats for each high-level ship role.
// It pulls a representative ship class from the shipClasses configuration.
// This is used for generating stats for manual entries, AI logic, and other role-based mechanics.
export const shipRoleStats: Record<ShipRole, ShipClassStats> = {
    // Federation Roles (used as archetypes for generic roles)
    Dreadnought: shipClasses.Federation['Sovereign-class'],
    Explorer: shipClasses.Federation['Galaxy-class'],
    Cruiser: shipClasses.Federation['Constitution-class'],
    Escort: shipClasses.Federation['Defiant-class'],
    Scout: shipClasses.Federation['Intrepid-class'],
    
    // Klingon Roles
    'Attack Cruiser': shipClasses.Klingon["Vor'cha-class"],
    Battleship: shipClasses.Klingon["Negh'Var-class"],
    
    // Romulan Roles
    Warbird: shipClasses.Romulan["D'deridex-class"],
    'Command Ship': shipClasses.Romulan['Scimitar-class'],

    // Pirate Roles
    Raider: shipClasses.Pirate['Orion Raider'],
    Marauder: shipClasses.Pirate['Ferengi Marauder'],

    // Independent Roles
    Freighter: shipClasses.Independent['Civilian Freighter'],
};
