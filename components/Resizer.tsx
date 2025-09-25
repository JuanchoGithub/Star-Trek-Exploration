import React, { useCallback } from 'react';

interface ResizerProps {
  onDrag: (delta: number) => void;
  orientation: 'vertical' | 'horizontal';
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

const Resizer: React.FC<ResizerProps> = ({ onDrag, orientation, onResizeStart, onResizeEnd }) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onResizeStart?.();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = orientation === 'vertical' ? moveEvent.movementX : moveEvent.movementY;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      onResizeEnd?.();
    };

    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onDrag, orientation, onResizeStart, onResizeEnd]);

  const classes = orientation === 'vertical'
    ? 'w-2 h-full cursor-col-resize bg-transparent hover:bg-secondary-main/30 transition-colors duration-200 flex items-center justify-center'
    : 'h-2 w-full cursor-row-resize bg-transparent hover:bg-secondary-main/30 transition-colors duration-200 flex items-center justify-center';

  const handleClasses = orientation === 'vertical'
    ? 'w-1 h-16 bg-border-dark rounded-full'
    : 'h-1 w-16 bg-border-dark rounded-full';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={classes}
      role="separator"
      aria-orientation={orientation}
    >
        <div className={handleClasses} />
    </div>
  );
};

export default Resizer;
