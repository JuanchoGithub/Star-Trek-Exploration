import React, { useRef, useCallback, useEffect } from 'react';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';


interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  themeName: ThemeName;
}

const KlingonEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange, themeName }) => {
    const containerRef = useRef<SVGSVGElement>(null);
    const isDragging = useRef(false);
    const { WeaponIcon, ShieldIcon, EngineIcon } = getFactionIcons(themeName);

    const vertices = {
        weapons: { x: 50, y: 10 },
        shields: { x: 15, y: 85 },
        engines: { x: 85, y: 85 },
    };

    const allocationToCartesian = (alloc: { weapons: number; shields: number; engines: number }) => {
        const w = alloc.weapons / 100;
        const s = alloc.shields / 100;
        const e = alloc.engines / 100;
        const x = w * vertices.weapons.x + s * vertices.shields.x + e * vertices.engines.x;
        const y = w * vertices.weapons.y + s * vertices.shields.y + e * vertices.engines.y;
        return { x, y };
    };

    const handleInteraction = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const svgX = (clientX - rect.left) / rect.width * 100;
        const svgY = (clientY - rect.top) / rect.height * 100;

        const p1 = vertices.weapons;
        const p2 = vertices.shields;
        const p3 = vertices.engines;

        const det = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);
        let w = ((p2.y - p3.y) * (svgX - p3.x) + (p3.x - p2.x) * (svgY - p3.y)) / det;
        let s = ((p3.y - p1.y) * (svgX - p3.x) + (p1.x - p3.x) * (svgY - p3.y)) / det;
        
        w = Math.max(0, Math.min(1, w));
        s = Math.max(0, Math.min(1, s));
        let e = 1 - w - s;
        e = Math.max(0, Math.min(1, e));

        const total = w + s + e;
        if (total === 0) return;

        const newAlloc = {
            weapons: (w / total) * 100,
            shields: (s / total) * 100,
            engines: (e / total) * 100,
        };
        
        const finalAlloc = {
            weapons: Math.round(newAlloc.weapons),
            shields: Math.round(newAlloc.shields),
            engines: Math.round(newAlloc.engines),
        };

        const remainder = 100 - (finalAlloc.weapons + finalAlloc.shields + finalAlloc.engines);
        finalAlloc.weapons += remainder;


        const diffs = {
            weapons: Math.abs(finalAlloc.weapons - allocation.weapons),
            shields: Math.abs(finalAlloc.shields - allocation.shields),
            engines: Math.abs(finalAlloc.engines - allocation.engines),
        };
        
        const changedKey = Object.keys(diffs).reduce((a, b) => diffs[a as keyof typeof diffs] > diffs[b as keyof typeof diffs] ? a : b) as keyof typeof diffs;
        
        onEnergyChange(changedKey, finalAlloc[changedKey]);

    }, [onEnergyChange, allocation]);
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if(isDragging.current) handleInteraction(e.clientX, e.clientY);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if(isDragging.current) handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
        };
        const handleMouseUp = () => { isDragging.current = false; };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleInteraction]);

    const handlePos = allocationToCartesian(allocation);

    return (
        <div className="panel-style p-2">
            <h3 className="text-center text-lg font-bold text-secondary-light mb-2">Power Diverter</h3>
            <div className="relative">
                 <svg 
                    ref={containerRef} 
                    viewBox="0 0 100 100" 
                    className="klingon-allocator-svg"
                    onMouseDown={(e) => { isDragging.current = true; handleInteraction(e.clientX, e.clientY); }}
                    onTouchStart={(e) => { isDragging.current = true; handleInteraction(e.touches[0].clientX, e.touches[0].clientY); }}
                >
                    <defs>
                        <radialGradient id="klingon-handle-gradient">
                            <stop offset="0%" stopColor="var(--color-primary-light)" />
                            <stop offset="50%" stopColor="var(--color-primary-main)" />
                            <stop offset="100%" stopColor="var(--color-primary-dark)" />
                        </radialGradient>
                    </defs>
                    <polygon points="50,5 5,95 95,95" className="klingon-allocator-triangle-bg" />
                    <polygon points="50,10 15,85 85,85" className="klingon-allocator-triangle-outline" />

                    <text x="50" y="8" className="klingon-allocator-label">Weapons</text>
                    <text x="15" y="98" className="klingon-allocator-label">Shields</text>
                    <text x="85" y="98" className="klingon-allocator-label">Engines</text>
                    
                    <circle cx={handlePos.x} cy={handlePos.y} r="6" className="klingon-allocator-handle" />
                </svg>
            </div>
            <div className="flex justify-around text-center mt-2">
                <div className="text-red-400">
                    <WeaponIcon className="w-5 h-5 mx-auto" />
                    <span className="font-bold">{allocation.weapons}%</span>
                </div>
                <div className="text-cyan-400">
                    <ShieldIcon className="w-5 h-5 mx-auto" />
                    <span className="font-bold">{allocation.shields}%</span>
                </div>
                 <div className="text-green-400">
                    <EngineIcon className="w-5 h-5 mx-auto" />
                    <span className="font-bold">{allocation.engines}%</span>
                </div>
            </div>
        </div>
    );
};

const FederationEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange, themeName }) => {
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
            const trackHeightRem = 16;
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
        const trackHeightRem = 16; // h-64
        const travelRangeRem = trackHeightRem - indicatorHeightRem;
        const topRem = (1 - value / 100) * travelRangeRem;


        return (
            <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative w-10 h-64 bg-black rounded-full cursor-pointer border-2 border-gray-700"
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
        
        <div className="relative h-64 w-2 flex-shrink-0 self-end">
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

        <div className="relative h-64 w-2 flex-shrink-0 self-end">
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

const RomulanEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon } = getFactionIcons('romulan');

    const systems = [
        { key: 'weapons' as const, icon: <WeaponIcon className="w-6 h-6"/>, color: 'bg-primary-main' },
        { key: 'shields' as const, icon: <ShieldIcon className="w-6 h-6"/>, color: 'bg-secondary-main' },
        { key: 'engines' as const, icon: <EngineIcon className="w-6 h-6"/>, color: 'bg-accent-green' },
    ];
    
    const handleBarClick = (key: 'weapons' | 'shields' | 'engines') => {
        // Simple logic: clicking a system gives it a majority of the power.
        if (allocation[key] > 50) {
            // If already focused, distribute evenly
            onEnergyChange('weapons', 34);
            onEnergyChange('shields', 33);
            onEnergyChange('engines', 33);
        } else {
             onEnergyChange(key, 60);
        }
    }

    return (
        <div className="panel-style p-3">
             <h3 className="text-center text-sm font-bold text-secondary-light mb-3 uppercase tracking-widest">Core Output</h3>
             <div className="flex justify-around items-end gap-3 h-32">
                 {systems.map(system => (
                     <div key={system.key} className="flex-1 flex flex-col items-center h-full cursor-pointer group" onClick={() => handleBarClick(system.key)} title={`Focus power on ${system.key}`}>
                         <div className="font-bold text-lg text-text-primary group-hover:text-white">{allocation[system.key]}%</div>
                         <div className="w-full h-full flex items-end bg-black/50 overflow-hidden border-t-2 border-border-main" style={{clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)'}}>
                            <div 
                                className={`${system.color} w-full shadow-inner shadow-black/50 group-hover:shadow-white/50`} 
                                style={{ 
                                    height: `${allocation[system.key]}%`, 
                                    transition: 'height 0.3s ease-in-out',
                                    boxShadow: `inset 0 0 10px ${system.color}, 0 0 10px ${system.color}`
                                }}
                            ></div>
                         </div>
                         <div className="mt-1 text-text-secondary group-hover:text-white">{system.icon}</div>
                     </div>
                 ))}
             </div>
        </div>
    );
};


const EnergyAllocator: React.FC<EnergyAllocatorProps> = (props) => {
  if (props.themeName === 'klingon') {
    return <KlingonEnergyAllocator {...props} />;
  }
  if (props.themeName === 'romulan') {
    return <RomulanEnergyAllocator {...props} />;
  }
  // Default to Federation style for any other theme
  return <FederationEnergyAllocator {...props} />;
};

export default EnergyAllocator;