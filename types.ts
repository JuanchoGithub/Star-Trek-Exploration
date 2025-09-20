import React from 'react';

// Fix: Replaced entire file content with correct type definitions and removed logic.
// This resolves circular dependency issues and provides strongly-typed interfaces for the application.
export interface Position {
  x: number;
  y: number;
}

export interface QuadrantPosition {
  qx: number;
  qy: number;
}

export interface ShipSubsystems {
  weapons: { health: number; maxHealth: number };
  engines: { health: number; maxHealth: number };
  shields: { health: number; maxHealth: number };
  transporter: { health: number; maxHealth: number };
}

interface BaseEntity {
  id: string;
  name: string;
  type: 'ship' | 'planet' | 'starbase' | 'asteroid_field' | 'event_beacon' | 'torpedo_projectile' | 'shuttle';
  faction: string;
  position: Position;
  scanned: boolean;
}

export type ShipRole = 'Explorer' | 'Cruiser' | 'Escort' | 'Freighter' | 'Dreadnought';
// FIX: Exported ShipModel type to be used across the application.
export type ShipModel = 'Federation' | 'Klingon' | 'Romulan' | 'Pirate' | 'Independent';

export interface Ship extends BaseEntity {
  type: 'ship';
  // FIX: Used the exported ShipModel type.
  shipModel: ShipModel;
  shipRole: ShipRole;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  subsystems: ShipSubsystems;
  energy: { current: number; max: number };
  energyAllocation: { weapons: number; shields: number; engines: number };
  torpedoes: { current: number; max: number };
  dilithium: { current: number; max: number };
  evasive: boolean;
  retreatingTurn: number | null;
  crewMorale: { current: number; max: number };
  securityTeams: { current: number; max: number };
  repairTarget: 'hull' | 'weapons' | 'engines' | 'shields' | 'transporter' | null;
  logColor: string;
  // FIX: Added optional 'desperationMove' property to the Ship interface to fix type errors.
  desperationMove?: {
    type: 'ram' | 'self_destruct' | 'escape' | 'evacuate';
    targetId?: string;
  };
}

export type PlanetClass = 'M' | 'J' | 'L' | 'D'; // M: Earth-like, J: Gas Giant, L: Barren/Marginal, D: Rock/Asteroid

export interface Planet extends BaseEntity {
  type: 'planet';
  planetClass: PlanetClass;
  awayMissionCompleted?: boolean;
}

export interface Starbase extends BaseEntity {
  type: 'starbase';
  hull: number;
  maxHull: number;
}

export interface AsteroidField extends BaseEntity {
    type: 'asteroid_field';
}

export interface EventBeacon extends BaseEntity {
    type: 'event_beacon';
    eventType: 'derelict_ship' | 'distress_call' | 'ancient_probe';
    isResolved: boolean;
}

export interface Shuttle extends BaseEntity {
    type: 'shuttle';
    crewCount: number;
}

export interface TorpedoProjectile extends BaseEntity {
    type: 'torpedo_projectile';
    targetId: string;
    sourceId: string;
    stepsTraveled: number;
    speed: number;
    path: Position[];
    turnLaunched: number;
    hull: number;
    maxHull: number;
}

export type Entity = Ship | Planet | Starbase | AsteroidField | EventBeacon | TorpedoProjectile | Shuttle;

export type FactionOwner = 'Federation' | 'Klingon' | 'Romulan' | 'None';

export type AwayMissionRole = 'Science' | 'Security' | 'Engineering' | 'Medical' | 'Counselor';
export type OfficerPersonality = 'Logical' | 'Aggressive' | 'Cautious';

export interface BridgeOfficer {
  id: string;
  name: string;
  role: AwayMissionRole;
  personality: OfficerPersonality;
}

export interface OfficerAdvice {
  officerName: string;
  role: AwayMissionRole;
  message: string;
}

export type OutcomeType = 'reward' | 'damage' | 'nothing' | 'special';
export type ResourceType = 'hull' | 'shields' | 'energy' | 'dilithium' | 'torpedoes' | 'morale' | 'weapons' | 'engines' | 'transporter' | 'security_teams';

export interface AwayMissionOutcome {
    type: OutcomeType;
    resource?: ResourceType;
    amount?: number;
    log: string;
    weight: number; // For weighted random selection
}

export interface AwayMissionOptionTemplate {
    role: AwayMissionRole;
    text: string;
    successChanceRange: [number, number]; // e.g., [0.7, 0.9] for 70-90%
    outcomes: {
        success: AwayMissionOutcome[];
        failure: AwayMissionOutcome[];
    };
}

export interface AwayMissionTemplate {
    id: string;
    title: string;
    planetClasses: PlanetClass[]; // Can apply to multiple planet types
    description: string;
    options: AwayMissionOptionTemplate[];
}

// This is what will be stored in the state for an active mission
export interface ActiveAwayMissionOption {
    role: AwayMissionRole;
    text: string;
    calculatedSuccessChance: number; // The specific chance for this instance
    outcomes: {
        success: AwayMissionOutcome[];
        failure: AwayMissionOutcome[];
    };
}

export interface ActiveAwayMission {
    id: string;
    seed: string;
    title: string;
    description: string;
    options: ActiveAwayMissionOption[];
    advice: OfficerAdvice[];
}

export type AwayMissionResultStatus = 'success' | 'failure';

export interface AwayMissionResult {
    log: string;
    status: AwayMissionResultStatus;
    changes: {
        resource: ResourceType;
        amount: number; // signed number: positive for gain, negative for loss
    }[];
}


export interface ActiveHail {
    targetId: string;
    loading: boolean;
    message: string;
}

export interface PlayerTurnActions {
    combat?: {
        type: 'phasers';
        targetId: string;
    };
    hasLaunchedTorpedo?: boolean;
    hasUsedAwayTeam?: boolean;
}

export interface EventTemplateOption {
    text: string;
    outcome: {
        type: 'reward' | 'damage' | 'combat' | 'nothing' | 'special' | 'mission';
        log: string;
        amount?: number;
        // FIX: Added subsystem types to allow for damaging engines, weapons, etc., in events.
        resource?: 'hull' | 'shields' | 'energy' | 'dilithium' | 'torpedoes' | 'morale' | 'weapons' | 'engines' | 'transporter';
        spawn?: 'pirate_raider';
        spawnCount?: number;
        missionId?: string;
    };
}

export interface EventTemplate {
    id: string;
    type: EventBeacon['eventType'];
    title: string;
    description: string;
    options: EventTemplateOption[];
}

export type CombatEffect = {
    type: 'phaser';
    sourceId: string;
    targetId: string;
    faction: string;
    delay: number; // in milliseconds
} | {
    type: 'torpedo_hit';
    position: Position;
    delay: number;
};

export interface LogEntry {
  id: string;
  turn: number;
  sourceId: string; // 'player', 'system', or an entity ID
  sourceName: string;
  message: string;
  color: string; // Tailwind border color class
  isPlayerSource: boolean;
}

// FIX: Added missing SectorState interface.
export interface SectorState {
  entities: Entity[];
  visited: boolean;
  hasNebula: boolean;
  factionOwner: FactionOwner;
  isScanned: boolean;
}

export interface GameState {
  player: {
    ship: Ship;
    position: QuadrantPosition;
    crew: BridgeOfficer[];
    targeting?: {
        entityId: string;
        subsystem: 'weapons' | 'engines' | 'shields' | null;
        consecutiveTurns: number;
    };
  };
  quadrantMap: SectorState[][];
  currentSector: SectorState;
  turn: number;
  logs: LogEntry[];
  gameOver: boolean;
  gameWon: boolean;
  redAlert: boolean;
  combatEffects: CombatEffect[];
  isRetreatingWarp: boolean;
  usedAwayMissionSeeds: string[];
  usedAwayMissionTemplateIds?: string[];
  desperationMoveAnimations: {
      source: Ship;
      target?: Ship;
      type: string;
      outcome?: 'success' | 'failure';
  }[];
}