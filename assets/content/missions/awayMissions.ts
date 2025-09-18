import type { AwayMissionTemplate, PlanetClass, ResourceType } from '../../../types';

export const awayMissionTemplates: AwayMissionTemplate[] = [
  {
    id: 'am01',
    title: 'Strange Energy Readings',
    planetClasses: ['M', 'L'],
    description: "Our sensors are picking up strange energy fluctuations from a nearby geological formation. Standard procedure dictates an investigation.",
    options: [
      {
        role: 'Science',
        text: 'Lead with a science officer to analyze the energy source with tricorders.',
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [
            { type: 'reward', resource: 'dilithium', amount: 1, log: 'The science team identifies the energy source as a stable, dormant crystalline lifeform. A valuable discovery! We recovered 1 Dilithium.', weight: 10 },
            { type: 'reward', resource: 'energy', amount: 50, log: 'The team discovered a natural energy pocket. They were able to safely channel 50 units of power to our reserve batteries.', weight: 10 },
            { type: 'reward', resource: 'dilithium', amount: 3, log: 'Extraordinary success! The crystalline lifeform is not only stable, but it resonates with dilithium. We were able to synthesize 3 crystals from the readings!', weight: 2 },
          ],
          failure: [
            { type: 'damage', resource: 'transporter', amount: 15, log: 'The energy fluctuates wildly, causing a feedback loop in the transporter beam. The team is recovered safely, but the transporter took 15 damage.', weight: 10 },
            { type: 'nothing', log: 'The energy source proves to be a common geological phenomenon, dissipating before the team can get a clear reading. A waste of time.', weight: 8 },
            { type: 'damage', resource: 'dilithium', amount: 1, log: 'Catastrophe! A massive energy discharge overloaded the team\'s equipment, and the resulting explosion fractured one of our Dilithium crystals in storage! We lost 1 Dilithium.', weight: 1 },
          ]
        }
      },
      {
        role: 'Security',
        text: 'Send a security team first to secure the area before scientific analysis.',
        successChanceRange: [0.5, 0.7],
        outcomes: {
          success: [
            { type: 'nothing', log: 'The security team secures the cave, finding it empty of hostiles. The science team can now proceed safely.', weight: 10 },
            { type: 'reward', resource: 'morale', amount: 5, log: 'The team discovers the cave was a shelter for a lost primitive tribe. They provide aid, and our crew morale improves.', weight: 5 },
          ],
          failure: [
            { type: 'damage', resource: 'security_teams', amount: 1, log: 'The team triggers a geological instability, causing a rockfall that traps and kills one security officer before the rest can escape. A tragic loss.', weight: 2 },
            { type: 'nothing', log: 'The cave system is unstable. The security team deems it too dangerous to proceed and withdraws.', weight: 10 },
          ]
        }
      },
      {
        role: 'Engineering',
        text: 'An engineering specialist could rig a device to safely tap and analyze the energy from a distance.',
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [
            { type: 'nothing', log: 'The engineer successfully modulates the energy field, gathering all necessary data without risk. A textbook operation.', weight: 10 },
            { type: 'reward', resource: 'shields', amount: 15, log: 'The data allows the engineer to develop a new shield modulation, improving shield subsystem health by 15 points.', weight: 8 },
          ],
          failure: [
            { type: 'damage', resource: 'energy', amount: 40, log: 'The device overloads, shorting out and creating a feedback loop that drains 40 units of reserve power from the ship.', weight: 10 },
            { type: 'damage', resource: 'engines', amount: 20, log: 'A power surge from the device feeds back into the ship\'s EPS grid, damaging the impulse engines.', weight: 3 },
          ]
        }
      },
    ],
  },
  {
    id: 'am02',
    title: 'The Silent Observers',
    planetClasses: ['M'],
    description: "Scans reveal a pre-warp civilization facing a natural disaster - a series of volcanic eruptions. We are bound by the Prime Directive, but there may be a way to help without revealing ourselves.",
    options: [
        {
            role: 'Science',
            text: 'Anonymously beam a data packet of the geological data to their most advanced scientific institution.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [
                    { type: 'reward', resource: 'morale', amount: 10, log: 'The local scientists, though puzzled by the data\'s origin, confirm its accuracy and issue an evacuation warning, saving thousands. A proud day for Starfleet.', weight: 10 }
                ],
                failure: [
                    { type: 'nothing', log: 'The civilization dismisses the data as a hoax or anomaly, and the disaster unfolds as predicted. A difficult lesson in non-interference.', weight: 10 },
                    { type: 'damage', resource: 'morale', amount: 5, log: 'They trace the data\'s origin to our ship! We were forced to leave orbit before being fully identified, but it was a close call. The crew is shaken.', weight: 3 }
                ]
            }
        },
        {
            role: 'Engineering',
            text: 'Use the ship\'s tractor beam on a micro-setting to subtly reinforce the tectonic plates.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [
                    { type: 'reward', resource: 'morale', amount: 5, log: 'The delicate procedure is a success! The worst of the eruptions are quelled, mitigating the disaster without detection.', weight: 10 }
                ],
                failure: [
                    { type: 'damage', resource: 'hull', amount: 15, log: 'The interference has unforeseen consequences, triggering a massive earthquake in another region. The resulting seismic shockwave slightly damaged our hull plating.', weight: 10 }
                ]
            }
        },
    ]
  },
   {
    id: 'am03',
    title: 'Outpost in the Storm',
    planetClasses: ['L'],
    description: "A Federation science outpost on a geologically active L-Class planet has gone silent. Their last message spoke of structural integrity failure due to plasma storms. We must rescue any survivors.",
    options: [
        {
            role: 'Engineering',
            text: 'Beam an engineering team to the power core to restore shields and life support.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [
                    { type: 'reward', resource: 'morale', amount: 10, log: 'Power is restored just as the primary containment fails! The shields hold, buying enough time for a full and safe evacuation. The survivors are grateful.', weight: 10 }
                ],
                failure: [
                    { type: 'damage', resource: 'security_teams', amount: 1, log: 'The core was too unstable. The attempt causes an overload that accelerates the outpost\'s destruction. We saved most of the staff, but a security officer was lost in the chaos.', weight: 2 },
                    { type: 'damage', resource: 'hull', amount: 10, log: 'The core explodes! We managed to beam everyone out just in time, but the Endeavour was struck by debris from the explosion.', weight: 10 }
                ]
            }
        },
        {
            role: 'Security',
            text: 'Clear an exfiltration zone of crystalline predators attracted by the energy discharges.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [
                    { type: 'nothing', log: 'The security team carves out a safe perimeter, holding off the creatures while the surviving science staff are beamed away. No casualties.', weight: 10 }
                ],
                failure: [
                    { type: 'damage', resource: 'morale', amount: 5, log: 'The creatures are unexpectedly tough. The team is overwhelmed and pinned down, forcing a much riskier and more dangerous rescue. Several crewmen were injured.', weight: 10 }
                ]
            }
        }
    ]
  },
  {
    id: 'am04',
    title: 'The Tomb of the Architects',
    planetClasses: ['D'],
    description: "Long-range scans have found what appears to be an artificially constructed monolith on a barren D-Class world. This could be a relic from a long-extinct, highly advanced civilization.",
    options: [
      {
        role: 'Science',
        text: 'Interface with the monolith to translate the alien language and data streams.',
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [
            { type: 'reward', resource: 'dilithium', amount: 2, log: 'The monolith reveals a treasure trove of astronomical data, including the location of a rare resource-rich nebula. We have synthesized 2 Dilithium from the data.', weight: 10 },
            { type: 'special', log: 'The monolith contains the cultural archive of a lost civilization. Starfleet Command commends your historic discovery.', weight: 5 }
          ],
          failure: [
            { type: 'nothing', log: 'The interface triggers a data cascade, wiping the monolith\'s memory banks permanently. The knowledge of this race is lost forever.', weight: 10 },
          ],
        },
      },
      {
        role: 'Engineering',
        text: 'Disable the complex energy field protecting the monolith by re-routing its power source.',
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [
            { type: 'reward', resource: 'shields', amount: 20, log: 'The field is disabled flawlessly. The technology used to generate it has been adapted to reinforce our own shield emitters.', weight: 10 }
          ],
          failure: [
            { type: 'damage', resource: 'transporter', amount: 25, log: 'A feedback loop vaporizes the monolith\'s internal components and sends a debilitating energy pulse back at the ship, damaging the transporter.', weight: 10 }
          ],
        },
      },
    ],
  },
];
