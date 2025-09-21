import React from 'react';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { asteroidType } from '../../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../../assets/beacons/configs/beaconTypes';
import { StarfleetLogoIcon, KlingonLogoIcon, RomulanLogoIcon } from '../../assets/ui/icons';
import { ShipModel, ShipRole } from '../../types';
import { SectionHeader, SubHeader } from './shared';
import { shuttleType } from '../../assets/shuttles/configs/shuttleType';
import { torpedoType } from '../../assets/projectiles/configs/projectileType';

const FactionHeader: React.FC<{ name: string, icon: React.ReactNode }> = ({ name, icon }) => (
    <div id={`registry-${name.toLowerCase().replace(/ /g, '-')}`} className="flex items-center gap-3 mt-8 mb-4 border-b-2 border-border-dark pb-2">
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

export const RegistrySection: React.FC = () => {
    const PirateIcon = shipVisuals.Pirate.roles.Escort!.icon;

    return (
        <div>
            <SectionHeader>Entity Registry</SectionHeader>
            <p>A registry of all known vessels, planets, and anomalies identified by Starfleet in the Typhon Expanse.</p>
            <div className="flex gap-2 my-4 flex-wrap">
                <a href="#registry-federation" className="btn btn-tertiary">Federation</a>
                <a href="#registry-klingon-empire" className="btn btn-tertiary">Klingon</a>
                <a href="#registry-romulan-star-empire" className="btn btn-tertiary">Romulan</a>
                <a href="#registry-pirate-&-orion-syndicate" className="btn btn-tertiary">Pirate</a>
                <a href="#registry-other-entities" className="btn btn-tertiary">Other Entities</a>
            </div>
            
            <FactionHeader name="Federation" icon={<StarfleetLogoIcon className="w-8 h-8" />} />
            <RoleEntry model="Federation" role="Dreadnought" name="Dreadnought" description="A powerful capital ship representing the pinnacle of Federation engineering. Slower than other classes, but boasts formidable weaponry, advanced systems, and an exceptionally durable hull. The U.S.S. Endeavour is of this class." />
            <RoleEntry model="Federation" role="Explorer" name="Explorer" description="Balanced vessels designed for long-range missions. They boast strong shields, versatile subsystems, and high energy reserves, but are not dedicated warships." />
            <RoleEntry model="Federation" role="Cruiser" name="Cruiser" description="A heavier class of starship, serving as the fleet's backbone in combat situations. Well-armed and armored, they sacrifice some scientific utility for increased firepower and durability." />
            <RoleEntry model="Federation" role="Escort" name="Escort" description="Small, fast, and highly maneuverable warships designed for patrol, interception, and fleet support. While fragile, their high damage output makes them a significant threat." />
            <RoleEntry model="Federation" role="Freighter" name="Freighter" description="Civilian cargo haulers under Federation registry. They have large hulls but are slow and possess only minimal defensive capabilities. Often require assistance when attacked." />

            <FactionHeader name="Klingon Empire" icon={<KlingonLogoIcon className="w-8 h-8 text-red-500" />} />
            <RoleEntry model="Klingon" role="Cruiser" name="Cruiser (Bird-of-Prey)" description="The workhorse of the Klingon Defense Force. A versatile combat vessel with powerful disruptors and a cloaking device, designed for direct, honorable confrontation." />
            <RoleEntry model="Klingon" role="Escort" name="Escort (Raptor)" description="A fast attack craft, more nimble than the standard Bird-of-Prey. Used for raiding, reconnaissance, and overwhelming smaller targets with speed and aggression." />
            <RoleEntry model="Klingon" role="Freighter" name="Freighter" description="Armored Klingon transports. While primarily for cargo, they are more heavily armed than their civilian counterparts and should not be underestimated." />

            <FactionHeader name="Romulan Star Empire" icon={<RomulanLogoIcon className="w-8 h-8 text-green-500" />} />
            <RoleEntry model="Romulan" role="Cruiser" name="Cruiser (Warbird)" description="The iconic symbol of Romulan power. These massive warships are heavily armed and possess superior cloaking technology, preferring to strike from the shadows with devastating precision." />
            <RoleEntry model="Romulan" role="Escort" name="Escort (Hawk)" description="A smaller, faster class of warship. While less powerful than a Warbird, they are still a deadly threat, often used for patrols along the Neutral Zone and for surgical strikes." />
            
            <FactionHeader name="Pirate & Orion Syndicate" icon={<PirateIcon className="w-8 h-8 text-orange-500" />} />
            <RoleEntry model="Pirate" role="Escort" name="Raider/Escort" description="A fast, lightly armored ship favored by pirates. They are glass cannons, boasting high-powered engines and weapons but suffering from weak hulls and shields. Typically rely on ambush tactics." />
            <RoleEntry model="Pirate" role="Cruiser" name="Cruiser" description="A captured and heavily modified freighter or older warship. Bristling with mismatched weapon systems and reinforced plating, these vessels are surprisingly durable and dangerous in a brawl." />

            <SubHeader id="registry-other-entities">Other Entities & Installations</SubHeader>
            {Object.values(starbaseTypes).map(starbase => (
                <OtherEntityEntry key={starbase.key} config={starbase} name={starbase.name} description={starbase.description} />
            ))}
            <OtherEntityEntry config={planetTypes.M} name="M-Class Planet" description="A terrestrial, Earth-like world capable of supporting carbon-based life. Often home to civilizations or valuable biological resources. Prime candidates for away missions." />
            <OtherEntityEntry config={planetTypes.J} name="J-Class Planet" description="A massive gas giant, rich in various gases that may be valuable but unsuitable for standard away missions. Often has numerous moons." />
            <OtherEntityEntry config={planetTypes.L} name="L-Class Planet" description="A marginally habitable world with a thin atmosphere or extreme temperatures. Life may exist, but it is often primitive or highly adapted. Suitable for some away missions." />
            <OtherEntityEntry config={planetTypes.D} name="D-Class Planet" description="A barren rock or asteroid, devoid of atmosphere and life. May contain valuable mineral deposits but is otherwise unremarkable." />
            <OtherEntityEntry config={asteroidType} name="Asteroid Field" description="A dense field of rock and ice. Navigating adjacent to these fields is hazardous, as micrometeoroid impacts can damage shields and hull." />
            <OtherEntityEntry config={beaconType} name="Event Beacon" description="An unidentified signal source. Approaching these beacons can trigger unique events, ranging from derelict ships and distress calls to ancient alien artifacts." />
            <OtherEntityEntry config={shuttleType} name="Shuttle" description="Small, short-range auxiliary craft. Used for away missions on gas giants where transporters are ineffective, and as escape pods during emergencies. Lacks weapons or significant defenses." />
            <OtherEntityEntry config={torpedoType} name="Photon Torpedo" description="A powerful projectile weapon. Torpedoes travel across the sector to their target but can be intercepted by enemy point-defense fire. They deal significant damage directly to the hull if they connect." />

        </div>
    )
};