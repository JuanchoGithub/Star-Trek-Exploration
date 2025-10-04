import React from 'react';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { asteroidType } from '../../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../../assets/beacons/configs/beaconTypes';
import { StarfleetLogoIcon, KlingonLogoIcon, RomulanLogoIcon } from '../../assets/ui/icons';
import { ShipModel, ShipSubsystems, BeamWeapon, ProjectileWeapon } from '../../types';
import { SectionHeader, SubHeader } from './shared';
import { shuttleType } from '../../assets/shuttles/configs/shuttleType';
import { shipClasses, ShipClassStats } from '../../assets/ships/configs/shipClassStats';
// FIX: Removed import for non-existent PirateEscortIcon.
import { IndependentFreighterIcon } from '../../assets/ships/icons';

const FactionHeader: React.FC<{ name: string, icon: React.ReactNode }> = ({ name, icon }) => (
    <div id={`registry-${name.toLowerCase().replace(/ /g, '-')}`} className="flex items-center gap-3 mt-8 mb-4 border-b-2 border-border-dark pb-2">
        {icon}
        <h3 className="text-2xl font-bold">{name}</h3>
    </div>
);

const shipTacticalInfo: Record<string, { description: string; notes: string; }> = {
    // Federation
    'Sovereign-class': {
        description: 'The pinnacle of Starfleet engineering. This powerful dreadnought serves as a flagship, boasting formidable weaponry, advanced systems, and an exceptionally durable hull. The U.S.S. Endeavour is of this class.',
        notes: 'Armed with powerful Type VIII, IX, or X phasers (Range: 7-8) and Quantum Torpedoes. Features a high-capacity shuttlebay for extensive away missions.',
    },
    'Constitution-class': {
        description: 'A legendary class of heavy cruiser designed for long-range exploration and defense. It represents a perfect balance between scientific capability and combat readiness.',
        notes: 'Features a balanced loadout of Type V, VI, or VII phasers (Range: 6-7) and standard photon torpedoes.',
    },
    'Galaxy-class': {
        description: 'A massive explorer-type vessel, designed for multi-generational missions into deep space. While not a dedicated warship, its immense size allows for incredibly powerful shields and robust systems, making it a defensive powerhouse.',
        notes: 'Typically armed with Type IV, V, or VI phaser arrays (Range: 5-6) and photon torpedoes. Can perform saucer separation in extreme emergencies.',
    },
    'Intrepid-class': {
        description: 'A small, swift scout ship equipped with the latest sensor technology. It is one of the fastest and most maneuverable ships in the fleet, ideal for reconnaissance and rapid response.',
        notes: 'Armed with advanced Type VII, VIII, or IX phaser arrays (Range: 7-8). Lacks heavy armor but possesses advanced sensor suites.',
    },
    'Defiant-class': {
        description: 'Originally designed to fight the Borg, this escort is little more than an engine with weapons attached. It is exceptionally powerful for its size but lacks amenities for long-term missions.',
        notes: 'Features high-output Pulse Phaser Cannons (Range: 4) and Quantum Torpedoes. Possesses a rare, treaty-permitted cloaking device.',
    },
    // Klingon
    'B\'rel-class Bird-of-Prey': {
        description: 'A classic Klingon vessel, the Bird-of-Prey is a versatile raider and scout. Its speed, cloaking device, and powerful forward-facing disruptors make it perfect for hit-and-run ambushes.',
        notes: 'Vulnerable if its cloak is penetrated or if it is caught in a sustained fight.',
    },
    'K\'t\'inga-class': {
        description: "The workhorse of the Klingon Defense Force. This battlecruiser is a durable and straightforward assault vessel, designed for direct, honorable combat without the subtlety of a cloak.",
        notes: 'Relies on brute force and heavy forward disruptor cannons.',
    },
    'Vor\'cha-class': {
        description: "A modern Klingon attack cruiser that balances firepower, durability, and maneuverability, making it a versatile and unpredictable mid-game threat.",
        notes: 'Intelligence reports indicate that approximately 80% of Vor\'cha-class vessels are equipped with a cloaking device, making them a significant ambush threat. Often serves as a command ship for smaller battle groups.',
    },
    'Negh\'Var-class': {
        description: 'The largest and most powerful warship in the Klingon fleet. A true battleship, it is slow but immensely powerful, capable of withstanding incredible punishment while delivering devastating barrages.',
        notes: 'Lacks a cloaking device, announcing its formidable presence to all in the sector.',
    },
    // Romulan
    'D\'deridex-class': {
        description: 'The iconic symbol of Romulan power. This massive warbird is a stealth powerhouse, combining a superior cloaking device with devastating plasma torpedoes to strike from the shadows.',
        notes: 'Its primary weakness is its relatively slow speed and large target profile when decloaked.',
    },
    'Valdore-type': {
        description: 'A newer, more agile class of warbird. While not as heavily armed as a D\'deridex, its speed and advanced cloaking systems make it a superb infiltrator and scout.',
        notes: 'Often operates in pairs, a "Talon" of ships, to overwhelm targets.',
    },
    'Scimitar-class': {
        description: 'A terrifyingly powerful command ship. While slow and ponderous, its overwhelming shields, incredible firepower, and advanced cloak make it a true flagship.',
        notes: 'Complex power systems may cause a delay between decloaking and firing main weapons. Intelligence reports on its ability to fire while cloaked are conflicting; current analysis indicates this feature is not operationally active.',
    },
    // Pirate
    'Orion Raider': {
        description: 'A light, fast vessel favored by Orion pirates and other raiders. It is a classic scavenger and harasser, sacrificing durability for speed and maneuverability.',
        notes: 'Often operates in packs and will flee if outmatched. Intelligence reports suggest a small number have been fitted with dangerously unstable cloaking devices.',
    },
    'Ferengi Marauder': {
        description: 'While ostensibly a trade vessel, the D\'Kora-class Marauder is surprisingly well-armed. It is often used by Ferengi to "disrupt" trade rivals and defend their profitable ventures.',
        notes: 'Favors disabling attacks on engines to capture vessels intact for "salvage". May rarely be equipped with a jury-rigged cloaking system.',
    },
    'Nausicaan Battleship': {
        description: 'A brute-force raider built for one purpose: smashing through defenses. It is slow and lacks finesse, but its heavy armor and powerful weapons make it a serious threat in a direct confrontation.',
        notes: 'Will press the attack relentlessly, even when heavily damaged. Has been sighted on rare occasions using a high-power, unstable cloaking field.',
    },
    // Independent
    'Civilian Freighter': {
        description: 'A common cargo hauler found throughout the quadrant. They have large hulls but are slow and possess only minimal defensive capabilities. Often require assistance when attacked.',
        notes: 'Generally not a threat, but may be carrying valuable cargo.',
    }
};

const StatRating: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div>
        <dt className="text-xs font-bold uppercase text-text-disabled">{label}</dt>
        <dd className="text-sm text-text-primary">{value}</dd>
    </div>
);

const getQualitativeRating = (value: number, thresholds: [number, number, number, number]): string => {
    if (value >= thresholds[3]) return 'Extreme';
    if (value >= thresholds[2]) return 'Very Strong';
    if (value >= thresholds[1]) return 'Strong';
    if (value >= thresholds[0]) return 'Medium';
    return 'Light';
};

const EnergyProfile: React.FC<{ stats: ShipClassStats }> = ({ stats }) => {
    const consumptionItems: { label: string; value: number }[] = [
        { label: 'Base Systems', value: stats.systemConsumption.base },
        { label: 'Weapons', value: stats.systemConsumption.weapons },
        { label: 'Shields', value: stats.systemConsumption.shields },
        { label: 'Life Support', value: stats.systemConsumption.lifeSupport },
        { label: 'Computer', value: stats.systemConsumption.computer },
        { label: 'Transporter', value: stats.systemConsumption.transporter },
        { label: 'Point Defense', value: stats.systemConsumption.pointDefense },
        { label: 'Shuttlebay', value: stats.systemConsumption.shuttlecraft },
    ].filter(item => item.value > 0);

    const totalPassiveConsumption = consumptionItems.reduce((sum, item) => sum + item.value, 0);

    return (
        <div>
            <h5 className="text-sm font-bold text-accent-yellow mb-2">Energy Profile</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                    <dt className="font-bold text-text-secondary">Baseline Generation</dt>
                    <dd className="text-green-400 font-mono">+{stats.baseEnergyGeneration.toFixed(1)} / turn (at 33% Engines)</dd>
                </div>
                <div>
                    <dt className="font-bold text-text-secondary">Total Passive Consumption</dt>
                    <dd className="text-red-400 font-mono">-{totalPassiveConsumption.toFixed(1)} / turn</dd>
                </div>
                <div className="col-span-2">
                    <dt className="font-bold text-text-secondary text-xs uppercase tracking-wider mt-2">Consumption Breakdown:</dt>
                    <dd>
                        <ul className="list-disc list-inside text-xs">
                            {consumptionItems.map(item => (
                                <li key={item.label} className="flex justify-between">
                                    <span>{item.label}</span>
                                    <span className="font-mono text-red-400">-{item.value.toFixed(1)}</span>
                                </li>
                            ))}
                        </ul>
                    </dd>
                </div>
                 <p className="text-xs italic text-text-disabled col-span-2 mt-2">Note: Tactical actions like raising shields (+20), evasive maneuvers (+10), and active point-defense (+15) add to the total consumption cost per turn.</p>
            </div>
        </div>
    );
};

const WeaponInfo: React.FC<{ weapons: (BeamWeapon | ProjectileWeapon)[], ammo: ShipClassStats['ammo'] }> = ({ weapons, ammo }) => {
    const beamWeapons = weapons.filter(w => w.type === 'beam') as BeamWeapon[];
    const projectileLaunchers = weapons.filter(w => w.type === 'projectile') as ProjectileWeapon[];

    return (
        <div className="col-span-full">
            <dt className="text-xs font-bold uppercase text-text-disabled">Weapon Loadout</dt>
            <dd className="text-sm text-text-primary">
                <ul className="list-disc list-inside">
                    {beamWeapons.map(w => (
                        <li key={w.id}>{w.name} (Dmg: {w.baseDamage}, Rng: {w.range})</li>
                    ))}
                    {projectileLaunchers.map(w => {
                        const ammoInfo = ammo[w.ammoType];
                        return (
                            <li key={w.id}>{w.name} (Ammo: {ammoInfo ? ammoInfo.max : 0} {w.ammoType})</li>
                        );
                    })}
                </ul>
            </dd>
        </div>
    );
};

const ClassEntry: React.FC<{ model: ShipModel, shipClass: ShipClassStats }> = ({ model, shipClass }) => {
    const visualConfig = shipVisuals[model]?.classes[shipClass.name] ?? shipVisuals.Unknown.classes['Unknown'];
    if (!visualConfig) return null;
    
    const Icon = visualConfig.icon;
    const tacticalInfo = shipTacticalInfo[shipClass.name] || { description: 'No tactical summary available.', notes: 'None' };

    const weaponRating = getQualitativeRating(shipClass.subsystems.weapons.maxHealth, [80, 120, 160, 200]);
    const shieldRating = getQualitativeRating(shipClass.maxShields, [60, 90, 110, 130]);
    const hullRating = getQualitativeRating(shipClass.maxHull, [200, 300, 400, 500]);

    let cloakDisplayValue = 'No';
    if (shipClass.cloakChance) {
        if (shipClass.cloakChance === 1.0) {
            cloakDisplayValue = `Yes (${shipClass.cloakEnergyCost.maintain} Pwr/turn)`;
        } else {
            cloakDisplayValue = `${shipClass.cloakChance * 100}% Chance`;
        }
    }

    return (
        <div className="mb-6 p-3 bg-bg-paper-lighter rounded">
            <div className="flex items-start gap-4 mb-3">
                <Icon className={`w-20 h-20 flex-shrink-0 ${visualConfig.colorClass}`} />
                <div>
                    <h4 className="text-xl font-bold text-secondary-light">{shipClass.name}</h4>
                    <p className="text-md italic text-text-disabled mb-2">Role: {shipClass.role}</p>
                    <p className="text-text-secondary text-sm">{tacticalInfo.description}</p>
                </div>
            </div>

            <div className="panel-style p-3 bg-black grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {/* Left Column: Tactical Profile */}
                <div>
                    <h5 className="text-sm font-bold text-accent-yellow mb-2">Tactical Profile</h5>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <StatRating label="Hull Integrity" value={`${hullRating} (${shipClass.maxHull})`} />
                        <StatRating label="Shield Capacity" value={`${shieldRating} (${shipClass.maxShields})`} />
                        <StatRating label="Weapon Power" value={weaponRating} />
                        <StatRating label="Energy Reserves" value={String(shipClass.energy.max)} />
                        <StatRating label="Dilithium Stores" value={String(shipClass.dilithium.max)} />
                        <StatRating label="Cloaking Device" value={cloakDisplayValue} />
                        <StatRating label="Shuttlebay" value={`${shipClass.shuttleCount} craft`} />
                        <div className="col-span-full">
                            <dt className="text-xs font-bold uppercase text-text-disabled">Special Notes</dt>
                            <dd className="text-sm text-text-primary italic">{tacticalInfo.notes}</dd>
                        </div>
                        <WeaponInfo weapons={shipClass.weapons} ammo={shipClass.ammo} />
                    </dl>
                </div>

                {/* Right Column: Energy Profile */}
                <div>
                    <EnergyProfile stats={shipClass} />
                </div>
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

export const RegistrySection: React.FC = () => {
    const PirateIcon = shipVisuals.Pirate.classes['Orion Raider']!.icon;

    return (
        <div>
            <SectionHeader>Entity Registry</SectionHeader>
            <p>A registry of all known vessels, planets, and anomalies identified by Starfleet in the Typhon Expanse.</p>
            <div className="flex gap-2 my-4 flex-wrap">
                <a href="#registry-federation" className="btn btn-tertiary">Federation</a>
                <a href="#registry-klingon-empire" className="btn btn-tertiary">Klingon</a>
                <a href="#registry-romulan-star-empire" className="btn btn-tertiary">Romulan</a>
                <a href="#registry-pirate-&-independent" className="btn btn-tertiary">Pirate &amp; Independent</a>
                <a href="#registry-other-entities" className="btn btn-tertiary">Other Entities</a>
            </div>
            
            <FactionHeader name="Federation" icon={<StarfleetLogoIcon className="w-8 h-8" />} />
            {Object.values(shipClasses.Federation).map(sc => <ClassEntry key={sc.name} model="Federation" shipClass={sc} />)}

            <FactionHeader name="Klingon Empire" icon={<KlingonLogoIcon className="w-8 h-8 text-red-500" />} />
            {Object.values(shipClasses.Klingon).map(sc => <ClassEntry key={sc.name} model="Klingon" shipClass={sc} />)}

            <FactionHeader name="Romulan Star Empire" icon={<RomulanLogoIcon className="w-8 h-8 text-green-500" />} />
            {Object.values(shipClasses.Romulan).map(sc => <ClassEntry key={sc.name} model="Romulan" shipClass={sc} />)}
            
            <FactionHeader name="Pirate & Independent" icon={<div className="flex items-center gap-2"><PirateIcon className="w-8 h-8 text-orange-500" /><IndependentFreighterIcon className="w-8 h-8 text-gray-300" /></div>} />
            {Object.values(shipClasses.Pirate).map(sc => <ClassEntry key={sc.name} model="Pirate" shipClass={sc} />)}
            {Object.values(shipClasses.Independent).map(sc => <ClassEntry key={sc.name} model="Independent" shipClass={sc} />)}

            <SubHeader id="registry-other-entities">Other Entities & Installations</SubHeader>
            {Object.values(starbaseTypes).map(starbase => (
                <OtherEntityEntry key={starbase.key} config={starbase} name={starbase.name} description={starbase.description} />
            ))}
            <OtherEntityEntry config={planetTypes.M} name="M-Class Planet" description="A terrestrial, Earth-like world capable of supporting carbon-based life. Often home to civilizations or valuable biological resources. Prime candidates for away missions." />
            <OtherEntityEntry config={planetTypes.J} name="J-Class Planet" description="A massive gas giant, rich in various gases that may be valuable but unsuitable for standard away missions. Often has numerous moons." />
            <OtherEntityEntry config={planetTypes.L} name="L-Class Planet" description="A marginally habitable world with a thin atmosphere or extreme temperatures. Life may exist, but it is often primitive or highly adapted. Suitable for some away missions." />
            <OtherEntityEntry config={planetTypes.D} name="D-Class Planet" description="A barren rock or asteroid, devoid of atmosphere and life. May contain valuable mineral deposits but is otherwise unremarkable." />
            <OtherEntityEntry config={asteroidType} name="Asteroid Field" description="A dense field of rock and ice. While ships can enter these fields for tactical cover or to find shortcuts, they are hazardous environments. Ending a turn inside an asteroid field risks taking damage from micrometeoroid impacts." />
            <OtherEntityEntry config={beaconType} name="Event Beacon" description="An unidentified signal source. Approaching these beacons can trigger unique events, ranging from derelict ships and distress calls to ancient alien artifacts." />
            <OtherEntityEntry config={shuttleType} name="Shuttle" description="Small, short-range auxiliary craft. Used for away missions on gas giants where transporters are ineffective, and as escape pods during emergencies. Lacks weapons or significant defenses." />
        </div>
    )
};