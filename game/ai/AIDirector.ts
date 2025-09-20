import { FactionAI } from './FactionAI';
import { FederationAI } from './factions/FederationAI';
import { KlingonAI } from './factions/KlingonAI';
import { PirateAI } from './factions/PirateAI';
import { RomulanAI } from './factions/RomulanAI';

// A map holding an instance of each AI class.
const aiMap: Record<string, FactionAI> = {
    Federation: new FederationAI(),
    Klingon: new KlingonAI(),
    Romulan: new RomulanAI(),
    Pirate: new PirateAI(),
    Independent: new FederationAI(), // Independents use passive Federation logic
};

// A default fallback AI for any unknown factions.
const defaultAI = new PirateAI();

// The AIDirector provides a single point of access for getting the correct AI logic.
export const AIDirector = {
    getAIForFaction(faction: string): FactionAI {
        return aiMap[faction] || defaultAI;
    }
};
