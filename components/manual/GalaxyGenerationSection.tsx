import React from 'react';
import { sectorTemplates } from '../../assets/galaxy/sectorTemplates';
import type { SectorTemplate, FactionOwner } from '../../types';
import { SectionHeader, SubHeader } from './shared';
import { SampleSector } from './SampleSector';

// Calculate total weights for each faction to determine percentage chances
const totalWeights: Record<FactionOwner, number> = {
    Federation: 0,
    Klingon: 0,
    Romulan: 0,
    None: 0,
};

sectorTemplates.forEach(template => {
    template.allowedFactions.forEach(faction => {
        if (totalWeights.hasOwnProperty(faction)) {
            totalWeights[faction] += template.weight;
        }
    });
});

// Helper to get a formatted string of appearance chances
const getChanceDescription = (template: SectorTemplate): string => {
    const chances = template.allowedFactions.map(faction => {
        if (totalWeights[faction] > 0) {
            const chance = (template.weight / totalWeights[faction]) * 100;
            return `${faction}: ${chance.toFixed(1)}%`;
        }
        return '';
    }).filter(Boolean);

    if (chances.length === 0) return "Cannot appear naturally.";
    return `Chance to appear in a new sector within the specified territory: ${chances.join(' / ')}.`;
};

// A curated list of descriptions and intents for each sector template
const templateInfo: Record<string, { description: string, intent: string }> = {
    'common-empty-space': {
        description: 'A quiet, largely uninhabited sector, typical of the vast emptiness of space.',
        intent: 'To provide breathing room between points of interest and act as a common, low-threat travel area.'
    },
    'common-asteroid-field': {
        description: 'A dense field of rock and ice, making navigation hazardous.',
        intent: 'To create a tactical obstacle. Moving adjacent to asteroids risks hull damage, and the field can provide cover for pirates.'
    },
    'common-trade-route': {
        description: 'A relatively safe corridor frequented by independent freighters.',
        intent: 'To make the galaxy feel alive with civilian traffic and provide opportunities for peaceful encounters or potential targets for piracy.'
    },
    'common-trade-hub': {
        description: 'A bustling sector centered around a trading outpost, attracting merchants and other vessels.',
        intent: 'To create a hub of civilian activity where players might encounter traders, get information, or find refuge.'
    },
    'common-unstable-nebula': {
        description: 'A beautiful but dangerous nebula that interferes with sensors and targeting.',
        intent: 'To create a unique combat environment where accuracy is reduced for all ships, favoring close-range brawls and torpedoes.'
    },
    'fed-border-patrol': {
        description: 'A standard Federation patrol guarding a border sector.',
        intent: 'To establish a clear Federation presence and provide a common, friendly encounter in Federation space.'
    },
    'fed-science-expedition': {
        description: 'A Federation science vessel or station conducting research on local phenomena.',
        intent: 'To offer exploration-focused gameplay, lore, and potential away mission opportunities.'
    },
    'fed-starbase-sector': {
        description: 'A key sector containing a Federation starbase, serving as a hub for fleet operations.',
        intent: 'To provide a safe harbor for players to repair, resupply, and interact with Starfleet.'
    },
    'fed-colonization-effort': {
        description: 'A sector with a habitable M-class planet, accompanied by Federation vessels preparing for colonization.',
        intent: 'To showcase the Federation\'s mission of peaceful expansion and provide a non-combat point of interest.'
    },
    'fed-listening-post': {
        description: 'A hidden deep-space sensor array, likely monitoring activity from a rival power.',
        intent: 'To provide a sense of the ongoing cold war and intelligence gathering operations.'
    },
    'klingon-border-picket': {
        description: 'A heavily armed Klingon patrol, aggressively defending their territory.',
        intent: 'To create a clear and dangerous border, signaling the player has entered hostile territory.'
    },
    'klingon-hunting-ground': {
        description: 'A sector where Klingon warriors seek glorious battle against local fauna or unfortunate trespassers.',
        intent: 'To characterize the Klingons as warriors seeking honor and combat, providing a high-threat encounter.'
    },
    'klingon-outpost': {
        description: 'A fortified military outpost, the heart of Klingon power in the region.',
        intent: 'To serve as a major tactical objective and a source of concentrated enemy forces.'
    },
    'klingon-ship-graveyard': {
        description: 'A debris field containing the wrecks of old Klingon warships, a testament to a past battle.',
        intent: 'To provide a point of interest for salvage or investigation, with a risk of encountering scavengers or patrols.'
    },
    'klingon-war-council': {
        description: 'A gathering of multiple Klingon vessels, likely planning a major operation.',
        intent: 'To represent a significant, high-density threat that a player should be wary of confronting directly.'
    },
    'romulan-border-patrol': {
        description: 'A cloaked Romulan patrol, silently guarding the border of the Star Empire.',
        intent: 'To create a sense of tension and paranoia, as the threat is present but may not be immediately obvious.'
    },
    'romulan-listening-post': {
        description: 'A clandestine intelligence-gathering operation, hidden within a dense nebula.',
        intent: 'To characterize the Romulans as secretive and manipulative, providing a non-combat but high-tension encounter.'
    },
    'romulan-staging-ground': {
        description: 'A forward operating base where Romulan warbirds prepare for incursions into uncharted space.',
        intent: 'To create a formidable enemy stronghold and a clear sign of Romulan military ambition.'
    },
    'romulan-tal-shiar-ops': {
        description: 'A sector under the control of the feared Tal Shiar, likely involved in a secret, nefarious plot.',
        intent: 'To introduce a particularly dangerous and cunning variant of Romulan encounter, hinting at deeper conspiracies.'
    },
    'romulan-plasma-minefield': {
        description: 'A defensive minefield of cloaked plasma torpedoes within a nebula, a classic Romulan tactic.',
        intent: 'To create a unique hazard that requires careful navigation, representing the Romulans\' tactical ingenuity.'
    },
    'none-pirate-ambush': {
        description: 'A classic pirate ambush point, often located in an asteroid field or nebula.',
        intent: 'To create a common tactical challenge and a resource drain for the player in lawless space.'
    },
    'none-pirate-hideout': {
        description: 'A heavily defended, hidden base of operations for a pirate faction.',
        intent: 'To provide a high-risk, high-reward tactical objective for the player to assault.'
    },
    'none-smugglers-run': {
        description: 'A quiet route used by smugglers to move illicit goods, sometimes attracting unwanted attention.',
        intent: 'To populate uncharted space with morally ambiguous activity and potential for varied encounters.'
    },
    'none-ancient-battlefield': {
        description: 'The silent remains of a massive battle fought eons ago, filled with drifting, derelict ships.',
        intent: 'To provide a rich area for exploration and salvage, with the potential to uncover ancient technology or history.'
    },
    'none-scientific-anomaly': {
        description: 'A sector containing strange readings or a unique celestial phenomenon worthy of scientific investigation.',
        intent: 'To encourage non-combat exploration and trigger unique story events through event beacons.'
    },
    'rare-klingon-civil-war': {
        description: 'A rare and shocking sight: two Klingon factions fighting each other, a sign of deep internal strife.',
        intent: 'To provide a very rare, dynamic encounter where the player can choose to intervene, observe, or take advantage of the chaos.'
    },
    'rare-romulan-secret-base': {
        description: 'A hidden Romulan installation deep in uncharted space, far from their borders. Its purpose is unknown.',
        intent: 'To create a major discovery for the player, hinting at larger Romulan plots and providing a significant late-game challenge.'
    },
    'rare-federation-deep-space-relay': {
        description: 'An automated deep-space communications and sensor relay, a lonely outpost of the Federation.',
        intent: 'To provide a rare, friendly encounter deep in hostile or uncharted territory, offering a moment of respite.'
    },
    'rare-abandoned-outpost': {
        description: 'An outpost of unknown origin that has long since been abandoned, now broadcasting a looping distress signal.',
        intent: 'To provide a mystery for the player to solve via an event beacon.'
    },
    'rare-crystalline-entity': {
        description: 'A sector containing strange crystalline asteroids and a powerful, unidentified energy signature.',
        intent: 'To present a unique and potentially dangerous environmental anomaly, hinting at non-biological life.'
    },
    'rare-temporal-anomaly': {
        description: 'A sector where time and space are unstable, causing sensor ghosts and strange readings.',
        intent: 'To provide a rare, high-concept sci-fi encounter, potentially leading to unique story events.'
    },
    'rare-dyson-sphere-fragment': {
        description: 'An impossibly large fragment of a Dyson Sphere, a testament to a godlike ancient civilization.',
        intent: 'To be a "wonder of the galaxy" discovery, emphasizing the scale and mystery of the universe.'
    },
    'fed-deep-space-science': {
        description: 'A major Federation science station on the farthest reaches of explored space.',
        intent: 'To act as a deep-space hub for Federation players and a symbol of their scientific mission.'
    },
    'klingon-homeland-defense': {
        description: 'A heavily fortified sector deep within the Klingon Empire, guarded by a powerful defense fleet.',
        intent: 'To represent the heart of Klingon power, presenting an almost insurmountable challenge.'
    },
    'romulan-fleet-maneuvers': {
        description: 'A large gathering of the Romulan fleet, conducting war games deep inside their territory.',
        intent: 'To showcase the might of the Romulan military and serve as a major obstacle to anyone foolish enough to intrude.'
    },
    'common-debris-field': {
        description: 'A scattered field of wreckage from a recent skirmish.',
        intent: 'To provide minor salvage opportunities and tell a story of a recent conflict in the area.'
    },
    'fed-convoy': {
        description: 'A convoy of Federation freighters being escorted by a Starfleet vessel.',
        intent: 'To create a mobile, friendly presence and a potential escort-style objective if attacked.'
    },
    'klingon-mining-op': {
        description: 'A Klingon mining operation, extracting resources from asteroids or a barren world.',
        intent: 'To show the logistical side of the Klingon Empire and provide a non-military but still hostile point of interest.'
    },
    'romulan-spy-network': {
        description: 'A sector used by Romulan spies masquerading as independent traders.',
        intent: 'To create suspicion and tension, where not everything is as it seems.'
    },
    'none-ion-storm': {
        description: 'A powerful ion storm that can disable ships and cause systems to fail. A very dangerous place to be.',
        intent: 'To serve as a major environmental hazard that players should actively avoid.'
    },
    'rare-generation-ship': {
        description: 'An ancient, sub-light generation ship from a long-lost civilization, still carrying its sleeping passengers.',
        intent: 'To provide a classic, rare sci-fi encounter with a significant ethical dilemma.'
    },
    'rare-doomsday-machine': {
        description: 'A sector of shattered, lifeless worlds, all destroyed by an unknown, terrifyingly powerful weapon.',
        intent: 'To hint at a powerful, external threat beyond the known factions and to create a sense of awe and dread.'
    }
};


export const GalaxyGenerationSection: React.FC = () => {
    return (
        <div>
            <SectionHeader>Galaxy Generation</SectionHeader>
            <p className="text-text-secondary mb-4">
                The Typhon Expanse is not a random collection of stars and planets. Its creation is governed by a template-based system designed to create a thematic and logical galaxy. Each sector you enter is generated from a blueprint that defines its contents, rarity, and character based on its location in the quadrant.
            </p>
            <SubHeader>Sector Templates Explained</SubHeader>
            <p className="text-text-secondary mb-4">
                A sector template is a blueprint containing a name, a rarity "weight" (higher is more common), and a list of rules for what can appear within it. Crucially, each template is restricted to certain territories. For example, you will only find "Klingon Hunting Grounds" within the Klingon Empire, while "Pirate Ambush Points" are most common in Uncharted Space. This ensures that the galaxy feels coherent and believable.
            </p>
            
            <SubHeader>Sector Template Registry</SubHeader>
            <p className="text-text-secondary mb-4">
                The following is a declassified list of all known sector templates used by the simulation.
            </p>

            <div className="space-y-4">
                {sectorTemplates.sort((a, b) => b.weight - a.weight).map(template => (
                    <div key={template.id} className="panel-style p-4">
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <div>
                                <h4 className="text-xl font-bold text-primary-light">{template.name}</h4>
                                <p className="text-sm font-bold text-accent-yellow-dark mb-2">{getChanceDescription(template)}</p>
                                <p className="text-sm text-text-secondary mb-2"><strong>Description:</strong> {templateInfo[template.id]?.description || 'No description available.'}</p>
                                <p className="text-sm text-text-secondary"><strong>Intent:</strong> {templateInfo[template.id]?.intent || 'No intent specified.'}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider text-text-disabled mb-1">Sample Layout</p>
                                <SampleSector template={template} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};