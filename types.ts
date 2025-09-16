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
  type: 'ship' | 'planet' | 'starbase' | 'asteroid_field' | 'event_beacon' | 'torpedo_projectile';
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
  dilithium: { current: number; max: number };
  evasive: boolean;
  retreatingTurn: number | null;
  crewMorale: { current: number; max: number };
  securityTeams: { current: number; max: number };
  repairTarget: 'hull' | 'weapons' | 'engines' | 'shields' | 'transporter' | null;
}

export type PlanetClass = 'M' | 'J' | 'L' | 'D'; // M: Earth-like, J: Gas Giant, L: Barren/Marginal, D: Rock/Asteroid

export interface Planet extends BaseEntity {
  type: 'planet';
  planetClass: PlanetClass;
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

export interface TorpedoProjectile extends BaseEntity {
    type: 'torpedo_projectile';
    targetId: string;
    sourceId: string;
    stepsTraveled: number;
    speed: number;
    path: Position[];
}

export type Entity = Ship | Planet | Starbase | AsteroidField | EventBeacon | TorpedoProjectile;

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
        type: 'phasers'; // Torpedoes are no longer a turn action
        targetId: string;
        subsystem?: 'weapons' | 'engines' | 'shields';
    };
}

export interface EventTemplateOption {
    text: string;
    outcome: {
        type: 'reward' | 'damage' | 'combat' | 'nothing' | 'special' | 'mission';
        log: string;
        amount?: number;
        resource?: 'hull' | 'shields' | 'energy' | 'dilithium' | 'torpedoes' | 'morale';
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
  redAlert: boolean;
  combatEffects: CombatEffect[];
}
