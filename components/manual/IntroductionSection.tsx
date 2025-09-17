import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const IntroductionSection: React.FC = () => (
    <div>
        <SectionHeader>Starfleet Field Manual</SectionHeader>
        <p className="text-lg text-text-secondary italic">Issued to Captain, U.S.S. Endeavour, Stardate 47458.2</p>
        <SubHeader>Letter from the Admiralty</SubHeader>
        <p className="mb-4">Captain,</p>
        <p className="mb-4 text-text-secondary indent-8">Welcome to the Typhon Expanse. Your mission is threefold: to explore this uncharted and volatile region of space, to extend the hand of diplomacy to any new life you may encounter, and to defend the Federation from those who would see it fall. The Expanse is home to Klingon patrols, Romulan spies, and lawless pirates. It is a tinderbox waiting for a spark.</p>
        <p className="mb-4 text-text-secondary indent-8">The U.S.S. Endeavour is one of the finest ships in the fleet, but she is only as good as her crew. Your command decisions will determine the success or failure of this five-year mission. This manual contains all the tactical and operational data you will need to command your vessel effectively. Study it. The lives of your crew depend on it.</p>
        <p className="font-bold">Admiral J. P. Hanson</p>
        <p className="text-sm text-text-disabled">Starfleet Command</p>
    </div>
);
