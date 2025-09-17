import type { AwayMissionTemplate } from '../../../types';

export const awayMissionTemplates: AwayMissionTemplate[] = [
  {
    id: 'am01',
    title: 'Strange Energy Readings',
    planetType: 'M-Class',
    description: 'The planet is showing unusual energy fluctuations from a cave system. Standard procedure dictates an investigation.',
    options: [
      {
        role: 'Science',
        text: 'Lead with a science officer to analyze the energy source with tricorders.',
        successChance: 0.8,
        outcomes: {
          success: 'The science team identifies the energy source as a stable, dormant crystalline lifeform. A valuable discovery!',
          failure: 'The energy fluctuates wildly, disabling the tricorders and causing minor injuries to the team. They retreat.',
        },
      },
      {
        role: 'Security',
        text: 'Send a security team first to secure the area before scientific analysis.',
        successChance: 0.6,
        outcomes: {
          success: 'The security team secures the cave, finding it empty of hostiles. The science team can proceed safely.',
          failure: 'The team triggers a geological instability, causing a rockfall that blocks the energy source. The mission is a wash.',
        },
      },
      {
        role: 'Engineering',
        text: 'An engineering specialist could rig a device to safely tap and analyze the energy from a distance.',
        successChance: 0.7,
        outcomes: {
          success: 'The engineer successfully modulates the energy field, gathering all necessary data without risk. A textbook operation.',
          failure: 'The device overloads, shorting out and creating a feedback loop that makes the energy source inert. A missed opportunity.',
        },
      },
    ],
  },
  {
    id: 'am_derelict01',
    title: 'Investigate Derelict',
    planetType: 'Derelict Ship',
    description: 'The away team has beamed aboard the silent vessel. The corridors are dark, with emergency lighting flickering. The mission is to find the ship\'s log and determine what happened.',
    options: [
      {
        role: 'Engineering',
        text: 'Have the engineer try to restore main power from the nearest console.',
        successChance: 0.7,
        outcomes: {
          success: 'Success! The engineer reroutes auxiliary power, lighting up the ship and revealing the bridge. The log is easily accessible. The freighter suffered a critical engine failure.',
          failure: 'The attempt causes a power surge, frying multiple systems and starting an electrical fire. The team must evacuate immediately, mission failed.',
        },
      },
      {
        role: 'Security',
        text: 'Order a tactical sweep of the ship, section by section, to ensure there are no surprises.',
        successChance: 0.8,
        outcomes: {
          success: 'The security team moves methodically, securing the ship. They find the crew was killed by a now-inert alien parasite. The log is recovered.',
          failure: 'The team is ambushed by automated defense turrets! They take damage and are forced to retreat before reaching the bridge.',
        },
      },
    ],
  },
  {
    id: 'am02',
    title: 'The Silent Observers',
    planetType: 'M-Class (Pre-Warp)',
    description: "Scans reveal a pre-warp civilization on this M-Class planet facing a natural disaster - a series of volcanic eruptions. We are bound by the Prime Directive, but there may be a way to help without revealing ourselves.",
    options: [
        {
            role: 'Science',
            text: 'Anonymously beam a data packet of the geological data to their most advanced scientific institution.',
            successChance: 0.75,
            outcomes: {
                success: 'The local scientists, though puzzled by the data\'s origin, confirm its accuracy and issue an evacuation warning, saving thousands.',
                failure: 'The civilization dismisses the data as a hoax or anomaly, and the disaster unfolds as predicted. A difficult lesson in non-interference.'
            }
        },
        {
            role: 'Engineering',
            text: 'Use the ship\'s tractor beam on a micro-setting to subtly reinforce the tectonic plates in the most vulnerable region.',
            successChance: 0.65,
            outcomes: {
                success: 'The delicate procedure is a success! The worst of the eruptions are quelled, mitigating the disaster without detection.',
                failure: 'The interference has unforeseen consequences, triggering a series of earthquakes in a populated area. We have made things worse.'
            }
        },
        {
            role: 'Security',
            text: 'Send a covert team to sabotage their primitive seismology equipment, forcing an evacuation of the danger zones.',
            successChance: 0.6,
            outcomes: {
                success: 'The team performs flawlessly. The locals, believing their own equipment is faulty, evacuate the area as a precaution.',
                failure: 'A team member is spotted. We extract them safely, but we have contaminated their culture with knowledge of alien life.'
            }
        }
    ]
  },
  {
    id: 'am03',
    title: 'Outpost in the Storm',
    planetType: 'L-Class (Volcanic)',
    description: "A Federation science outpost on a geologically active L-Class planet has gone silent. Their last message spoke of structural integrity failure. We must rescue any survivors.",
    options: [
        {
            role: 'Engineering',
            text: 'Beam an engineering team to the power core. If they can stabilize it, they can restore shields and life support.',
            successChance: 0.7,
            outcomes: {
                success: 'Power is restored just as the primary containment fails! The shields hold, buying enough time for a full and safe evacuation.',
                failure: 'The core was too unstable. The attempt causes an overload that accelerates the outpost\'s destruction. There are casualties.'
            }
        },
        {
            role: 'Security',
            text: 'Clear an exfiltration zone. The outpost is surrounded by crystalline predators attracted by energy discharges.',
            successChance: 0.8,
            outcomes: {
                success: 'The security team carves out a safe perimeter, holding off the creatures while the surviving science staff are beamed away.',
                failure: 'The creatures are unexpectedly tough. The team is overwhelmed and pinned down, forcing a much riskier and more dangerous rescue.'
            }
        },
        {
            role: 'Science',
            text: 'Find a calm window in the planet\'s magnetosphere for a safe, wide-field transport of all survivors at once.',
            successChance: 0.6,
            outcomes: {
                success: 'The science officer\'s calculations are perfect. A stable window is found, allowing for a quick, mass evacuation with no injuries.',
                failure: 'The prediction is wrong. The transport beam scatters, causing severe transporter psychosis among the survivors.'
            }
        }
    ]
  },
  {
    id: 'am04',
    title: 'The Tomb of the Architects',
    planetType: 'D-Class (Ruin)',
    description: "Long-range scans have found what appears to be an artificially constructed monolith on a barren D-Class world. This could be a relic from a long-extinct, highly advanced civilization.",
    options: [
      {
        role: 'Science',
        text: 'Interface with the monolith to translate the alien language and data streams.',
        successChance: 0.7,
        outcomes: {
          success: 'The monolith reveals a treasure trove of astronomical data, including the location of a rare resource-rich nebula.',
          failure: 'The interface triggers a data cascade, wiping the monolith\'s memory banks permanently. The knowledge of this race is lost forever.',
        },
      },
      {
        role: 'Engineering',
        text: 'Disable the complex energy field protecting the monolith by re-routing its power source.',
        successChance: 0.8,
        outcomes: {
          success: 'The field is disabled flawlessly, allowing full access to the structure and the intact computer core within.',
          failure: 'A feedback loop vaporizes the monolith\'s internal components. The structure is now just an empty shell.',
        },
      },
      {
        role: 'Security',
        text: 'Perform a tactical sweep and probe for automated defenses before anyone approaches.',
        successChance: 0.9,
        outcomes: {
          success: 'The team discovers and disables ancient, but still functional, automated plasma turrets hidden in the rock.',
          failure: 'The team walks directly into a sophisticated stasis field, freezing them in time until a rescue can be mounted.',
        },
      },
    ],
  },
  {
    id: 'am05',
    title: 'The Crimson Plague',
    planetType: 'M-Class (Colony)',
    description: "A Federation colony is being ravaged by an unknown, fast-spreading plague. Medical facilities are overwhelmed. We need to help them contain the outbreak and find a cure.",
    options: [
      {
        role: 'Science',
        text: 'Take samples to the ship\'s medical bay to synthesize an anti-viral agent.',
        successChance: 0.6,
        outcomes: {
          success: 'A cure is synthesized after hours of tireless work. It is distributed and the colony is saved.',
          failure: 'The virus mutates faster than the science team can analyze it. The initial research is useless, and the crisis deepens.',
        },
      },
      {
        role: 'Engineering',
        text: 'Repair the colony\'s failing atmospheric processors and containment fields to enforce a planet-wide quarantine.',
        successChance: 0.8,
        outcomes: {
          success: 'The systems are repaired and reinforced, completely halting the airborne spread of the virus.',
          failure: 'The systems suffer a catastrophic failure during the repairs, venting the virus into the upper atmosphere and making the situation much worse.',
        },
      },
      {
        role: 'Security',
        text: 'Help local authorities restore order. Panic is spreading and colonists are trying to break the quarantine.',
        successChance: 0.7,
        outcomes: {
          success: 'Using non-lethal methods, the security team restores order, allowing medical teams to work effectively.',
          failure: 'The attempt to restore order is met with force. A riot breaks out, and the away team is forced to retreat.',
        },
      },
    ],
  },
  {
    id: 'am06',
    title: 'Oracle of the Primitives',
    planetType: 'M-Class (Primitive)',
    description: "A primitive, bronze-age culture on this planet worships a 'sky god' that resides in a mountain temple. Our scans show the 'god' is actually an ancient, powerful computer system.",
    options: [
      {
        role: 'Engineering',
        text: 'Infiltrate the \'temple\' and shut down the computer\'s power source, freeing the populace from its influence.',
        successChance: 0.7,
        outcomes: {
          success: 'The computer is deactivated without the locals ever knowing of your presence. Their society is now free to develop on its own.',
          failure: 'The computer detects the intrusion and turns the populace against the "demons from the sky." The team is run out of the temple.',
        },
      },
      {
        role: 'Science',
        text: 'Attempt to establish a dialogue with the AI. It may be reasoned with.',
        successChance: 0.6,
        outcomes: {
          success: 'The AI is lonely. It agrees to a new role as a silent guardian, ceasing its direct interference in exchange for occasional conversation.',
          failure: 'The AI interprets your hails as a threat and uses its control over the environment to attack the away team with localized weather phenomena.',
        },
      },
      {
        role: 'Security',
        text: 'Create a diversion, using phasers to create \'natural\' phenomena to draw the AI\'s attention.',
        successChance: 0.8,
        outcomes: {
          success: 'The diversion works perfectly. The AI focuses its sensors on a distant, sudden canyon formation, giving another team time to access its core.',
          failure: 'The AI is far too advanced to be fooled and perceives your actions as a direct and rather insulting attack.',
        },
      },
    ],
  },
  {
    id: 'am07',
    title: 'The Neutrino Asteroid',
    planetType: 'D-Class (Asteroid)',
    description: "This asteroid is rich in Topaline, a rare mineral needed for our warp core injectors. Standard mining is impossible due to high-level neutrino emissions that interfere with sensors.",
    options: [
      {
        role: 'Science',
        text: 'Modify a tricorder to triangulate the Topaline deposits by tracking the neutrino sources directly.',
        successChance: 0.7,
        outcomes: {
          success: 'The team pinpoints a massive, pure vein of Topaline, allowing for a highly efficient mining operation.',
          failure: 'The tricorder is overloaded by the radiation, giving false readings that lead the mining team on a wild goose chase.',
        },
      },
      {
        role: 'Engineering',
        text: 'Construct a specialized \'neutrino dampener\' to clear a safe corridor for the transporters.',
        successChance: 0.6,
        outcomes: {
          success: 'The device works perfectly, creating a stable pocket in the radiation and allowing for safe and efficient mining of the mineral.',
          failure: 'The dampener creates a harmonic frequency that destabilizes the asteroid, causing dangerous quakes and damaging the ship\'s shields.',
        },
      },
      {
        role: 'Security',
        text: 'Use patterned micro-explosives to crack the asteroid open and expose the minerals inside.',
        successChance: 0.8,
        outcomes: {
          success: 'The controlled demolition perfectly exposes the Topaline with minimal risk. A textbook operation.',
          failure: 'The explosion is larger than expected, sending a deadly shower of shrapnel towards the ship, causing hull damage.',
        },
      },
    ],
  },
  {
    id: 'am08',
    title: 'The Ghost Ship',
    planetType: 'Derelict Ship (Federation)',
    description: "We've found a Federation ship, the USS Chimera, adrift and silent. It was reported missing over 5 years ago. There are faint, non-human life signs aboard.",
    options: [
      {
        role: 'Security',
        text: 'Board with a heavily-armed security team. We don\'t know what we\'re dealing with.',
        successChance: 0.85,
        outcomes: {
          success: 'The team discovers the ship is infested with non-sentient space scavengers and eliminates them, securing the vessel and its logs.',
          failure: 'The lifeforms are unexpectedly dangerous, possessing natural armor. The team takes injuries and is forced to retreat.',
        },
      },
      {
        role: 'Science',
        text: 'Lead with a science team. The life signs are unusual and could be sentient. Attempt a non-hostile first contact.',
        successChance: 0.5,
        outcomes: {
          success: 'The life forms are sentient refugees who took over the ship after the crew died. A peaceful solution is found and they are relocated.',
          failure: 'The attempt at peaceful communication is seen as a weakness. The aliens attack the unprepared science team.',
        },
      },
      {
        role: 'Engineering',
        text: 'Try to restore the ship\'s logs from a remote engineering console before beaming anyone aboard.',
        successChance: 0.6,
        outcomes: {
          success: 'The log is recovered. The crew died from a radiation leak from an experimental drive. The life signs are just hardy space microbes.',
          failure: 'Accessing the logs triggers a pre-set quarantine protocol, activating the auto-destruct sequence! We must leave immediately.',
        },
      },
    ],
  },
  {
    id: 'am09',
    title: 'The Crystal Desert',
    planetType: 'L-Class (Crystalline)',
    description: "This planet's ecosystem appears to be entirely silicon-based. Massive, stationary crystalline structures dot the landscape, humming with a strange energy.",
    options: [
      {
        role: 'Science',
        text: 'Analyze the crystal resonance. It might be a form of communication or a sign of sentience.',
        successChance: 0.7,
        outcomes: {
          success: 'The officer discovers the entire planet is a single, dormant consciousness and gathers invaluable data on non-biological life.',
          failure: 'The tricorder\'s frequency causes a chain reaction, shattering a nearby crystal and releasing a dangerous, high-frequency energy pulse.',
        },
      },
      {
        role: 'Engineering',
        text: 'Set up a device to safely tap the energy humming from the crystals for analysis.',
        successChance: 0.6,
        outcomes: {
          success: 'The engineer safely channels the energy, revealing it has properties that can slightly improve our warp efficiency.',
          failure: 'The tapping device creates a feedback loop. The crystals begin to grow uncontrollably, threatening the landing zone.',
        },
      },
      {
        role: 'Security',
        text: 'Take samples by force, using a low-power phaser drill to extract a core sample.',
        successChance: 0.8,
        outcomes: {
          success: 'The sample is secured without incident, allowing for safe study of this unique geology back on the ship.',
          failure: 'The drilling is perceived as an attack. The crystals retaliate by firing focused energy beams at the away team.',
        },
      },
    ],
  },
  {
    id: 'am10',
    title: 'Ripples in Spacetime',
    planetType: 'Anomaly (Wormhole)',
    description: "A nearby planet is being bombarded by temporal distortions from a decaying, unstable wormhole in orbit. We need to collapse it before it tears the planet apart.",
    options: [
      {
        role: 'Engineering',
        text: 'Modify a photon torpedo with a chroniton warhead. Firing it into the anomaly could seal the rift.',
        successChance: 0.7,
        outcomes: {
          success: 'The torpedo detonates at the exact right moment, collapsing the wormhole safely. The planet is saved.',
          failure: 'The torpedo destabilizes the wormhole further, causing a massive time-distortion wave to hit the ship, aging all systems and causing damage.',
        },
      },
      {
        role: 'Science',
        text: 'Pilot a probe into the wormhole to find a natural decay frequency we can amplify from the ship\'s deflector dish.',
        successChance: 0.6,
        outcomes: {
          success: 'A precise frequency is found. The deflector dish emits a pulse that safely dissipates the wormhole.',
          failure: 'The probe is lost and the wormhole unexpectedly shifts, nearly trapping the ship in its gravitational field.',
        },
      },
      {
        role: 'Security',
        text: 'Take a shuttlepod to the edge of the anomaly to scan for any technology controlling it.',
        successChance: 0.5,
        outcomes: {
          success: 'Incredibly, they find an ancient alien device holding the wormhole open. They are able to disable it.',
          failure: 'The shuttle is hit by a temporal wave, aging its systems by 50 years in an instant and forcing an emergency retreat.',
        },
      },
    ],
  },
  {
    id: 'am11',
    title: 'The Gardeners',
    planetType: 'M-Class (First Contact)',
    description: "We've encountered a sentient, peaceful, plant-based species. They communicate through modulated light pulses. This is a delicate first contact situation.",
    options: [
      {
        role: 'Science',
        text: 'Use a universal translator modified for optical data to try and establish a rudimentary dialogue.',
        successChance: 0.7,
        outcomes: {
          success: 'A basic but friendly communication is established. A cultural exchange begins, and they share valuable botanical knowledge.',
          failure: 'The translator\'s light patterns are accidentally interpreted as a challenge, deeply offending the aliens and making them hostile.',
        },
      },
      {
        role: 'Engineering',
        text: 'Construct a simple water purification system for the aliens, demonstrating Federation technology as a helpful tool.',
        successChance: 0.8,
        outcomes: {
          success: 'The gift is accepted with great ceremony, cementing a positive relationship and an offer of alliance.',
          failure: 'The aliens view the technology as a corrupting, unnatural influence and demand you leave their world at once.',
        },
      },
      {
        role: 'Security',
        text: 'Establish a formal, demilitarized meeting zone to show respect and discipline.',
        successChance: 0.6,
        outcomes: {
          success: 'The aliens appreciate the formality and see you as trustworthy equals, opening the door for further diplomatic talks.',
          failure: 'The rigid formality is seen as cold and intimidating, making the aliens wary and unwilling to communicate.',
        },
      },
    ],
  }
];
