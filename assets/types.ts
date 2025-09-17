import React from 'react';

// Shared config type for non-ship/planet entities
export interface EntityTypeConfig {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
}
