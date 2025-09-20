import React, { useRef, useCallback, useEffect } from 'react';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';

interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
}

export const RomulanEnergyAllocator: React.FC<EnergyAllocatorProps> = ({ allocation, onEnergyChange }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon } = getFactionIcons('romulan');

    const systems = [
        { key: 'weapons' as const, label: 'wpn', icon: <WeaponIcon className="w-6 h-6"/>, color: 'bg-primary-main' },
        { key: 'shields' as const, label: 'shd', icon: <ShieldIcon className="w-6 h-6"/>, color: 'bg-secondary-main' },
        { key: 'engines' as const, label: 'eng', icon: <EngineIcon className="w-6 h-6"/>, color: 'bg-accent-green' },
    ];

    // Refs for drag functionality
    const barContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const activeDragSystem = useRef<'weapons' | 'shields' | 'engines' | null>(null);

    // Handles calculating and applying the new percentage on drag
    const handleInteraction = useCallback((clientY: number) => {
        if (!activeDragSystem.current) return;
        
        const systemKey = activeDragSystem.current;
        const barContainer = barContainerRefs.current[systemKey];
        if (!barContainer) return;
        
        const rect = barContainer.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        const percentage = 1 - (relativeY / rect.height);
        const clampedPercentage = Math.max(0, Math.min(100, percentage * 100));

        onEnergyChange(systemKey, Math.round(clampedPercentage));
    }, [onEnergyChange]);

    // Effect to add and clean up global event listeners for drag
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (activeDragSystem.current) {
                e.preventDefault();
                handleInteraction(e.clientY);
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
             if (activeDragSystem.current) {
                e.preventDefault();
                handleInteraction(e.touches[0].clientY);
            }
        };
        const handleMouseUp = () => {
            activeDragSystem.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleInteraction]);

    // Initiates the drag state for mouse or touch
    const startDrag = (system: 'weapons' | 'shields' | 'engines', clientY: number) => {
        activeDragSystem.current = system;
        handleInteraction(clientY);
    };

    return (
        <div className="panel-style p-3">
             <h3 className="text-center text-sm font-bold text-secondary-light mb-3 uppercase tracking-widest">Core Output</h3>
             <div className="flex justify-around items-end gap-3 h-32" style={{ touchAction: 'none' }}>
                 {systems.map(system => (
                     <div 
                        key={system.key} 
                        className="flex-1 flex flex-col items-center h-full cursor-ns-resize group" 
                        title={`Drag to allocate power to ${system.key}`}
                        onMouseDown={(e) => startDrag(system.key, e.clientY)}
                        onTouchStart={(e) => startDrag(system.key, e.touches[0].clientY)}
                     >
                         <div className="font-bold text-lg text-text-primary group-hover:text-white pointer-events-none">{allocation[system.key]}%</div>
                         <div 
                            ref={el => { barContainerRefs.current[system.key] = el; }}
                            className="w-full h-full flex items-end bg-black/50 overflow-hidden border-t-2 border-border-main pointer-events-none" 
                            style={{clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)'}}
                         >
                            <div 
                                className={`${system.color} w-full shadow-inner shadow-black/50 group-hover:shadow-white/50`} 
                                style={{ 
                                    height: `${allocation[system.key]}%`, 
                                    boxShadow: `inset 0 0 10px ${system.color}, 0 0 10px ${system.color}`
                                }}
                            ></div>
                         </div>
                         <div className="mt-1 text-text-secondary group-hover:text-white pointer-events-none">{system.icon}</div>
                         <div className="text-xs uppercase tracking-widest text-text-secondary group-hover:text-white pointer-events-none">{system.label}</div>
                     </div>
                 ))}
             </div>
        </div>
    );
};
