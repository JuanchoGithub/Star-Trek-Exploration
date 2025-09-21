import React from 'react';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../../hooks/useTheme';
import { SectionHeader, SubHeader } from './shared';

interface AdvancedTacticsSectionProps {
    themeName: ThemeName;
}

export const AdvancedTacticsSection: React.FC<AdvancedTacticsSectionProps> = ({ themeName }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon, CloakIcon } = getFactionIcons(themeName);
    // FIX: getFactionIcons is a function. To get a specific icon set, it must be called with the theme name.
    const { ScanIcon: FederationScanIcon } = getFactionIcons('federation');
    
    return (
        <div>
            <SectionHeader>Advanced Tactical Operations</SectionHeader>
            <p className="text-text-secondary mb-4">Victory is not achieved through superior firepower alone, but through superior strategy. This section details advanced concepts that separate seasoned captains from rookie commanders.</p>

            <SubHeader>Energy Allocation Doctrine</SubHeader>
            <p className="text-text-secondary mb-4">Your energy allocation is your most flexible tactical tool, allowing you to adapt your ship's performance profile mid-battle. A wise captain shifts power preemptively, not reactively. Consider these standard doctrines:</p>
            <div className="space-y-3">
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-red-400">Alpha Strike Configuration (100% Weapons)</h4>
                    <p className="text-sm text-text-secondary">Divert all non-essential power to weapons. This profile maximizes your initial phaser damage, ideal for a powerful opening salvo or for finishing a critically damaged enemy. Be warned: this leaves your shields unable to regenerate and your evasion bonus nullified, making you extremely vulnerable to counter-attack.</p>
                </div>
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-cyan-400">Defensive Shell (100% Shields)</h4>
                    <p className="text-sm text-text-secondary">Maximize power to shields for rapid regeneration. This is the optimal configuration when under heavy fire from multiple opponents, when attempting to survive until your torpedoes connect, or when trying to weather a particularly nasty plasma burn. Your offensive capabilities will be minimal in this state.</p>
                </div>
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-green-400">Maneuvering Profile (100% Engines)</h4>
                    <p className="text-sm text-text-secondary">Boost power to engines to gain a slight edge in evasion. While not a substitute for dedicated Evasive Maneuvers, this can be the difference-maker in a long-range duel. Use this when attempting to close distance, open range for a torpedo shot, or simply make yourself a harder target while other systems are offline.</p>
                </div>
            </div>

            <SubHeader>Positional Warfare</SubHeader>
            <p className="text-text-secondary mb-4">The sector grid is your chessboard. Where you place your ship is as important as how you equip it.</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li><strong>Optimal Range:</strong> Phaser damage drops off sharply with distance. Your ideal engagement range is 2-3 hexes. Conversely, if an enemy is slow but powerful (like a Klingon Negh'Var), try to stay at maximum range (5-6 hexes), a practice known as "kiting", to pepper them with long-range fire while minimizing their devastating return volleys.</li>
                <li><strong>Using the Environment:</strong> Do not ignore the battlefield. Lure aggressive enemies through <span className="text-gray-400">Asteroid Fields</span> to inflict free damage. Fight inside a <span className="text-purple-400">Nebula</span> to reduce the accuracy of phaser-heavy opponents, giving your more reliable torpedoes a distinct advantage.</li>
                <li><strong>Focus Fire:</strong> In multi-ship engagements, it is always better to destroy one enemy than to damage two. Concentrate all fire on a single target until it is neutralized before moving to the next. Prioritize destroying high-damage, low-health threats (like a B'rel Bird-of-Prey) first.</li>
            </ul>

            <SubHeader>Subsystem Targeting: A Surgical Approach</SubHeader>
            <p className="text-text-secondary mb-4">A discerning captain knows that simply pounding on an enemy's hull is inefficient. Crippling key systems can neutralize a threat with less risk and greater tactical advantage. An enemy ship is only as dangerous as its functioning components.</p>
             <div className="space-y-3">
                <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <WeaponIcon className="w-8 h-8 text-accent-red flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Weapons</h4>
                        <p className="text-sm text-text-secondary">Disabling an enemy's weapon systems is the most direct way to reduce incoming damage. A ship with zero weapon health cannot fire phasers or launch torpedoes, rendering it harmless. This is the priority target when facing a "glass cannon" vessel like a Klingon Bird-of-Prey.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <EngineIcon className="w-8 h-8 text-accent-green flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Engines</h4>
                        <p className="text-sm text-text-secondary">A ship that cannot move is a sitting duck. Disabling engines will leave a vessel dead in space, unable to pursue, retreat, or adjust its range. This makes them exceptionally vulnerable to slow-moving, high-damage torpedoes and allows you to control the engagement distance entirely.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <ShieldIcon className="w-8 h-8 text-secondary-main flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Shields</h4>
                        <p className="text-sm text-text-secondary">Destroying the shield generator prevents the enemy from regenerating their shields for the remainder of combat. This means any subsequent hull damage is permanent. This is a powerful long-term strategy in a protracted battle, ensuring that your efforts are not undone by their engineering crews.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <TransporterIcon className="w-8 h-8 text-accent-purple flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Transporter</h4>
                        <p className="text-sm text-text-secondary">While most hostile ships lack transporters, those that possess them use them to repel boarders and conduct rapid internal repairs. Disabling their transporter makes them highly vulnerable to your own boarding actions and strike teams.</p>
                    </div>
                </div>
            </div>

            <SubHeader>Cloaking and Anti-Cloak Operations</SubHeader>
            <p className="text-text-secondary mb-4">Stealth technology is a cornerstone of Romulan strategy and a rare but powerful tool in your own arsenal.</p>
            <div className="p-3 bg-bg-paper-lighter rounded space-y-2">
                <h4 className="font-bold text-accent-teal flex items-center gap-2"><CloakIcon className="w-6 h-6"/>Using Your Cloak (Defiant-Class)</h4>
                <p className="text-sm text-text-secondary">Your cloaking device is a powerful strategic tool. Use it to bypass enemy patrols to reach a critical objective, to position yourself for a devastating surprise torpedo volley, or to disengage from a losing battle. Remember the costs: you cannot fire weapons while cloaked, and decloaking will consume your major action for that turn, preventing you from firing immediately.</p>
                <h4 className="font-bold text-accent-yellow flex items-center gap-2"><FederationScanIcon className="w-6 h-6"/>Countering Cloaks: Tachyon Scan</h4>
                <p className="text-sm text-text-secondary">The Tachyon Scan is your primary counter to cloaked vessels. It floods the area with particles that reveal cloaked ships. A successful scan will force an enemy to decloak and disrupt their systems, preventing them from re-cloaking for several turns. Use this to create a window of vulnerability.</p>
            </div>

            <SubHeader>Countering Faction Doctrines</SubHeader>
            <p className="text-text-secondary mb-4">Each faction's AI has a distinct personality. Exploit their tendencies to secure victory.</p>
            <div className="space-y-3">
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-red-500">Countering Klingons</h4>
                    <p className="text-sm text-text-secondary">Klingons are honorable and aggressive. They will charge into phaser range and favor an <span className="font-bold">Aggressive</span> power stance. Weather their initial attack with a <span className="font-bold">Defensive</span> stance of your own, then cripple their <span className="font-bold">Weapon Systems</span>. Their code of honor makes them unlikely to retreat, allowing you to systematically dismantle their disabled ship.</p>
                </div>
                 <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-green-500">Countering Romulans</h4>
                    <p className="text-sm text-text-secondary">Romulans are cautious and tactical. They will use their cloak to get into optimal position and will shift power defensively if damaged. Your first priority is the <span className="font-bold">Tachyon Scan</span>. Once a Romulan is decloaked, they are vulnerable. They will try to exploit weakness; if your shields drop, expect them to shift to an <span className="font-bold">Aggressive</span> stance. Keep your shields healthy and focus fire, as they will attempt to escape if their hull becomes critical.</p>
                </div>
                 <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-orange-500">Countering Pirates</h4>
                    <p className="text-sm text-text-secondary">Pirates are opportunistic cowards. They will press the attack if they sense weakness (low player hull) but will quickly switch to a <span className="font-bold">Defensive</span> stance if they take significant damage. A strong, decisive opening salvo ("Alpha Strike") can force them onto the back foot early. Be wary of their desperation move; if a pirate ship is critically damaged, move away from it to avoid its self-destruct radius.</p>
                </div>
            </div>
        </div>
    );
};