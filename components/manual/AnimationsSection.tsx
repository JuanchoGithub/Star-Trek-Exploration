import React, { useState, useEffect, useMemo } from 'react';
import DesperationMoveAnimation from '../DesperationMoveAnimation';
import { SectionHeader, SubHeader } from './shared';
import { allMockShips, getShipsByFaction } from './mockShipData';
import { Ship, ShipModel } from '../../types';

const ShipSelectDropdown: React.FC<{
    label: string;
    selectedShipId: string;
    ships: Ship[];
    onChange: (shipId: string) => void;
}> = ({ label, selectedShipId, ships, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm text-text-secondary mb-1">{label}</label>
        <select
            value={selectedShipId}
            onChange={(e) => onChange(e.target.value)}
            className="bg-bg-paper-lighter border border-border-dark rounded p-2"
        >
            {ships.map(ship => (
                <option key={ship.id} value={ship.id}>
                    {ship.name} ({ship.shipRole})
                </option>
            ))}
        </select>
    </div>
);


export const AnimationsSection: React.FC = () => {
    const [activeAnimation, setActiveAnimation] = useState<{
        source: Ship;
        target?: Ship;
        type: string;
        outcome?: 'success' | 'failure';
        name: string;
        sourceFaction: ShipModel;
    } | null>(null);

    const [sourceShip, setSourceShip] = useState<Ship | null>(null);
    const [targetShip, setTargetShip] = useState<Ship | null>(null);

    const animationList = useMemo(() => [
        { name: 'Federation: Evacuate', type: 'evacuate', source: allMockShips.find(s => s.shipRole === 'Dreadnought' && s.faction === 'Federation')!, sourceFaction: 'Federation' as ShipModel },
        { name: 'Klingon: Ram', type: 'ram', source: allMockShips.find(s => s.shipModel === 'Klingon')!, target: allMockShips.find(s => s.shipModel === 'Federation'), sourceFaction: 'Klingon' as ShipModel },
        { name: 'Romulan: Escape (Success)', type: 'escape', source: allMockShips.find(s => s.shipModel === 'Romulan')!, outcome: 'success' as const, sourceFaction: 'Romulan' as ShipModel },
        { name: 'Romulan: Escape (Failure)', type: 'escape', source: allMockShips.find(s => s.shipModel === 'Romulan')!, outcome: 'failure' as const, sourceFaction: 'Romulan' as ShipModel },
        { name: 'Pirate: Self-Destruct', type: 'self_destruct', source: allMockShips.find(s => s.shipModel === 'Pirate')!, sourceFaction: 'Pirate' as ShipModel },
    ], []);

    useEffect(() => {
        if (activeAnimation) {
            setSourceShip(activeAnimation.source);
            setTargetShip(activeAnimation.target || null);
        } else {
            setSourceShip(null);
            setTargetShip(null);
        }
    }, [activeAnimation]);

    const handleAnimationSelect = (animation: typeof animationList[0]) => {
        // Give it a unique name to force re-render on re-click
        setActiveAnimation({ ...animation, name: `${animation.name}-${Date.now()}` });
    };

    const handleSourceShipChange = (shipId: string) => {
        const newShip = allMockShips.find(s => s.id === shipId);
        if (newShip) setSourceShip(newShip);
    };

    const handleTargetShipChange = (shipId: string) => {
        const newShip = allMockShips.find(s => s.id === shipId);
        if (newShip) setTargetShip(newShip);
    };

    const sourceShipOptions = activeAnimation ? getShipsByFaction(activeAnimation.sourceFaction) : [];

    const currentAnimationData = activeAnimation && sourceShip ? {
        source: sourceShip,
        target: targetShip || undefined,
        type: activeAnimation.type,
        outcome: activeAnimation.outcome,
    } : null;

    return (
        <div>
            <SectionHeader>Animation Library</SectionHeader>
            <p className="text-text-secondary mb-4">
                This section contains a library of all cinematic desperation moves. Select an animation from the list, then choose the participating ships to preview the sequence.
            </p>
            <div className="flex flex-col md:flex-row gap-4 min-h-0" style={{ height: '65vh' }}>
                <nav className="w-full md:w-1/4 flex-shrink-0 flex flex-col gap-1 panel-style p-2 overflow-y-auto">
                    {animationList.map((anim) => (
                        <button
                            key={anim.name}
                            onClick={() => handleAnimationSelect(anim)}
                            className={`w-full text-left p-3 rounded transition-colors btn btn-primary flex-shrink-0 ${activeAnimation?.name.startsWith(anim.name) ? 'bg-primary-light' : ''}`}
                        >
                            {anim.name}
                        </button>
                    ))}
                </nav>
                <main className="w-full md:w-3/4 flex-grow flex flex-col gap-4">
                    <div className="panel-style overflow-hidden relative bg-black flex-grow flex items-center justify-center">
                        {currentAnimationData ? (
                            <DesperationMoveAnimation key={activeAnimation?.name + sourceShip?.id + targetShip?.id} animation={currentAnimationData} />
                        ) : (
                            <p className="text-text-secondary text-lg">Select an animation to view.</p>
                        )}
                    </div>
                    {activeAnimation && (
                         <div className="panel-style p-3 flex-shrink-0">
                            <SubHeader>Animation Controls</SubHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {sourceShip && (
                                    <ShipSelectDropdown
                                        label="Source Ship"
                                        selectedShipId={sourceShip.id}
                                        ships={sourceShipOptions}
                                        onChange={handleSourceShipChange}
                                    />
                                )}
                                {activeAnimation.target && targetShip && (
                                     <ShipSelectDropdown
                                        label="Target Ship"
                                        selectedShipId={targetShip.id}
                                        ships={allMockShips}
                                        onChange={handleTargetShipChange}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};