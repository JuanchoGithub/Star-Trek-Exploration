
import React from 'react';
import { StarfleetLogoIcon, KlingonLogoIcon, RomulanLogoIcon } from '../../assets/ui/icons';
import { SectionHeader, SubHeader } from './shared';

export const TyphonExpanseSection: React.FC = () => (
    <div>
        <SectionHeader>A Primer on the Typhon Expanse</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: EYES ONLY - LEVEL 7 CLEARANCE</p>
        <p className="text-text-secondary mt-4 indent-8">The Typhon Expanse is a largely uncharted sector on the fringe of the Alpha and Beta Quadrants. For decades, exploration was deemed too hazardous due to unpredictable gravimetric distortions and plasma storms. However, recent long-range sensor data indicates these phenomena have begun to subside, opening a new frontier for exploration, colonization... and conflict.</p>
        
        <SubHeader>Known Environmental Hazards</SubHeader>
        <div className="space-y-4 my-4">
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-purple-400">Nebulae</h4>
                <p className="text-sm text-text-secondary mt-1">These dense clouds of gas and dust disrupt sensors and targeting systems. While inside a nebula, sensor range is reduced to adjacent cells, and phaser accuracy is significantly diminished. The densest parts of a nebula can even provide complete sensor concealment.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-yellow-400">Ion Storms</h4>
                <div className="text-sm text-text-secondary mt-1 space-y-2">
                    <p>Far from being benign, ion storms are extremely hazardous electrical phenomena. At the end of each turn, any ship within an ion storm cell is subjected to checks against all of the following hazards. If one or more checks succeed, a single effect is chosen at random from the successful checks and applied to the ship.</p>
                    <ul className="list-disc list-inside ml-4 font-mono text-xs">
                        <li><strong className="text-white">Hull Damage (10% chance):</strong> Inflicts damage equal to 5% of the ship's maximum hull.</li>
                        <li><strong className="text-white">Shields Offline (5% chance):</strong> Instantly depletes shields and prevents them from being raised for 2 turns.</li>
                        <li><strong className="text-white">Shield System Damage (15% chance):</strong> Inflicts damage equal to 10% of the shield subsystem's maximum health.</li>
                        <li><strong className="text-white">Weapons Offline (7% chance):</strong> Prevents all weapon use for 2 turns.</li>
                        <li><strong className="text-white">Reserve Power Depleted (7% chance):</strong> Instantly drains all reserve energy to zero.</li>
                        <li><strong className="text-white">Impulse Engines Disabled (23% chance):</strong> Prevents all movement for 1 turn.</li>
                        <li><strong className="text-white">Phaser Ionization (55% chance):</strong> Reduces all phaser damage by 70% for 2 turns.</li>
                        <li><strong className="text-white">Torpedo Misfire (70% chance):</strong> If the ship has torpedoes, one is destroyed in its launch tube, causing 25 hull damage.</li>
                    </ul>
                </div>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-gray-400">Asteroid Fields</h4>
                <p className="text-sm text-text-secondary mt-1">These dense fields of rock and debris provide tactical cover, reducing phaser accuracy against ships within them. However, they are a hazard to navigation; ending a turn inside an asteroid field risks taking micrometeoroid damage.</p>
            </div>
        </div>

        <SubHeader>Strategic Map of the Region</SubHeader>
        <div className="w-full max-w-md mx-auto my-4 border-2 border-border-main p-1 font-bold">
            <div className="grid grid-cols-2 grid-rows-2 gap-1">
                <div className="bg-red-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-red-500 text-red-300">
                    <KlingonLogoIcon className="w-8 h-8" />
                    <span>Klingon Empire</span>
                    <span className="text-xs font-normal">(Asserting Dominance)</span>
                </div>
                <div className="bg-green-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-green-500 text-green-300">
                    <RomulanLogoIcon className="w-8 h-8" />
                    <span>Romulan Star Empire</span>
                    <span className="text-xs font-normal">(Observing from Shadows)</span>
                </div>
                <div className="bg-blue-900 bg-opacity-50 p-4 flex flex-col items-center justify-center gap-2 text-center border border-blue-500 text-blue-300">
                    <StarfleetLogoIcon className="w-8 h-8" />
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
                <h4 className="font-bold text-red-400 flex items-center gap-2"><KlingonLogoIcon className="w-5 h-5" />Klingon Empire</h4>
                <p className="text-sm text-text-secondary mt-1">Intelligence suggests the High Council views the newly-opened Expanse as a source of untapped resources and, more importantly, a new arena to test their warriors and prove the Empire's might. Expect patrols to be aggressive and honor-bound. They will view any Federation presence as a challenge to their dominance.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-green-400 flex items-center gap-2"><RomulanLogoIcon className="w-5 h-5" />Romulan Star Empire</h4>
                <p className="text-sm text-text-secondary mt-1">The Romulans are playing a quieter game. The Tal Shiar is undoubtedly active in the Expanse, operating from the shadows to gather intelligence on both Klingon and Federation activities. Their motives are unclear, but they likely seek technological advantages or strategic footholds. Romulan vessels will be elusive, preferring observation to open conflict, but are deadly when cornered.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-blue-400 flex items-center gap-2"><StarfleetLogoIcon className="w-5 h-5" />United Federation of Planets</h4>
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