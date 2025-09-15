import React from 'react';

type SVGProps = React.SVGProps<SVGSVGElement>;

export const PlayerShipIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2.5 21.5h19L12 2zm0 4.24L17.76 19.5H6.24L12 6.24z"/>
  </svg>
);

export const EnemyShipIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l-2 7h4l-2-7zm-10 7l4 2-4 2v-4zm20 0v4l-4-2 4-2zm-10 3c-4.42 0-8 3.58-8 8h16c0-4.42-3.58-8-8-8z"/>
  </svg>
);

export const PlanetIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79.83 2.18 3.12 3.79 5.79 3.79s4.96-1.61 5.79-3.79c.14.58.21 1.17.21 1.79 0 4.08-3.05 7.44-7 7.93z"/>
  </svg>
);

export const StarbaseIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2c-1.1 0-2 .9-2 2v2.05A7.002 7.002 0 005.95 12H3.9c-1.1 0-2 .9-2 2s.9 2 2 2h2.05c.58 2.84 2.89 5.15 5.73 5.73V20c0 1.1.9 2 2 2s2-.9 2-2v-2.28c2.84-.58 5.15-2.89 5.73-5.73H20c1.1 0 2-.9 2-2s-.9-2-2-2h-2.28A7.002 7.002 0 0014.05 6.05V4c0-1.1-.9-2-2-2zm0 5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
    </svg>
);


export const WeaponIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a12.02 12.02 0 0 0-5.84 0m5.84 0a12.02 12.02 0 0 1-5.84 0M12 12v9m-9-9h18" />
  </svg>
);

export const ShieldIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </svg>
);

export const EngineIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export const TargetIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3m0 9v3m-7.5-6h3m9 0h3" />
    </svg>
);

export const CycleTargetIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5 3.358 7.5 7.5 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 19.5L19.5 12l-3-3" />
    </svg>
);

export const TorpedoIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.5 7.5V3H7.5v4.5L3 12l4.5 4.5V21h9v-4.5L21 12l-4.5-4.5zM15 13.5h-3v3h-2v-3H7v-2h3V8h2v3h3v2z" />
  </svg>
);

export const EvasiveManeuverIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>
);

export const RetreatIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H3" />
    </svg>
);

export const NavigationTargetIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3v18" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export const QuadrantIcon: React.FC<SVGProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-6h15m-15-6h15" />
  </svg>
);

export const SectorIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0-2.25l2.25 1.313M12 12.75l-2.25 1.313M9 21l2.25-1.313M9 21v-2.25m0 2.25l2.25 1.313M12 15.75l2.25-1.313M12 15.75l-2.25-1.313m0 0l-2.25 1.313m2.25-1.313l2.25 1.313m0 0l2.25-1.313m-2.25 1.313V21m-2.25-4.5l-2.25 1.313m-2.25-1.313l2.25-1.313m2.25 1.313l2.25 1.313" />
    </svg>
);

export const DilithiumIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2l-5 9h10l-5-9zm-7 10l5 9h4l5-9h-14z" />
    </svg>
);

export const DamageControlIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.664 1.206-.861a7.5 7.5 0 10-9.28 9.28c.197.466.477.89.861 1.206l3.03-2.496m-2.496-3.03l-4.286 3.486A2.652 2.652 0 013 17.25L8.83 11.42m2.59 3.75l4.286-3.486" />
    </svg>
);

export const ScanIcon: React.FC<SVGProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7.07-2.93l.707-.707m12.728 0l-.707-.707M3 12h1m16 0h1m-2.93-7.07l-.707.707m0 12.728l.707.707" />
    </svg>
);