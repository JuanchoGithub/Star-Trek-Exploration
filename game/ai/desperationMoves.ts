
import type { GameState, Ship, Shuttle } from '../../types';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
// FIX: `uniqueId` is not in `helpers`, it's in `ai`. Merged imports to fix resolution error.
import { calculateDistance, findClosestTarget, uniqueId } from '../utils/ai';

export function executeDesperationMove(ship: Ship, gameState: GameState, addLog: (log: any) => void) {
    if (!ship.desperationMove) return;

    const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];

    switch (ship.desperationMove.type) {
        case 'ram': {
            const target = allShips.find(s => s.id === ship.desperationMove.targetId);
            if (target) {
                const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
                let shieldDamageMultiplier = 0.8;
                let hullDamageMultiplier = 0.4;
                if (shieldPercent < 0.2) {
                    shieldDamageMultiplier = 1.0;
                    hullDamageMultiplier = 0.8;
                }
                const shieldDamage = target.maxShields * shieldDamageMultiplier;
                const hullDamage = target.maxHull * hullDamageMultiplier;

                target.shields = Math.max(0, target.shields - shieldDamage);
                target.hull = Math.max(0, target.hull - hullDamage);

                addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes a final glorious charge, ramming the "${target.name}"!\n--> Target takes ${Math.round(shieldDamage)} shield and ${Math.round(hullDamage)} hull damage!` });
                ship.hull = 0; // The ramming ship is destroyed
            } else {
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `With no target to ram, the "${ship.name}" overloads its core in a final, defiant act!` });
                ship.hull = 0;
            }
            break;
        }
        case 'self_destruct': {
            const adjacentShips = allShips.filter(s => s.id !== ship.id && calculateDistance(ship.position, s.position) <= 1);
            let logMessage = `"${ship.name}" overloads its reactor! The ship explodes violently!`;
            
            adjacentShips.forEach(target => {
                const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
                let shieldDamageMultiplier = 0.8;
                let hullDamageMultiplier = 0.2;
                if (shieldPercent < 0.2) {
                    shieldDamageMultiplier = 1.0;
                    hullDamageMultiplier = 0.4;
                }
                const shieldDamage = target.maxShields * shieldDamageMultiplier;
                const hullDamage = target.maxHull * hullDamageMultiplier;
                
                target.shields = Math.max(0, target.shields - shieldDamage);
                target.hull = Math.max(0, target.hull - hullDamage);
                logMessage += `\n--> "${target.name}" is caught in the blast!`;
            });
            
            addLog({ sourceId: ship.id, sourceName: ship.name, message: logMessage });
            ship.hull = 0;
            break;
        }
        case 'escape': {
            if (Math.random() < 0.7) {
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump to escape... but the core breaches! The ship is destroyed!` });
                ship.hull = 0;
            } else {
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump... and vanishes! They've escaped!` });
                gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
            }
            break;
        }
        case 'evacuate': {
            const shuttleCount = shipRoleStats[ship.shipRole]?.shuttleCount || 1;
            for (let i = 0; i < shuttleCount; i++) {
                const shuttle: Shuttle = {
                    id: uniqueId(),
                    name: "Federation Shuttle",
                    type: 'shuttle',
                    faction: 'Federation',
                    position: { ...ship.position },
                    scanned: true,
                    crewCount: 5,
                };
                gameState.currentSector.entities.push(shuttle);
            }
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" is abandoning ship! ${shuttleCount} escape shuttles have launched.` });
            ship.hull = 0;
            break;
        }
    }
}