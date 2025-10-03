import React from 'react';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../../hooks/useTheme';
import { SectionHeader, SubHeader } from './shared';
// FIX: Replaced non-existent PirateEscortIcon with OrionRaiderIcon.
import { OrionRaiderIcon } from '../../assets/ships/icons';

interface AdvancedTacticsSectionProps {
    themeName: ThemeName;
}

const DetailBox: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, borderColorClass: string }> = ({ title, icon, children, borderColorClass }) => (
    <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass}`}>
        <h4 className="font-bold text-white flex items-center gap-2">{icon}{title}</h4>
        <div className="text-sm text-text-secondary mt-2 space-y-1">{children}</div>
    </div>
);

const CloakingMechanicsTable: React.FC = () => (
    <table className="w-full text-sm text-left border-collapse my-2">
        <thead className="bg-bg-paper-lighter">
            <tr>
                <th className="p-2 border border-border-dark font-bold">Vessel / Faction</th>
                <th className="p-2 border border-border-dark font-bold">Base Reliability</th>
                <th className="p-2 border border-border-dark font-bold">Power Cost / Turn</th>
            </tr>
        </thead>
        <tbody>
            <tr className="bg-bg-paper even:bg-black/20">
                <td className="p-2 border border-border-dark font-bold text-green-400">Romulan (All)</td>
                <td className="p-2 border border-border-dark font-mono">99%</td>
                <td className="p-2 border border-border-dark font-mono">40</td>
            </tr>
            <tr className="bg-bg-paper even:bg-black/20">
                <td className="p-2 border border-border-dark font-bold text-red-400">Klingon (B'rel)</td>
                <td className="p-2 border border-border-dark font-mono">92%</td>
                <td className="p-2 border border-border-dark font-mono">45</td>
            </tr>
            <tr className="bg-bg-paper even:bg-black/20">
                <td className="p-2 border border-border-dark font-bold text-blue-400">Federation (Defiant)</td>
                <td className="p-2 border border-border-dark font-mono">90%</td>
                <td className="p-2 border border-border-dark font-mono">50</td>
            </tr>
        </tbody>
    </table>
);


export const AdvancedTacticsSection: React.FC<AdvancedTacticsSectionProps> = ({ themeName }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon, CloakIcon } = getFactionIcons(themeName);
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
                <li><strong>Using the Environment:</strong> Lure aggressive enemies into <span className="text-gray-400">Asteroid Fields</span>. The dense rock provides cover (reducing phaser accuracy against ships inside by 30%) and a direct hazard (risk of impact damage). You can also use asteroid fields as a cloak. By positioning your ship inside a field, you become undetectable beyond 4 hexes. This allows you to break sensor lock and set up ambushes. Lure an enemy to chase you, then enter a field. They will be forced to close to within 2 hexes to fire, bringing them into your optimal torpedo range.</li>
                <li><strong>Focus Fire:</strong> In multi-ship engagements, it is always better to destroy one enemy than to damage two. Concentrate all fire on a single target until it is neutralized before moving to the next. Prioritize destroying high-damage, low-health threats (like a B'rel Bird-of-Prey) first.</li>
            </ul>

            <SubHeader>Nebula Warfare</SubHeader>
            <p className="text-text-secondary mb-4">Nebulae are your greatest tactical tool for stealth, surprise, and controlling the flow of battle. Their particulate density and gravimetric distortions create unique opportunities for a cunning captain.</p>
            <div className="space-y-3">
                <DetailBox title="Concealment (Deep Nebula)" icon={<CloakIcon className="w-6 h-6"/>} borderColorClass="border-purple-400">
                    <p>If you position your ship in a nebula cell that is <span className="text-white font-bold">completely surrounded by 8 other nebula cells</span> (including diagonals), you enter a "Deep Nebula".</p>
                    <p>Your vessel will become <span className="text-accent-yellow">completely undetectable</span> to enemy ships and will vanish from their tactical displays. This is the ultimate ambush position, allowing you to fire on an enemy that cannot see you.</p>
                </DetailBox>
                <DetailBox title="Sensor Reduction" icon={<FederationScanIcon className="w-6 h-6"/>} borderColorClass="border-cyan-400">
                    <p>While your ship is inside <span className="text-white font-bold">any</span> nebula cell, your own sensor resolution is drastically reduced. You will only be able to detect hostile ships in <span className="text-accent-yellow">adjacent cells (range 1)</span>.</p>
                    <p>Use this to break contact with a superior force, force a close-range engagement where your torpedoes excel, or sneak past enemy patrols undetected.</p>
                </DetailBox>
                <DetailBox title="Communication Blackout" icon={<TransporterIcon className="w-6 h-6"/>} borderColorClass="border-gray-500">
                    <p>Allied vessels normally share sensor data, allowing them to see each other regardless of line of sight. However, this connection can be severed.</p>
                    <p>If an allied ship is positioned in a nebula cell that is surrounded by <span className="text-accent-yellow">two full layers of nebula cells</span> on all sides (a 5x5 grid with the ship in the center), all its communications will be blocked. It will disappear even from <span className="text-white font-bold">allied</span> sensors.</p>
                </DetailBox>
            </div>

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

            <SubHeader>Employing the Laser Point-Defense (LPD) System</SubHeader>
            <p className="text-text-secondary mb-4">
                The LPD system is a powerful but costly defensive tool. Knowing when to activate it is a critical tactical decision.
            </p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li><strong>The Trade-Off:</strong> Activating the LPD significantly reduces your offensive phaser capability. It is a purely defensive measure. Do not activate it if you need maximum phaser damage to finish a target.</li>
                <li><strong>When to Use It:</strong> The LPD is most effective when anticipating a torpedo-heavy attack, especially against factions like the Romulans or Klingons with powerful warheads. Activating it when an enemy launches a torpedo can completely negate their primary attack for that turn.</li>
                <li><strong>Countering LPD:</strong> The system can only target one torpedo per turn. The most effective way to defeat an enemy's LPD is to overwhelm it with a multi-torpedo launch from several ships, or by launching a torpedo while simultaneously pressuring them with heavy phaser fire.</li>
            </ul>

            <SubHeader>Cloaking and Anti-Cloak Operations</SubHeader>
            <p className="text-text-secondary mb-4">Stealth technology is no longer a simple fire-and-forget system. It is a dynamic state requiring constant power and subject to failure under pressure. Understanding these new, more complex mechanics is essential to survival.</p>
            <div className="space-y-3">
                <DetailBox title="General Cloaking Mechanics" icon={<CloakIcon className="w-6 h-6"/>} borderColorClass="border-gray-500">
                    <p><strong>Engaging Cloak:</strong> This is a two-turn process. On Turn 1, you initiate the sequence, which consumes your major action. Your ship enters a vulnerable 'cloaking' state. At the end of Turn 2, the cloak becomes fully active. Your ship is vulnerable for the entire turn it is engaging the cloak.</p>
                    <p><strong>Disengaging Cloak:</strong> This is a three-turn process. On Turn 1, you initiate the sequence. The ship enters a vulnerable 'decloaking' state. It remains in this vulnerable state for Turn 1 and Turn 2. At the start of Turn 3, the ship is fully visible and can act normally. This means the ship is vulnerable for two full turns.</p>
                    <p><strong>Action Cost & Restrictions:</strong> Initiating either sequence consumes your major tactical action for the turn. A cloaked ship cannot fire weapons or be at Red Alert. A ship in a 'cloaking' or 'decloaking' state is also unable to perform any other major actions.</p>
                </DetailBox>
                
                 <DetailBox title="Reliability & Failure Cascade" icon={<CloakIcon className="w-6 h-6"/>} borderColorClass="border-red-500">
                    <p>At the end of every turn a cloak is active or engaging, it must pass a reliability check and consume a significant amount of reserve power.</p>
                    <p><strong>Instability:</strong> Taking damage while engaging the cloak will increase the device's 'instability', permanently reducing its base reliability for the rest of combat.</p>
                    <p><strong>Failure:</strong> If the reliability check fails or there is insufficient power, the cloak collapses. This makes the ship visible, puts the cloaking device on a 2-turn cooldown, and critically, shorts out the shield emitters, preventing you from raising shields for 2 turns. A failed cloak is a moment of extreme vulnerability.</p>
                </DetailBox>

                <h4 className="text-lg font-bold text-accent-yellow mt-4">Technical Specifications by Faction</h4>
                <p className="text-sm text-text-secondary mb-2">Each faction's cloaking technology has different performance parameters. Romulan technology is superior, but all devices are susceptible to environmental interference.</p>
                <CloakingMechanicsTable />
                
                <div className="mt-4">
                    <DetailBox title="Special Case: Pirate Makeshift Cloak" icon={<OrionRaiderIcon className="w-6 h-6"/>} borderColorClass="border-orange-500">
                        <p>Intelligence has confirmed that some pirate factions have managed to jury-rig cloaking devices onto their vessels. These systems are highly volatile and should be considered as much a threat to their user as to their target.</p>
                        <ul className="list-disc list-inside ml-4 mt-2 font-mono text-sm">
                            <li>Base Reliability: <span className="text-white">60%</span></li>
                            <li>Power Cost / Turn: <span className="text-white">70</span></li>
                            <li>Subsystem Damage Chance: <span className="text-white">7%</span> per turn (30% damage to a random key system)</li>
                            <li>Catastrophic Failure Chance: <span className="text-white">0.1%</span> per turn (instant self-destruction)</li>
                        </ul>
                        <p className="mt-2">Note: These failure chances are <span className="text-white font-bold">compounded</span> by environmental effects like nebulae. A pirate attempting to cloak in a nebula is taking an extreme gamble.</p>
                    </DetailBox>
                </div>

                <h4 className="font-bold text-accent-yellow mt-4">Environmental Factors</h4>
                <p className="text-sm text-text-secondary mb-2">Sector conditions can severely impact cloaking device performance, turning a tactical advantage into a critical liability.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-bg-paper-lighter rounded border-l-4 border-purple-400">
                        <h5 className="font-bold text-purple-300">Nebulae</h5>
                        <p className="text-sm text-text-secondary">The gravimetric shear and particle density within a nebula wreak havoc on the delicate balance required to maintain a cloaking field.</p>
                        <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-1">
                            <li><strong>Reliability:</strong> Reduced by 25% (e.g., 92% becomes 69%).</li>
                            <li><strong>Power Cost:</strong> Increased by 30% (e.g., 40 becomes 52 per turn).</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-bg-paper-lighter rounded border-l-4 border-gray-500">
                        <h5 className="font-bold text-gray-400">Asteroid Fields</h5>
                        <p className="text-sm text-text-secondary">The dense rock, ice, and sensor-reflective dust in an asteroid field can create minor interference with cloaking fields.</p>
                        <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-1">
                            <li><strong>Reliability:</strong> Reduced by 10% (e.g., 92% becomes 83%).</li>
                            <li><strong>Power Cost:</strong> Increased by 15% (e.g., 40 becomes 46 per turn).</li>
                        </ul>
                    </div>
                </div>
            </div>

            <SubHeader>Countering Faction Doctrines</SubHeader>
            <p className="text-text-secondary mb-4">Each faction's AI has a distinct personality. Exploit their tendencies to secure victory.</p>
            <div className="space-y-3">
                <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-red-500">Countering Klingons</h4>
                    <p className="text-sm text-text-secondary">Klingons are honorable and aggressive. They will charge into phaser range and favor an <span className="font-bold">Aggressive</span> power stance. Be especially wary of their B'rel-class Birds-of-Prey, which will use cloaking devices to get into close range for a surprise alpha strike. Weather their initial attack with a <span className="font-bold">Defensive</span> stance of your own, then cripple their <span className="font-bold">Weapon Systems</span>. Their code of honor makes them unlikely to retreat, allowing you to systematically dismantle their disabled ship.</p>
                </div>
                 <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-green-500">Countering Romulans</h4>
                    <p className="text-sm text-text-secondary">Romulans are cautious and tactical. They will use their cloak to get into optimal position and will shift power defensively if damaged. Their primary goal is to disable your ship. Keep your shields healthy and focus fire, as they will attempt to escape if their hull becomes critical.</p>
                </div>
                 <div className="p-3 bg-bg-paper-lighter rounded">
                    <h4 className="font-bold text-orange-500">Countering Pirates</h4>
                    <p className="text-sm text-text-secondary">Pirates are opportunistic cowards. They will press the attack if they sense weakness (low player hull) but will quickly switch to a <span className="font-bold">Defensive</span> stance if they take significant damage. A strong, decisive opening salvo ("Alpha Strike") can force them onto the back foot early. Be wary of their desperation move; if a pirate ship is critically damaged, move away from it to avoid its self-destruct radius.</p>
                </div>
            </div>
        </div>
    );
};