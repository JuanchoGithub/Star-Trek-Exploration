import React, { useState } from 'react';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { shipRoleStats } from '../assets/ships/configs/shipRoleStats';
import { starbaseType } from '../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { NavigationTargetIcon, FederationIcon, KlingonIcon, RomulanIcon } from '../assets/ui/icons';
import { ShipModel, ShipRole } from '../../types';

type Section = 'intro' | 'ui' | 'registry' | 'officers' | 'lore' | 'mechanics' | 'combat' | 'advanced' | 'simulations';

interface PlayerManualProps {
    onClose: () => void;
    themeName: ThemeName;
}

const SectionLink: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`w-full text-left p-3 rounded transition-colors ${active ? 'bg-secondary-main text-secondary-text font-bold' : 'hover:bg-bg-paper-lighter'}`}>
        {children}
    </button>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-secondary-light mb-4 pb-2 border-b-2 border-border-main">{children}</h2>
);

const SubHeader: React.FC<{ children: React.ReactNode, id?: string }> = ({ children, id }) => (
    <h3 id={id} className="text-xl font-bold text-accent-yellow mt-6 mb-2">{children}</h3>
);

const PlayerManual: React.FC<PlayerManualProps> = ({ onClose, themeName }) => {
    const [activeSection, setActiveSection] = useState<Section>('intro');
    const { ScienceIcon, SecurityIcon, EngineeringIcon, WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon } = getFactionIcons(themeName);

    const renderContent = () => {
        switch(activeSection) {
            case 'intro': return <IntroductionSection />;
            case 'ui': return <UISection />;
            case 'registry': return <RegistrySection />;
            case 'officers': return <OfficerDossiersSection />;
            case 'lore': return <TyphonExpanseSection />;
            case 'mechanics': return <MechanicsSection />;
            case 'combat': return <CombatSection />;
            case 'advanced': return <AdvancedTacticsSection />;
            case 'simulations': return <CombatSimulationSection />;
            default: return null;
        }
    }

    const IntroductionSection = () => (
        <div>
            <SectionHeader>Starfleet Field Manual</SectionHeader>
            <p className="text-lg text-text-secondary italic">Issued to Captain, U.S.S. Endeavour, Stardate 47458.2</p>
            <SubHeader>Letter from the Admiralty</SubHeader>
            <p className="mb-4">Captain,</p>
            <p className="mb-4 text-text-secondary indent-8">Welcome to the Typhon Expanse. Your mission is threefold: to explore this uncharted and volatile region of space, to extend the hand of diplomacy to any new life you may encounter, and to defend the Federation from those who would see it fall. The Expanse is home to Klingon patrols, Romulan spies, and lawless pirates. It is a tinderbox waiting for a spark.</p>
            <p className="mb-4 text-text-secondary indent-8">The U.S.S. Endeavour is one of the finest ships in the fleet, but she is only as good as her crew. Your command decisions will determine the success or failure of this five-year mission. This manual contains all the tactical and operational data you will need to command your vessel effectively. Study it. The lives of your crew depend on it.</p>
            <p className="font-bold">Admiral J. P. Hanson</p>
            <p className="text-sm text-text-disabled">Starfleet Command</p>
        </div>
    );

    const UISection = () => {
        const PlayerShipIcon = shipVisuals.Federation.roles.Explorer!.icon;
        const MClassIcon = planetTypes.M.icon;
        return (
            <div>
                <SectionHeader>The Bridge Interface</SectionHeader>
                <p>Your command interface is divided into two primary columns and a status line at the bottom.</p>
                <SubHeader>Left Column: Viewscreen & Operations</SubHeader>
                <p className="text-text-secondary">This area contains your view of the current sector and your primary command console.</p>
                <div className="mt-4 p-2 border border-border-dark rounded">
                    <div className="font-bold mb-2">1. The Viewscreen</div>
                    <p>Displays either the current <strong>Sector View</strong> or the strategic <strong>Quadrant Map</strong>. You can switch between them using the vertical tabs.</p>
                    <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2 space-y-1">
                        <li><strong>Sector View:</strong> A tactical grid of the current sector. Click on an empty square to set a <NavigationTargetIcon className="w-4 h-4 inline-block text-accent-yellow" /> navigation target. Click on an entity like a <PlayerShipIcon className="w-4 h-4 inline-block text-blue-400" /> ship or <MClassIcon className="w-4 h-4 inline-block text-green-500" /> planet to select it. Successfully captured ships will be displayed with a friendly blue icon.</li>
                        <li><strong>Quadrant Map:</strong> A strategic overview of the entire Typhon Expanse. Green quadrants are Federation-controlled, Red are Klingon, etc. Click on an adjacent sector to open a context menu to Warp or Scan.</li>
                    </ul>
                    <div className="font-bold mb-2 mt-4">2. Player HUD</div>
                    <p>This section is divided into the Target Information panel and the Command Console.</p>
                    <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                        <li><strong>Target Info:</strong> Displays a wireframe and vital statistics (Hull, Shields, Subsystems) for your currently selected target. You must scan unscanned ships to see their details.</li>
                        <li><strong>Command Console:</strong> Contains all your primary actions for the turn: Fire Phasers, Launch Torpedoes, Scan, Hail, Retreat, and special actions like Boarding.</li>
                    </ul>
                </div>
                <SubHeader>Right Column: Ship Systems Status</SubHeader>
                <p className="text-text-secondary">This column gives you a detailed, real-time overview of the U.S.S. Endeavour's status.</p>
                 <div className="mt-4 p-2 border border-border-dark rounded">
                    <div className="font-bold mb-2">1. Primary Status Bars</div>
                     <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                         <li><strong>Hull:</strong> Your ship's structural integrity. If this reaches zero, the Endeavour is destroyed.</li>
                         <li><strong>Shields:</strong> Your main defense. Only active during Red Alert. Regenerates each turn based on power to shields.</li>
                         <li><strong>Reserve Power:</strong> Used for combat actions and system upkeep during Red Alert. Recharges when not in combat.</li>
                         <li><strong>Dilithium:</strong> A critical resource used for warping between quadrants and as an emergency power backup.</li>
                     </ul>
                     <div className="font-bold mb-2 mt-4">2. Tactical Toggles</div>
                     <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                         <li><strong>Red Alert:</strong> Raises shields for combat. Drains reserve power each turn.</li>
                         <li><strong>Evasive:</strong> Increases chance to evade attacks but costs more power. Requires Red Alert.</li>
                         <li><strong>Damage Control:</strong> Assign your engineering crew to slowly repair the Hull or a damaged subsystem. This consumes power each turn.</li>
                     </ul>
                     <div className="font-bold mb-2 mt-4">3. Energy Allocation</div>
                     <p>Perhaps the most critical system. Distribute 100% of your main reactor's power between Weapons, Shields, and Engines. This directly impacts phaser damage, shield regeneration rate, and a passive evasion bonus.</p>
                 </div>
            </div>
        )
    };
    
    const RegistrySection = () => {
        const FactionHeader: React.FC<{ name: string, icon: React.ReactNode }> = ({ name, icon }) => (
            <div id={`registry-${name.toLowerCase()}`} className="flex items-center gap-3 mt-8 mb-4 border-b-2 border-border-dark pb-2">
                {icon}
                <h3 className="text-2xl font-bold">{name}</h3>
            </div>
        );

        const RoleEntry: React.FC<{ model: ShipModel, role: ShipRole, name: string, description: string }> = ({ model, role, name, description }) => {
            const visualConfig = shipVisuals[model].roles[role];
            if (!visualConfig) return null;
            const stats = shipRoleStats[role];

            const Wireframe = visualConfig.wireframe;
            const Icon = visualConfig.icon;

            return (
                 <div className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-6 p-3 bg-bg-paper-lighter rounded">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24"><Wireframe /></div>
                        <Icon className={`w-12 h-12 mt-2 ${visualConfig.colorClass}`} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-secondary-light">{name}</h4>
                        <p className="text-text-secondary text-sm mb-2">{description}</p>
                        <p className="font-mono text-accent-orange text-xs bg-black p-2 rounded">
                            HULL: {stats.maxHull} | SHIELDS: {stats.maxShields} | ENERGY: {stats.energy.max} | TORPS: {stats.torpedoes.max}
                        </p>
                    </div>
                </div>
            )
        };
        
        const OtherEntityEntry: React.FC<{ config: {icon: React.FC<any>, wireframe: React.FC, colorClass: string}, name: string, description: string }> = ({ config, name, description }) => {
            const Wireframe = config.wireframe;
            const Icon = config.icon;
            
            return (
                 <div className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-6 p-3 bg-bg-paper-lighter rounded">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24"><Wireframe /></div>
                        <Icon className={`w-12 h-12 mt-2 ${config.colorClass}`} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-secondary-light">{name}</h4>
                        <p className="text-text-secondary text-sm mb-2">{description}</p>
                    </div>
                </div>
            )
        };

        const PirateIcon = shipVisuals.Pirate.roles.Escort!.icon;
    
        return (
            <div>
                <SectionHeader>Entity Registry</SectionHeader>
                <p>A registry of all known vessels, planets, and anomalies identified by Starfleet in the Typhon Expanse.</p>
                <div className="flex gap-2 my-4 flex-wrap">
                    <a href="#registry-federation" className="btn btn-tertiary">Federation</a>
                    <a href="#registry-klingon" className="btn btn-tertiary">Klingon</a>
                    <a href="#registry-romulan" className="btn btn-tertiary">Romulan</a>
                    <a href="#registry-pirate" className="btn btn-tertiary">Pirate</a>
                    <a href="#registry-planets" className="btn btn-tertiary">Stellar Bodies</a>
                </div>
                
                <FactionHeader name="Federation" icon={<FederationIcon className="w-8 h-8 text-blue-400" />} />
                <RoleEntry model="Federation" role="Explorer" name="Explorer" description="Balanced vessels designed for long-range missions. They boast strong shields, versatile subsystems, and high energy reserves, but are not dedicated warships. The U.S.S. Endeavour is a prime example." />
                <RoleEntry model="Federation" role="Cruiser" name="Cruiser" description="A heavier class of starship, serving as the fleet's backbone in combat situations. Well-armed and armored, they sacrifice some scientific utility for increased firepower and durability." />
                <RoleEntry model="Federation" role="Escort" name="Escort" description="Small, fast, and highly maneuverable warships designed for patrol, interception, and fleet support. While fragile, their high damage output makes them a significant threat." />
                <RoleEntry model="Federation" role="Freighter" name="Freighter" description="Civilian cargo haulers under Federation registry. They have large hulls but are slow and possess only minimal defensive capabilities. Often require assistance when attacked." />

                <FactionHeader name="Klingon Empire" icon={<KlingonIcon className="w-8 h-8 text-red-500" />} />
                <RoleEntry model="Klingon" role="Cruiser" name="Cruiser (Bird-of-Prey)" description="The workhorse of the Klingon Defense Force. A versatile combat vessel with powerful disruptors and a cloaking device, designed for direct, honorable confrontation." />
                <RoleEntry model="Klingon" role="Escort" name="Escort (Raptor)" description="A fast attack craft, more nimble than the standard Bird-of-Prey. Used for raiding, reconnaissance, and overwhelming smaller targets with speed and aggression." />
                <RoleEntry model="Klingon" role="Freighter" name="Freighter" description="Armored Klingon transports. While primarily for cargo, they are more heavily armed than their civilian counterparts and should not be underestimated." />

                <FactionHeader name="Romulan Star Empire" icon={<RomulanIcon className="w-8 h-8 text-green-500" />} />
                <RoleEntry model="Romulan" role="Cruiser" name="Cruiser (Warbird)" description="The iconic symbol of Romulan power. These massive warships are heavily armed and possess superior cloaking technology, preferring to strike from the shadows with devastating precision." />
                <RoleEntry model="Romulan" role="Escort" name="Escort (Hawk)" description="A smaller, faster class of warship. While less powerful than a Warbird, they are still a deadly threat, often used for patrols along the Neutral Zone and for surgical strikes." />
                
                <FactionHeader name="Pirate & Orion Syndicate" icon={<PirateIcon className="w-8 h-8 text-orange-500" />} />
                <RoleEntry model="Pirate" role="Escort" name="Raider/Escort" description="A fast, lightly armored ship favored by pirates. They are glass cannons, boasting high-powered engines and weapons but suffering from weak hulls and shields. Typically rely on ambush tactics." />
                <RoleEntry model="Pirate" role="Cruiser" name="Cruiser" description="A captured and heavily modified freighter or older warship. Bristling with mismatched weapon systems and reinforced plating, these vessels are surprisingly durable and dangerous in a brawl." />
    
                <SubHeader id="registry-planets">Stellar Bodies & Anomalies</SubHeader>
                <OtherEntityEntry config={planetTypes.M} name="M-Class Planet" description="A terrestrial, Earth-like world capable of supporting carbon-based life. Often home to civilizations or valuable biological resources. Prime candidates for away missions." />
                <OtherEntityEntry config={planetTypes.J} name="J-Class Planet" description="A massive gas giant, rich in various gases that may be valuable but unsuitable for standard away missions. Often has numerous moons." />
                <OtherEntityEntry config={planetTypes.L} name="L-Class Planet" description="A marginally habitable world with a thin atmosphere or extreme temperatures. Life may exist, but it is often primitive or highly adapted. Suitable for some away missions." />
                <OtherEntityEntry config={planetTypes.D} name="D-Class Planet" description="A barren rock or asteroid, devoid of atmosphere and life. May contain valuable mineral deposits but is otherwise unremarkable." />
                <OtherEntityEntry config={starbaseType} name="Starbase" description="Federation outposts that serve as hubs for repair, resupply, and refuge. Docking with a starbase provides full repairs and replenishment of torpedoes and dilithium." />
                <OtherEntityEntry config={asteroidType} name="Asteroid Field" description="A dense field of rock and ice. Navigating adjacent to these fields is hazardous, as micrometeoroid impacts can damage shields and hull." />
                 <OtherEntityEntry config={beaconType} name="Event Beacon" description="An unidentified signal source. Approaching these beacons can trigger unique events, ranging from derelict ships and distress calls to ancient alien artifacts." />

            </div>
        )
    };
    

    const OfficerDossiersSection = () => {
         const OfficerEntry: React.FC<{
            name: string,
            icon: React.ReactNode,
            record: string,
            profile: string,
            analysis: string
        }> = ({ name, icon, record, profile, analysis }) => (
            <div className="mb-6 p-3 bg-bg-paper-lighter rounded">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-secondary-light">{icon}</div>
                    <h3 className="text-xl font-bold text-accent-yellow">{name}</h3>
                </div>
                <div className="mt-2 pl-12">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Service Record</h4>
                    <p className="text-sm text-text-secondary italic mb-2">{record}</p>
                     <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Psychological Profile</h4>
                    <p className="text-sm text-text-secondary italic mb-2">{profile}</p>
                     <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Operational Analysis</h4>
                    <p className="text-sm text-text-secondary italic">{analysis}</p>
                </div>
            </div>
        );

        return (
            <div>
                <SectionHeader>Bridge Officer Dossiers</SectionHeader>
                <p className="text-text-secondary mb-4">An overview of your senior staff. Their unique personalities and experience will shape the advice they provide during critical mission decisions.</p>
                <OfficerEntry 
                    name="Cmdr. T'Vok, Science Officer"
                    icon={<ScienceIcon className="w-8 h-8"/>}
                    record="Graduate of the Vulcan Science Academy. Distinguished career in stellar cartography and xeno-biology. Served on the U.S.S. Intrepid before requesting a transfer to the Endeavour for its deep-space exploration profile."
                    profile="Personality Type: Logical. Unflappable under pressure. Analyzes all situations based on available data and probability, often dismissing emotional or intuitive arguments."
                    analysis="Cmdr. T'Vok's counsel will always favor the most probable path to success with the least risk to scientific objectives. He will advocate for gathering more data before acting and will prioritize non-violent, analytical solutions."
                />
                 <OfficerEntry 
                    name="Lt. Thorne, Chief of Security"
                    icon={<SecurityIcon className="w-8 h-8"/>}
                    record="Decorated combat veteran of the Cardassian border skirmishes. Excelled in tactical operations and boarding actions. Known for a direct and sometimes confrontational command style."
                    profile="Personality Type: Aggressive. Believes in overwhelming force as the most effective deterrent and solution. Prone to action over deliberation. Possesses a strong protective instinct for the crew."
                    analysis="Lt. Thorne's advice will almost always involve a direct, forceful approach. He will recommend pre-emptive strikes, security sweeps, and tactical solutions to mission objectives, viewing diplomatic or scientific approaches as secondary or inefficient."
                />
                 <OfficerEntry 
                    name="Lt. Cmdr. Singh, Chief Engineer"
                    icon={<EngineeringIcon className="w-8 h-8"/>}
                    record="Rose through the ranks in Starfleet Engineering. Specialist in warp field dynamics and structural integrity. Served as Chief Engineer on a Miranda-class vessel before this assignment."
                    profile="Personality Type: Cautious. Meticulous and risk-averse. Views every situation through the lens of equipment stress and potential system failure. 'Measure twice, cut once' is his mantra."
                    analysis="Lt. Cmdr. Singh will consistently recommend the path of least risk to the ship and its crew. He will advocate for using remote probes, reinforcing systems before an operation, and finding engineering-based solutions that avoid direct confrontation or unknown variables."
                />
            </div>
        )
    };

    const TyphonExpanseSection = () => (
        <div>
            <SectionHeader>A Primer on the Typhon Expanse</SectionHeader>
            <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: EYES ONLY - LEVEL 7 CLEARANCE</p>
            <p className="text-text-secondary mt-4 indent-8">The Typhon Expanse is a largely uncharted sector on the fringe of the Alpha and Beta Quadrants. For decades, exploration was deemed too hazardous due to unpredictable gravimetric distortions and plasma storms. However, recent long-range sensor data indicates these phenomena have begun to subside, opening a new frontier for exploration, colonization... and conflict.</p>
            <SubHeader>Strategic Map of the Region</SubHeader>
            <div className="w-full max-w-md mx-auto my-4 border-2 border-border-main p-1 font-bold">
                <div className="grid grid-cols-2 grid-rows-2 gap-1">
                    <div className="bg-red-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-red-500 text-red-300">
                        <KlingonIcon className="w-8 h-8" />
                        <span>Klingon Empire</span>
                        <span className="text-xs font-normal">(Asserting Dominance)</span>
                    </div>
                    <div className="bg-green-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-green-500 text-green-300">
                        <RomulanIcon className="w-8 h-8" />
                        <span>Romulan Star Empire</span>
                        <span className="text-xs font-normal">(Observing from Shadows)</span>
                    </div>
                    <div className="bg-blue-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-blue-500 text-blue-300">
                        <FederationIcon className="w-8 h-8" />
                        <span>Federation Space</span>
                        <span className="text-xs font-normal">(Staging Ground)</span>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-gray-500 text-gray-400">
                        <span className="text-2xl">?</span>
                        <span>Uncharted Space</span>
                        <span className="text-xs font-normal">(Piracy & Anomalies)</span>
                    </div>
                </div>
            </div>
            <SubHeader>Major Power Analysis</SubHeader>
            <div className="space-y-4">
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-red-400 flex items-center gap-2"><KlingonIcon className="w-5 h-5" />Klingon Empire</h4>
                    <p className="text-sm text-text-secondary mt-1">Intelligence suggests the High Council views the newly-opened Expanse as a source of untapped resources and, more importantly, a new arena to test their warriors and prove the Empire's might. Expect patrols to be aggressive and honor-bound. They will view any Federation presence as a challenge to their dominance.</p>
                </div>
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-green-400 flex items-center gap-2"><RomulanIcon className="w-5 h-5" />Romulan Star Empire</h4>
                    <p className="text-sm text-text-secondary mt-1">The Romulans are playing a quieter game. The Tal Shiar is undoubtedly active in the Expanse, operating from the shadows to gather intelligence on both Klingon and Federation activities. Their motives are unclear, but they likely seek technological advantages or strategic footholds. Romulan vessels will be elusive, preferring observation to open conflict, but are deadly when cornered.</p>
                </div>
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-blue-400 flex items-center gap-2"><FederationIcon className="w-5 h-5" />United Federation of Planets</h4>
                    <p className="text-sm text-text-secondary mt-1">Starfleet's primary objective is peaceful exploration and scientific discovery. The establishment of Starbases on the fringe of the Expanse serves as a launching point for these missions. However, Command is not naive to the threats posed by the other powers. Your mission, Captain, is to be our eyes, our voice, and if necessary, our sword in this new frontier.</p>
                </div>
            </div>
             <SubHeader>Other Threats</SubHeader>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-orange-400">Orion Syndicate & Other Pirates</h4>
                <p className="text-sm text-text-secondary mt-1">The lawless nature of the Expanse has made it a haven for pirates, smugglers, and mercenaries, chief among them the Orion Syndicate. These groups are opportunistic and ruthless, preying on civilian transports and isolated outposts. They are a constant, unpredictable threat.</p>
            </div>
        </div>
    );
    
    const MechanicsSection = () => (
        <div>
            <SectionHeader>Core Mechanics</SectionHeader>
            <SubHeader>Turn Flow</SubHeader>
            <p>The game is turn-based. In each turn, you can perform one or more actions (e.g., set a navigation course, target a subsystem, fire a weapon). When you are ready, press the "End Turn" button. The game will then resolve your actions, move NPCs, and process combat for that turn.</p>
            <SubHeader>Movement & Navigation</SubHeader>
            <p className="text-text-secondary">The U.S.S. Endeavour's impulse engines have two modes of operation:</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
                <li><strong>Cruise Speed (Green Alert):</strong> When not in combat, the ship can move up to <span className="font-bold text-accent-green">three cells</span> per turn, allowing for rapid travel across sectors.</li>
                <li><strong>Tactical Speed (Red Alert):</strong> During combat, power is diverted to weapons and shields. Movement is reduced to <span className="font-bold text-accent-red">one cell</span> per turn to maximize maneuverability.</li>
                <li><strong>Hazards:</strong> Be aware that moving through or adjacent to certain phenomena, like asteroid fields, can cause damage for each cell you move through.</li>
            </ul>
            <SubHeader>Energy Management</SubHeader>
            <p>Your ship has two power pools:</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
                <li><strong>Main Reactor Power (Allocation):</strong> The 100% you allocate via sliders. This is your primary power for passive systems. Higher allocation to <span className="text-red-400">Weapons</span> boosts phaser damage. Higher allocation to <span className="text-cyan-400">Shields</span> increases shield regeneration per turn. Higher allocation to <span className="text-green-400">Engines</span> provides a small passive evasion bonus.</li>
                <li><strong>Reserve Power (Battery):</strong> A separate pool used for active abilities like Red Alert upkeep, evasive maneuvers, and subsystem targeting. This power recharges slowly when Red Alert is off, but is consumed when it's active. If it runs out, you may use a <span className="text-pink-400">Dilithium</span> crystal to fully recharge it, but this can cause subsystem stress damage.</li>
            </ul>
             <SubHeader>Warp & Scanning</SubHeader>
            <p>From the Quadrant Map, you can travel long distances via Warp Drive. Each warp jump consumes one Dilithium crystal. You can also perform a Long-Range Scan on an adjacent quadrant to reveal basic information about it (e.g., number of hostile contacts) at the cost of Reserve Power.</p>
             <SubHeader>Repairs & Damage Control</SubHeader>
            <p>Damage can be repaired in two ways:</p>
             <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
                <li><strong>Damage Control Teams:</strong> In the Ship Status panel, you can assign your crew to repair the Hull or a specific subsystem. This is a slow process that occurs at the end of each turn and consumes Reserve Power.</li>
                <li><strong>Starbase:</strong> Docking with a friendly Starbase allows for a full repair of all systems, free of charge. You can also resupply torpedoes and dilithium here.</li>
            </ul>
        </div>
    );
    
    const CombatSection = () => (
         <div>
            <SectionHeader>Advanced Combat Theory</SectionHeader>
            <p>Combat is a complex interplay of positioning, power management, and tactical choices.</p>
            <SubHeader>Phaser Combat Breakdown</SubHeader>
            <p className="text-text-secondary">Phaser damage is calculated through several steps. Understanding them is key to victory.</p>
            <ol className="list-decimal list-inside space-y-3 p-2 border border-border-dark rounded mt-2">
                <li>
                    <strong>Hit Chance:</strong> Starts at a base of 90%. If a target is taking Evasive Maneuvers, this is significantly reduced. Your own Evasive Maneuvers also slightly reduce your accuracy. Nebulae in a sector will reduce accuracy for all combatants.
                </li>
                <li>
                    <strong>Base Damage:</strong> Directly proportional to your <span className="text-red-400 font-bold">Power to Weapons</span> allocation. At 100% allocation, your base damage is 20. At 50%, it is 10.
                </li>
                 <li>
                    <strong>Range Modifier:</strong> Phasers lose effectiveness over distance. An attack at maximum range (6-7 hexes) may do only 20-30% of its potential damage. Close-range attacks are devastating.
                </li>
                <li>
                    <strong>Shield Absorption:</strong> Damage is first applied to shields. Healthy shields can absorb an entire phaser blast.
                </li>
                 <li>
                    <strong>Subsystem Targeting & Shield Bypass:</strong> When targeting a specific subsystem (Weapons, Engines, Shields), your phasers attempt to "bleed through" the shields. The weaker the target's shields, the more damage bypasses them and hits the subsystem and hull directly.
                </li>
                 <li>
                    <strong>Targeting Focus Bonus:</strong> Maintaining a lock on the same subsystem for consecutive turns grants a significant damage bonus against that specific subsystem, leading to critical hits.
                </li>
            </ol>
            <SubHeader>Example Scenario</SubHeader>
            <div className="bg-bg-paper-lighter p-3 mt-2 rounded-md font-mono text-sm">
                <p>&gt; <span className="text-secondary-light">SITUATION:</span> U.S.S. Endeavour vs. Klingon D7.</p>
                <p>&gt; <span className="text-secondary-light">RANGE:</span> 3 hexes (effective).</p>
                <p>&gt; <span className="text-secondary-light">PLAYER POWER:</span> 80% to Weapons.</p>
                <p>&gt; <span className="text-secondary-light">KLINGON STATUS:</span> Shields at 50%.</p>
                <p className="mt-2 text-accent-yellow">&gt; --- CALCULATION ---</p>
                <p>&gt; 1. Base Damage: 20 * (80/100) = <span className="text-white font-bold">16</span></p>
                <p>&gt; 2. Range Modifier at 3 hexes: ~0.67x</p>
                <p>&gt; 3. Effective Damage: 16 * 0.67 = <span className="text-white font-bold">~10.7</span></p>
                <p>&gt; 4. Damage to Shields: The D7's shields (10/20) absorb a portion of the hit.</p>
                <p>&gt; 5. Damage to Hull: Remaining damage penetrates to the hull.</p>
                <p className="mt-2 text-accent-yellow">&gt; --- SCENARIO VARIANT: TARGETING WEAPONS ---</p>
                 <p>&gt; The D7's shields are low (50%). A significant portion of the <span className="text-white font-bold">10.7</span> effective damage will bypass the shields, hitting the weapons system and hull directly. If you held the lock from last turn, a <span className="text-white font-bold">1.5x</span> critical multiplier is applied to the subsystem damage, likely disabling it.</p>
            </div>
             <SubHeader>Torpedoes, Boarding, and Retreat</SubHeader>
              <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
                <li><strong>Photon Torpedoes:</strong> Fire-and-forget weapons that travel across the map. They are powerful but have limited ammo and can be shot down by enemy point-defense fire. They always target the hull.</li>
                <li><strong>Boarding / Strike Teams:</strong> If an enemy's shields are below 20%, you can use your Transporter to send a Security team. A <span className="text-purple-400">Boarding</span> action attempts to capture the ship, but you lose the team if it fails. A <span className="text-orange-400">Strike Team</span> deals direct hull damage, with a small chance of losing the team. Both actions require an operational Transporter.</li>
                <li><strong>Retreat:</strong> If there are hostiles present, you can initiate a retreat. For 3 turns, you will be unable to take action as your ship prepares to warp. If you survive, all hostile ships will be removed from the sector.</li>
            </ul>
        </div>
    );

    const AdvancedTacticsSection = () => (
        <div>
            <SectionHeader>Advanced Tactical Operations</SectionHeader>
            <SubHeader>Subsystem Targeting Strategy</SubHeader>
            <p className="text-text-secondary mb-4">A discerning captain knows that simply pounding on an enemy's hull is inefficient. Crippling key systems can neutralize a threat with less risk and greater tactical advantage. An enemy ship is only as dangerous as its functioning components.</p>
            <div className="space-y-3">
                <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <WeaponIcon className="w-8 h-8 text-accent-red flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Weapons</h4>
                        <p className="text-sm text-text-secondary">Disabling an enemy's weapon systems is the most direct way to reduce incoming damage. A ship with zero weapon health cannot fire phasers or launch torpedoes, rendering it harmless from a distance. This is the priority target when facing a high-damage vessel like a Klingon Bird-of-Prey.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <EngineIcon className="w-8 h-8 text-accent-green flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Engines</h4>
                        <p className="text-sm text-text-secondary">A ship that cannot move is a sitting duck. Disabling engines will leave a vessel dead in space, unable to pursue, retreat, or adjust its range. This makes them exceptionally vulnerable to slow-moving, high-damage torpedoes and allows you to control the engagement distance.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <ShieldIcon className="w-8 h-8 text-secondary-main flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Shields</h4>
                        <p className="text-sm text-text-secondary">Destroying the shield generator prevents the enemy from regenerating their shields for the remainder of combat. This means any subsequent hull damage is permanent. This is a powerful long-term strategy in a protracted battle, ensuring that your efforts are not undone by their engineering crews.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <TransporterIcon className="w-8 h-8 text-accent-purple flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Transporter</h4>
                        <p className="text-sm text-text-secondary">While most hostile ships lack transporters, those that possess them (primarily other Federation or high-tier vessels) use them to repel boarders and conduct rapid internal repairs. Disabling their transporter makes them highly vulnerable to your own boarding actions and strike teams.</p>
                    </div>
                </div>
            </div>
            <SubHeader>Away Team & Transporter Doctrine</SubHeader>
            <p className="text-text-secondary mb-4">Your Security Teams and Transporter Room are a versatile strategic asset, not just a last resort. Proper deployment can end a battle or complete a mission without firing a shot.</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-1">
                <li><strong>Condition for Transport:</strong> All transport-based actions (Away Missions, Boarding, Strikes) require two conditions: your Transporter must be online, and the target's shields must be down (or below 20% for enemy ships).</li>
                <li><strong>Boarding Action:</strong> A high-risk, high-reward maneuver. Success instantly captures the enemy vessel, changing its icon to friendly blue on the tactical display. Failure results in the loss of the entire security team and a significant blow to crew morale. Only to be attempted when victory is uncertain or a ship must be taken intact.</li>
                <li><strong>Strike Team:</strong> A lower-risk alternative to boarding. A security team transports over, sabotages a critical system dealing direct hull damage, and transports back. There is a small but non-zero chance of losing the team in the firefight, with a minor morale penalty.</li>
                 <li><strong>Planetary Away Missions:</strong> The primary method of investigating planets. The composition of the away team (Science, Security, Engineering) is determined by your command choice, influencing the probability of success. A disabled Transporter makes these missions impossible.</li>
            </ul>
             <SubHeader>General Order 1: The Prime Directive</SubHeader>
            <div className="border-l-4 border-border-main pl-4 italic text-text-secondary my-4">
                "As the right of each sentient species to live in accordance with its normal cultural evolution is considered sacred, no Starfleet personnel may interfere with the healthy and normal development of alien life and culture. Such interference includes the introduction of superior knowledge, strength, or technology to a world whose society is incapable of handling such advantages wisely."
            </div>
            <p className="text-text-secondary">This is Starfleet's most important mandate. On missions involving pre-warp civilizations—societies that have not yet discovered warp drive on their own—you are forbidden from revealing your ship, your technology, or the existence of extraterrestrial life. This directive will present you with profound ethical dilemmas. You may be forced to allow a natural disaster to run its course to prevent cultural contamination, or find a clever, indirect way to assist that does not violate the spirit of the law. Your choices in these situations will define your career as a Starfleet captain.</p>
        </div>
    );

    const CombatSimulationSection = () => (
        <div>
            <SectionHeader>Appendix A: Combat Simulation Log</SectionHeader>
            <p className="text-text-secondary mb-4">The following simulations are provided to give Starfleet officers a clearer understanding of key combat mechanics. All calculations are derived from standard tactical engagement protocols.</p>
            
            <SubHeader>Simulation 1: Photon Torpedo Impact Analysis</SubHeader>
            <p className="text-text-secondary mb-2">A standard photon torpedo has a base yield of 50 damage. Its effectiveness is heavily mitigated by active shielding.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario A: Target with Full Shields</h4>
                    <p className="text-sm text-secondary-light font-mono mb-2">TARGET: Romulan Warbird (Shields: 20/20)</p>
                    <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> 25% of a torpedo's yield is applied to shields. If the shields can absorb this portion, the kinetic energy of the entire warhead is dissipated, negating all hull damage.</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Damage: 50</p>
                        <p>&gt; Potential Shield Damage: 50 * 0.25 = <span className="text-accent-yellow">12.5</span></p>
                        <p>&gt; Target Shields: 20</p>
                        <p>&gt; Absorbed by Shields: min(20, 12.5) = <span className="text-accent-yellow">12.5</span></p>
                        <p>&gt; Hull Damage Reduction: 12.5 / 0.25 = <span className="text-accent-yellow">50</span></p>
                        <p>&gt; Final Hull Damage: 50 - 50 = <span className="text-accent-red font-bold">0</span></p>
                        <hr className="border-border-dark my-1"/>
                        <p className="text-accent-green">&gt; RESULT: Shields reduced to 7.5. No hull damage.</p>
                    </div>
                </div>
                 <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario B: Unshielded Target</h4>
                    <p className="text-sm text-secondary-light font-mono mb-2">TARGET: Romulan Warbird (Shields: 0/20)</p>
                    <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> With no shields to dissipate the blast, the warhead's full explosive and kinetic force is applied directly to the hull.</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Damage: 50</p>
                        <p>&gt; Potential Shield Damage: 50 * 0.25 = <span className="text-accent-yellow">12.5</span></p>
                        <p>&gt; Target Shields: 0</p>
                        <p>&gt; Absorbed by Shields: min(0, 12.5) = <span className="text-accent-yellow">0</span></p>
                        <p>&gt; Hull Damage Reduction: 0 / 0.25 = <span className="text-accent-yellow">0</span></p>
                        <p>&gt; Final Hull Damage: 50 - 0 = <span className="text-accent-red font-bold">50</span></p>
                        <hr className="border-border-dark my-1"/>
                        <p className="text-accent-green">&gt; RESULT: Target suffers 50 hull damage.</p>
                    </div>
                </div>
            </div>
            <SubHeader>Simulation 2: Evasive Maneuvers & Hit Probability</SubHeader>
            <p className="text-text-secondary mb-2">Phaser accuracy is subject to various modifiers. The base hit chance is 90%.</p>
             <div className="space-y-2">
                <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario A: Target is Evasive</h4>
                    <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> Engaging evasive maneuvers grants the target a powerful defensive bonus, multiplying the incoming hit chance by 0.6.</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Hit Chance: 90%</p>
                        <p>&gt; Target Evasive Modifier: x0.6</p>
                        <p>&gt; Final Hit Chance: 90% * 0.6 = <span className="text-accent-green font-bold">54%</span></p>
                    </div>
                </div>
                 <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario B: Player is Also Evasive</h4>
                    <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> Your own evasive maneuvers affect your targeting computers, applying a 0.75x penalty to your own accuracy.</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Hit Chance: 90%</p>
                        <p>&gt; Target Evasive Modifier: x0.6</p>
                        <p>&gt; Player Evasive Penalty: x0.75</p>
                        <p>&gt; Final Hit Chance: 90% * 0.6 * 0.75 = <span className="text-accent-green font-bold">40.5%</span></p>
                    </div>
                </div>
            </div>
            <SubHeader>Simulation 3: Shield Regeneration Calculation</SubHeader>
            <p className="text-text-secondary mb-2">Shields regenerate at the end of each turn, provided Red Alert is active. The amount is determined by your power allocation.</p>
            <p className="text-sm text-text-secondary italic mb-2"><strong>FORMULA:</strong> (Max Shields * 0.10) * (% Power to Shields)</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario A: Low Power to Shields</h4>
                    <p className="text-sm text-secondary-light font-mono mb-2">ENDEAVOUR: Max Shields 50, Power: 20%</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Regen Amount: 50 * 0.10 = 5</p>
                        <p>&gt; Power Multiplier: 20% (0.20)</p>
                        <p>&gt; Regen This Turn: 5 * 0.20 = <span className="text-accent-green font-bold">1.0 point</span></p>
                    </div>
                </div>
                 <div className="bg-bg-paper-lighter p-3 rounded-md">
                    <h4 className="font-bold text-white">Scenario B: High Power to Shields</h4>
                    <p className="text-sm text-secondary-light font-mono mb-2">ENDEAVOUR: Max Shields 50, Power: 80%</p>
                    <div className="font-mono text-xs bg-black p-2 rounded">
                        <p>&gt; Base Regen Amount: 50 * 0.10 = 5</p>
                        <p>&gt; Power Multiplier: 80% (0.80)</p>
                        <p>&gt; Regen This Turn: 5 * 0.80 = <span className="text-accent-green font-bold">4.0 points</span></p>
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="panel-style h-full w-full max-w-6xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-primary-light">STARFLEET PLAYER'S MANUAL</h1>
                    <button onClick={onClose} className="btn btn-tertiary">Close Manual</button>
                </div>
                <div className="flex-grow flex gap-4 min-h-0">
                    <nav className="w-1/4 flex-shrink-0 flex flex-col gap-1 panel-style p-2">
                         <SectionLink active={activeSection === 'intro'} onClick={() => setActiveSection('intro')}>Introduction</SectionLink>
                         <SectionLink active={activeSection === 'ui'} onClick={() => setActiveSection('ui')}>Bridge Interface</SectionLink>
                         <SectionLink active={activeSection === 'registry'} onClick={() => setActiveSection('registry')}>Entity Registry</SectionLink>
                         <SectionLink active={activeSection === 'officers'} onClick={() => setActiveSection('officers')}>Bridge Officer Dossiers</SectionLink>
                         <SectionLink active={activeSection === 'lore'} onClick={() => setActiveSection('lore')}>Typhon Expanse Primer</SectionLink>
                         <SectionLink active={activeSection === 'mechanics'} onClick={() => setActiveSection('mechanics')}>Core Mechanics</SectionLink>
                         <SectionLink active={activeSection === 'combat'} onClick={() => setActiveSection('combat')}>Advanced Combat</SectionLink>
                         <SectionLink active={activeSection === 'advanced'} onClick={() => setActiveSection('advanced')}>Advanced Tactics</SectionLink>
                         <SectionLink active={activeSection === 'simulations'} onClick={() => setActiveSection('simulations')}>Appendix: Combat Sims</SectionLink>
                    </nav>
                    <main className="w-3/4 flex-grow panel-style p-4 overflow-y-auto">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PlayerManual;