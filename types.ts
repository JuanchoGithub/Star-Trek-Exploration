// types.ts

export interface Position {
    x: number;
    y: number;
}

export interface QuadrantPosition {
    qx: number;
    qy: number;
}

export interface Subsystem {
    health: number;
    maxHealth: number;
}

export interface ShipSubsystems {
    weapons: Subsystem;
    engines: Subsystem;
    shields: Subsystem;
}

export type Faction = 'Federation' | 'Klingon' | 'Romulan' | 'Independent';

interface BaseEntity {
    id: string;
    name: string;
    position: Position;
    faction?: Faction;
    scanned?: boolean;
}

export interface Ship extends BaseEntity {
    type: 'ship';
    maxHull: number;
    hull: number;
    maxShields: number;
    shields: number;
    energy: {
        current: number;
        max: number;
    };
    energyAllocation: {
        weapons: number;
        shields: number;
        engines: number;
    };
    subsystems: ShipSubsystems;
    torpedoes: {
        current: number;
        max: number;
    };
    dilithium: {
        current: number;
        max: number;
    };
    scanned: boolean;
    faction: Faction;
    isCloaked?: boolean;
    evasive: boolean;
    retreatingTurn: number | null;
    repairTarget: 'weapons' | 'engines' | 'shields' | 'hull' | null;
}

export interface Starbase extends BaseEntity {
    type: 'starbase';
    faction: 'Federation';
}

export interface Planet extends BaseEntity {
    type: 'planet';
}

export type Entity = Ship | Starbase | Planet;

export interface Sector {
    entities: Entity[];
}

export interface SectorState {
    visited: boolean;
    hasEnemies: boolean;
    hasStarbase: boolean;
    hasPlanet: boolean;
    hasNeutral: boolean;
}

export interface GameState {
    player: {
        ship: Ship;
        quadrantPosition: QuadrantPosition;
    };
    currentSector: Sector;
    quadrantMap: SectorState[][];
    turn: number;
    navigationTarget: Position | null;
}