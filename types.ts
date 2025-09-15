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
}

interface BaseEntity {
  id: string;
  name: string;
  type: 'ship' | 'planet' | 'starbase' | 'asteroid_field';
  faction: string;
  position: Position;
  scanned: boolean;
}

export interface Ship extends BaseEntity {
  type: 'ship';
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  subsystems: ShipSubsystems;
  energy: { current: number; max: number };
  energyAllocation: { weapons: number; shields: number; engines: number };
  torpedoes: { current: number; max: number };
  evasive: boolean;
  retreatingTurn: number | null;
  crewMorale: { current: number; max: number };
}

export interface Planet extends BaseEntity {
  type: 'planet';
}

export interface Starbase extends BaseEntity {
  type: 'starbase';
  hull: number;
  maxHull: number;
}

export interface AsteroidField extends BaseEntity {
    type: 'asteroid_field';
}

export type Entity = Ship | Planet | Starbase | AsteroidField;

export interface SectorState {
  entities: Entity[];
  visited: boolean;
  hasNebula: boolean;
}

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

export interface AwayMissionOption {
  role: AwayMissionRole;
  text: string;
  successChance: number;
  outcomes: {
    success: string;
    failure: string;
  };
}

export interface AwayMissionTemplate {
  id: string;
  title: string;
  planetType: string;
  description: string;
  options: AwayMissionOption[];
}

export interface ActiveHail {
    targetId: string;
    loading: boolean;
    message: string;
}

export interface ActiveCounselSession {
    mission: AwayMissionTemplate;
    advice: OfficerAdvice[];
}

export interface PlayerTurnActions {
    combat?: {
        type: 'phasers' | 'torpedoes';
        targetId: string;
    };
    evasive?: boolean;
}


export interface GameState {
  player: {
    ship: Ship;
    position: QuadrantPosition;
    crew: BridgeOfficer[];
  };
  quadrantMap: SectorState[][];
  currentSector: SectorState;
  turn: number;
  logs: string[];
  gameOver: boolean;
  gameWon: boolean;
}