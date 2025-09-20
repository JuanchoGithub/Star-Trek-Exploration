import type { Ship, ResourceType } from '../../types';

export const applyResourceChange = (ship: Ship, resource: ResourceType, amount: number) => {
    switch (resource) {
        case 'hull':
            ship.hull = Math.max(0, Math.min(ship.maxHull, ship.hull + amount));
            break;
        case 'energy':
            ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + amount));
            break;
        case 'dilithium':
            ship.dilithium.current = Math.max(0, Math.min(ship.dilithium.max, ship.dilithium.current + amount));
            break;
        case 'torpedoes':
            ship.torpedoes.current = Math.max(0, Math.min(ship.torpedoes.max, ship.torpedoes.current + amount));
            break;
        case 'morale':
            ship.crewMorale.current = Math.max(0, Math.min(ship.crewMorale.max, ship.crewMorale.current + amount));
            break;
        case 'security_teams':
            ship.securityTeams.current = Math.max(0, Math.min(ship.securityTeams.max, ship.securityTeams.current + amount));
            break;
        case 'weapons':
        case 'engines':
        case 'shields':
        case 'transporter':
            const subsystem = ship.subsystems[resource];
            if (subsystem) {
                subsystem.health = Math.max(0, Math.min(subsystem.maxHealth, subsystem.health + amount));
            }
            break;
    }
};
