import React, { useRef, useCallback, useEffect } from 'react';

interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
}

// Local component for the vertical slider
const VerticalSlider: React.FC<{
    value: number;
    onChange: (newValue: number) => void;
    colorFrom: string;
    colorTo: string;
}> = ({ value, onChange, colorFrom, colorTo }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleInteraction = useCallback((clientY: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();

        const indicatorHeightRem = 2.5;
        const trackHeightRem = 10; // Corresponds to h-40
        const indicatorHeightRatio = indicatorHeightRem / trackHeightRem;

        const indicatorHeightPx = rect.height * indicatorHeightRatio;
        const travelRangePx = rect.height - indicatorHeightPx;
        const clickOffsetY = clientY - rect.top;
        
        const clampedTopPx = Math.max(0, Math.min(clickOffsetY - (indicatorHeightPx / 2), travelRangePx));
        
        let percentage = 1 - (clampedTopPx / travelRangePx);
        percentage = Math.max(0, Math.min(1, percentage));

        const newValue = Math.round(percentage * 100);
        onChange(newValue);
    }, [onChange]);


    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        handleInteraction(e.clientY);
    }, [handleInteraction]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        isDragging.current = true;
        handleInteraction(e.touches[0].clientY);
    }, [handleInteraction]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                e.preventDefault();
                handleInteraction(e.clientY);
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging.current) {
                e.preventDefault();
                handleInteraction(e.touches[0].clientY);
            }
        };
        const handleMouseUp = () => { isDragging.current = false; };
        const handleTouchEnd = () => { isDragging.current = false; };
        
        window.addEventListener('mousemove', handleMouseMove, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleInteraction]);

    const dynamicNumberLabel = String(value).padStart(3, '0');

    const indicatorHeightRem = 2.5; // h-10
    const trackHeightRem = 10; // h-40
    const travelRangeRem = trackHeightRem - indicatorHeightRem;
    const topRem = (1 - value / 100) * travelRangeRem;


    return (
        <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-10 h-40 bg-black rounded-full cursor-pointer border-2 border-gray-700"
            style={{ touchAction: 'none' }}
        >
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                    className="w-full h-full"
                    style={{ background: `linear-gradient(to top, ${colorFrom}, ${colorTo})` }}
                />
            </div>
            <div
                className="absolute left-1/2 w-14 h-10 transition-all duration-75 pointer-events-none"
                style={{
                    top: `${topRem}rem`,
                    transform: 'translateX(-50%)',
                }}
            >
                <div
                    className="bg-purple-200 w-full h-full flex items-center justify-center border-[7px] border-black"
                >
                    <svg viewBox="0 0 42 26" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                        <text
                            x="50%"
                            y="50%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            className="font-mono font-bold"
                            fill="black"
                            fontSize="24"
                            textLength="40"
                            lengthAdjust="spacingAndGlyphs"
                        >
                            {dynamicNumberLabel}
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export const FederationEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange }) => {
  return (
    <div className="panel-style p-4 bg-black">
      <h3 className="text-center text-lg font-bold text-secondary-light mb-4">Energy Allocation</h3>
      <div className="flex justify-around items-start">
        <div className="flex flex-col items-center gap-2">
            <div className="font-bold text-accent-orange">Weapons</div>
            <VerticalSlider 
                value={allocation.weapons}
                onChange={(val) => onEnergyChange('weapons', val)}
                colorFrom="var(--color-accent-orange)"
                colorTo="var(--color-accent-yellow-dark)"
            />
        </div>
        
        <div className="relative h-40 w-2 flex-shrink-0 self-end">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-accent-yellow-darker rounded-full"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white rounded-sm"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
            <div className="font-bold text-accent-yellow">Shields</div>
            <VerticalSlider 
                value={allocation.shields}
                onChange={(val) => onEnergyChange('shields', val)}
                colorFrom="var(--color-accent-yellow-dark)"
                colorTo="var(--color-accent-yellow)"
            />
        </div>

        <div className="relative h-40 w-2 flex-shrink-0 self-end">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-accent-yellow-darker rounded-full"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white rounded-sm"></div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
            <div className="font-bold" style={{color: '#fef9c3'}}>Engines</div>
            <VerticalSlider
                value={allocation.engines}
                onChange={(val) => onEnergyChange('engines', val)}
                colorFrom="var(--color-accent-yellow)"
                colorTo="#fef9c3"
            />
        </div>
      </div>
    </div>
  );
};