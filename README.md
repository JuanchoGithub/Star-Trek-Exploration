# Star Trek: Vibe Exploration

A browser-based, turn-based game where you captain a Federation starship. Explore the galaxy, manage your ship and crew, and navigate complex diplomatic and combat encounters. Based on the provided game design document.

## Key Features

*   **Deep, Turn-Based Tactical Combat:** Manage energy allocation, target enemy subsystems, and utilize a variety of weapon systems.
*   **Dynamic Galaxy Exploration:** Navigate a procedurally generated quadrant map, with each sector offering unique challenges and opportunities based on its location and factional control.
*   **Rich Thematic Experience:** Choose from multiple UI themes (Federation, Klingon, Romulan) that alter the entire visual and auditory experience.
*   **Complex Ship Management:** Monitor your ship's hull, shields, energy, and the health of over eight critical subsystems. Make tough decisions about repairs and resource allocation.
*   **Narrative Events & Away Missions:** Encounter derelict ships, answer distress calls, and send away teams to investigate strange new worlds, with outcomes determined by your choices and your officers' skills.
*   **Advanced AI:** Face off against distinct faction AIs with unique doctrines, from the honorable but aggressive Klingons to the cunning and cautious Romulans.
*   **Scenario Simulator & Battle Replayer:** Test your skills and analyze your strategies with a powerful wargaming tool that lets you design, observe, and review any combat scenario.

---

# Starfleet Player's Manual

## Introduction

*Issued to Captain, U.S.S. Endeavour, Stardate 47458.2*

### Historical Primer: The Rise of the Federation

The story of the United Federation of Planets is one of optimism born from ashes. In the mid-21st century, Earth was devastated by World War III, a conflict that saw the planet's great powers annihilate one another. From this chaos, a unified global government emerged, focused on rebuilding and renouncing the petty nationalisms of the past. The turning point in human history came on April 5, 2063, when Zefram Cochrane's successful warp flight from Bozeman, Montana, attracted the attention of a passing Vulcan survey ship. This "First Contact" ended humanity's isolation and ushered in an era of unprecedented technological and cultural growth.

Over the next century, humanity, with Vulcan guidance, reached for the stars, forming alliances with species like the Andorians and Tellarites. These relationships, though often strained by cultural differences—the Vulcan's logic clashing with Andorian passion and Tellarite obstinance—formed the nucleus of a revolutionary idea: a multispecies, democratic union dedicated to peace, diplomacy, and exploration. In 2161, this vision was formalized with the signing of the Federation Charter on Earth.

### A History of Conflict

The Federation's history has not been without its trials. The Earth-Romulan War of the 2150s was a brutal, anonymous conflict fought with primitive nuclear weapons and early warp ships. Fought before the age of ship-to-ship visual communication, no human ever saw a Romulan, and vice versa. It was a war against a ghost, concluding with the establishment of the Neutral Zone via subspace radio—a peace treaty between unseen enemies that would define galactic politics for a century.

A century later, tensions with the Klingon Empire led to decades of cold war, punctuated by bloody battles and fragile peace treaties brokered at Organia and Khitomer. The Klingons, a warrior race driven by a code of honor, saw the Federation's expansion as a threat to their way of life. It was only after the Praxis disaster, which threatened their homeworld's very survival, that true peace became possible, leading to a hard-won, and often tested, alliance.

More recently, the entire Alpha Quadrant was reshaped by the Dominion War (2373-2375). This devastating conflict against the Gamma Quadrant's Dominion—a ruthless empire led by the shapeshifting Founders—allied with the Cardassian Union and the Breen, cost billions of lives and saw Starfleet suffer its most grievous losses. The fleet has been rebuilt, but the memory of the Borg attack at Wolf 359 and the fall of Betazed serves as a constant reminder of the price of freedom. The Federation emerged victorious, but only through a desperate, quadrant-spanning alliance with our old enemies, the Klingons and the Romulans. The scars of that war run deep.

### Major Powers in the Expanse

Your mission takes you to a region where the Federation's ideals will be tested against the ambitions of old rivals and new threats. The post-war landscape is a fragile one.

*   **The Klingon Empire:** Currently led by Chancellor Martok, a commoner who rose through the ranks to become a hero of the Dominion War, the Empire is enjoying a resurgence of traditional values. The decadence of the old houses is being swept away in favor of true honor. They are our allies, but it is an alliance born of shared sacrifice, not shared values. Klingon captains are driven by a desire for glorious battle and will test any perceived weakness. They respect strength above all else.
*   **The Romulan Star Empire:** Following their participation in the Dominion War and a recent, destabilizing internal coup, the Romulans have retreated into their customary isolationism. Their internal politics are a mystery, but the Tal Shiar, their intelligence agency, is undoubtedly active, more paranoid than ever. Romulan vessels operate with stealth and cunning, viewing outsiders with deep suspicion and striking from the shadows. They see conspiracy in every corner and opportunity in every crisis.
*   **The Orion Syndicate & Other Raiders:** The political instability following the war has created a power vacuum that criminal organizations like the Orion Syndicate have been eager to fill. These pirates are motivated by profit and operate without a code of honor, preying on the weak and undefended. Their ships are often heavily modified civilian freighters or stolen military craft, making them unpredictable and dangerous.

### Letter from the Admiralty

Captain,

Welcome to the Typhon Expanse. Your mission is threefold: to explore this uncharted and volatile region of space, to extend the hand of diplomacy to any new life you may encounter, and to defend the Federation from those who would see it fall. The Expanse is home to Klingon patrols, Romulan spies, and lawless pirates. It is a tinderbox waiting for a spark.

The U.S.S. Endeavour is one of the finest ships in the fleet, but she is only as good as her crew. Your command decisions will determine the success or failure of this five-year mission. This manual contains all the tactical and operational data you will need to command your vessel effectively. Study it. The lives of your crew depend on it.

**Admiral J. P. Hanson**
*Starfleet Command*

## The Bridge Interface

Your command interface is divided into two primary columns and a status line at the bottom.

### Left Column: Viewscreen & Operations

This area contains your view of the current sector and your primary command console.

**1. The Viewscreen**
Displays either the current **Sector View** or the strategic **Quadrant Map**. You can switch between them using the vertical tabs.

*   **Sector View:** A tactical grid of the current sector. Click on an empty square to set a navigation target (marked with a yellow crosshair). Click on an entity like a ship (blue icon) or planet (green icon) to select it. Successfully captured ships will be displayed with a friendly blue icon.
*   **Quadrant Map:** A strategic overview of the entire Typhon Expanse. Green quadrants are Federation-controlled, Red are Klingon, etc. Click on an adjacent sector to open a context menu to Warp or Scan.

**2. Player HUD**
This section is divided into the Target Information panel and the Command Console.

*   **Target Info:** Displays a wireframe and vital statistics (Hull, Shields, Subsystems) for your currently selected target. You must scan unscanned ships to see their details.
*   **Command Console:** Contains all your primary actions for the turn: Fire Phasers, Launch Torpedoes, Scan, Hail, Retreat, and special actions like Boarding.

### Right Column: Ship Systems Status

This column gives you a detailed, real-time overview of the U.S.S. Endeavour's status.

**1. Primary Status Bars**
*   **Hull:** Your ship's structural integrity. If this reaches zero, the Endeavour is destroyed.
*   **Shields:** Your main defense. Only active during Red Alert. Regenerates each turn based on power to shields.
*   **Reserve Power:** Used for combat actions and system upkeep during Red Alert. Recharges when not in combat.
*   **Dilithium:** A critical resource used for warping between quadrants and as an emergency power backup.

**2. Tactical Toggles**
*   **Red Alert:** Raises shields for combat. Drains reserve power each turn.
*   **Evasive:** Increases chance to evade attacks but costs more power. Requires Red Alert.
*   **Damage Control:** Assign your engineering crew to slowly repair the Hull or a specific subsystem. This consumes power each turn.

**3. Energy Allocation**
Perhaps the most critical system. Distribute 100% of your main reactor's power between Weapons, Shields, and Engines. This directly impacts phaser damage, shield regeneration rate, and a passive evasion bonus.

## Entity Registry

A registry of all known vessels, planets, and anomalies identified by Starfleet in the Typhon Expanse.

### Federation

#### Sovereign-class
*   **Role:** Dreadnought
*   **Hull Integrity:** Extreme (450)
*   **Shield Capacity:** Very Strong (120)
*   **Weapon Power:** Extreme
*   **Energy Reserves:** 200
*   **Dilithium Stores:** 20
*   **Cloaking Device:** No
*   **Torpedoes:** 20 (Quantum)
*   **Shuttlebay:** 6 craft
*   **Special Notes:** Equipped with Quantum Torpedoes and a high-capacity shuttlebay for extensive away missions.

#### Constitution-class
*   **Role:** Cruiser
*   **Hull Integrity:** Strong (300)
*   **Shield Capacity:** Strong (100)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 175
*   **Dilithium Stores:** 18
*   **Cloaking Device:** No
*   **Torpedoes:** 10 (Photon)
*   **Shuttlebay:** 4 craft
*   **Special Notes:** A true multi-role vessel, capable in almost any situation.

#### Galaxy-class
*   **Role:** Explorer
*   **Hull Integrity:** Very Strong (400)
*   **Shield Capacity:** Very Strong (120)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 191
*   **Dilithium Stores:** 19
*   **Cloaking Device:** No
*   **Torpedoes:** 12 (Photon)
*   **Shuttlebay:** 8 craft
*   **Special Notes:** Can perform saucer separation in extreme emergencies, though this feature is not implemented in this simulation.

#### Intrepid-class
*   **Role:** Scout
*   **Hull Integrity:** Light (200)
*   **Shield Capacity:** Medium (80)
*   **Weapon Power:** Light
*   **Energy Reserves:** 149
*   **Dilithium Stores:** 15
*   **Cloaking Device:** No
*   **Torpedoes:** 6 (Photon)
*   **Shuttlebay:** 2 craft
*   **Special Notes:** Equipped with bio-neural gel packs for enhanced performance, but lacks heavy armor.

#### Defiant-class
*   **Role:** Escort
*   **Hull Integrity:** Medium (250)
*   **Shield Capacity:** Strong (100)
*   **Weapon Power:** Extreme
*   **Energy Reserves:** 162
*   **Dilithium Stores:** 16
*   **Cloaking Device:** Yes
*   **Torpedoes:** 8 (Quantum)
*   **Shuttlebay:** 1 craft
*   **Special Notes:** Possesses a rare, treaty-permitted cloaking device, making it an excellent anti-cloak platform. Use in non-Federation space may cause diplomatic incidents.

### Klingon Empire

#### B'rel-class Bird-of-Prey
*   **Role:** Escort
*   **Hull Integrity:** Light (150)
*   **Shield Capacity:** Light (50)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 135
*   **Dilithium Stores:** 13
*   **Cloaking Device:** Yes
*   **Torpedoes:** 6 (Photon)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Vulnerable if its cloak is penetrated or if it is caught in a sustained fight.

#### K't'inga-class
*   **Role:** Cruiser
*   **Hull Integrity:** Strong (300)
*   **Shield Capacity:** Medium (80)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 168
*   **Dilithium Stores:** 17
*   **Cloaking Device:** No
*   **Torpedoes:** 10 (Photon)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Relies on brute force and heavy forward disruptor cannons.

#### Vor'cha-class
*   **Role:** Attack Cruiser
*   **Hull Integrity:** Strong (350)
*   **Shield Capacity:** Strong (100)
*   **Weapon Power:** Very Strong
*   **Energy Reserves:** 180
*   **Dilithium Stores:** 18
*   **Cloaking Device:** No
*   **Torpedoes:** 12 (Photon)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Often serves as a command ship for smaller battle groups.

#### Negh'Var-class
*   **Role:** Battleship
*   **Hull Integrity:** Extreme (500)
*   **Shield Capacity:** Very Strong (120)
*   **Weapon Power:** Extreme
*   **Energy Reserves:** 209
*   **Dilithium Stores:** 21
*   **Cloaking Device:** No
*   **Torpedoes:** 18 (Heavy Photon)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Lacks a cloaking device, announcing its formidable presence to all in the sector.

### Romulan Star Empire

#### D'deridex-class
*   **Role:** Warbird
*   **Hull Integrity:** Very Strong (400)
*   **Shield Capacity:** Strong (100)
*   **Weapon Power:** Extreme
*   **Energy Reserves:** 188
*   **Dilithium Stores:** 19
*   **Cloaking Device:** Yes
*   **Torpedoes:** 15 (Heavy Plasma)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Its primary weakness is its relatively slow speed and large target profile when decloaked.

#### Valdore-type
*   **Role:** Scout
*   **Hull Integrity:** Light (200)
*   **Shield Capacity:** Medium (80)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 149
*   **Dilithium Stores:** 15
*   **Cloaking Device:** Yes
*   **Torpedoes:** 8 (Plasma)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Often operates in pairs, a "Talon" of ships, to overwhelm targets.

#### Scimitar-class
*   **Role:** Command Ship
*   **Hull Integrity:** Extreme (450)
*   **Shield Capacity:** Very Strong (120)
*   **Weapon Power:** Extreme
*   **Energy Reserves:** 200
*   **Dilithium Stores:** 20
*   **Cloaking Device:** Yes
*   **Torpedoes:** 25 (Heavy Plasma)
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Complex power systems may cause a delay between decloaking and firing main weapons. Can fire while cloaked, a unique and deadly ability.

### Pirate & Independent

#### Orion Raider
*   **Role:** Raider
*   **Hull Integrity:** Light (180)
*   **Shield Capacity:** Light (50)
*   **Weapon Power:** Medium
*   **Energy Reserves:** 140
*   **Dilithium Stores:** 14
*   **Cloaking Device:** No
*   **Torpedoes:** 4 (Photon (Stolen))
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Often operates in packs and will flee if outmatched. Intelligence reports suggest a small number have been fitted with dangerously unstable cloaking devices.

#### Ferengi Marauder
*   **Role:** Marauder
*   **Hull Integrity:** Medium (250)
*   **Shield Capacity:** Medium (80)
*   **Weapon Power:** Strong
*   **Energy Reserves:** 158
*   **Dilithium Stores:** 16
*   **Cloaking Device:** No
*   **Torpedoes:** 8 (Photon)
*   **Shuttlebay:** 1 craft
*   **Special Notes:** Favors disabling attacks on engines to capture vessels intact for "salvage". May rarely be equipped with a jury-rigged cloaking system.

#### Nausicaan Battleship
*   **Role:** Battleship
*   **Hull Integrity:** Strong (350)
*   **Shield Capacity:** Strong (100)
*   **Weapon Power:** Very Strong
*   **Energy Reserves:** 180
*   **Dilithium Stores:** 18
*   **Cloaking Device:** No
*   **Torpedoes:** 12 (Heavy Photon (Modified))
*   **Shuttlebay:** 0 craft
*   **Special Notes:** Will press the attack relentlessly, even when heavily damaged. Has been sighted on rare occasions using a high-power, unstable cloaking field.

#### Civilian Freighter
*   **Role:** Freighter
*   **Hull Integrity:** Light (200)
*   **Shield Capacity:** Light (40)
*   **Weapon Power:** Light
*   **Energy Reserves:** 142
*   **Dilithium Stores:** 14
*   **Cloaking Device:** No
*   **Torpedoes:** 2 (None)
*   **Shuttlebay:** 1 craft
*   **Special Notes:** Generally not a threat, but may be carrying valuable cargo.

### Other Entities & Installations

*   **M-Class Planet:** A terrestrial, Earth-like world capable of supporting carbon-based life. Often home to civilizations or valuable biological resources. Prime candidates for away missions.
*   **J-Class Planet:** A massive gas giant, rich in various gases that may be valuable but unsuitable for standard away missions. Often has numerous moons.
*   **L-Class Planet:** A marginally habitable world with a thin atmosphere or extreme temperatures. Life may exist, but it is often primitive or highly adapted. Suitable for some away missions.
*   **D-Class Planet:** A barren rock or asteroid, devoid of atmosphere and life. May contain valuable mineral deposits but is otherwise unremarkable.
*   **Asteroid Field:** A dense field of rock and ice. While ships can enter these fields for tactical cover or to find shortcuts, they are hazardous environments. Ending a turn inside an asteroid field risks taking damage from micrometeoroid impacts.
*   **Event Beacon:** An unidentified signal source. Approaching these beacons can trigger unique events, ranging from derelict ships and distress calls to ancient alien artifacts.
*   **Shuttle:** Small, short-range auxiliary craft. Used for away missions on gas giants where transporters are ineffective, and as escape pods during emergencies. Lacks weapons or significant defenses.
*   **Photon Torpedo:** Standard Federation and Klingon antimatter warhead. It is heavily mitigated by shields but deals significant hull damage if they are down. Can be intercepted by point-defense phasers.
*   **Quantum Torpedo:** A highly advanced projectile utilizing a zero-point energy warhead. It is faster than standard torpedoes and a portion of its damage bypasses enemy shields. It is also significantly harder for point-defense systems to intercept.
*   **Plasma Torpedo:** The signature projectile of the Romulan Star Empire. It delivers a moderate initial impact followed by a lingering plasma 'burn' effect that damages the hull directly over several turns, bypassing shields entirely. It is relatively slow-moving.
*   **Heavy Plasma Torpedo:** A larger, more potent version of the standard plasma torpedo, typically found on capital ships like the D'deridex Warbird. It has a greater initial impact and a more severe plasma burn effect.
*   **Heavy Photon Torpedo:** A brute-force weapon favored by Klingon battleships. It is slow and easy to intercept, but delivers devastating damage if it connects with a depleted shield facing. It offers no special properties beyond sheer destructive power.

## Bridge Officer Dossiers

An overview of your senior staff. Their unique personalities and experience will shape the advice they provide during critical mission decisions.

#### Cmdr. T'Vok, Science Officer
*   **Service Record:** Graduate of the Vulcan Science Academy. Distinguished career in stellar cartography and xeno-biology. Served on the U.S.S. Intrepid before requesting a transfer to the Endeavour for its deep-space exploration profile.
*   **Psychological Profile:** Personality Type: Logical. Unflappable under pressure. Analyzes all situations based on available data and probability, often dismissing emotional or intuitive arguments.
*   **Operational Analysis:** Cmdr. T'Vok's counsel will always favor the most probable path to success with the least risk to scientific objectives. He will advocate for gathering more data before acting and will prioritize non-violent, analytical solutions.

#### Lt. Thorne, Chief of Security
*   **Service Record:** Decorated combat veteran of the Cardassian border skirmishes. Excelled in tactical operations and boarding actions. Known for a direct and sometimes confrontational command style.
*   **Psychological Profile:** Personality Type: Aggressive. Believes in overwhelming force as the most effective deterrent and solution. Prone to action over deliberation. Possesses a strong protective instinct for the crew.
*   **Operational Analysis:** Lt. Thorne's advice will almost always involve a direct, forceful approach. He will recommend pre-emptive strikes, security sweeps, and tactical solutions to mission objectives, viewing diplomatic or scientific approaches as secondary or inefficient.

#### Lt. Cmdr. Singh, Chief Engineer
*   **Service Record:** Rose through the ranks in Starfleet Engineering. Specialist in warp field dynamics and structural integrity. Served as Chief Engineer on a Miranda-class vessel before this assignment.
*   **Psychological Profile:** Personality Type: Cautious. Meticulous and risk-averse. Views every situation through the lens of equipment stress and potential system failure. 'Measure twice, cut once' is his mantra.
*   **Operational Analysis:** Lt. Cmdr. Singh will consistently recommend the path of least risk to the ship and its crew. He will advocate for using remote probes, reinforcing systems before an operation, and finding engineering-based solutions that avoid direct confrontation or unknown variables.

## Typhon Expanse Primer

**CLASSIFICATION: EYES ONLY - LEVEL 7 CLEARANCE**

The Typhon Expanse is a largely uncharted sector on the fringe of the Alpha and Beta Quadrants. For decades, exploration was deemed too hazardous due to unpredictable gravimetric distortions and plasma storms. However, recent long-range sensor data indicates these phenomena have begun to subside, opening a new frontier for exploration, colonization... and conflict.

### Strategic Map of the Region

*   **North-West:** Klingon Empire (Asserting Dominance)
*   **North-East:** Romulan Star Empire (Observing from Shadows)
*   **South-West:** Federation Space (Staging Ground)
*   **South-East:** Uncharted Space (Piracy & Anomalies)

### Major Power Analysis

*   **Klingon Empire:** Intelligence suggests the High Council views the newly-opened Expanse as a source of untapped resources and, more importantly, a new arena to test their warriors and prove the Empire's might. Expect patrols to be aggressive and honor-bound. They will view any Federation presence as a challenge to their dominance.
*   **Romulan Star Empire:** The Romulans are playing a quieter game. The Tal Shiar is undoubtedly active in the Expanse, operating from the shadows to gather intelligence on both Klingon and Federation activities. Their motives are unclear, but they likely seek technological advantages or strategic footholds. Romulan vessels will be elusive, preferring observation to open conflict, but are deadly when cornered.
*   **United Federation of Planets:** Starfleet's primary objective is peaceful exploration and scientific discovery. The establishment of Starbases on the fringe of the Expanse serves as a launching point for these missions. However, Command is not naive to the threats posed by the other powers. Your mission, Captain, is to be our eyes, our voice, and if necessary, our sword in this new frontier.

### Other Threats

*   **Orion Syndicate & Other Pirates:** The lawless nature of the Expanse has made it a haven for pirates, smugglers, and mercenaries, chief among them the Orion Syndicate. These groups are opportunistic and ruthless, preying on civilian transports and isolated outposts. They are a constant, unpredictable threat.

## Core Mechanics

### Turn Flow
The game is turn-based. In each turn, you can perform one or more actions (e.g., set a navigation course, target a subsystem, fire a weapon). When you are ready, press the "End Turn" button. The game will then resolve your actions, move NPCs, and process combat for that turn.

### Movement & Navigation
The U.S.S. Endeavour's impulse engines have two modes of operation:
*   **Cruise Speed (Green Alert):** When not in combat, the ship can move up to **three cells** per turn, allowing for rapid travel across sectors.
*   **Tactical Speed (Red Alert):** During combat, power is diverted to weapons and shields. Movement is reduced to **one cell** per turn to maximize maneuverability.
*   **Hazards:** Ending a turn inside an asteroid field cell risks taking damage from micrometeoroid impacts. Additionally, asteroid fields provide cover, reducing the accuracy of incoming phaser fire by 30%. However, they are a danger to projectiles; any torpedo traveling through an asteroid field cell has a 40% chance of being destroyed by a collision. Furthermore, asteroid fields act as sensor cover. A ship inside a field is only detectable within 4 hexes, and can only be targeted by weapons from 2 hexes or less.

### Energy Management
Your ship's power is a dynamic resource. Managing the balance between power generation and consumption is the key to victory.
*   **Power Generation:** Your ship generates a baseline amount of energy each turn. This generation is directly affected by your **Engine** power allocation and the health of your engine subsystem.
    *   At **33% power**, engines provide **100% (1x)** of baseline energy generation.
    *   At **100% power**, engines are overloaded to provide **200% (2x)** energy generation.
    *   At **0% power**, engines provide only **50% (0.5x)** energy generation.
    *   Engine **damage** reduces this output proportionally. An engine at 50% health will produce only 50% of its potential energy.
*   **Power Consumption:** Every online system on your ship consumes power each turn. This includes weapons, shields, life support, and more. A fully operational ship at Green Alert with 33% power to engines has a **net zero** energy change; generation perfectly matches consumption.
*   **Reserve Power (Battery):** This is your energy buffer. Any deficit between generation and consumption is drained from this pool. Activating systems like **Shields** (Red Alert), **Point-Defense**, or **Evasive Maneuvers** drastically increases consumption, causing a drain on your reserves. Any surplus energy will recharge this pool.
*   **Tactical Trade-offs:** If a system is destroyed, its power consumption is removed from the total. This creates a tactical choice: if you are low on power, you could intentionally leave a non-critical system like the transporter offline to free up energy for shields or weapons.

### Warp & Scanning
From the Quadrant Map, you can travel long distances via Warp Drive. Each warp jump consumes one Dilithium crystal. You can also perform a Long-Range Scan on an adjacent quadrant to reveal basic information about it (e.g., number of hostile contacts) at the cost of Reserve Power.

### Repairs & Damage Control
Damage can be repaired in two ways:
*   **Damage Control Teams:** In the Ship Status panel, you can assign your crew to slowly repair the Hull or a specific subsystem. This is a slow process that occurs at the end of each turn and consumes a small amount of power.
*   **Starbase:** Docking with a friendly Starbase allows for a full repair of all systems, free of charge. You can also resupply torpedoes and dilithium here.

### Laser Point-Defense System (LPDS)
The LPDS is a specialized, short-range defensive system designed to intercept incoming torpedoes. It can be toggled in the Ship Status panel.
*   **Function:** When active, the LPDS grid will automatically target and attempt to destroy **one** incoming hostile torpedo per turn. It will prioritize the most dangerous torpedo type first.
*   **Effectiveness:** The system's chance to successfully intercept a torpedo is equal to its current subsystem health percentage. A system at 75% health has a 75% chance to hit.
*   **Range:** The system is effective only at extremely close range, targeting torpedoes in adjacent cells (**1 hex**).
*   **Energy Cost:** The LPDS adds a significant drain to your passive power consumption each turn it is active.
*   **Tactical Trade-off:** Activating the LPDS requires a significant power diversion from your main phaser arrays. While active, your phaser damage is reduced by **40%**, and their effective range for damage falloff calculations is increased by one hex (e.g., a shot at 2 hexes is calculated as if it were 3).

### Nebulae
Nebulae are no longer just visual obstructions; they are tactical environments composed of individual cells of gas and dust. Being inside any nebula cell has immediate effects on combat and sensors.
*   **Phaser Inaccuracy:** Firing phasers at any target **inside a nebula cell** will reduce your accuracy. The gravimetric distortions and particle density make it difficult to maintain a coherent energy beam over distance. Torpedoes, being self-propelled projectiles, are unaffected by this accuracy penalty.
*   **Sensor Reduction:** While your ship is inside a nebula cell, your own sensor resolution is drastically reduced. You will only be able to detect hostile ships in adjacent cells. Be warned: this means you can be ambushed as easily as you can set an ambush.

### Ship Systems Breakdown
The Endeavour is a complex machine. Understanding how its key systems function and degrade under fire is essential for effective command.

*   **Shields:** The shields' percentage of repair indicates how efficiently the shield generators can convert energy into actual shielding. Damaged generators are less effective, providing weaker protection for the same amount of power.
*   **Warp Engines:** The warp engines are virtually impossible to destroy completely, but their level of damage affects the maximum possible warp speed. The maximum warp speed is approximately warp 1 plus 0.09 times percentage of repair.
*   **Impulse Engines:** Impulse engines are much simpler than warp engines; they either work or they don't. When they are at less than 50% repair, they simply stop functioning, leaving the ship dead in space.
*   **Phasers:** Phaser percentage of repair is a direct indication of what percentage of energy is converted to destructive force at the point of impact. In other words, for a given level of phaser energy, 100% working phasers will do twice the damage of 50% working phasers.
*   **Photon Torpedo Tubes:** Like impulse engines, photon torpedo tubes' functionality degrades with damage, reducing the number of tubes available. At 100% repair, three tubes are functional. At 67-99%, two tubes work. At 34-66%, only one works. This effectively reduces potential torpedo damage output.
*   **Laser Point-Defense System (LPDS):** The LPDS is your automated defense against incoming torpedoes. Its effectiveness is directly tied to its health. At 100% health, it has a 100% chance to hit an adjacent torpedo. This chance decreases linearly with damage. A broken LPDS (0% health) cannot fire and consumes no energy.
*   **Computer:** A modern starship is highly computerized. Portions of the ship's charts can be lost if the computer is sufficiently damaged and can only be recovered by re-scanning. Automatic navigation and viewing the Quadrant Map require the computer to be 100% repaired.
*   **Life Support:** When life support systems are damaged below 100%, they cease to produce oxygen. The ship then switches to emergency reserves, which last for exactly two turns. If life support is not repaired within that time, the crew is lost, and the ship becomes a derelict hulk, ripe for salvage or capture. This applies to all ships in the sector, including yours.
*   **Transporter:** The transporter must be at 100% repair to be used for away missions or tactical operations.
*   **Shuttlecraft:** The shuttlecraft must be at 100% repair to be used for missions.

## Advanced Combat: Weapon Systems

A thorough understanding of your own weapon systems—and those of your potential adversaries—is paramount. This section details the operational parameters of all known energy and projectile weapons in the Typhon Expanse.

### Energy Weapons

#### Phasers
*   **Primary Users:** All Factions
*   **Effective Range:** 1-6 hexes
*   **Energy Cost:** Draws directly from main reactor based on 'Weapons' allocation setting.
*   **Damage Profile:** Variable (Base 20 for player * % Power to Weapons). Modified by range and phaser subsystem health.
*   **Tactical Notes:** The standard energy weapon. Can be precisely targeted at enemy subsystems. Accuracy is negatively affected by nebulae, evasive maneuvers, and firing at targets inside an asteroid field (-30%).
*   **Phaser Damage Falloff:**
    | Range (Hexes) | Damage Modifier |
    | :------------ | :-------------- |
    | 1             | 100%            |
    | 2             | 80%             |
    | 3             | 60%             |
    | 4             | 40%             |
    | 5             | 20%             |
    | 6             | 20% (Minimum)   |

### Projectile Weapons (Torpedoes)

#### Photon Torpedoes
*   **Primary Users:** Federation, Klingon, Pirates
*   **Effective Range:** Sector-wide (Travel time applies)
*   **Energy Cost:** None (Consumes ammunition)
*   **Damage Profile:** Base 50. This damage is heavily mitigated by active shields, which can absorb the entire blast if strong enough.
*   **Tactical Notes:** Standard antimatter warhead. Targets the hull only and cannot be aimed at subsystems. Can be shot down by point-defense phaser fire or destroyed by colliding with asteroids.

#### Quantum Torpedoes
*   **Primary Users:** Advanced Federation (Sovereign, Defiant classes)
*   **Effective Range:** Sector-wide (Faster than Photon Torpedoes)
*   **Energy Cost:** None (Consumes ammunition)
*   **Damage Profile:** Base 75. A portion of this damage will bypass shields, striking the hull directly.
*   **Tactical Notes:** A zero-point energy warhead that is much more difficult for enemy point-defense systems to intercept. Can be destroyed by colliding with asteroids.

#### Plasma Torpedoes
*   **Primary Users:** Romulan Star Empire
*   **Effective Range:** Sector-wide (Relatively slow travel time)
*   **Energy Cost:** None (Consumes ammunition)
*   **Damage Profile:** Base 30 + Plasma Burn (10 damage per turn for 2 turns). The burn damage bypasses shields entirely.
*   **Tactical Notes:** A tactical weapon designed to disable and wear down targets. The initial impact is moderate, but the subsequent plasma fire can be devastating to an unshielded hull. Can be shot down by point-defense phaser fire or destroyed by colliding with asteroids.

#### Heavy Plasma Torpedoes
*   **Primary Users:** Romulan (D'deridex Warbird)
*   **Effective Range:** Sector-wide (Slow travel time)
*   **Energy Cost:** None (Consumes ammunition)
*   **Damage Profile:** Base 40 + Plasma Burn (15 damage per turn for 2 turns). The burn damage bypasses shields entirely.
*   **Tactical Notes:** A larger, more potent version of the standard plasma torpedo. Exceptionally dangerous against vessels with compromised shields. Can be shot down or destroyed by asteroids.

#### Heavy Photon Torpedoes
*   **Primary Users:** Klingon Empire (Negh'Var), Pirates (Nausicaan)
*   **Effective Range:** Sector-wide (Slow travel time)
*   **Energy Cost:** None (Consumes ammunition)
*   **Damage Profile:** Base 90. Heavily mitigated by shields.
*   **Tactical Notes:** A brute-force weapon favored by Klingons. It is slow and relatively easy to intercept, but will inflict catastrophic damage if it connects with a depleted shield facing. Can be destroyed by asteroids.

### Defensive Systems

#### Laser Point-Defense Grid
*   **Primary Users:** All Factions
*   **Effective Range:** 1 hex
*   **Energy Cost:** 20 Reserve Power (Standby), 40 Reserve Power (Active Fire)
*   **Damage Profile:** Destroys one torpedo projectile.
*   **Tactical Notes:** An automated defensive laser system that targets incoming torpedoes at very close range. Its chance to hit is directly proportional to its subsystem health. When active, it diverts significant power from the main phaser arrays, reducing their damage and effective range. The system's targeting computer prioritizes the most dangerous torpedoes first.

## Advanced Tactical Operations

Victory is not achieved through superior firepower alone, but through superior strategy. This section details advanced concepts that separate seasoned captains from rookie commanders.

### Energy Allocation Doctrine
Your energy allocation is your most flexible tactical tool, allowing you to adapt your ship's performance profile mid-battle. A wise captain shifts power preemptively, not reactively. Consider these standard doctrines:

*   **Alpha Strike Configuration (100% Weapons):** Divert all non-essential power to weapons. This profile maximizes your initial phaser damage, ideal for a powerful opening salvo or for finishing a critically damaged enemy. Be warned: this leaves your shields unable to regenerate and your evasion bonus nullified, making you extremely vulnerable to counter-attack.
*   **Defensive Shell (100% Shields):** Maximize power to shields for rapid regeneration. This is the optimal configuration when under heavy fire from multiple opponents, when attempting to survive until your torpedoes connect, or when trying to weather a particularly nasty plasma burn. Your offensive capabilities will be minimal in this state.
*   **Maneuvering Profile (100% Engines):** Boost power to engines to gain a slight edge in evasion. While not a substitute for dedicated Evasive Maneuvers, this can be the difference-maker in a long-range duel. Use this when attempting to close distance, open range for a torpedo shot, or simply make yourself a harder target while other systems are offline.

### Positional Warfare
The sector grid is your chessboard. Where you place your ship is as important as how you equip it.

*   **Optimal Range:** Phaser damage drops off sharply with distance. Your ideal engagement range is 2-3 hexes. Conversely, if an enemy is slow but powerful (like a Klingon Negh'Var), try to stay at maximum range (5-6 hexes), a practice known as "kiting", to pepper them with long-range fire while minimizing their devastating return volleys.
*   **Using the Environment:** Lure aggressive enemies into **Asteroid Fields**. The dense rock provides cover (reducing phaser accuracy against ships inside by 30%) and a direct hazard (risk of impact damage). You can also use asteroid fields as a cloak. By positioning your ship inside a field, you become undetectable beyond 4 hexes. This allows you to break sensor lock and set up ambushes. Lure an enemy to chase you, then enter a field. They will be forced to close to within 2 hexes to fire, bringing them into your optimal torpedo range.
*   **Focus Fire:** In multi-ship engagements, it is always better to destroy one enemy than to damage two. Concentrate all fire on a single target until it is neutralized before moving to the next. Prioritize destroying high-damage, low-health threats (like a B'rel Bird-of-Prey) first.

### Nebula Warfare
Nebulae are your greatest tactical tool for stealth, surprise, and controlling the flow of battle. Their particulate density and gravimetric distortions create unique opportunities for a cunning captain.

*   **Concealment (Deep Nebula):** If you position your ship in a nebula cell that is **completely surrounded by 8 other nebula cells** (including diagonals), you enter a "Deep Nebula". Your vessel will become **completely undetectable** to enemy ships and will vanish from their tactical displays. This is the ultimate ambush position, allowing you to fire on an enemy that cannot see you.
*   **Sensor Reduction:** While your ship is inside **any** nebula cell, your own sensor resolution is drastically reduced. You will only be able to detect hostile ships in **adjacent cells (range 1)**. Use this to break contact with a superior force, force a close-range engagement where your torpedoes excel, or sneak past enemy patrols undetected.
*   **Communication Blackout:** Allied vessels normally share sensor data, allowing them to see each other regardless of line of sight. However, this connection can be severed. If an allied ship is positioned in a nebula cell that is surrounded by **two full layers of nebula cells** on all sides (a 5x5 grid with the ship in the center), all its communications will be blocked. It will disappear even from **allied** sensors.

### Subsystem Targeting: A Surgical Approach
A discerning captain knows that simply pounding on an enemy's hull is inefficient. Crippling key systems can neutralize a threat with less risk and greater tactical advantage. An enemy ship is only as dangerous as its functioning components.

*   **Targeting: Weapons:** Disabling an enemy's weapon systems is the most direct way to reduce incoming damage. A ship with zero weapon health cannot fire phasers or launch torpedoes, rendering it harmless. This is the priority target when facing a "glass cannon" vessel like a Klingon Bird-of-Prey.
*   **Targeting: Engines:** A ship that cannot move is a sitting duck. Disabling engines will leave a vessel dead in space, unable to pursue, retreat, or adjust its range. This makes them exceptionally vulnerable to slow-moving, high-damage torpedoes and allows you to control the engagement distance entirely.
*   **Targeting: Shields:** Destroying the shield generator prevents the enemy from regenerating their shields for the remainder of combat. This means any subsequent hull damage is permanent. This is a powerful long-term strategy in a protracted battle, ensuring that your efforts are not undone by their engineering crews.
*   **Targeting: Transporter:** While most hostile ships lack transporters, those that possess them use them to repel boarders and conduct rapid internal repairs. Disabling their transporter makes them highly vulnerable to your own boarding actions and strike teams.

### Employing the Laser Point-Defense (LPD) System
The LPD system is a powerful but costly defensive tool. Knowing when to activate it is a critical tactical decision.

*   **The Trade-Off:** Activating the LPD significantly reduces your offensive phaser capability. It is a purely defensive measure. Do not activate it if you need maximum phaser damage to finish a target.
*   **When to Use It:** The LPD is most effective when anticipating a torpedo-heavy attack, especially against factions like the Romulans or Klingons with powerful warheads. Activating it when an enemy launches a torpedo can completely negate their primary attack for that turn.
*   **Countering LPD:** The system can only target one torpedo per turn. The most effective way to defeat an enemy's LPD is to overwhelm it with a multi-torpedo launch from several ships, or by launching a torpedo while simultaneously pressuring them with heavy phaser fire.

### Cloaking and Anti-Cloak Operations
Stealth technology is no longer a simple fire-and-forget system. It is a dynamic state requiring constant power and subject to failure under pressure. Understanding these new, more complex mechanics is essential to survival.

*   **General Cloaking Mechanics:**
    *   **Per-Turn Maintenance:** At the end of every turn a ship's cloak is active (or in the process of engaging), it must pass a **reliability check** AND consume a significant amount of **reserve power**. Failure of either the check (due to random chance or environmental effects) or the power draw will cause the cloak to collapse, making the ship visible and putting the device on a 2-turn cooldown.
    *   **Action Cost:** Engaging or disengaging a cloak consumes your major tactical action for the turn. You cannot move or fire other weapons in the same turn.
    *   **Combat Restrictions:** A cloaked ship cannot fire weapons or be at Red Alert (shields up). Attempting to do so will automatically disengage the cloak.

*   **Technical Specifications by Faction:**
    | Vessel / Faction         | Base Reliability | Power Cost / Turn |
    | :----------------------- | :--------------- | :---------------- |
    | Romulan (All)            | 99%              | 40                |
    | Klingon (B'rel)          | 92%              | 45                |
    | Federation (Defiant)     | 90%              | 50                |

*   **Special Case: Pirate Makeshift Cloak:**
    Intelligence has confirmed that some pirate factions have managed to jury-rig cloaking devices onto their vessels. These systems are highly volatile and should be considered as much a threat to their user as to their target.
    *   Base Reliability: **60%**
    *   Power Cost / Turn: **70**
    *   Subsystem Damage Chance: **7%** per turn (30% damage to a random key system)
    *   Catastrophic Failure Chance: **0.1%** per turn (instant self-destruction)
    *   *Note: These failure chances are **compounded** by environmental effects like nebulae. A pirate attempting to cloak in a nebula is taking an extreme gamble.*

*   **Environmental Factors:**
    *   **Nebulae:** Reliability: Reduced by 25% (e.g., 92% becomes 69%). Power Cost: Increased by 30% (e.g., 40 becomes 52 per turn).
    *   **Asteroid Fields:** Reliability: Reduced by 10% (e.g., 92% becomes 83%). Power Cost: Increased by 15% (e.g., 40 becomes 46 per turn).

### Countering Faction Doctrines
Each faction's AI has a distinct personality. Exploit their tendencies to secure victory.

*   **Countering Klingons:** Klingons are honorable and aggressive. They will charge into phaser range and favor an **Aggressive** power stance. Be especially wary of their B'rel-class Birds-of-Prey, which will use cloaking devices to get into close range for a surprise alpha strike. Weather their initial attack with a **Defensive** stance of your own, then cripple their **Weapon Systems**. Their code of honor makes them unlikely to retreat, allowing you to systematically dismantle their disabled ship.
*   **Countering Romulans:** Romulans are cautious and tactical. They will use their cloak to get into optimal position and will shift power defensively if damaged. Their primary goal is to disable your ship. Keep your shields healthy and focus fire, as they will attempt to escape if their hull becomes critical.
*   **Countering Pirates:** Pirates are opportunistic cowards. They will press the attack if they sense weakness (low player hull) but will quickly switch to a **Defensive** stance if they take significant damage. A strong, decisive opening salvo ("Alpha Strike") can force them onto the back foot early. Be wary of their desperation move; if a pirate ship is critically damaged, move away from it to avoid its self-destruct radius.

## The Scenario Simulator

The Scenario Simulator is a powerful wargaming tool that allows Starfleet officers to construct and observe custom tactical situations. This is an invaluable resource for testing ship capabilities, understanding AI behavior, and honing your own command skills without risking the U.S.S. Endeavour.

### Accessing the Simulator
The simulator is accessible directly from the game's Main Menu.

### Phase 1: Setup Mode
This is the heart of the simulator, where you become the architect of your own battle. The screen is divided into the tactical map on the left and the control panel on the right.

*   **1. The Tactical Map & Sector Controls:** The large map on the left is a live preview of the sector where your simulation will take place.
    *   **Sector Type:** Use this button to open a full-screen modal where you can select the environmental template for your battle, from empty space to dense nebulae or asteroid fields.
    *   **Refresh:** Each sector template is generated with a random "seed". Clicking Refresh generates a new layout using the same template but a different seed, allowing you to cycle through map variations.
*   **2. The Toolbox:** The right-hand panel contains all the tools needed to place and configure your forces.
    *   **Set Allegiance:** Before placing a ship, you must select its allegiance. This determines who it will fight for. 'Player' is for dogfight mode, 'Ally' will fight alongside the player, 'Enemy' will fight against the player, and 'Neutral' will not participate.
    *   **Ship Registry:** This scrollable list contains every ship class in the simulation. Select a faction, then click on a ship class to arm your placement tool.
    *   **Remove Ship:** Select this tool to remove a previously placed ship from the map.
    *   **Placement:** With an allegiance and ship class selected, simply click on an empty cell on the tactical map to deploy that vessel.
*   **3. Starting the Simulation:** Once your ships are placed, you have two options:
    *   **Start Spectate:** This begins the simulation in a fully automated mode. All ships will be controlled by their respective AI doctrines. This is perfect for observing large-scale fleet engagements or testing how different ship compositions fare against each other.
    *   **Start Dogfight:** This mode requires you to have placed exactly one ship with the 'Player' allegiance. You will take direct command of this vessel, with the full player HUD at your disposal, fighting against any ships you designated as 'Enemy'.

### Phase 2: Running the Simulation
Once the simulation begins, your interface will change based on the mode you selected.

*   **Spectate Mode:** This is a read-only observation mode.
    *   **Controls:** At the top of the screen, you can see the current turn and a Play/Pause button to control the automatic turn progression.
    *   **Layout:** The screen is split between the tactical map on the left and a sidebar on the right.
    *   **Ship Inspection:** Clicking on any ship on the map will select it. This splits the right sidebar, showing a detailed, scrollable status panel for that ship in the top half and the turn-by-turn combat log in the bottom half. Clicking an empty cell or the selected ship again will deselect it, giving the log the full sidebar height.
*   **Dogfight Mode:** This mode gives you direct control over your designated 'Player' ship.
    *   **Interface:** The layout mirrors the main game. The tactical map is on the left, with your full Player HUD below it. A sidebar on the right contains your Ship Status panel and, if a target is selected, its detailed information panel.
    *   **Log:** The combat log is available via a "Show Log" button, which opens it in a large modal window over the screen.

## The Battle Replayer

The Battle Replayer is a comprehensive after-action review system that allows you to analyze combat encounters. It is an invaluable tool for understanding AI behavior and refining your own tactical decisions.

### Accessing the Replayer
The "Battle Replayer" is accessible from the in-game Game Menu. It will only be available if a combat encounter has occurred in the current sector. The replayer history is automatically recorded, storing a complete snapshot of the last 100 turns of activity. This history is cleared when you warp to a new sector.

### Interface and Controls
The replayer interface provides a complete reconstruction of the battle:

*   **Playback Controls:** At the bottom of the tactical map, you will find a full suite of controls, including a Play/Pause button for automatic playback, Previous/Next turn buttons, and a slider to jump to any specific turn in the recorded history.
*   **Interactive Tactical View:** The main viewscreen shows the state of the sector for the selected turn. You can click on any ship on the map to select it for detailed analysis. Combat effects, such as phaser fire and torpedo impacts, will be animated for the selected turn.
*   **Detailed Status Panels:** The right-hand sidebar is dedicated to providing an exhaustive breakdown of ship statuses.
    *   The top panel shows the status of your ship, the U.S.S. Endeavour.
    *   The panel below it shows the detailed status of any ship you have selected on the map. This includes hull, shields, energy, all subsystem health percentages, resources, critical timers (e.g., life support failure), and any active tactical or environmental modifiers.
*   **Turn Log:** A button is available to show the full, verbose combat log for the currently selected turn, allowing for a line-by-line analysis of events.

---
# Simulation Changelog

## Version 1.6.1 - Tactical Clarity Update
*Release Date: Stardate 49733.1, 10:00 (September 24, 2025)*

A quality-of-life patch addressing two critical pieces of user feedback regarding shield mechanics and the tactical display of defeated vessels.

### Summary of User Directives & Field Reports
> Engineering reports a persistent malfunction in shield regeneration protocols; depleted shields were failing to recharge from zero, a critical flaw in defensive systems. Additionally, the bridge crew reported tactical confusion due to destroyed vessels not being visually distinct from active combatants. Immediate rectification was ordered to ensure system reliability and combat effectiveness.

### Summary of Implemented Changes
*   **Bug Fix - Shield Regeneration:** Corrected a logical flaw in the end-of-turn processing. A faulty condition was preventing shield regeneration from initiating if a ship's shields were at 0. This has been fixed, and shields will now correctly begin recharging from a fully depleted state, provided the ship is at Red Alert with a functional shield generator.
*   **New Feature - Visual State for Destroyed Ships:**
    *   **Tactical View:** Ships with a hull value of 0 or less are now visually marked as destroyed. They will appear grayed-out and semi-transparent on the `SectorView`, and their health bar will be hidden to provide clear, immediate feedback on their status.
    *   **Command Console:** All offensive action buttons (Fire Phasers, Launch Torpedo, etc.) in the `CommandConsole` are now disabled when a destroyed ship is targeted. This prevents wasted actions and streamlines target selection during combat.

## Version 1.6 - The Phased Combat & AI Overhaul
*Release Date: Stardate 49732.5, 15:00 (September 24, 2025)*

A major update focusing on a more dynamic, cinematic combat experience through a new phased turn system. This release also introduces a significantly more advanced AI, a modernized mobile UI, and a suite of enhanced visual effects.

### Summary of User Directives & Field Reports
> Analysis of previous simulation logs indicated that the turn-based combat system, while functional, lacked dynamism. All actions resolved simultaneously, leading to a static and sometimes confusing battlefield. Feedback also highlighted that AI opponents were predictable, failing to adapt their strategies to changing combat conditions.
>
> Furthermore, with increasing deployment on touch-enabled PADDs, the primary user interface was reported as clunky and difficult to operate on smaller screens. A full modernization was ordered to improve mobile usability. Finally, a general directive was issued to enhance the visual fidelity of combat to better represent the tactical situation.

### Summary of Implemented Changes
*   **New Phased Turn System:** Combat is now resolved in a logical, sequential order instead of all at once. The new turn manager processes actions in distinct phases (Point-Defense, Energy Management, Movement, Torpedo Launch, Phaser Fire, Projectile Movement), creating a more cinematic and easier-to-follow battle flow.
*   **Advanced AI Doctrine Overhaul:**
    *   AI ships now operate under a dynamic 'Stance' system (Aggressive, Defensive, Balanced, Recovery), intelligently reallocating power and choosing actions based on their current situation and factional doctrine.
    *   Hostile AI will now strategically target specific ship subsystems to exploit weaknesses, such as Klingons targeting weapons or Romulans targeting engines.
    *   AI vessels now manage energy and repair critical systems when out of combat, ensuring they are better prepared for subsequent encounters.
*   **Tactical Viewscreen Enhancements:**
    *   Entity rendering has been upgraded to use dynamic pixel-based positioning, resulting in smooth, animated movement on the tactical grid.
    *   Nebula cells are now rendered with subtle animations, creating a more vibrant and atmospheric battlefield.
    *   Torpedoes now leave a visible trail, making their paths and trajectories clear at a glance.
*   **Modernized Mobile UI/UX:**
    *   For touch-enabled devices, the main sidebar has been replaced with a floating "Systems" button that opens an intuitive, full-height slide-out overlay panel.
    *   The "Sector View" and "Quadrant Map" buttons have been redesigned into a clean, vertical stack to the left of the viewscreen, improving ergonomics and screen real estate.
*   **Enhanced Combat Visual Effects:**
    *   Phaser beam animations are now multi-stage, featuring a distinct draw, hold, and fade phase for a more impactful feel.
    *   New shield and hull impact animations provide clear visual feedback for where damage is being dealt.
    *   Point-defense lasers now render as a visible defensive beam, showing their interception attempts.

## Version 1.5.2 - AI Resource Management & UI Polish
*Release Date: Stardate 49728.1, 20:00 (September 23, 2025)*

Introduced intelligent, out-of-combat AI behavior for resource management and repairs. Addressed several UI layout and rendering bugs for a smoother user experience.

### Summary of User Directives & Field Reports
> User directive specified that AI vessels should exhibit more strategic behavior outside of direct combat. When no enemies are nearby, they should attempt to conserve power, initiate repairs on damaged systems, and generally prepare for their next engagement. If threats approach, they must immediately return to a combat-ready state.
>
> Additionally, a visual glitch was reported where the decorative, pulsating border of status panels would incorrectly scroll along with the panel's text content, breaking the UI's fixed-frame aesthetic.

### Summary of Implemented Changes
*   **New AI 'Recovery' Stance:**
    *   AI ships will now automatically enter a 'Recovery' stance when no enemies are within a 10-unit radius.
    *   In this stance, ships divert all non-essential power to their engines to maximize energy generation and recharge their reserve batteries.
    *   Damage control teams are automatically assigned to repair the most critically damaged system, followed by hull repairs.
    *   The AI will immediately exit Recovery mode and re-allocate power for combat the moment an enemy vessel closes to within 10 units.
*   **UI Layout & Scrolling Fixes:**
    *   Corrected the layout of the `SimulatorShipDetailPanel`. The component was refactored to have a fixed outer frame with the panel styling and an independent, internally scrolling div for its content, preventing the border from moving.
    *   Restructured the "Dogfight" mode sidebar in the `ScenarioSimulator`. The Player and Target status panels are now in separate containers, allowing them to scroll independently and resolving an issue where scrolling one would move both.

## Version 1.5.1 - Critical Systems & Bug Fixes
*Release Date: Stardate 49727.4, 16:00 (September 23, 2025)*

A rapid-response patch addressing several critical bugs reported from the field, focusing on combat mechanics, AI resource management, and UI clarity.

### Summary of User Directives & Field Reports
> Field reports indicated multiple system malfunctions during combat scenarios:
> *   The 'Unknown Contact' icon was failing to display, revealing ship identities prematurely.
> *   Enemy vessels were observed operating indefinitely with zero reserve power and no dilithium, violating established energy mechanics.
> *   A critical flaw in the damage model was causing ships with moderately damaged engines (e.g., 24% health) to become derelict, a state that should only result from total life support failure.
> *   UI feedback for engine failure was unclear, causing confusion when movement commands were unavailable.
>
> Immediate rectification of these issues was ordered.

### Summary of Implemented Changes
*   **Bug Fix - Unknown Contact Icon:** Corrected the rendering logic in the `SectorView` component. The system now properly checks if a ship is unscanned *before* selecting an icon, ensuring unidentified contacts display the correct sensor blip.
*   **Bug Fix - AI Energy & Dilithium Consumption:** Overhauled the end-of-turn energy management logic in `turnManager.ts` for all NPC ships. AI vessels with an energy deficit will now correctly consume one dilithium for an emergency recharge. If no dilithium is available, their power will drop to zero, and the life-support failure countdown will begin as intended.
*   **Bug Fix - Derelict Ship Logic:** Corrected a critical bug where engine damage was incorrectly linked to life support failure. The two-turn countdown to a ship becoming derelict now ONLY begins when the Life Support subsystem's health reaches 0.
*   **New UI - System Failure Indicators:** To improve tactical clarity, new visual indicators have been added to the `ShipStatus` panel:
    *   A red, flashing `"OFFLINE"` indicator now appears next to the Impulse Engines when their health is below 50%.
    *   A red, flashing `"FAILING (xT)"` timer appears next to Life Support when the two-turn derelict countdown is active.

## Version 1.5 - The Energy & Simulation Overhaul
*Release Date: Stardate 49725.1, 11:00 (September 23, 2025)*

A fundamental redesign of ship energy management systems, a comprehensive overhaul of the Scenario Simulator, and a full update to the Player's Manual to document these extensive changes.

### Summary of User Directives
> User mandated a complete revamp of the game's energy management to introduce a more granular, tactical model. This included dynamic power generation based on engine allocation and damage, passive power consumption for all individual ship components, and updated AI doctrines to utilize these new mechanics. Subsequently, a series of directives called for a major overhaul of the Scenario Simulator to include a detailed ship information panel mirroring the Battle Replayer, full combat animation support, and a more intuitive UI/UX for 'Spectate' mode. Finally, a complete documentation update was ordered for the Player's Manual to reflect all new features and mechanics.

### Summary of Implemented Changes
*   **New Dynamic Energy Grid:**
    *   A ship's energy generation is now determined by a baseline value (scaled by class) and amplified by power allocated to engines (from 50% at 0% allocation to 200% at 100% allocation).
    *   Engine damage now directly reduces energy generation, making engines a critical tactical target.
    *   Every major ship system now has a passive energy cost. Disabling or destroying a system frees up its power for other functions.
    *   AI doctrines for all factions have been updated to a three-way Weapons/Shields/Engines power allocation system.
*   **Scenario Simulator Overhaul:**
    *   Added a detailed, scrollable ship information panel, providing a comprehensive tactical readout of any selected vessel.
    *   The information panel includes a full breakdown of the new energy grid, showing generation, consumption, and net power balance.
    *   Restored all combat animations (phasers, torpedoes, explosions) to the simulator.
    *   Redesigned 'Spectate' mode with a split-view UI for simultaneous log and ship detail viewing, and implemented intuitive click-to-deselect controls.
*   **Main Menu Redesign:** The main menu was streamlined for clarity, removing the sub-menu and adding direct-access buttons for the Manual and Changelog.
*   **Comprehensive Manual Update:**
    *   Added brand-new sections detailing the features and UI of the 'Scenario Simulator' and 'Battle Replayer'.
    *   The 'Entity Registry' was updated to include a detailed "Energy Profile" for every ship, showing baseline generation and passive consumption for each system.
    *   All relevant mechanics sections were updated to reflect the new energy management system.

## Version 1.4.1 - Simulation Updates
*Release Date: Stardate 49722.8, 18:00 (September 22, 2025)*

A comprehensive overhaul of the Scenario Simulator, implementing numerous user-requested features for improved functionality, consistency, and tactical clarity.

### Summary of User Directives
> User requested a massive overhaul of the Scenario Simulator to bring it up to par with the main game's quality and functionality. Key directives included:
> *   **Visual Consistency:** The setup screen's tactical map needed to be a live, persistent preview of the actual battle map, not just a placeholder.
> *   **Predictable Generation:** Sector generation needed to be controlled by a persistent seed, with a "Refresh" button to allow cycling through layouts.
> *   **Clearer Tactical Readout:** Ship icons needed to be colored by their assigned allegiance (Player, Enemy, etc.) for at-a-glance clarity, rather than by their faction.
> *   **Functional AI:** AI needed to be "fixed" to respect allegiance over hard-coded faction behavior, allowing for scenarios like Federation vs. Federation battles.
> *   **UI/UX Overhaul:** The cumbersome sector dropdown was to be replaced with a rich modal window. The dogfight UI needed to be enhanced with the player's full `ShipStatus` panel.
> *   **Critical Bug Fixes:** A persistent, frustrating bug preventing the combat log from scrolling needed to be definitively resolved. Additionally, targeting and layout responsiveness issues were to be corrected.

### Summary of Implemented Changes
*   **New Simulator Setup Flow:** The setup screen now generates a full, seed-based preview of the selected sector. This exact sector state, including its seed and entity placement, is now preserved and used when the simulation begins. A "Refresh" button has been added to generate new map layouts on demand.
*   **Allegiance-Based Systems:** The `SectorView` now colors ships based on their simulator allegiance. The core AI logic for the Federation faction was overhauled to engage in combat if assigned as an 'enemy', enabling more flexible scenarios. The player's `CommandConsole` was also updated to allow targeting based on allegiance, not just faction.
*   **Comprehensive UI/UX Overhaul:**
    *   The sector dropdown was replaced with a full-screen modal displaying previews and detailed descriptions of each sector template.
    *   The simulator layout is now fully responsive, correctly scaling the map and stacking UI elements on smaller screens.
    *   In "Dogfight" mode, the player now has access to the full `ShipStatus` panel in a new sidebar for complete control.
    *   The combat log in both Dogfight and Spectator modes was moved into a modal/panel with a definitive fix for the long-standing scrolling issue, using a robust flexbox layout to correctly constrain its height.
*   **Core Logic Refactoring:** The `useScenarioLogic` hook was refactored to support the new seed-based, persistent sector generation, improving the simulator's stability and predictability.

## Version 1.4 - Battle Replayer
*Release Date: Stardate 49722.3, 14:00 (September 22, 2025)*

A comprehensive after-action review system has been added to the simulation for advanced tactical analysis.

### Summary of User Directives
> User requested a comprehensive 'Battle Replayer' to analyze combat encounters. Initial requests focused on basic playback, but follow-up directives expanded the scope to include fully interactive, detailed inspection of any ship's status on any given turn. This included demands for a verbose turn-by-turn combat log and a complete tactical readout showing every subsystem, resource, timer, and active modifier.

### Summary of Implemented Changes
*   **New 'Battle Replayer' Feature:** A new "Battle Replayer" is now accessible from the Game Menu after any combat encounter.
*   **Automatic Recording:** The simulation now automatically records a complete snapshot of the sector state at the end of every turn, storing the last 100 turns of activity. This history is cleared upon warping to a new sector.
*   **Full Playback Controls:** The replayer includes a turn slider, play/pause functionality, and step-by-step controls to review the engagement turn-by-turn.
*   **Interactive Tactical View:** You can now click on any ship within the replayer's Sector View to select it for detailed analysis.
*   **Comprehensive Status Panels:** Detailed, scrollable panels provide an exhaustive, real-time breakdown of every variable for both your ship and the selected target for any specific turn. This includes hull, shields, energy, all subsystem health percentages, resources, critical timers (e.g., life support failure), and active tactical modifiers (e.g., nebula cover, stun effects).
*   **Expandable Log Viewer:** A new "Show Full Log" button opens a large, scrollable overlay, allowing you to read the detailed event log for the selected turn while still viewing the tactical map.

## Version 1.3.2 - Energy Rebalancing
*Release Date: Stardate 49721.8, 09:00 (September 22, 2025)*

Overhaul of the ship energy economy based on operational feedback.

### Field Report & Directive
> "...some ships have too low energy and dilithium... make the energy requirements equivalent on all ships... if a galaxy class ship's phasers consume 20 units, an intrepid class should consume 50% of that, and the phasers should do 50% of damage... this modifier works both for phaser, point defense systems and any energy requirements consumption."

### Summary of Implemented Changes
*   **Energy Modifier System:** Introduced a new `energyModifier` stat for every ship class, calculated based on its total durability (Hull + Shields). The Sovereign-class serves as the 1.0x baseline.
*   **Scaled Energy Consumption:** All actions that consume Reserve Power (phasers, torpedoes, repairs, etc.) now have their costs scaled by this modifier.
*   **Scaled Damage Output:** Phaser damage is now also scaled by the `energyModifier` to maintain combat balance.
*   **Proportional Resource Pools:** Each ship's maximum Reserve Power and Dilithium stores were rebalanced based on its `energyModifier`.