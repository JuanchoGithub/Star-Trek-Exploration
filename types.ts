import React from 'react';

export interface Subsystem {
  health: number;
  maxHealth: number;
}

export interface Ship {
  id: string;
  name: string;
  hull: number;
  maxHull: number;
  shields: { fore: number; aft: number; };
  maxShields: { fore: number; aft: number; };
  energy: number;
  maxEnergy: number;
  torpedoes: number;
  dilithium: number;
  maxDilithium: number;
  position: { x: number; y: number };
  powerAllocation: {
    weapons: number;
    shields: number;
    engines: number;
  };
  faction: string;
  isEvasive: boolean;
  subsystems: {
    weapons: Subsystem;
    engines: Subsystem;
    shields: Subsystem; // Represents the shield generator itself
  };
}

export interface Planet {
  id: string;
  name: string;
  type: 'planet';
  position: { x: number; y: number };
}

export interface Starbase {
  id: string;
  name: string;
  type: 'starbase';
  faction: 'Federation';
  position: { x: number; y: number };
}

export type Entity = (Ship & { type: 'ship' }) | Planet | Starbase;

export interface SectorState {
  visited: boolean;
  entities: Entity[];
}

export interface GameState {
  turn: number;
  player: {
    rank: string;
    xp: number;
    ship: Ship;
    quadrantPosition: { qx: number; qy: number };
  };
  factions: {
    [key: string]: { reputation: number };
  };
  currentSector: {
    size: { width: number; height: number };
    entities: Entity[];
  };
  navigationTarget: { x: number; y: number } | null;
  quadrantMap: SectorState[][];
}