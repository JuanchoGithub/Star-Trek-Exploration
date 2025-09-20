import React from 'react';
import { ThemeName } from '../hooks/useTheme';
import { FederationEnergyAllocator, KlingonEnergyAllocator, RomulanEnergyAllocator } from './allocators';


interface EnergyAllocatorProps {
  allocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  themeName: ThemeName;
}

const EnergyAllocator: React.FC<EnergyAllocatorProps> = (props) => {
  switch (props.themeName) {
    case 'klingon':
      return <KlingonEnergyAllocator {...props} />;
    case 'romulan':
      return <RomulanEnergyAllocator {...props} />;
    case 'federation':
    default:
      // The Federation allocator doesn't need the themeName, but we pass all props for simplicity.
      return <FederationEnergyAllocator {...props} />;
  }
};

export default EnergyAllocator;