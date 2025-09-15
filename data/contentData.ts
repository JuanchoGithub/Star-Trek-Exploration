import type { AwayMissionTemplate, AwayMissionRole, OfficerPersonality } from '../types';

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
];

export const hailResponses: Record<string, Record<string, string>> = {
  Independent: {
    greeting: "This is the trader vessel 'Stardust'. State your intentions.",
    threatened: "We're just simple traders, we don't want any trouble!",
    destroyed: "You'll pay for this, Federation!",
  },
  Klingon: {
    greeting: "You are foolish to approach a Klingon vessel! Prepare to die with honor!",
    threatened: "A coward's tactic! Face us in glorious combat!",
    destroyed: "Today is a good day to die!",
  },
  Romulan: {
    greeting: "You have entered Romulan space. Identify yourself or be destroyed.",
    threatened: "Your aggression is noted, Federation. The Star Empire will not forget this.",
    destroyed: "For the glory of the Empire!",
  },
  Pirate: {
    greeting: "Heh, a Federation prize. Drop your shields and prepare to be boarded. We'll make this quick.",
    threatened: "So, you want a fight? Fine by us! More scrap to sell!",
    destroyed: "Argh, you haven't seen the last of us!",
  }
};

export const counselAdvice: Record<AwayMissionRole, Partial<Record<OfficerPersonality, string[]>>> = {
  Science: {
    Cautious: [
      "Captain, I advise a preliminary long-range scan. Rushing in could expose us to unknown environmental hazards.",
      "A cautious approach is warranted. Let's gather more data from orbit before committing the team.",
    ],
    Logical: [
      "The most logical course of action is to collect atmospheric and geological data before committing the team.",
      "Probability suggests a direct approach carries unnecessary risk. Let's analyze the anomaly from a safe distance first.",
    ],
    Aggressive: [
      "Standard scans are a waste of time. We need to get down there and analyze the source directly to get any real data.",
      "The fastest way to understand this is to be on-site. Let's go.",
    ]
  },
  Security: {
    Cautious: [
      "I recommend a full perimeter sweep before the science team beams down. Let's not walk into an ambush.",
      "My team should establish a secure landing zone first. The safety of the crew is paramount.",
    ],
    Logical: [
      "A systematic approach is best. My team can provide tactical support and cover for the science specialists.",
      "Threat assessment is inconclusive from orbit. A small reconnaissance team should be our first move.",
    ],
    Aggressive: [
      "Send my team in first, phasers on stun. We'll neutralize any potential threats before they become a problem.",
      "A show of force is the best way to ensure there are no surprises. Let's go in ready for a fight.",
    ]
  },
  Engineering: {
    Cautious: [
      "Let's be careful down there. The energy readings could interfere with our equipment. I suggest running a full diagnostic first.",
      "I can rig a remote probe to test the environment. Better to lose a drone than a crew member.",
    ],
    Logical: [
      "The equipment should be calibrated for the specific energy frequencies we're seeing. It will provide more accurate readings.",
      "Based on the readings, I recommend taking modified tricorders that are shielded against this type of interference.",
    ],
    Aggressive: [
      "The best way to see what this energy does to our gear is to expose it. Let's get down there and see what happens.",
      "I can probably re-route the energy field if I can get direct access to the source. It's risky, but it's the fastest solution.",
    ]
  },
  Medical: {
      Cautious: ["I advise the away team takes extra medical supplies. We don't know what we're walking into."],
      Logical: ["Planetary scans show no airborne pathogens, but contact precautions are always logical."]
  },
  Counselor: {
      Cautious: ["Captain, an unknown planet can cause anxiety. Remind the team to rely on their training."],
      Logical: ["First contact situations require careful psychological assessment. We must be prepared for anything."]
  },
};