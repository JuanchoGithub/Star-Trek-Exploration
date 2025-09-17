import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const CombatSimulationSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix A: Combat Simulation Log</SectionHeader>
        <p className="text-text-secondary mb-4">The following simulations are provided to give Starfleet officers a clearer understanding of key combat mechanics. All calculations are derived from standard tactical engagement protocols.</p>
        
        <SubHeader>Simulation 1: Photon Torpedo Impact Analysis</SubHeader>
        <p className="text-text-secondary mb-2">A standard photon torpedo has a base yield of 50 damage. Its effectiveness is heavily mitigated by active shielding.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario A: Target with Full Shields</h4>
                <p className="text-sm text-secondary-light font-mono mb-2">TARGET: Romulan Warbird (Shields: 20/20)</p>
                <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> 25% of a torpedo's yield is applied to shields. If the shields can absorb this portion, the kinetic energy of the entire warhead is dissipated, negating all hull damage.</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Damage: 50</p>
                    <p>&gt; Potential Shield Damage: 50 * 0.25 = <span className="text-accent-yellow">12.5</span></p>
                    <p>&gt; Target Shields: 20</p>
                    <p>&gt; Absorbed by Shields: min(20, 12.5) = <span className="text-accent-yellow">12.5</span></p>
                    <p>&gt; Hull Damage Reduction: 12.5 / 0.25 = <span className="text-accent-yellow">50</span></p>
                    <p>&gt; Final Hull Damage: 50 - 50 = <span className="text-accent-red font-bold">0</span></p>
                    <hr className="border-border-dark my-1"/>
                    <p className="text-accent-green">&gt; RESULT: Shields reduced to 7.5. No hull damage.</p>
                </div>
            </div>
             <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario B: Unshielded Target</h4>
                <p className="text-sm text-secondary-light font-mono mb-2">TARGET: Romulan Warbird (Shields: 0/20)</p>
                <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> With no shields to dissipate the blast, the warhead's full explosive and kinetic force is applied directly to the hull.</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Damage: 50</p>
                    <p>&gt; Potential Shield Damage: 50 * 0.25 = <span className="text-accent-yellow">12.5</span></p>
                    <p>&gt; Target Shields: 0</p>
                    <p>&gt; Absorbed by Shields: min(0, 12.5) = <span className="text-accent-yellow">0</span></p>
                    <p>&gt; Hull Damage Reduction: 0 / 0.25 = <span className="text-accent-yellow">0</span></p>
                    <p>&gt; Final Hull Damage: 50 - 0 = <span className="text-accent-red font-bold">50</span></p>
                    <hr className="border-border-dark my-1"/>
                    <p className="text-accent-green">&gt; RESULT: Target suffers 50 hull damage.</p>
                </div>
            </div>
        </div>
        <SubHeader>Simulation 2: Evasive Maneuvers & Hit Probability</SubHeader>
        <p className="text-text-secondary mb-2">Phaser accuracy is subject to various modifiers. The base hit chance is 90%.</p>
         <div className="space-y-2">
            <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario A: Target is Evasive</h4>
                <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> Engaging evasive maneuvers grants the target a powerful defensive bonus, multiplying the incoming hit chance by 0.6.</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Hit Chance: 90%</p>
                    <p>&gt; Target Evasive Modifier: x0.6</p>
                    <p>&gt; Final Hit Chance: 90% * 0.6 = <span className="text-accent-green font-bold">54%</span></p>
                </div>
            </div>
             <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario B: Player is Also Evasive</h4>
                <p className="text-sm text-text-secondary italic mb-2"><strong>RULE:</strong> Your own evasive maneuvers affect your targeting computers, applying a 0.75x penalty to your own accuracy.</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Hit Chance: 90%</p>
                    <p>&gt; Target Evasive Modifier: x0.6</p>
                    <p>&gt; Player Evasive Penalty: x0.75</p>
                    <p>&gt; Final Hit Chance: 90% * 0.6 * 0.75 = <span className="text-accent-green font-bold">40.5%</span></p>
                </div>
            </div>
        </div>
        <SubHeader>Simulation 3: Shield Regeneration Calculation</SubHeader>
        <p className="text-text-secondary mb-2">Shields regenerate at the end of each turn, provided Red Alert is active. The amount is determined by your power allocation.</p>
        <p className="text-sm text-text-secondary italic mb-2"><strong>FORMULA:</strong> (Max Shields * 0.10) * (% Power to Shields)</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario A: Low Power to Shields</h4>
                <p className="text-sm text-secondary-light font-mono mb-2">ENDEAVOUR: Max Shields 50, Power: 20%</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Regen Amount: 50 * 0.10 = 5</p>
                    <p>&gt; Power Multiplier: 20% (0.20)</p>
                    <p>&gt; Regen This Turn: 5 * 0.20 = <span className="text-accent-green font-bold">1.0 point</span></p>
                </div>
            </div>
             <div className="bg-bg-paper-lighter p-3 rounded-md">
                <h4 className="font-bold text-white">Scenario B: High Power to Shields</h4>
                <p className="text-sm text-secondary-light font-mono mb-2">ENDEAVOUR: Max Shields 50, Power: 80%</p>
                <div className="font-mono text-xs bg-black p-2 rounded">
                    <p>&gt; Base Regen Amount: 50 * 0.10 = 5</p>
                    <p>&gt; Power Multiplier: 80% (0.80)</p>
                    <p>&gt; Regen This Turn: 5 * 0.80 = <span className="text-accent-green font-bold">4.0 points</span></p>
                </div>
            </div>
        </div>
    </div>
);
