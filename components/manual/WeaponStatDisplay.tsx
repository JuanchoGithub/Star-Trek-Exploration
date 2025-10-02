import React from 'react';

// Props definition
interface WeaponStatDisplayProps {
    label: string;
    // For simple bar
    value?: number;
    maxValue?: number;
    unit?: string;
    colorClass?: string;
    // For phaser range falloff
    phaserRange?: number;
    phaserBaseDamage?: number;
    // For torpedo accuracy falloff
    torpedoAccuracy?: { range: number; chance: number }[];
    projectileBaseDamage?: number;
}


// Phaser Range Visualization
const PhaserRangeDisplay: React.FC<{ range: number, baseDamage: number }> = ({ range, baseDamage }) => {
    const segments = Array.from({ length: range });
    const falloff = [1, 0.8, 0.6, 0.4, 0.2, 0.2]; // Standard phaser falloff

    return (
        <div className="flex flex-col">
            <div className="flex border border-border-dark">
                {segments.map((_, i) => {
                    const modifier = falloff[i] || falloff[falloff.length - 1];
                    const damage = Math.round(baseDamage * modifier);
                    return (
                        <div key={i} className="flex-1 text-center border-r border-border-dark last:border-r-0 p-1" style={{ opacity: Math.max(0.2, modifier) }}>
                            <div className="text-xs text-text-disabled">Rng {i + 1}</div>
                            <div className="font-bold text-accent-red">{damage}</div>
                        </div>
                    );
                })}
            </div>
            <div className="text-xs text-text-disabled text-center mt-1">Damage at Range (Hexes)</div>
        </div>
    );
};

// Torpedo Accuracy & Damage Visualization
const ProjectileDamageDisplay: React.FC<{ accuracyData: { range: number; chance: number }[], baseDamage: number }> = ({ accuracyData, baseDamage }) => {
    return (
        <div className="flex flex-col">
            <div className="flex border border-border-dark">
                {accuracyData.map(({ range, chance }) => {
                    const expectedDamage = Math.round(baseDamage * (chance / 100));
                    return (
                        <div key={range} className="flex-1 text-center border-r border-border-dark last:border-r-0 p-1" style={{ opacity: Math.max(0.2, chance / 100) }}>
                            <div className="text-xs text-text-disabled">Rng {range}</div>
                            <div className="font-bold text-accent-sky">{chance}%</div>
                            <div className="text-xs text-accent-orange font-mono">({expectedDamage})</div>
                        </div>
                    );
                })}
            </div>
            <div className="text-xs text-text-disabled text-center mt-1">Hit Chance % (Expected Damage) at Range</div>
        </div>
    );
};

// Simple Bar Visualization
const SimpleBarDisplay: React.FC<{ value: number, maxValue: number, unit?: string, colorClass: string }> = ({ value, maxValue, unit, colorClass }) => {
    const percentage = (value / maxValue) * 100;
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-baseline mb-1">
                 <span className="font-bold text-text-primary">{value}{unit}</span>
                 <span className="text-xs text-text-disabled">Max Ref: {maxValue}{unit}</span>
            </div>
            <div className="w-full bg-black h-4 rounded-sm border border-border-dark p-0.5">
                <div className={`${colorClass} h-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


export const WeaponStatDisplay: React.FC<WeaponStatDisplayProps> = ({
    label,
    value, maxValue, unit, colorClass,
    phaserRange, phaserBaseDamage,
    torpedoAccuracy, projectileBaseDamage
}) => {
    let content;
    if (phaserRange && phaserBaseDamage) {
        content = <PhaserRangeDisplay range={phaserRange} baseDamage={phaserBaseDamage} />;
    } else if (torpedoAccuracy && projectileBaseDamage) {
        content = <ProjectileDamageDisplay accuracyData={torpedoAccuracy} baseDamage={projectileBaseDamage} />;
    } else if (value !== undefined && maxValue !== undefined) {
        content = <SimpleBarDisplay value={value} maxValue={maxValue} unit={unit} colorClass={colorClass || 'bg-primary-main'} />;
    }

    return (
        <div className="col-span-full">
            <dt className="text-xs font-bold uppercase text-text-disabled mb-1">{label}</dt>
            <dd>{content}</dd>
        </div>
    );
};