import React from 'react';
import { SectionHeader, SubHeader } from './shared';

const SimulationBox: React.FC<{ title: string, scenario: string, rules: string[], calculations: { label: string, value: string, isFinal?: boolean }[] }> = ({ title, scenario, rules, calculations }) => (
    <div className="bg-bg-paper-lighter p-3 rounded-md">
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-secondary-light font-mono mb-2">{scenario}</p>
        <div className="text-sm text-text-secondary italic mb-2">
            {rules.map((rule, i) => <p key={i}><strong>RULE {i + 1}:</strong> {rule}</p>)}
        </div>
        <div className="font-mono text-xs bg-black p-2 rounded">
            {calculations.map((calc, i) => (
                <p key={i} className={calc.isFinal ? 'text-accent-green font-bold' : ''}>
                    &gt; {calc.label}: <span className={!calc.isFinal ? "text-accent-yellow" : ""}>{calc.value}</span>
                </p>
            ))}
        </div>
    </div>
);

export const CombatSimulationSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix A: Combat Simulation Log</SectionHeader>
        <p className="text-text-secondary mb-4">The following simulations are provided to give Starfleet officers a clearer understanding of key combat mechanics. All calculations are derived from standard tactical engagement protocols.</p>
        
        <SubHeader>Simulation 1: Phaser Damage Calculation</SubHeader>
        <p className="text-text-secondary mb-2">Phaser damage is dynamic, influenced by power, range, and system integrity.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimulationBox
                title="Scenario A: Standard Engagement"
                scenario="ENDEAVOUR vs. Klingon Cruiser @ Range 3"
                rules={[
                    "Player phaser base damage is 20.",
                    "Damage is multiplied by the percentage of power allocated to weapons.",
                    "Damage decreases with range (100% at Range 1, dropping by 20% per hex to a minimum of 20%)."
                ]}
                calculations={[
                    { label: "Base Damage", value: "20" },
                    { label: "Power to Weapons", value: "75% (x0.75)" },
                    { label: "Range Modifier (3 hexes)", value: "60% (x0.60)" },
                    { label: "Final Damage", value: "20 * 0.75 * 0.60 = 9", isFinal: true }
                ]}
            />
            <SimulationBox
                title="Scenario B: Damaged Phasers"
                scenario="ENDEAVOUR (Phasers @ 50%) vs. K-Cruiser"
                rules={[
                    "Damage is multiplied by the health percentage of the weapon subsystem (Phaser Efficiency)."
                ]}
                calculations={[
                    { label: "Calculated Damage (from Scenario A)", value: "9" },
                    { label: "Phaser Efficiency", value: "50% (x0.50)" },
                    { label: "Final Damage", value: "9 * 0.50 = 4.5", isFinal: true }
                ]}
            />
        </div>

        <SubHeader>Simulation 2: Subsystem Targeting Analysis</SubHeader>
        <p className="text-text-secondary mb-2">Targeting subsystems allows for surgical strikes. The effectiveness depends on the target's shield status.</p>
        <div className="space-y-4">
            <SimulationBox
                title="Scenario A: Targeting with Strong Shields"
                scenario="TARGET: Weapons (Shields @ 90%) | DAMAGE: 10"
                rules={[
                    "A portion of damage bypasses shields based on how weak they are. Formula: (1 - Shield %)^2.",
                    "Damage that gets past shields is split: 70% hits the targeted subsystem, 30% hits the hull."
                ]}
                calculations={[
                    { label: "Shield Bypass Multiplier", value: "(1 - 0.9)^2 = 0.01 (1%)" },
                    { label: "Damage Bypassing Shields", value: "10 * 0.01 = 0.1" },
                    { label: "Damage hitting Shields", value: "10 - 0.1 = 9.9" },
                    { label: "Damage to Subsystem", value: "0.1 * 0.70 = 0.07", isFinal: true },
                    { label: "Damage to Hull", value: "0.1 * 0.30 = 0.03", isFinal: true }
                ]}
            />
             <SimulationBox
                title="Scenario B: Targeting with Weak Shields"
                scenario="TARGET: Weapons (Shields @ 15%) | DAMAGE: 10"
                rules={[
                    "With shields below 20%, the damage split shifts to 90% subsystem / 10% hull."
                ]}
                calculations={[
                    { label: "Shield Bypass Multiplier", value: "(1 - 0.15)^2 = 0.72 (72%)" },
                    { label: "Damage Bypassing Shields", value: "10 * 0.72 = 7.2" },
                    { label: "Damage hitting Shields", value: "10 - 7.2 = 2.8" },
                    { label: "Damage to Subsystem", value: "7.2 * 0.90 = 6.48", isFinal: true },
                    { label: "Damage to Hull", value: "7.2 * 0.10 = 0.72", isFinal: true }
                ]}
            />
        </div>

        <SubHeader>Simulation 3: Advanced Torpedo Impact</SubHeader>
        <p className="text-text-secondary mb-2">Advanced torpedoes have unique properties beyond raw damage.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimulationBox
                title="Scenario A: Quantum Torpedo vs. Full Shields"
                scenario="TARGET: Warbird (Shields 100/100) | DAMAGE: 75"
                rules={[
                    "Quantum torpedoes have a 25% shield-bypassing component.",
                    "The remaining 75% of the damage is treated like a standard torpedo (mitigated by shields)."
                ]}
                calculations={[
                    { label: "Bypassing Damage", value: "75 * 0.25 = 18.75" },
                    { label: "Standard Damage Portion", value: "75 * 0.75 = 56.25" },
                    { label: "Shields Absorb", value: "min(100, 56.25 * 0.25) = 14.06" },
                    { label: "Hull Damage Reduction", value: "14.06 / 0.25 = 56.25" },
                    { label: "Standard Hull Damage", value: "56.25 - 56.25 = 0" },
                    { label: "Total Hull Damage", value: "0 (Standard) + 18.75 (Bypass) = 18.75", isFinal: true }
                ]}
            />
            <SimulationBox
                title="Scenario B: Plasma Torpedo Impact"
                scenario="TARGET: K-Cruiser | DAMAGE: 30 + Burn"
                rules={[
                    "The initial impact is handled like a standard torpedo.",
                    "The Plasma Burn effect is applied, dealing direct hull damage for 2 turns, bypassing shields."
                ]}
                calculations={[
                    { label: "Turn 1: Initial Impact", value: "30 damage (mitigated by shields)" },
                    { label: "Turn 1: Plasma Burn Applied", value: "10 Damage / Turn for 2 turns" },
                    { label: "Turn 2: Burn Damage", value: "10 Hull Damage (Bypasses Shields)", isFinal: true },
                    { label: "Turn 3: Burn Damage", value: "10 Hull Damage (Bypasses Shields)", isFinal: true }
                ]}
            />
        </div>

        <SubHeader>Simulation 4: Defensive & Special Operations</SubHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <SimulationBox
                title="Scenario A: Point-Defense vs. Torpedo"
                scenario="ENEMY fires phasers at incoming player torpedo"
                rules={[
                    "AI has a high chance (75%) to prioritize shooting down torpedoes over attacking your ship.",
                    "Point-defense phaser shots are highly accurate and will destroy a torpedo on a successful hit."
                ]}
                calculations={[
                    { label: "Incoming Torpedo Detected", value: "YES" },
                    { label: "AI Priority Roll (Needs < 75)", value: "35 (Success)" },
                    { label: "Action", value: "Fire Point-Defense Phasers" },
                    { label: "Result", value: "Player torpedo is destroyed before impact.", isFinal: true }
                ]}
            />
            <SimulationBox
                title="Scenario B: Tachyon Scan vs. Cloak"
                scenario="ENDEAVOUR (Scanners @ 80%) vs. Cloaked Romulan @ Range 4"
                rules={[
                    "Base detection chance is 40% at range 5.",
                    "Chance increases by 5% for each hex closer.",
                    "Final chance is multiplied by scanner health percentage."
                ]}
                calculations={[
                    { label: "Base Chance", value: "40%" },
                    { label: "Proximity Bonus (Range 4)", value: "+5%" },
                    { label: "Scanner Health Modifier", value: "x0.80" },
                    { label: "Final Detection Chance", value: "(40% + 5%) * 0.80 = 36%", isFinal: true }
                ]}
            />
        </div>
    </div>
);