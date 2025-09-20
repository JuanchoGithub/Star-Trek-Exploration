import React from 'react';
import { Ship } from '../types';
import KlingonRamAnimation from './animations/KlingonRamAnimation';
import RomulanEscapeAnimation from './animations/RomulanEscapeAnimation';
import PirateSelfDestructAnimation from './animations/PirateSelfDestructAnimation';
import FederationEvacuateAnimation from './animations/FederationEvacuateAnimation';

interface DesperationMoveAnimationProps {
    animation: {
        source: Ship;
        target?: Ship;
        type: string;
        outcome?: 'success' | 'failure';
    } | null;
}

const DesperationMoveAnimation: React.FC<DesperationMoveAnimationProps> = ({ animation }) => {
    if (!animation) {
        return null;
    }

    const { type, source, target, outcome } = animation;

    switch (type) {
        case 'ram':
            // Ram move requires a target
            if (!target) return null;
            return <KlingonRamAnimation source={source} target={target} />;
        
        case 'escape':
            // Escape move requires an outcome
            if (!outcome) return null;
            return <RomulanEscapeAnimation source={source} outcome={outcome} />;

        case 'self_destruct':
            return <PirateSelfDestructAnimation source={source} />;

        case 'evacuate':
            return <FederationEvacuateAnimation source={source} />;

        default:
            return null;
    }
};

export default DesperationMoveAnimation;