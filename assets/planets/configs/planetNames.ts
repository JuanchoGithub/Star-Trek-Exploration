import { PlanetClass } from "../../../types";

// Lists of planet names based on their classification.
// M: Terrestrial, Earth-like
// J: Gas Giant
// L: Marginal, barely habitable
// D: Rock, uninhabitable
export const planetNames: Record<PlanetClass, string[]> = {
  M: [
    "Ceti Alpha V", "Vulcan", "Andoria", "Risa", "Bajor", "Cardassia Prime",
    "Betazed", "Trill", "Alpha Centauri", "Tau Ceti", "Genesis",
    "Mintaka III", "Ba'ku", "Organia", "Talos IV", "Earth", "Kronos",
    "Romulus", "Ferenginar", "Cait", "Denobula", "Xylos", "Tellar Prime",
    "Coridan", "Pacificia", "New Sydney", "Terra Nova", "Deneb V",
    "Tarsus IV", "Gideon", "Eden", "Sarpeidon", "Cheron", "Wolf 359",
    "Solaria VII", "Veridia III", "Khitomer", "P'Jem", "Terra Lyra",
    "Haven", "Angel One", "Boreth", "Acamar III",
  ],
  J: [
    "Bespin", "Jupiter", "Saturn", "Gas Giant 7", "Koltar", "Praxus",
    "Ardahan", "Vagra II", "Q'tahL", "Talax", "Matalas", "Boreas",
    "Indri VIII", "Q'ell", "The Great Eye", "Storm's End", "Typhon Primus",
    "Hespar", "Rhomboidas", "Vortex IV", "Amleth", "Odinani", "Zeus I",
    "Hera's Veil", "Targus IX", "Cryssalia",
  ],
  L: [
    "Nimbus III", "Taurus II", "Janus VI", "Excalbia", "Cestus III",
    "Memory Alpha", "Delta Vega", "Regula I", "Gothos", "Mudd",
    "Ceti Alpha VI", "Narendra III", "Veridian IV", "Elba II", "Platonius",
    "Gama Trianguli VI", "Stardrift", "Arrakis", "Nomad's Landing",
    "Galorndon Core", "Pyris VII", "Tyree", "Coalsack",
    "The Boneyard", "Last Stop", "Forlorn Hope",
  ],
  D: [
    "Regula", "Exo III", "Rura Penthe", "Ardranis", "El-Adrel IV", "Remus",
    "Rigel VII", "Neural", "M-113", "Praxis", "Canopus", "The Cinder",
    "Obsidian", "Hephaestus IV", "Tartarus V", "The Anvil", "Barrenheim",
    "Geode", "Solitude", "The Void's Edge", "Persephone V", "Hades IX",
    "Styx", "Lethe", "The Shattered Sphere", "Golgotha",
  ],
};