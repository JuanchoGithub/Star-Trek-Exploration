import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const StarbaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></Icon>
);

export const AsteroidFieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <Icon {...props}><path d="M16.5 10.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-6 2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5-1.5zM9 11c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM5.5 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></Icon>
);

export const EventBeaconIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
        <path d="M15.41 6.59C14.05 5.23 12.04 4.5 10 4.5c-2.04 0-4.05.73-5.41 2.09" />
        <path d="M17.5 4.5c2.76 2.76 2.76 7.24 0 10" transform="rotate(45 12 12)" />
    </Icon>
);

export const NavigationTargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></Icon>
);

export const WeaponIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></Icon>
);

export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></Icon>
);

export const EngineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></Icon>
);

export const TransporterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="11" strokeDasharray="4 4" />
    </Icon>
);

export const CycleTargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></Icon>
);

export const TorpedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M8 20c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2v-4H8v4zm8-18h-2V1h-4v1H8V1H6v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></Icon>
);

export const TorpedoProjectileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="torpedoGradient">
                <stop offset="0%" stopColor="white" />
                <stop offset="50%" stopColor="yellow" />
                <stop offset="100%" stopColor="orange" />
            </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="8" fill="url(#torpedoGradient)" />
    </Icon>
);


export const EvasiveManeuverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="m19.65 9.04-2.79-2.79-2.79 2.79C14.07 9.03 15 9.49 15 10v7H9v-7c0-.51.93-1 1.07-.96l-2.8-2.79-2.78 2.79C4.34 9.03 4 8.66 4 8V4h16v4c0 .66-.34 1.03-.49 1.04z"/></Icon>
);

export const DamageControlIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-3.7z"/></Icon>
);

export const ScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21c-1.53 1.28-3.48 2.04-5.55 2.04s-4.02-.76-5.55-2.04C3.25 16.48 2.3 14.15 2.3 11.5 2.3 8.85 3.25 6.52 4.69 4.79c1.53-1.28 3.48-2.04 5.55-2.04s4.02.76 5.55 2.04c1.44 1.73 2.39 4.06 2.39 6.71s-.95 4.98-2.39 6.71z"/></Icon>
);

export const RetreatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></Icon>
);

export const HailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></Icon>
);

export const SecurityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="23" x2="23" y2="1" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </Icon>
);

export const ScienceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2H9v-2h2v-2H9V9h2V7h2v2h2v2h-2v2h2v2h-2v2h-2z"/></Icon>
);

export const EngineeringIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4H9.5c-1.93 0-3.5 1.57-3.5 3.5S7.57 18 9.5 18H11v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4h1.5c1.93 0 3.5-1.57 3.5-3.5S22.43 11 20.5 11z"/></Icon>
);

export const DilithiumIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}><path d="M12 2L4 8.5V15.5L12 22L20 15.5V8.5L12 2ZM18 14.5L12 19L6 14.5V9.5L12 5L18 9.5V14.5Z"/></Icon>
);