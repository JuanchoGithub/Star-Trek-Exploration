import React, { useState } from 'react';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { shipTypes } from '../assets/ships/configs/shipTypes';
import { starbaseType } from '../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { PlayerShipIcon } from '../assets/ships/icons';
import { StarbaseIcon } from '../assets/starbases/icons';
import { MClassIcon } from '../assets/planets/icons';
import { NavigationTargetIcon } from '../assets/ui/icons';

type Section = 'intro' | 'ui' | 'registry' | 'mechanics' | 'combat';

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

const SubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-accent-yellow mt-6 mb-2">{children}</h3>
);

const IconStat: React.FC<{ icon: React.ReactNode, label: string, value: string | number, description: string }> = ({ icon, label, value, description }) => (
    <div className="flex items-start gap-4 p-2 bg-black rounded">
        <div className="text-secondary-light pt-1">{icon}</div>
        <div className="flex-grow">
            <div className="flex justify-between items-baseline">
                <span className="font-bold">{label}</span>
                <span className="text-accent-orange font-mono">{value}</span>
            </div>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
    </div>
);

const PlayerManual: React.FC<PlayerManualProps> = ({ onClose, themeName }) => {
    const [activeSection, setActiveSection] = useState<Section>('intro');
    const { WeaponIcon, ShieldIcon, EngineIcon, TorpedoIcon, SecurityIcon, ScanIcon, HailIcon, RetreatIcon, TransporterIcon } = getFactionIcons(themeName);

    const renderContent = () => {
        switch(activeSection) {
            case 'intro': return <IntroductionSection />;
            case 'ui': return <UISection />;
            case 'registry': return <RegistrySection />;
            case 'mechanics': return <MechanicsSection />;
            case 'combat': return <CombatSection />;
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

    const UISection = () => (
        <div>
            <SectionHeader>The Bridge Interface</SectionHeader>
            <p>Your command interface is divided into two primary columns and a status line at the bottom.</p>
            <SubHeader>Left Column: Viewscreen & Operations</SubHeader>
            <p className="text-text-secondary">This area contains your view of the current sector and your primary command console.</p>
            <div className="mt-4 p-2 border border-border-dark rounded">
                <div className="font-bold mb-2">1. The Viewscreen</div>
                <p>Displays either the current <strong>Sector View</strong> or the strategic <strong>Quadrant Map</strong>. You can switch between them using the vertical tabs.</p>
                <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                    <li><strong>Sector View:</strong> A tactical grid of the current sector. Click on an empty square to set a <NavigationTargetIcon className="w-4 h-4 inline-block text-accent-yellow" /> navigation target. Click on an entity like a <PlayerShipIcon className="w-4 h-4 inline-block text-blue-400" /> ship or <MClassIcon className="w-4 h-4 inline-block text-green-500" /> planet to select it.</li>
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
    );
    
    const RegistrySection = () => {
        const ShipEntry: React.FC<{faction: keyof typeof shipTypes, name: string, description: string, stats: string}> = ({ faction, name, description, stats }) => {
            const Wireframe = shipTypes[faction].wireframe;
            const Icon = shipTypes[faction].icon;
            return (
                <div className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-6 p-3 bg-bg-paper-lighter rounded">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24"><Wireframe /></div>
                        <Icon className={`w-12 h-12 mt-2 ${shipTypes[faction].colorClass}`} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-secondary-light">{name}</h4>
                        <p className="text-text-secondary text-sm mb-2">{description}</p>
                        <p className="font-mono text-accent-orange text-sm bg-black p-2 rounded">{stats}</p>
                    </div>
                </div>
            )
        };
        return (
            <div>
                <SectionHeader>Entity Registry</SectionHeader>
                <SubHeader>Hostile Forces</SubHeader>
                <ShipEntry faction="Klingon" name="Klingon D7-Class" description="The workhorse of the Klingon fleet. Aggressive tactics, heavy forward disruptors, and an appetite for glorious battle. Expect torpedoes." stats="HULL: 60 | SHIELDS: 20 | TORPEDOES: 4" />
                <ShipEntry faction="Romulan" name="Romulan D'deridex-Type Warbird" description="A feared vessel of the Romulan Star Empire. Often found patrolling their borders. They rely on powerful plasma weaponry and cloaking devices (not simulated)." stats="HULL: 60 | SHIELDS: 20 | TORPEDOES: 4" />
                <ShipEntry faction="Pirate" name="Orion Pirate Vessel" description="A jury-rigged ship, common among raiders in the Expanse. What it lacks in durability, it makes up for in ferocity. Weak shields are their primary vulnerability." stats="HULL: 40 | SHIELDS: 10 | TORPEDOES: 2" />

                <SubHeader>Neutral & Other Contacts</SubHeader>
                 <ShipEntry faction="Independent" name="Independent Freighter" description="Civilian traders and transports. Typically not hostile unless provoked. They possess minimal armament and defenses." stats="HULL: 30 | SHIELDS: 0 | TORPEDOES: 0" />
                 <div className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-6 p-3 bg-bg-paper-lighter rounded">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24"><starbaseType.wireframe /></div>
                        <StarbaseIcon className={`w-12 h-12 mt-2 ${starbaseType.colorClass}`} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-secondary-light">Starbase</h4>
                        <p className="text-text-secondary text-sm mb-2">Federation outposts. Dock with them to fully repair your ship, recharge dilithium, and resupply torpedoes.</p>
                        <p className="font-mono text-accent-orange text-sm bg-black p-2 rounded">HULL: 500 | SHIELDS: N/A</p>
                    </div>
                </div>
            </div>
        )
    };
    
    const MechanicsSection = () => (
        <div>
            <SectionHeader>Core Mechanics</SectionHeader>
            <SubHeader>Turn Flow</SubHeader>
            <p>The game is turn-based. In each turn, you can perform one or more actions (e.g., set a navigation course, target a subsystem, fire a weapon). When you are ready, press the "End Turn" button. The game will then resolve your actions, move NPCs, and process combat for that turn.</p>
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
                    <strong>Hit Chance:</strong> Starts at a base of 90%. If a target is taking Evasive Maneuvers, this is significantly reduced. Your own Evasive Maneuvers also slightly reduce your accuracy.
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
                         <SectionLink active={activeSection === 'mechanics'} onClick={() => setActiveSection('mechanics')}>Core Mechanics</SectionLink>
                         <SectionLink active={activeSection === 'combat'} onClick={() => setActiveSection('combat')}>Advanced Combat</SectionLink>
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