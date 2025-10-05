import React from 'react';
import { FederationEnergyAllocator, KlingonEnergyAllocator, RomulanEnergyAllocator } from './allocators';
import { useUIState } from '../contexts/UIStateContext';


interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
}

const EnergyAllocator: React.FC<EnergyAllocatorProps> = (props) => {
  const { themeName } = useUIState();

  switch (themeName) {
    case 'klingon':
      return <KlingonEnergyAllocator {...props} themeName={themeName} />;
    case 'romulan':
      return <RomulanEnergyAllocator {...props} />;
    case 'federation':
    default:
      return <FederationEnergyAllocator {...props} />;
  }
};

export default EnergyAllocator;