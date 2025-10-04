import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version2_1: React.FC = () => {
    const releaseDate = "September 28, 2025";
    return (
        <>
            <SectionHeader>Version 2.1 - The "Strategic Depth" Update</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49752.1, 14:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A major update to the galaxy generation system, introducing a "strategic depth" mechanic that creates a more logical and varied distribution of encounters across the quadrant.</p>
            
            <SubHeader>Summary of User Directives</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic">
                    <p>"The galaxy generation logic...divides the map into four static quadrants... There is no concept of 'depth'... As a result, these deep-space templates will never be selected... implement the depth concept, the zone where factions touch is the shallowest, and the further away from other factions, the deepest"</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">New "Sector Depth" System:</strong> Each sector in the quadrant now has a calculated "depth" from 1 (border sector) to 4 (deep space/homeland). This is determined by its distance from the nearest foreign border.
                </li>
                <li>
                    <strong className="text-white">Depth-Based Template Spawning:</strong> All sector templates have been assigned a valid depth range for spawning. The galaxy generator now filters templates based on a sector's calculated depth.
                </li>
                <li>
                    <strong className="text-white">Activated Deep-Space Encounters:</strong> Previously dormant templates for major fleet concentrations and rare deep-space anomalies (e.g., "Klingon Homeland Defense Fleet", "Dyson Sphere Fragment") are now active in the simulation and will appear in their appropriate deep-space locations.
                </li>
                <li>
                    <strong className="text-white">Player's Manual Update:</strong> The 'Galaxy Generation' section of the manual has been updated to fully document the new sector depth system, providing captains with the intelligence needed to anticipate regional threats and opportunities.
                </li>
            </ul>
        </>
    );
};