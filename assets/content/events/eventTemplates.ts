import type { EventTemplate } from '../../../types';

export const eventTemplates: Record<EventTemplate['type'], EventTemplate[]> = {
    derelict_ship: [
        {
            id: 'ev_derelict_01',
            type: 'derelict_ship',
            title: 'Derelict Freighter',
            description: "You've discovered a small, independent freighter adrift. There are no life signs, and its distress beacon is on a low-power loop. It appears to have been abandoned for some time.",
            options: [
                {
                    text: 'Salvage the wreck for supplies.',
                    outcome: {
                        type: 'reward',
                        log: 'The salvage team recovered 5 units of Dilithium and 4 Torpedoes from the derelict.',
                        resource: 'dilithium',
                        amount: 5,
                    }
                },
                {
                    text: 'Investigate for clues.',
                    outcome: {
                        type: 'combat',
                        log: "It's a trap! The ship was rigged. A pirate vessel decloaks and attacks!",
                        spawn: 'pirate_raider',
                        spawnCount: 1,
                    }
                },
                {
                    text: 'Leave it be.',
                    outcome: {
                        type: 'nothing',
                        log: 'You note the freighter in the ship log and continue on your mission.'
                    }
                }
            ]
        }
    ],
    distress_call: [
        {
            id: 'ev_distress_01',
            type: 'distress_call',
            title: 'Transport Under Attack',
            description: 'You receive a distress call from a Tellarite transport. They are being attacked by a pirate vessel and their shields are failing.',
            options: [
                {
                    text: 'Intervene and defend the transport.',
                    outcome: {
                        type: 'combat',
                        log: 'You move to intercept the pirates. They turn their attention to you!',
                        spawn: 'pirate_raider',
                        spawnCount: 1,
                    }
                },
                {
                    text: 'Ignore the call.',
                    outcome: {
                        type: 'damage',
                        resource: 'morale',
                        amount: 5,
                        log: 'You leave the transport to its fate. The crew is unsettled by the decision.'
                    }
                }
            ]
        }
    ],
    ancient_probe: [
        {
            id: 'ev_probe_01',
            type: 'ancient_probe',
            title: 'Ancient Alien Probe',
            description: 'You encounter a probe of unknown origin. It is ancient, but still broadcasting a simple, repeating signal. It does not appear hostile.',
            options: [
                {
                    text: 'Attempt to download its data.',
                    outcome: {
                        type: 'reward',
                        log: 'The probe contains valuable stellar cartography data! You gain 10 Dilithium.',
                        resource: 'dilithium',
                        amount: 10
                    }
                },
                 {
                    text: 'Destroy it as a potential threat.',
                    outcome: {
                        type: 'damage',
                        log: 'The probe emits a powerful energy burst upon destruction, damaging the ship! Hull integrity is down.',
                        resource: 'hull',
                        amount: 15
                    }
                },
                {
                    text: 'Leave it undisturbed.',
                    outcome: {
                        type: 'nothing',
                        log: 'You decide not to interfere with the ancient artifact.'
                    }
                }
            ]
        }
    ]
};
