import React from 'react';
import type { SectorTemplate, EntityTemplate, ShipModel } from '../../types';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../../assets/beacons/configs/beaconTypes';

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
            const faction = (entityTemplate.faction === 'Inherit' ? 'Federation' : entityTemplate.faction) as ShipModel;
            const visualConfig = shipVisuals[faction];
            if (!visualConfig) return null;
            const role = Array.isArray(entityTemplate.shipRole) ? entityTemplate.shipRole[0] : entityTemplate.shipRole || visualConfig.defaultRole;
            const roleConfig = visualConfig.roles[role] ?? visualConfig.roles[visualConfig.defaultRole];
            if (!roleConfig) return null;
            const IconComponent = roleConfig.icon;
            return <IconComponent className={`w-6 h-6 ${roleConfig.colorClass}`} />;
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
            {hasNebula && <div className="absolute inset-0 bg-accent-purple opacity-30 z-0 pointer-events-none"></div>}
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