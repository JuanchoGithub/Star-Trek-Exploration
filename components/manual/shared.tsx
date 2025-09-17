import React from 'react';

export const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-secondary-light mb-4 pb-2 border-b-2 border-border-main">{children}</h2>
);

export const SubHeader: React.FC<{ children: React.ReactNode, id?: string }> = ({ children, id }) => (
    <h3 id={id} className="text-xl font-bold text-accent-yellow mt-6 mb-2">{children}</h3>
);
