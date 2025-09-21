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
        },
        {
            id: 'ev_derelict_02',
            type: 'derelict_ship',
            title: 'Silent Vessel',
            description: "An old Vulcan freighter hangs silently in space. Scans show its power core is still active, but there are no life signs.",
            options: [
                 {
                    text: 'Board with a security team to secure any cargo.',
                    outcome: {
                        type: 'damage',
                        resource: 'hull',
                        amount: 10,
                        log: "The ship's automated defenses activate! The team is repelled, and the Endeavour takes some minor damage from plasma turrets before they withdraw."
                    }
                },
                {
                    text: 'Send an engineering team to remotely disable the power core first.',
                    outcome: {
                        type: 'reward',
                        resource: 'hull',
                        amount: 15,
                        log: "The engineers find a backdoor in the Vulcan systems and safely disable the ship. They recover valuable components, reinforcing your ship's hull integrity."
                    }
                },
                {
                    text: 'Leave it.',
                    outcome: {
                        type: 'nothing',
                        log: 'The vessel is not worth the risk. You leave it to the void.'
                    }
                }
            ]
        },
        {
            id: 'ev_derelict_03',
            type: 'derelict_ship',
            title: 'Missing Starfleet Vessel',
            description: "Sensors have located the U.S.S. Saratoga, a science vessel that went missing three years ago. It's heavily damaged but intact.",
            options: [
                {
                    text: "Recover the ship's log.",
                    outcome: {
                        type: 'reward',
                        resource: 'dilithium',
                        amount: 5,
                        log: "The log is recovered. It contains valuable data on a nearby nebula, rich in exotic particles. You gain 5 Dilithium."
                    }
                },
                {
                    text: 'Attempt full salvage of its components.',
                    outcome: {
                        type: 'damage',
                        resource: 'scanners',
                        amount: 25,
                        log: "The salvage operation triggers a containment breach in the ship's damaged warp core! The resulting feedback damages your sensitive scanner arrays."
                    }
                },
                {
                    text: 'Give it a proper burial (destroy it).',
                    outcome: {
                        type: 'reward',
                        resource: 'morale',
                        amount: 5,
                        log: 'You give the Saratoga a photon torpedo burial. The crew appreciates the respect shown to a lost Starfleet crew. Crew morale improves.'
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
        },
         {
            id: 'ev_distress_02',
            type: 'distress_call',
            title: 'Fake Distress Signal',
            description: 'You receive a distress call using a Federation frequency, but the signal is weak and full of static. It claims to be a freighter under attack.',
            options: [
                {
                    text: 'Respond to the call.',
                    outcome: {
                        type: 'combat',
                        log: "It's a Klingon ambush! A Bird-of-Prey decloaks and powers up weapons! 'Today is a good day to die, Federation dogs!'",
                        spawn: 'pirate_raider',
                        spawnCount: 2,
                    }
                },
                {
                    text: "Scan the signal's origin before approaching.",
                    outcome: {
                        type: 'nothing',
                        log: "Your science officer detects faint traces of a Klingon warp signature around the signal's origin. You identify the trap and avoid it."
                    }
                },
                {
                    text: 'Ignore it.',
                    outcome: {
                        type: 'nothing',
                        log: 'The signal could be a trap. You decide to ignore it and continue on your mission.'
                    }
                }
            ]
        },
        {
            id: 'ev_distress_03',
            type: 'distress_call',
            title: 'Scientist in Peril',
            description: "A Federation science vessel, the U.S.S. Grissom, hails you. They are trapped in a gravimetric shear and their engines are offline.",
            options: [
                {
                    text: 'Attempt to tow them out with your tractor beam.',
                    outcome: {
                        type: 'damage',
                        resource: 'engines',
                        amount: 25,
                        log: 'You manage to pull them free, but the strain damages your own impulse engines!'
                    }
                },
                {
                    text: 'Share shield power to help them ride out the anomaly.',
                    outcome: {
                        type: 'damage',
                        resource: 'shields',
                        amount: 25,
                        log: 'Your shields protect them from the worst of the anomaly, but your own shield emitters are damaged in the process.'
                    }
                },
                {
                    text: 'Advise them on a technical solution.',
                    outcome: {
                        type: 'reward',
                        resource: 'dilithium',
                        amount: 3,
                        log: 'Your engineer devises a novel solution using their deflector dish. They escape the anomaly and transfer you some of their spare Dilithium as thanks.'
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
        },
         {
            id: 'ev_probe_02',
            type: 'ancient_probe',
            title: 'The Inquisitor Probe',
            description: "The probe emits a complex, patterned light sequence. The universal translator manages to decipher a single, repeated question: 'What is the purpose of carbon-based units?'",
            options: [
                {
                    text: 'To explore.',
                    outcome: {
                        type: 'reward',
                        resource: 'energy',
                        amount: 50,
                        log: "The probe seems to accept this answer. It transfers a small amount of energy to your ship's reserve batteries and continues on its way."
                    }
                },
                {
                    text: 'To create.',
                     outcome: {
                        type: 'nothing',
                        log: "The probe processes this, then silently drifts away, its mission apparently unfulfilled."
                    }
                },
                {
                    text: 'To destroy.',
                    outcome: {
                        type: 'damage',
                        resource: 'hull',
                        amount: 20,
                        log: 'The probe interprets this as a threat. It fires a small antimatter charge, damaging the hull before you can destroy it.'
                    }
                }
            ]
        },
         {
            id: 'ev_probe_03',
            type: 'ancient_probe',
            title: 'The Logic Probe',
            description: "The probe transmits a simple mathematical sequence: 1, 1, 2, 3, 5, 8... It waits for the next number in the sequence.",
            options: [
                {
                    text: "Transmit '13'.",
                    outcome: {
                        type: 'reward',
                        resource: 'torpedoes',
                        amount: 2,
                        log: "The probe flashes a green light. It seems to be a simple intelligence test. It opens a small compartment and ejects a container with 2 torpedoes."
                    }
                },
                 {
                    text: "Transmit '21'.",
                    outcome: {
                        type: 'nothing',
                        log: "The probe flashes a red light, then goes silent. It seems you've failed its test."
                    }
                },
                {
                    text: 'Destroy it.',
                     outcome: {
                        type: 'nothing',
                        log: 'You destroy the probe before it can do anything else. A missed opportunity, perhaps.'
                    }
                }
            ]
        }
    ]
};