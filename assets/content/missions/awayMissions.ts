import type { AwayMissionTemplate } from '../../../types';

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
  // --- NEW M-CLASS MISSIONS ---
  {
    id: 'am05',
    title: 'The Plague Village',
    planetClasses: ['M'],
    description: "A pre-warp village is afflicted by a deadly, yet easily curable, plague. The Prime Directive forbids interference, but a Starfleet officer's oath compels us to consider our options. How do we proceed?",
    options: [
      {
        role: 'Science',
        text: 'Anonymously introduce the cure into the village water supply via a targeted transporter dispersal.',
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [{ type: 'reward', resource: 'morale', amount: 15, log: 'The cure works perfectly. The village recovers without ever knowing of our existence. The crew is proud of their quiet humanitarian effort.', weight: 10 }],
          failure: [
            { type: 'damage', resource: 'morale', amount: 10, log: 'The dispersal was detected! A local saw the transporter effect. We had to withdraw immediately. We violated the Prime Directive and the crew is deeply ashamed.', weight: 5 },
            { type: 'nothing', log: 'The cure was ineffective due to an unforeseen biological quirk in the natives. We could not save them. A tragic outcome.', weight: 5 },
          ]
        }
      },
      {
        role: 'Engineering',
        text: 'Create a "natural" atmospheric phenomenon with the deflector dish that will neutralize the airborne pathogen.',
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [{ type: 'reward', resource: 'morale', amount: 10, log: 'The engineered electrical storm scrubs the pathogen from the air. The natives see it as a sign from their gods. We saved them without detection.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'hull', amount: 10, log: 'The atmospheric manipulation was more powerful than anticipated, creating a freak lightning strike that hit the Endeavour, causing minor hull damage.', weight: 10 }]
        }
      },
    ]
  },
  {
    id: 'am06',
    title: 'First Contact Protocol',
    planetClasses: ['M'],
    description: "Sensors have confirmed this M-Class world is home to a newly warp-capable species. They are unaware of other life in the galaxy. This is a historic opportunity.",
    options: [
        {
            role: 'Science',
            text: 'Make peaceful, formal first contact as per Starfleet guidelines.',
            successChanceRange: [0.8, 0.95],
            outcomes: {
                success: [{ type: 'special', log: 'First contact is a stunning success. The species is peaceful and eager to learn. Starfleet commends your textbook diplomacy.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 5, log: 'A cultural misunderstanding leads to a diplomatic incident. The new species is now deeply suspicious of the Federation. A terrible start.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Approach with a show of strength to ensure they understand our capabilities and respect our position.',
            successChanceRange: [0.3, 0.5],
            outcomes: {
                success: [{ type: 'nothing', log: 'They seem to be a warrior culture and respect our power. They agree to talks, but remain wary.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'hull', amount: 10, log: 'They interpreted our "show of strength" as an act of aggression and launched a primitive but powerful weapon, damaging our hull before we could withdraw.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am07',
    title: 'The Whispering Forest',
    planetClasses: ['M'],
    description: "A vast forest on the planet's southern continent is emitting a coherent, low-level telepathic field. It's causing mild confusion among the crew. Is it a natural phenomenon or a sign of a non-corporeal intelligence?",
    options: [
        {
            role: 'Science',
            text: 'Send a science team with psionic resonators to attempt communication.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'special', log: 'The team makes contact! The forest is a single, gestalt intelligence. It shares a wealth of ecological data, a landmark discovery.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 10, log: 'The attempt to communicate is interpreted as an attack. The psionic field intensifies, causing severe mental distress to the away team and a sharp drop in crew morale.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Establish a secure perimeter and use focused phaser fire to clear a section of the forest, disrupting the field.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'nothing', log: 'The phaser fire disrupts the telepathic field in a localized area, allowing for safe study from a distance. The field eventually recovers.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'The forest responds defensively, animating vines and roots to attack the away team. We lost a security officer in the ensuing chaos.', weight: 3 }]
            }
        }
    ]
  },
  {
    id: 'am08',
    title: 'The God Machine',
    planetClasses: ['M'],
    description: "A primitive culture worships a sophisticated weather control device from a long-dead civilization. The device is malfunctioning, causing catastrophic storms. They believe it is an angry god.",
    options: [
      {
        role: 'Engineering',
        text: 'Disguise an engineering team as "sky spirits" and repair the device under the cover of a storm.',
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [{ type: 'reward', resource: 'morale', amount: 10, log: 'The team repairs the machine, and the weather stabilizes. The natives rejoice, their "god" appeased. A successful covert operation.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'transporter', amount: 20, log: 'The storm interferes with the transporter beam during extraction. The team makes it back, but the transporter is heavily damaged.', weight: 10 }]
        }
      },
      {
        role: 'Security',
        text: 'Create a diversion on the other side of the settlement to draw the natives away, allowing an engineering team to work undisturbed.',
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [{ type: 'nothing', log: 'The diversion works perfectly. The machine is repaired, and the natives are none the wiser.', weight: 10 }],
          failure: [{ type: 'nothing', log: 'The natives are not fooled by the diversion and refuse to leave their shrine. The mission is aborted.', weight: 10 }]
        }
      }
    ]
  },
  {
    id: 'am09',
    title: 'Botanical Anomaly',
    planetClasses: ['M'],
    description: "A unique species of plant on this world exhibits strange chroniton properties, causing small, localized time distortions around it. This could be a scientific breakthrough or incredibly dangerous.",
    options: [
        {
            role: 'Science',
            text: 'Collect samples using a temporal stasis field to prevent contamination.',
            successChanceRange: [0.7, 0.85],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 2, log: 'The samples are secured safely. Analysis of their chroniton emissions allows us to refine our dilithium recrystallization process.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'engines', amount: 20, log: 'A temporal distortion ages a key component of our impulse engines, causing a significant loss of function.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Modify the ship\'s deflector dish to emit a field that neutralizes the chroniton particles, rendering the area safe.',
            successChanceRange: [0.6, 0.75],
            outcomes: {
                success: [{ type: 'nothing', log: 'The deflector field works, neutralizing the temporal effects and allowing for safe collection of samples.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'energy', amount: 50, log: 'The plants react to the deflector field by drawing power from it! The attempt drains 50 units of reserve power before the beam is shut down.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am10',
    title: 'The Living Sea',
    planetClasses: ['M'],
    description: "It's incredible, Captain. Our science team believes the entire ocean of this planet is a single, massive, sentient organism. It is attempting to communicate with us through complex pressure waves.",
    options: [
        {
            role: 'Science',
            text: 'Use the ship\'s sensors to translate the pressure waves and establish communication.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'special', log: 'A historic moment. We have made peaceful contact with a planet-sized organism. It shares its ancient knowledge of the galaxy\'s history.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'Our attempts at translation are too crude. The organism ceases its attempts to communicate, sinking into silence.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Launch a probe into the ocean to gather direct biological data.',
            successChanceRange: [0.5, 0.7],
            outcomes: {
                success: [{ type: 'reward', resource: 'hull', amount: 20, log: 'The data from the probe reveals how the organism\'s cellular structure regenerates. We can apply this to our ship\'s hull repair systems.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'torpedoes', amount: 2, log: 'The organism perceives the probe as a threat and destroys it. In the process, the magnetic pulse from its defense mechanism detonates two torpedoes in our launch tubes!', weight: 5 }]
            }
        }
    ]
  },
  {
    id: 'am11',
    title: 'Marooned',
    planetClasses: ['M', 'L'],
    description: "We've found a distress beacon from a Starfleet shuttle, the 'Pioneer', that went missing five years ago. Scans show it crash-landed in a remote, mountainous region.",
    options: [
        {
            role: 'Security',
            text: 'Send a security team to the crash site to search for survivors and secure the area.',
            successChanceRange: [0.75, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'morale', amount: 10, log: 'The team finds a survivor! Lieutenant Johnson has been living off the land for five years. Her rescue is a massive boost to crew morale.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'The crash site is unstable. A sudden landslide injures the team and we lose one officer during the evacuation.', weight: 5 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Focus on salvaging the shuttle\'s flight recorder to determine the cause of the crash.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'engines', amount: 15, log: 'The recorder shows the shuttle was brought down by a previously unknown plasma anomaly. The data allows us to reinforce our engine cowlings against this threat.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The flight recorder is corrupted beyond recovery. The cause of the crash will remain a mystery.', weight: 10 }]
            }
        }
    ]
  },
   {
    id: 'am12',
    title: 'Colony Dispute',
    planetClasses: ['M'],
    description: "A Federation colony, 'New Haven', is in a tense land dispute with a native sentient species. Starfleet has ordered us to mediate and prevent bloodshed.",
    options: [
        {
            role: 'Science',
            text: 'Act as a neutral arbiter, using diplomacy and cultural understanding to find a compromise.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'morale', amount: 10, log: 'A peaceful resolution is found. A new treaty is signed, and both sides are grateful for the Federation\'s intervention.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 10, log: 'The talks break down. Both sides accuse the Federation of bias. Violence erupts, and we are forced to leave. A diplomatic failure.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Enforce a ceasefire by creating a demilitarized zone with a security team, forcing both sides to the negotiating table.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'nothing', log: 'Our show of force works. With Starfleet security ensuring the peace, both sides reluctantly agree to a ceasefire and resume talks.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'A radical faction from one side attacks our security team. We restore order, but not before losing an officer in the crossfire.', weight: 4 }]
            }
        }
    ]
  },
  // --- NEW L-CLASS MISSIONS ---
  {
    id: 'am13',
    title: 'The Crystal Labyrinth',
    planetClasses: ['L', 'D'],
    description: "A vast underground cave system is filled with massive, naturally occurring crystals that focus ambient energy. The crystals are valuable, but the focused energy makes transporter locks unstable.",
    options: [
        {
            role: 'Science',
            text: 'Take remote readings to map the energy patterns and find a safe path through.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 2, log: 'The science officer maps a safe route. The team navigates the caves and returns with several large, pure crystals.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The crystal formations are too complex and shift constantly. Mapping a safe route is impossible; the mission is aborted.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Create a frequency dampener to neutralize the energy fields, allowing for direct access.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 3, log: 'The dampener works! The team can move freely and collects a large cache of crystals.', weight: 8 }],
                failure: [{ type: 'damage', resource: 'shields', amount: 20, log: 'The dampener creates a harmonic feedback loop with the crystals, sending a powerful energy surge back to the ship that damages the shield emitters.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am14',
    title: 'Abandoned Mine',
    planetClasses: ['L', 'D'],
    description: "This planet was once home to a lucrative mining operation that was abandoned decades ago. There could be leftover equipment or unrefined ore for the taking.",
    options: [
        {
            role: 'Security',
            text: 'Send a security team to sweep the facility for squatters or automated defenses.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'torpedoes', amount: 3, log: 'The team finds a cache of old but functional mining explosives. Our engineers adapt them into 3 new photon torpedo casings.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'The mine\'s old automated security system activates, trapping and killing one of the team members before it can be disabled.', weight: 3 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Focus on reactivating the main computer to access geological survey logs and find remaining ore deposits.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 2, log: 'The logs point to an overlooked vein of ore. A quick excavation yields a small but valuable amount of dilithium.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'energy', amount: 40, log: 'Reactivating the computer overloads the facility\'s decayed power conduits, creating a massive short circuit that drains our ship\'s reserve power.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am15',
    title: 'The Sand Beast',
    planetClasses: ['L'],
    description: "Our science officer reports a massive, silicon-based lifeform 'swimming' beneath the desert sands. It's creating seismic disturbances that interfere with our sensors.",
    options: [
        {
            role: 'Science',
            text: 'Use a modified tricorder to emit a sonic frequency that will attract the creature for study.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'special', log: 'The creature surfaces peacefully. It appears to be intelligent, communicating through vibrations. A successful first contact with a non-humanoid species.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'hull', amount: 10, log: 'The frequency enrages the creature! It surfaces and hurls massive rocks at the ship with surprising force, causing hull damage before burrowing away.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Set a wide-area phaser stun sweep to neutralize the creature and allow for safe study.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'nothing', log: 'The stun sweep works, temporarily paralyzing the creature. We gather our data and leave before it recovers.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The creature\'s silicon hide is resistant to phaser stun effects. It burrows deep and disappears, ending the mission.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am16',
    title: 'Rescue the Prospector',
    planetClasses: ['L'],
    description: "We've picked up a distress call from a lone, independent prospector. His ship has crashed, and his life support is failing.",
    options: [
        {
            role: 'Security',
            text: 'Send a standard search and rescue team.',
            successChanceRange: [0.8, 0.95],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 1, log: 'The team finds the prospector just in time. As thanks, he gives us a small dilithium crystal he found.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 5, log: 'We found the crash site, but it was too late. The prospector had already succumbed to the harsh environment. The crew is saddened by the loss.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Use the transporter to beam over spare parts and help him repair his own ship.',
            successChanceRange: [0.6, 0.75],
            outcomes: {
                success: [{ type: 'reward', resource: 'hull', amount: 15, log: 'The prospector is a brilliant mechanic. With our parts, he gets his ship flying. In gratitude, he shows us a trick to reinforce hull plating with common asteroid minerals.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The prospector\'s ship is too heavily damaged. He is grateful for the attempt, but we still have to evacuate him conventionally.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am17',
    title: 'Romulan Listening Post',
    planetClasses: ['L'],
    description: "Tucked away in a deep canyon, we've discovered a derelict Romulan listening post, likely from the Earth-Romulan War era. Its data core could be a treasure trove of intelligence.",
    options: [
        {
            role: 'Science',
            text: 'Attempt to bypass the security protocols and download the data core.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'special', log: 'The science officer cracks the ancient encryption! The data core contains historic Romulan fleet movements and intelligence. A major find for Starfleet.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 5, log: 'The attempt triggers a booby trap! The data core is wiped, and a plasma burst injures the away team. A failure on all fronts.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Physically extract the data core, bypassing the software entirely.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'nothing', log: 'The engineering team successfully cuts the core from the facility. Starfleet Intelligence will have to crack the encryption, but the data is secure.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'transporter', amount: 15, log: 'Extracting the core triggers a power surge that feeds back into the transporter system during beam-out, causing damage.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am18',
    title: 'Spore World',
    planetClasses: ['L', 'M'],
    description: "The planet's atmosphere is saturated with microscopic, psychoactive spores. They are not harmful, but they are causing mild hallucinations among the crew. A science team could potentially synthesize a remedy or even a useful compound.",
    options: [
        {
            role: 'Science',
            text: 'Collect atmospheric samples to synthesize an antidote for the hallucinations.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'morale', amount: 10, log: 'An effective antidote is created and distributed. The crew\'s minds are clear, and morale improves significantly.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The spores are too complex, and a reliable antidote cannot be synthesized with our equipment. We will have to leave orbit for the effects to wear off.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Beam down a team in full EV suits to retrieve spore samples directly from the plant sources.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'special', log: 'The samples are a medical breakthrough! The spores can be refined into a powerful truth serum, a valuable asset for Starfleet Intelligence.', weight: 5 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 5, log: 'A tear in one of the EV suits exposes an officer to a concentrated dose of spores, causing a severe psychotic episode. The team is recovered, but the incident is disturbing.', weight: 10 }]
            }
        }
    ]
  },
  // --- NEW D-CLASS MISSIONS ---
  {
    id: 'am21',
    title: 'Pirate Hideout',
    planetClasses: ['D'],
    description: "Our scans have pierced a cloaking field inside a large crater, revealing a hidden pirate listening post. It appears to be lightly manned.",
    options: [
        {
            role: 'Security',
            text: 'Send a strike team to neutralize the pirates and capture their base.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'torpedoes', amount: 4, log: 'The pirates are caught completely by surprise. We capture the base, along with their cache of stolen torpedoes.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'The pirates were better armed than we thought. A firefight ensues, and we lose a security officer before taking the base.', weight: 4 }]
            }
        },
        {
            role: 'Science',
            text: 'Covertly hack their systems to download their intelligence data on local shipping routes.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 2, log: 'The science officer gains access to their star charts, which include the locations of several unrefined dilithium deposits they were targeting.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The hacking attempt is detected, and the pirates wipe their systems before we can get anything useful. They abandon the base before we can attack.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am22',
    title: 'The Doomsday Weapon',
    planetClasses: ['D'],
    description: "A colossal, automated weapon of unknown origin lies dormant on the surface. Its power readings are off the charts. It could be a threat to the entire quadrant if activated.",
    options: [
        {
            role: 'Engineering',
            text: 'Send an engineering team to carefully disarm its power core.',
            successChanceRange: [0.5, 0.7],
            outcomes: {
                success: [{ type: 'reward', resource: 'weapons', amount: 25, log: 'The team successfully disarms the weapon. The technology is reverse-engineered to improve our own weapon systems.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'hull', amount: 25, log: 'The disarming sequence fails! The weapon activates a defensive pulse that damages our hull before shutting down again.', weight: 10 },
                           { type: 'damage', resource: 'security_teams', amount: 3, log: 'Catastrophic failure! The weapon self-destructs, taking the entire away team with it. A devastating loss.', weight: 1 }]
            }
        },
        {
            role: 'Security',
            text: 'Destroy it from orbit with a full torpedo spread.',
            successChanceRange: [0.8, 0.95],
            outcomes: {
                success: [{ type: 'nothing', log: 'The torpedoes strike true, and the weapon is vaporized. The threat is neutralized.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'shields', amount: 30, log: 'The weapon\'s automated defenses shoot down most of our torpedoes and return fire, damaging our shields before the final torpedo hits.', weight: 5 }]
            }
        }
    ]
  },
  {
    id: 'am23',
    title: 'Crashed Warbird',
    planetClasses: ['D'],
    description: "We've found the crash site of a Romulan Warbird, likely from the Dominion War. Its cloaking device appears to be partially intact.",
    options: [
        {
            role: 'Engineering',
            text: 'Salvage the cloaking device components for Starfleet R&D.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'engines', amount: 20, log: 'We can\'t replicate the cloak, but the power signature data allows us to improve our engine efficiency, making us harder to detect.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The cloaking device was booby-trapped. The salvage team triggered a self-destruct, vaporizing the components.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Destroy the wreckage to prevent the technology from falling into the wrong hands.',
            successChanceRange: [0.9, 0.98],
            outcomes: {
                success: [{ type: 'nothing', log: 'The wreckage is destroyed. A potential threat has been neutralized.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'torpedoes', amount: 1, log: 'The ship\'s torpedo magazine cooked off in the explosion, and a stray warhead was blasted into our path, forcing us to use one of our own torpedoes to destroy it defensively.', weight: 2 }]
            }
        }
    ]
  },
  {
    id: 'am24',
    title: 'Unstable Element',
    planetClasses: ['D'],
    description: "Our geological scans have detected trace amounts of a previously unknown, highly unstable element. If we could safely contain a sample, its energy potential would be immense.",
    options: [
        {
            role: 'Science',
            text: 'Use a modified containment field to secure a sample.',
            successChanceRange: [0.6, 0.75],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 4, log: 'The containment field holds! The element is stabilized and analysis shows it can greatly enrich our dilithium stores.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'transporter', amount: 30, log: 'The element detonates during transport! The explosion cripples the transporter system.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Bombard the deposit with neutrinos from the ship\'s deflector to stabilize it before collection.',
            successChanceRange: [0.7, 0.85],
            outcomes: {
                success: [{ type: 'nothing', log: 'The neutrino bombardment works, rendering the element inert and safe for collection and study.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'weapons', amount: 20, log: 'The bombardment has an unexpected reaction, creating a cascade of energy that overloads our phaser emitters.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am25',
    title: 'The Sleeper Ship',
    planetClasses: ['D'],
    description: "Buried in a deep chasm is a sublight sleeper ship from an unknown, pre-warp culture. Its occupants are in cryogenic stasis. Who knows how long they've been here.",
    options: [
        {
            role: 'Science',
            text: 'Attempt to revive the occupants to learn their story.',
            successChanceRange: [0.5, 0.7],
            outcomes: {
                success: [{ type: 'special', log: 'You successfully revive the command crew. They are the last survivors of a world destroyed by a supernova. They offer their thanks and cultural history to the Federation archives.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The cryogenic systems have degraded too much over the millennia. The occupants cannot be revived. All you can do is record their passing.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Leave the occupants in stasis and tow the ship to the nearest Starbase.',
            successChanceRange: [0.8, 0.95],
            outcomes: {
                success: [{ type: 'nothing', log: 'The ship is carefully towed out of the chasm. Starfleet will handle this delicate second contact scenario.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'hull', amount: 15, log: 'The ancient ship\'s hull breaks apart during the tow. Debris strikes the Endeavour, causing moderate damage.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am28',
    title: 'Labyrinth of Tunnels',
    planetClasses: ['D'],
    description: "A vast network of perfectly circular, artificial tunnels runs beneath the planet's surface. They are smooth as glass and show no signs of tool marks. What could have created them?",
    options: [
      {
        role: 'Science',
        text: 'Send a probe to map the network and analyze the tunnel composition.',
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [{ type: 'reward', resource: 'hull', amount: 15, log: 'The probe discovers the tunnels are made of an ultra-dense, self-repairing material. We can adapt this technology to our hull plating.', weight: 10 }],
          failure: [{ type: 'nothing', log: 'The probe is lost in the endless maze of tunnels. No useful data is recovered.', weight: 10 }]
        }
      },
      {
        role: 'Security',
        text: 'Lead an away team into the tunnels to explore on foot.',
        successChanceRange: [0.5, 0.7],
        outcomes: {
          success: [{ type: 'nothing', log: 'The team explores for several hours but finds the tunnels to be empty and seemingly endless. They return with samples but no answers.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'security_teams', amount: 1, log: 'The away team is attacked by a giant, worm-like creature that created the tunnels. They manage to escape, but one security officer is lost.', weight: 3 }]
        }
      }
    ]
  },
  // --- NEW J-CLASS MISSIONS ---
  {
    id: 'am29',
    title: 'Gas Scooping',
    planetClasses: ['J'],
    description: "The gas giant's upper atmosphere is rich in Deuterium, a key component of our impulse engine fuel. We could use a modified shuttle to collect some.",
    options: [
        {
            role: 'Engineering',
            text: 'Launch a shuttle to perform precision gas scooping operations.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'energy', amount: 75, log: 'The operation is a success. The collected Deuterium is refined and replenishes our reserve power banks significantly.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'engines', amount: 15, log: 'The shuttle is hit by an unexpected atmospheric shear, damaging its engines. It returns safely, but our main impulse engines suffer a power feedback.', weight: 10 }]
            }
        },
        {
            role: 'Science',
            text: 'Use the main deflector dish to ionize and attract the gas directly to the ship.',
            successChanceRange: [0.6, 0.75],
            outcomes: {
                success: [{ type: 'reward', resource: 'energy', amount: 100, log: 'A brilliant, if risky, maneuver. The deflector safely channels a massive amount of Deuterium, fully restoring our reserve power.', weight: 5 }],
                failure: [{ type: 'damage', resource: 'shields', amount: 25, log: 'Unwanted gases were collected along with the Deuterium, creating a corrosive mixture that damages the shield emitters.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am30',
    title: 'Moon Mission: The Garden',
    planetClasses: ['J'],
    description: "One of the gas giant's moons is a lush M-Class world, teeming with life. However, its proximity to the giant's radiation belt makes it a hazardous location for an away mission.",
    options: [
        {
            role: 'Science',
            text: 'Risk a short-duration away mission to a region with unusually low radiation to collect samples.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'special', log: 'The team discovers a plant with incredible anti-radiation properties. Starfleet Medical will be able to synthesize new treatments from this.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'morale', amount: 10, log: 'The radiation levels spike unexpectedly. The team is beamed out with minor radiation sickness, and the experience shakes crew morale.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Land a heavily shielded shuttle to establish a safe zone before conducting any science.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'nothing', log: 'The shuttle provides adequate protection, allowing for a safe but limited survey of the moon\'s surface.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The moon\'s radiation is too intense even for the shuttle\'s shielding. The mission is deemed too risky and aborted.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am31',
    title: 'Floating City',
    planetClasses: ['J'],
    description: "Incredible. Scans show a vast, abandoned city floating in the stable layers of the gas giant's atmosphere. It appears to be millions of years old.",
    options: [
        {
            role: 'Engineering',
            text: 'Send a probe to analyze the city\'s structural and power systems.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'shields', amount: 25, log: 'The probe finds the city is held aloft by an incredibly advanced anti-gravity system. The principles are applied to our own shield grid, improving its integrity.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The probe is crushed by the intense atmospheric pressure before it can gather any meaningful data.', weight: 10 }]
            }
        },
        {
            role: 'Science',
            text: 'Use long-range sensors to scan for artifacts or data storage.',
            successChanceRange: [0.6, 0.8],
            outcomes: {
                success: [{ type: 'reward', resource: 'dilithium', amount: 2, log: 'A faint data signal is detected. It contains the chemical composition of a synthetic, hyper-efficient energy source. We replicate it, gaining 2 Dilithium.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The city\'s materials are too dense for our sensors to penetrate from this distance. Its secrets remain hidden.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am32',
    title: 'The Great Eye',
    planetClasses: ['J'],
    description: "The planet's most prominent feature is a colossal, centuries-old storm. We are detecting strange, non-random energy patterns within it. Could it be more than just a storm?",
    options: [
        {
            role: 'Science',
            text: 'Launch a probe into the storm to analyze the energy patterns.',
            successChanceRange: [0.7, 0.9],
            outcomes: {
                success: [{ type: 'special', log: 'The patterns are a complex mathematical language. The storm is a form of non-corporeal, energy-based life. A truly unique discovery.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The probe is destroyed by the storm\'s turbulence before it can confirm the source of the patterns.', weight: 10 }]
            }
        },
        {
            role: 'Engineering',
            text: 'Attempt to draw power from the storm using a modified energy conduit.',
            successChanceRange: [0.4, 0.6],
            outcomes: {
                success: [{ type: 'reward', resource: 'energy', amount: 100, log: 'The gamble pays off! We manage to safely channel a massive amount of energy from the storm, completely refilling our reserve power.', weight: 5 }],
                failure: [{ type: 'damage', resource: 'hull', amount: 20, log: 'The storm is too powerful! The energy conduit overloads, and a massive lightning strike hits the ship, causing significant hull damage.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am33',
    title: 'Magnetic Field Research',
    planetClasses: ['J'],
    description: "This gas giant has an unusually powerful magnetic field. Data collected from it could lead to significant improvements in our own defensive systems.",
    options: [
        {
            role: 'Science',
            text: 'Deploy a series of probes to triangulate the field\'s primary flux points.',
            successChanceRange: [0.8, 0.9],
            outcomes: {
                success: [{ type: 'reward', resource: 'shields', amount: 20, log: 'The data is collected successfully. Our science officer develops a new algorithm that improves shield modulation and efficiency.', weight: 10 }],
                failure: [{ type: 'nothing', log: 'The magnetic field is too chaotic, crushing the probes before they can form a stable sensor net. No useful data is collected.', weight: 10 }]
            }
        }
    ]
  },
  {
    id: 'am34',
    title: 'Comet Intercept',
    planetClasses: ['J'],
    description: "A large comet is on a collision course with one of the gas giant's inhabited moons. We are the only ship in range to intervene.",
    options: [
        {
            role: 'Engineering',
            text: 'Use the tractor beam to alter the comet\'s trajectory.',
            successChanceRange: [0.7, 0.85],
            outcomes: {
                success: [{ type: 'reward', resource: 'morale', amount: 5, log: 'The tractor beam successfully nudges the comet onto a safe trajectory. The moon\'s inhabitants are saved.', weight: 10 }],
                failure: [{ type: 'damage', resource: 'engines', amount: 20, log: 'The comet begins to break apart under the strain, and a large fragment strikes our impulse engines. The moon is saved, but we sustained damage.', weight: 10 }]
            }
        },
        {
            role: 'Security',
            text: 'Use a photon torpedo to fracture the comet into smaller, harmless pieces.',
            successChanceRange: [0.8, 0.95],
            outcomes: {
                success: [{ type: 'nothing', log: 'A single, well-placed torpedo fractures the comet\'s nucleus. The resulting fragments will burn up harmlessly in the gas giant\'s atmosphere.', weight: 10 }],
                // FIX: Added missing quotes to the log string.
                failure: [{ type: 'damage', resource: 'hull', amount: 10, log: "The torpedo detonation wasn't clean. A large piece is sent spinning towards us, and we take a minor hull breach before it passes.", weight: 5 }]
            }
        }
    ]
  },
  {
    id: 'am36',
    title: 'Sky Whales',
    planetClasses: ['J'],
    description: "Sensors are tracking several city-sized biological entities 'swimming' through the gas giant's clouds. They appear to be docile, filter-feeding organisms.",
    options: [
      {
        role: 'Science',
        text: 'Approach one of the creatures and perform a passive bio-scan.',
        successChanceRange: [0.8, 0.9],
        outcomes: {
          success: [{ type: 'special', log: 'The creature is a magnificent, ancient lifeform. The bio-data collected is a treasure for Federation xenobiology.', weight: 10 }],
          failure: [{ type: 'nothing', log: 'The creature is startled by our presence and dives deep into the crushing atmosphere before we can get a complete scan.', weight: 10 }]
        }
      },
      {
        role: 'Engineering',
        text: 'Collect samples of the gases vented by the creatures; they may be useful.',
        successChanceRange: [0.7, 0.85],
        outcomes: {
          success: [{ type: 'reward', resource: 'energy', amount: 40, log: 'The vented gases are a highly efficient fuel source! We process them and gain 40 reserve power.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'shields', amount: 15, log: 'The vented gases are unexpectedly corrosive, and they damage our shield emitters before we can withdraw.', weight: 10 }]
        }
      }
    ]
  },
  {
    id: 'am37',
    title: 'Ring Runners',
    planetClasses: ['J'],
    description: "The gas giant's dense, icy rings are providing perfect cover for a group of Orion pirates who have been raiding local trade routes.",
    options: [
      {
        role: 'Security',
        text: 'Enter the rings and hunt them down.',
        successChanceRange: [0.6, 0.75],
        outcomes: {
          success: [{ type: 'special', log: 'After a tense chase through the ice field, we corner and destroy the pirate vessel. The local colonies will be safer now.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'hull', amount: 15, log: 'The pirates use the environment to their advantage, causing a controlled asteroid collision that damages our hull. They escape in the confusion.', weight: 10 }]
        }
      },
      {
        role: 'Engineering',
        text: 'Use the deflector dish to create a resonance pulse, "flushing" the pirates out of the rings into open space.',
        successChanceRange: [0.7, 0.85],
        outcomes: {
          success: [{ type: 'nothing', log: 'The pulse works, forcing the pirates out of the rings for an easy interception. They surrender without a fight.', weight: 10 }],
          failure: [{ type: 'damage', resource: 'weapons', amount: 20, log: 'The resonance pulse works, but it causes a feedback loop in our weapon systems, damaging the phaser arrays.', weight: 10 }]
        }
      }
    ]
  },
  {
    id: 'am38',
    title: 'The Crystalline Epidemic',
    planetClasses: ['L'],
    description: "An independent Federation research team on this marginal world has been afflicted by a bizarre condition: a crystalline virus is slowly encasing their bodies. We must find a cure before they are lost.",
    options: [
      {
        role: 'Science',
        text: "Use a science team to analyze the virus's resonant frequency and develop an anti-viral agent.",
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [
            { type: 'reward', resource: 'morale', amount: 10, log: 'The cure works! The away team synthesizes an anti-viral agent that reverses the crystallization. The research team is saved.', weight: 10 },
            { type: 'special', log: 'Extraordinary success. The anti-viral agent is a major medical breakthrough. Starfleet Medical commends your team\'s ingenuity.', weight: 2 }
          ],
          failure: [
            { type: 'damage', resource: 'morale', amount: 10, log: 'The anti-viral agent fails to stop the crystallization process. The research team is lost. The crew is devastated.', weight: 10 },
            { type: 'damage', resource: 'energy', amount: 30, log: 'The attempt to create a cure causes an energy cascade in the lab equipment, feeding back and draining 30 reserve power.', weight: 5 }
          ]
        }
      },
      {
        role: 'Engineering',
        text: "The virus reacts to sonic frequencies. An engineer could rig an emitter to shatter the crystals.",
        successChanceRange: [0.7, 0.9],
        outcomes: {
          success: [
            { type: 'reward', resource: 'morale', amount: 5, log: 'The sonic emitter shatters the crystalline structures without harming the patients. They are weak, but alive.', weight: 10 },
            { type: 'reward', resource: 'hull', amount: 15, log: 'The resonant frequency data used to shatter the crystals has an unexpected application in reinforcing our hull plating.', weight: 3 }
          ],
          failure: [
            { type: 'damage', resource: 'morale', amount: 10, log: 'The frequency accelerates the crystal growth, encasing the victims instantly. The away team could only watch. A horrifying failure.', weight: 10 },
            { type: 'damage', resource: 'security_teams', amount: 1, log: 'The emitter overloads, sending a shockwave of razor-sharp crystal shards through the lab. A member of the away team is killed in the blast.', weight: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'am39',
    title: 'The Quantum Echo',
    planetClasses: ['J'],
    description: "While studying this gas giant, our sensors detected a quantum echo—a Starfleet vessel is appearing and disappearing from sensors, out of phase. It's the U.S.S. Defiant, presumed destroyed at the Battle of Sector 001.",
    options: [
      {
        role: 'Engineering',
        text: "Modify the deflector dish to emit an inverse chroniton pulse, attempting to lock the Defiant in our phase of spacetime.",
        successChanceRange: [0.5, 0.7],
        outcomes: {
          success: [
            { type: 'reward', resource: 'morale', amount: 20, log: 'It worked! The Defiant is stabilized! We have rescued the heroic crew, who were trapped in a time loop since the battle. A truly historic rescue for Starfleet.', weight: 5 },
            { type: 'reward', resource: 'weapons', amount: 25, log: 'We couldn\'t save the ship, but we managed to download its final battle logs. The tactical data on Borg weaponry allows us to upgrade our weapon systems.', weight: 10 }
          ],
          failure: [
            { type: 'damage', resource: 'morale', amount: 5, log: 'The inverse pulse destabilizes the echo entirely. The Defiant vanishes from our sensors for the last time. We had a chance to save them, and we failed.', weight: 10 },
            { type: 'damage', resource: 'dilithium', amount: 1, log: 'The chroniton pulse creates a temporal feedback loop that prematurely ages one of our dilithium crystals, rendering it inert.', weight: 3 }
          ]
        }
      },
      {
        role: 'Science',
        text: "Use the transporter to beam a temporal beacon aboard the Defiant during one of its phased appearances.",
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [
            { type: 'reward', resource: 'shields', amount: 20, log: 'The beacon attaches successfully. The data it returns on quantum mechanics is invaluable and allows us to reinforce our shield emitters.', weight: 10 },
            { type: 'reward', resource: 'morale', amount: 15, log: 'During a moment of stability, we managed to get a transporter lock on a single life sign. We have rescued a survivor from the Battle of Sector 001! Their story is incredible.', weight: 3 }
          ],
          failure: [
            { type: 'nothing', log: 'The transporter lock fails to hold through the quantum flux. The beacon materializes in empty space, and the opportunity is lost.', weight: 10 },
            { type: 'damage', resource: 'transporter', amount: 25, log: 'The quantum flux feeds back through the transporter beam during the attempt, severely damaging the pattern buffer.', weight: 5 }
          ]
        }
      }
    ]
  },
  {
    id: 'am40',
    title: 'The Silence',
    planetClasses: ['D'],
    description: "This desolate rock is emitting a powerful subspace dampening field, creating a 'cone of silence' that blocks all long-range communications in this sector. At its center is a massive alien device of unknown origin.",
    options: [
      {
        role: 'Security',
        text: "The device is a tactical liability. Destroy it with a targeted torpedo strike from orbit.",
        successChanceRange: [0.8, 0.95],
        outcomes: {
          success: [
            { type: 'nothing', log: 'The torpedo strikes true. The alien device is vaporized, and the subspace dampening field collapses. The sector is clear.', weight: 10 }
          ],
          failure: [
            { type: 'damage', resource: 'hull', amount: 15, log: 'The device possesses an automated point-defense system. It shoots down the torpedo and retaliates with a powerful energy pulse, damaging our hull before we can destroy it with a second volley.', weight: 10 }
          ]
        }
      },
      {
        role: 'Engineering',
        text: "Send an engineering team to overload the device's power source from within. It should disable it without a massive explosion.",
        successChanceRange: [0.6, 0.8],
        outcomes: {
          success: [
            { type: 'nothing', log: 'The team successfully bypasses the external systems and triggers a controlled power overload. The device goes dark, and the field dissipates.', weight: 10 },
            { type: 'reward', resource: 'energy', amount: 100, log: 'The device is not a weapon, but a massive capacitor. The team safely drains its stored power, completely recharging our reserve batteries!', weight: 3 }
          ],
          failure: [
            { type: 'damage', resource: 'hull', amount: 20, log: 'The overload is more powerful than expected. The device explodes violently, and the Endeavour is struck by high-velocity shrapnel.', weight: 10 },
            { type: 'damage', resource: 'security_teams', amount: 1, log: 'The device\'s internal systems contain a lethal electrical discharge trap. An engineer on the away team is killed instantly.', weight: 2 }
          ]
        }
      }
    ]
  }
];