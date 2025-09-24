
import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_6: React.FC = () => {
    const releaseDate = "September 24, 2025";
    return (
        <>
            <SectionHeader>Version 1.6 - The Phased Combat & AI Overhaul</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49732.5, 15:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A major update focusing on a more dynamic, cinematic combat experience through a new phased turn system. This release also introduces a significantly more advanced AI, a modernized mobile UI, and a suite of enhanced visual effects.</p>
            
            <SubHeader>Summary of User Directives & Field Reports</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>Analysis of previous simulation logs indicated that the turn-based combat system, while functional, lacked dynamism. All actions resolved simultaneously, leading to a static and sometimes confusing battlefield. Feedback also highlighted that AI opponents were predictable, failing to adapt their strategies to changing combat conditions.</p>
                    <p>Furthermore, with increasing deployment on touch-enabled PADDs, the primary user interface was reported as clunky and difficult to operate on smaller screens. A full modernization was ordered to improve mobile usability. Finally, a general directive was issued to enhance the visual fidelity of combat to better represent the tactical situation.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">New Phased Turn System:</strong> Combat is now resolved in a logical, sequential order instead of all at once. The new turn manager processes actions in distinct phases (Point-Defense, Energy Management, Movement, Torpedo Launch, Phaser Fire, Projectile Movement), creating a more cinematic and easier-to-follow battle flow.
                </li>
                <li>
                    <strong className="text-white">Advanced AI Doctrine Overhaul:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>AI ships now operate under a dynamic 'Stance' system (Aggressive, Defensive, Balanced, Recovery), intelligently reallocating power and choosing actions based on their current situation and factional doctrine.</li>
                        <li>Hostile AI will now strategically target specific ship subsystems to exploit weaknesses, such as Klingons targeting weapons or Romulans targeting engines.</li>
                        <li>AI vessels now manage energy and repair critical systems when out of combat, ensuring they are better prepared for subsequent encounters.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Tactical Viewscreen Enhancements:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Entity rendering has been upgraded to use dynamic pixel-based positioning, resulting in smooth, animated movement on the tactical grid.</li>
                        <li>Nebula cells are now rendered with subtle animations, creating a more vibrant and atmospheric battlefield.</li>
                        <li>Torpedoes now leave a visible trail, making their paths and trajectories clear at a glance.</li>
                     </ul>
                </li>
                <li>
                    <strong className="text-white">Modernized Mobile UI/UX:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>For touch-enabled devices, the main sidebar has been replaced with a floating "Systems" button that opens an intuitive, full-height slide-out overlay panel.</li>
                        <li>The "Sector View" and "Quadrant Map" buttons have been redesigned into a clean, vertical stack to the left of the viewscreen, improving ergonomics and screen real estate.</li>
                     </ul>
                </li>
                 <li>
                    <strong className="text-white">Enhanced Combat Visual Effects:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Phaser beam animations are now multi-stage, featuring a distinct draw, hold, and fade phase for a more impactful feel.</li>
                        <li>New shield and hull impact animations provide clear visual feedback for where damage is being dealt.</li>
                        <li>Point-defense lasers now render as a visible defensive beam, showing their interception attempts.</li>
                     </ul>
                </li>
            </ul>
        </>
    );
};
