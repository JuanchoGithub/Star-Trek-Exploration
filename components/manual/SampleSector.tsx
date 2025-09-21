import React from 'react';
import type { SectorTemplate, EntityTemplate, ShipModel } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../../assets/beacons/configs/beaconTypes';
// FIX: Import shipClasses to find a representative ship class for a given role.
import { shipClasses } from '../../assets/ships/configs/shipClassStats';

interface SampleSectorProps {
    template: SectorTemplate;
}

const entityPositions = [
    { top: '12.5%', left: '30%' },
    { top: '12.5%', left: '70%' },
    { top: '37.5%', left: '50%' },
    { top: '62.5%', left: '30%' },
    { top: '62.5%', left: '70%' },
    { top: '87.5%', left: '50%' },
];

const getIconForTemplate = (entityTemplate: EntityTemplate) => {
    switch (entityTemplate.type) {
        case 'ship': {
            // FIX: Reworked logic to find a representative ship class for a given role to look up visuals.
            const faction = (entityTemplate.faction === 'Inherit' ? 'Federation' : entityTemplate.faction) as ShipModel;
            const visualConfig = shipVisuals[faction];
            const factionAllClasses = shipClasses[faction];
            if (!visualConfig || !factionAllClasses) return null;

            const role = Array.isArray(entityTemplate.shipRole) ? entityTemplate.shipRole[0] : entityTemplate.shipRole;
            if (!role) return null;

            const matchingClassName = Object.keys(factionAllClasses).find(cn => factionAllClasses[cn].role === role);

            const classNameToUse = matchingClassName || Object.keys(visualConfig.classes)[0];
            if (!classNameToUse) return null;
            
            const classConfig = visualConfig.classes[classNameToUse];
            if (!classConfig) return null;
            
            const IconComponent = classConfig.icon;
            return <IconComponent className={`w-6 h-6 ${classConfig.colorClass}`} />;
        }
        case 'planet': {
            const planetClass = Array.isArray(entityTemplate.planetClass) ? entityTemplate.planetClass[0] : entityTemplate.planetClass || 'M';
            const config = planetTypes[planetClass];
            const IconComponent = config.icon;
            return <IconComponent className={`w-6 h-6 ${config.colorClass}`} />;
        }
        case 'starbase': {
            const starbaseType = Array.isArray(entityTemplate.starbaseType) ? entityTemplate.starbaseType[0] : entityTemplate.starbaseType || 'command_station';
            const config = starbaseTypes[starbaseType];
            const IconComponent = config.icon;
            return <IconComponent className={`w-8 h-8 ${config.colorClass}`} />;
        }
        case 'asteroid_field': {
            const IconComponent = asteroidType.icon;
            return <IconComponent className={`w-8 h-8 ${asteroidType.colorClass}`} />;
        }
        case 'event_beacon': {
            const IconComponent = beaconType.icon;
            return <IconComponent className={`w-6 h-6 ${beaconType.colorClass}`} />;
        }
        default:
            return null;
    }
};


export const SampleSector: React.FC<SampleSectorProps> = ({ template }) => {
    const iconsToRender: { icon: React.ReactNode; key: string }[] = [];
    let iconIndex = 0;

    template.entityTemplates.forEach((et, idx) => {
        const count = Math.max(1, et.count[0]); // Show at least one for visualization
        for (let i = 0; i < count; i++) {
            if (iconIndex < entityPositions.length) {
                const icon = getIconForTemplate(et);
                if (icon) {
                    iconsToRender.push({ icon, key: `${idx}-${i}` });
                    iconIndex++;
                }
            }
        }
    });

    const hasNebula = (template.hasNebulaChance || 0) > 0.5;

    return (
        <div className="w-48 h-36 bg-black border border-border-dark grid grid-cols-5 grid-rows-4 relative overflow-hidden">
            {hasNebula && <div className="nebula-background"></div>}
            {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="border border-border-dark border-opacity-30"></div>
            ))}
            {iconsToRender.map(({ icon, key }, index) => (
                 <div
                    key={key}
                    className="absolute"
                    style={{
                        ...entityPositions[index % entityPositions.length],
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {icon}
                </div>
            ))}
        </div>
    );
};
