import React from 'react';
import { BaseIcon } from './BaseIcon';

export const CloakIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 00-10 10c0 4.42 2.87 8.17 6.84 9.5" strokeDasharray="4 4" />
      <path d="M20.66 17.5A10 10 0 0012 2" strokeDasharray="4 4"/>
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </BaseIcon>
);