import type { SectorTemplate } from '../../types';

/**
 * Note on Modularity:
 * In a real-world project, each of these template objects would be in its own file
 * (e.g., /templates/federation/patrol.ts) and imported into an index file.
 * They are combined here for simplicity of the response format.
 */

export const sectorTemplates: SectorTemplate[] = [
    // =================================================================
    // == COMMON TEMPLATES (High Weight) ==
    // =================================================================
    {
        id: 'common-empty-space',
        name: 'Empty Space',
        weight: 200,
        allowedFactions: ['None', 'Federation', 'Klingon', 'Romulan'],
        entityTemplates: [
            { type: 'planet', faction: 'None', count: [1, 2], planetClass: ['D', 'L', 'J'] },
        ],
        hasNebulaChance: 0.1,
    },
    {
        id: 'common-asteroid-field',
        name: 'Asteroid Field',
        weight: 150,
        // FIX: 'Pirate' is not a valid FactionOwner for a sector. Pirates can appear in 'None' or 'Klingon' space.
        allowedFactions: ['None', 'Klingon'],
        entityTemplates: [
            { type: 'asteroid_field', faction: 'None', count: [2, 4] },
            { type: 'planet', faction: 'None', count: [0, 1], planetClass: ['D'] },
        ],
        hasNebulaChance: 0.2,
    },
    {
        id: 'common-trade-route',
        name: 'Trade Route',
        weight: 100,
        allowedFactions: ['None', 'Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Independent', count: [1, 3], shipRole: 'Freighter' },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: ['M', 'L'] },
        ],
    },
    {
        id: 'common-unstable-nebula',
        name: 'Unstable Nebula',
        weight: 80,
        allowedFactions: ['None', 'Romulan'],
        entityTemplates: [
            { type: 'planet', faction: 'None', count: [1, 2], planetClass: ['J', 'D'] },
             { type: 'event_beacon', faction: 'Unknown', count: [0, 1], eventType: 'derelict_ship' },
        ],
        hasNebulaChance: 1.0,
    },
    
    // =================================================================
    // == FEDERATION TEMPLATES ==
    // =================================================================
    {
        id: 'fed-border-patrol',
        name: 'Federation Border Patrol',
        weight: 100,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Federation', count: [1, 2], shipRole: ['Escort', 'Cruiser'] },
            { type: 'planet', faction: 'None', count: [1, 2] },
        ],
    },
    {
        id: 'fed-science-expedition',
        name: 'Federation Science Expedition',
        weight: 80,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Federation', count: [1, 1], shipRole: 'Explorer' },
            { type: 'planet', faction: 'None', count: [2, 3], planetClass: ['M', 'J'] },
        ],
        hasNebulaChance: 0.3,
    },
    {
        id: 'fed-starbase-sector',
        name: 'Federation Starbase Sector',
        weight: 60,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'starbase', faction: 'Federation', count: [1, 1] },
            { type: 'ship', faction: 'Federation', count: [1, 2], shipRole: ['Explorer', 'Freighter'] },
            { type: 'ship', faction: 'Independent', count: [0, 2], shipRole: 'Freighter' },
            { type: 'planet', faction: 'None', count: [1, 2] },
        ],
    },
    {
        id: 'fed-colonization-effort',
        name: 'Federation Colonization Effort',
        weight: 50,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Federation', count: [1, 1], shipRole: 'Explorer' },
            { type: 'ship', faction: 'Independent', count: [2, 3], shipRole: 'Freighter' },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: 'M' },
        ],
    },
    {
        id: 'fed-listening-post',
        name: 'Federation Listening Post',
        weight: 30,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Federation', count: [1, 1], shipRole: 'Escort' },
            { type: 'asteroid_field', faction: 'None', count: [2, 3] },
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'distress_call' },
        ],
        hasNebulaChance: 0.5,
    },
    
    // =================================================================
    // == KLINGON TEMPLATES ==
    // =================================================================
    {
        id: 'klingon-border-picket',
        name: 'Klingon Border Picket',
        weight: 100,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [2, 3], shipRole: ['Escort'] },
            { type: 'planet', faction: 'None', count: [1, 2], planetClass: ['L', 'D'] },
        ],
    },
    {
        id: 'klingon-hunting-ground',
        name: 'Klingon Hunting Ground',
        weight: 70,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [1, 2], shipRole: ['Cruiser'] },
            { type: 'asteroid_field', faction: 'None', count: [1, 3] },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: 'J' },
        ],
        hasNebulaChance: 0.4,
    },
    {
        id: 'klingon-outpost',
        name: 'Klingon Outpost',
        weight: 50,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'starbase', faction: 'Klingon', count: [1, 1] },
            { type: 'ship', faction: 'Klingon', count: [1, 3], shipRole: ['Cruiser', 'Escort'] },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: ['D'] },
        ],
    },
    {
        id: 'klingon-ship-graveyard',
        name: 'Klingon Ship Graveyard',
        weight: 25,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'event_beacon', faction: 'Unknown', count: [1, 2], eventType: 'derelict_ship' },
            { type: 'ship', faction: 'Klingon', count: [0, 1], shipRole: 'Escort' },
             { type: 'asteroid_field', faction: 'None', count: [1, 2] },
        ],
        hasNebulaChance: 0.2,
    },
     {
        id: 'klingon-war-council',
        name: 'Klingon War Council',
        weight: 15,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [3, 4], shipRole: ['Cruiser', 'Escort'] },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: ['L'] },
        ],
    },
    
    // =================================================================
    // == ROMULAN TEMPLATES ==
    // =================================================================
    {
        id: 'romulan-border-patrol',
        name: 'Romulan Border Patrol',
        weight: 100,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [1, 2], shipRole: ['Escort'] },
            { type: 'planet', faction: 'None', count: [1, 2] },
        ],
        hasNebulaChance: 0.3,
    },
    {
        id: 'romulan-listening-post',
        name: 'Romulan Listening Post',
        weight: 70,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [1, 1], shipRole: 'Cruiser' },
            { type: 'asteroid_field', faction: 'None', count: [2, 3] },
        ],
        hasNebulaChance: 0.8,
    },
    {
        id: 'romulan-staging-ground',
        name: 'Romulan Staging Ground',
        weight: 40,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'starbase', faction: 'Romulan', count: [1, 1] },
            { type: 'ship', faction: 'Romulan', count: [2, 3], shipRole: ['Cruiser', 'Escort'] },
            { type: 'planet', faction: 'None', count: [1, 1] },
        ],
    },
    {
        id: 'romulan-tal-shiar-ops',
        name: 'Tal Shiar Operations',
        weight: 20,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [2, 2], shipRole: ['Cruiser'] },
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'ancient_probe' },
        ],
        hasNebulaChance: 0.5,
    },
     {
        id: 'romulan-plasma-minefield',
        name: 'Romulan Plasma Minefield',
        weight: 15,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [1, 2], shipRole: ['Escort'] },
            { type: 'asteroid_field', faction: 'None', count: [3, 4] },
        ],
        hasNebulaChance: 0.9,
    },

    // =================================================================
    // == UNCHARTED / PIRATE TEMPLATES ==
    // =================================================================
    {
        id: 'none-pirate-ambush',
        name: 'Pirate Ambush Point',
        weight: 60,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'ship', faction: 'Pirate', count: [2, 3], shipRole: 'Escort' },
            { type: 'asteroid_field', faction: 'None', count: [2, 2] },
        ],
        hasNebulaChance: 0.5,
    },
    {
        id: 'none-pirate-hideout',
        name: 'Pirate Hideout',
        weight: 30,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'ship', faction: 'Pirate', count: [2, 4], shipRole: ['Escort', 'Cruiser'] },
            { type: 'asteroid_field', faction: 'None', count: [3, 4] },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: 'D' },
        ],
    },
    {
        id: 'none-smugglers-run',
        name: 'Smuggler\'s Run',
        weight: 70,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'ship', faction: 'Independent', count: [1, 2], shipRole: 'Freighter' },
            { type: 'ship', faction: 'Pirate', count: [0, 1], shipRole: 'Escort' },
            { type: 'asteroid_field', faction: 'None', count: [1, 2] },
        ],
        hasNebulaChance: 0.6,
    },
    {
        id: 'none-ancient-battlefield',
        name: 'Ancient Battlefield',
        weight: 25,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'event_beacon', faction: 'Unknown', count: [1, 3], eventType: ['derelict_ship'] },
            { type: 'asteroid_field', faction: 'None', count: [1, 2] },
        ],
    },
    {
        id: 'none-scientific-anomaly',
        name: 'Scientific Anomaly',
        weight: 40,
        allowedFactions: ['None', 'Federation'],
        entityTemplates: [
            { type: 'planet', faction: 'None', count: [1, 2], planetClass: ['J', 'L'] },
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'ancient_probe' },
        ],
        hasNebulaChance: 0.4,
    },
    
    // =================================================================
    // == RARE TEMPLATES (Low Weight) ==
    // =================================================================
    {
        id: 'rare-klingon-civil-war',
        name: 'Klingon Civil War Skirmish',
        weight: 10,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [2, 2], shipRole: 'Cruiser' },
            { type: 'ship', faction: 'Klingon', count: [2, 2], shipRole: 'Escort' },
        ]
    },
    {
        id: 'rare-romulan-secret-base',
        name: 'Romulan Secret Base',
        weight: 10,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'starbase', faction: 'Romulan', count: [1, 1] },
            { type: 'ship', faction: 'Romulan', count: [2, 3], shipRole: ['Cruiser', 'Escort'] },
            { type: 'asteroid_field', faction: 'None', count: [3, 3] },
        ],
        hasNebulaChance: 1.0,
    },
    {
        id: 'rare-federation-deep-space-relay',
        name: 'Federation Deep Space Relay',
        weight: 10,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'starbase', faction: 'Federation', count: [1, 1] },
            { type: 'ship', faction: 'Federation', count: [1, 1], shipRole: 'Explorer' },
        ]
    },
    {
        id: 'rare-abandoned-outpost',
        name: 'Abandoned Outpost',
        weight: 8,
        allowedFactions: ['None', 'Federation', 'Klingon', 'Romulan'],
        entityTemplates: [
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'distress_call' },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: ['L', 'D'] },
        ]
    },
    {
        id: 'rare-crystalline-entity',
        name: 'Crystalline Entity Field',
        weight: 5,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'planet', faction: 'None', count: [2, 3], planetClass: 'D' },
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1] }
        ],
        hasNebulaChance: 0.2
    },
    {
        id: 'rare-temporal-anomaly',
        name: 'Temporal Anomaly',
        weight: 3,
        allowedFactions: ['None', 'Federation'],
        entityTemplates: [
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1] },
            { type: 'ship', faction: 'Federation', count: [0, 1], shipRole: 'Explorer' },
        ],
        hasNebulaChance: 0.7,
    },
    {
        id: 'rare-dyson-sphere-fragment',
        name: 'Dyson Sphere Fragment',
        weight: 1,
        allowedFactions: ['None'],
        entityTemplates: [
            { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'ancient_probe' },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: 'D' }
        ]
    },

    // =================================================================
    // == Depth-based encounters ==
    // =================================================================
    {
        id: 'fed-deep-space-science',
        name: 'Federation Deep Space Science Station',
        weight: 20,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'starbase', faction: 'Federation', count: [1, 1] },
            { type: 'ship', faction: 'Federation', count: [1, 2], shipRole: ['Explorer'] },
            { type: 'planet', faction: 'None', count: [1, 2], planetClass: ['M', 'J'] }
        ],
        hasNebulaChance: 0.5
    },
    {
        id: 'klingon-homeland-defense',
        name: 'Klingon Homeland Defense Fleet',
        weight: 20,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [3, 4], shipRole: ['Cruiser', 'Escort'] },
            { type: 'starbase', faction: 'Klingon', count: [1, 1] },
        ]
    },
    {
        id: 'romulan-fleet-maneuvers',
        name: 'Romulan Fleet Maneuvers',
        weight: 20,
        allowedFactions: ['Romulan'],
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [3, 5], shipRole: ['Cruiser', 'Escort'] },
        ],
        hasNebulaChance: 0.6
    },

    // A few more to flesh out the numbers
    {
        id: 'common-debris-field',
        name: 'Debris Field',
        weight: 90,
        allowedFactions: ['None', 'Klingon', 'Romulan'],
        entityTemplates: [
            { type: 'asteroid_field', faction: 'None', count: [1, 3] },
            { type: 'event_beacon', faction: 'Unknown', count: [0, 1], eventType: ['derelict_ship'] },
        ],
    },
    {
        id: 'fed-convoy',
        name: 'Federation Convoy',
        weight: 40,
        allowedFactions: ['Federation'],
        entityTemplates: [
            { type: 'ship', faction: 'Federation', count: [1, 1], shipRole: 'Escort' },
            { type: 'ship', faction: 'Independent', count: [2, 3], shipRole: 'Freighter' },
        ]
    },
    {
        id: 'klingon-mining-op',
        name: 'Klingon Mining Operation',
        weight: 35,
        allowedFactions: ['Klingon'],
        entityTemplates: [
            { type: 'ship', faction: 'Klingon', count: [1, 2], shipRole: 'Freighter' },
            { type: 'ship', faction: 'Klingon', count: [0, 1], shipRole: 'Escort' },
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: ['D'] },
            { type: 'asteroid_field', faction: 'None', count: [1, 2] },
        ]
    },
    {
        id: 'romulan-spy-network',
        name: 'Romulan Spy Network',
        weight: 30,
        allowedFactions: ['None', 'Federation'], // They spy everywhere
        entityTemplates: [
            { type: 'ship', faction: 'Romulan', count: [1, 1], shipRole: 'Escort' },
            { type: 'ship', faction: 'Independent', count: [1, 2], shipRole: 'Freighter' },
        ],
        hasNebulaChance: 0.7
    },
    {
        id: 'none-ion-storm',
        name: 'Ion Storm',
        weight: 50,
        allowedFactions: ['None', 'Romulan'],
        entityTemplates: [
            { type: 'planet', faction: 'None', count: [1, 1], planetClass: 'J' },
        ],
        hasNebulaChance: 1.0,
    },
    {
        id: 'rare-generation-ship',
        name: 'Generation Ship',
        weight: 4,
        allowedFactions: ['None'],
        entityTemplates: [
             { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: ['distress_call'] },
             { type: 'ship', faction: 'Independent', count: [1, 1], shipRole: 'Freighter' },
        ]
    },
    {
        id: 'rare-doomsday-machine',
        name: 'Doomsday Machine Aftermath',
        weight: 1,
        allowedFactions: ['None'],
        entityTemplates: [
             { type: 'planet', faction: 'None', count: [3, 4], planetClass: 'D' },
             { type: 'event_beacon', faction: 'Unknown', count: [1, 1], eventType: 'derelict_ship' }
        ]
    }
];
