import type { AwayMissionRole, OfficerPersonality } from '../../../types';

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
