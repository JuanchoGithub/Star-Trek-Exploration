import React from 'react';
import type { Ship } from '../types';

interface ShipStatusProps {
  ship: Ship;
}

const StatusBar: React.FC<{ label: string; value: number; max: number; color: string; }> = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm">
      <span className="font-bold">{label}</span>
      <span>{value} / {max}</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
      <div
        className={`${color} h-4 rounded-full transition-all duration-300`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const ShipStatus: React.FC<ShipStatusProps> = ({ ship }) => {
  return (
    <div className="bg-gray-900 p-3 rounded">
      <h3 className="text-lg font-bold text-blue-300 mb-2">Ship Status: {ship.name}</h3>
      <div className="space-y-3">
        <StatusBar label="Hull Integrity" value={ship.hull} max={ship.maxHull} color="bg-green-500" />
        <StatusBar label="Fore Shields" value={ship.shields.fore} max={ship.maxShields.fore} color="bg-cyan-500" />
        <StatusBar label="Aft Shields" value={ship.shields.aft} max={ship.maxShields.aft} color="bg-cyan-500" />
      </div>
       <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-x-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-bold">Photon Torpedoes:</span>
          <span className="text-orange-400 font-bold">{ship.torpedoes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Dilithium Crystals:</span>
          <span className="text-pink-400 font-bold">{ship.dilithium}</span>
        </div>
      </div>
    </div>
  );
};

export default ShipStatus;