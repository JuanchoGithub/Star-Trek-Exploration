import { AIDirector } from '../AIDirector';
import { FederationAI } from './federation';
import { KlingonAI } from './klingon';
import { PirateAI } from './pirate';
import { RomulanAI } from './romulan';
import { IndependentAI } from './IndependentAI';

// Register all the core game AI implementations with the Director.
// To add a new modded faction, a user would add their registration call here.
const pirateAI = new PirateAI();
AIDirector.register('Federation', new FederationAI());
AIDirector.register('Klingon', new KlingonAI());
AIDirector.register('Romulan', new RomulanAI());
AIDirector.register('Pirate', pirateAI);
AIDirector.register('Independent', new IndependentAI());

// Set a default AI for any unregistered factions
AIDirector.setDefault(pirateAI);
