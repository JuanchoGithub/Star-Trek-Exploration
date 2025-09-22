import React, { useRef, useCallback, useEffect } from 'react';
import { ThemeName } from '../../hooks/useTheme';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';

interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  themeName: ThemeName;
}

export const KlingonEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange, themeName }) => {
    const containerRef = useRef<SVGSVGElement>(null);
    const isDragging = useRef(false);
    const { WeaponIcon, ShieldIcon, EngineIcon } = getFactionIcons(themeName);

    const vertices = {
        weapons: { x: 50, y: 10 },
        shields: { x: 15, y: 66 },
        engines: { x: 85, y: 66 },
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
        const svgY = (clientY - rect.top) / rect.height * 80; // Use viewBox height

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
                    viewBox="0 0 100 80" 
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
                    <polygon points="50,5 5,71 95,71" className="klingon-allocator-triangle-bg" />
                    <polygon points="50,10 15,66 85,66" className="klingon-allocator-triangle-outline" />

                    <text x="50" y="8" className="klingon-allocator-label">wpn</text>
                    <text x="15" y="79" className="klingon-allocator-label">shd</text>
                    <text x="85" y="79" className="klingon-allocator-label">eng</text>
                    
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