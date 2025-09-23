import React from 'react';
import { sectorTemplates } from '../../assets/galaxy/sectorTemplates';
import type { SectorTemplate, FactionOwner } from '../../types';
import { SectionHeader, SubHeader } from './shared';
import { SampleSector } from './SampleSector';
import { templateInfo } from './templateInfo';

// Calculate total weights for each faction to determine percentage chances
const totalWeights: Record<FactionOwner, number> = {
    Federation: 0,
    Klingon: 0,
    Romulan: 0,
    None: 0,
};

sectorTemplates.forEach(template => {
    template.allowedFactions.forEach(faction => {
        if (totalWeights.hasOwnProperty(faction)) {
            totalWeights[faction] += template.weight;
        }
    });
});

// Helper to get a formatted string of appearance chances
const getChanceDescription = (template: SectorTemplate): string => {
    const chances = template.allowedFactions.map(faction => {
        if (totalWeights[faction] > 0) {
            const chance = (template.weight / totalWeights[faction]) * 100;
            return `${faction}: ${chance.toFixed(1)}%`;
        }
        return '';
    }).filter(Boolean);

    if (chances.length === 0) return "Cannot appear naturally.";
    return `Chance to appear in a new sector within the specified territory: ${chances.join(' / ')}.`;
};

export const GalaxyGenerationSection: React.FC = () => {
    return (
        <div>
            <SectionHeader>Galaxy Generation</SectionHeader>
            <p className="text-text-secondary mb-4">
                The Typhon Expanse is not a random collection of stars and planets. Its creation is governed by a template-based system designed to create a thematic and logical galaxy. Each sector you enter is generated from a blueprint that defines its contents, rarity, and character based on its location in the quadrant.
            </p>
            <SubHeader>Sector Templates Explained</SubHeader>
            <p className="text-text-secondary mb-4">
                A sector template is a blueprint containing a name, a rarity "weight" (higher is more common), and a list of rules for what can appear within it. Crucially, each template is restricted to certain territories. For example, you will only find "Klingon Hunting Grounds" within the Klingon Empire, while "Pirate Ambush Points" are most common in Uncharted Space. This ensures that the galaxy feels coherent and believable.
            </p>
            
            <SubHeader>Environmental Generation: Nebulae &amp; Asteroid Fields</SubHeader>
            <p className="text-text-secondary mb-4">
                Some sector templates can generate large-scale environmental features that significantly impact gameplay.
            </p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong>Nebulae:</strong> If a sector is generated with a nebula, it will not be completely filled. Instead, the simulation generates a partial, organic-looking gas cloud composed of individual nebula cells. The nebula will cover between 30% and 70% of the sector's area, creating a mix of open channels and dense clusters. This turns nebulae into complex tactical environments.
                </li>
                <li>
                    <strong>Asteroid Fields:</strong> Asteroid fields no longer appear as single entities. They now generate in large, dense clusters of 3 to 9 cells. These clusters can block movement and provide extensive cover for ambushes, making navigation through these sectors a tactical challenge.
                </li>
            </ul>

            <SubHeader>Sector Template Registry</SubHeader>
            <p className="text-text-secondary mb-4">
                The following is a declassified list of all known sector templates used by the simulation.
            </p>

            <div className="space-y-4">
                {sectorTemplates.sort((a, b) => b.weight - a.weight).map(template => (
                    <div key={template.id} className="panel-style p-4">
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <div>
                                <h4 className="text-xl font-bold text-primary-light">{template.name}</h4>
                                <p className="text-sm font-bold text-accent-yellow-dark mb-2">{getChanceDescription(template)}</p>
                                <p className="text-sm text-text-secondary mb-2"><strong>Description:</strong> {templateInfo[template.id]?.description || 'No description available.'}</p>
                                <p className="text-sm text-text-secondary"><strong>Intent:</strong> {templateInfo[template.id]?.intent || 'No intent specified.'}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-xs font-bold uppercase tracking-wider text-text-disabled mb-1">Sample Layout</p>
                                <SampleSector template={template} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
