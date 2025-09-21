
import { AIDirector } from '../AIDirector';
import { FederationAI } from './federation';
import { KlingonAI } from './klingon';
import { PirateAI } from './pirate';
import { RomulanAI } from './romulan';

// Register all the core game AI implementations with the Director.
const pirateAI = new PirateAI();
AIDirector.register('Federation', new FederationAI());
AIDirector.register('Klingon', new KlingonAI());
AIDirector.register('Romulan', new RomulanAI());
AIDirector.register('Pirate', pirateAI);
// Independent ships use the passive Federation logic.
AIDirector.register('Independent', new FederationAI());

// Set a default AI for any unregistered factions
AIDirector.setDefault(pirateAI);
