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
    "Mintaka III", "Ba'ku", "Organia", "Talos IV",
  ],
  J: [
    "Bespin", "Jupiter", "Saturn", "Gas Giant 7", "Koltar", "Praxus",
    "Ardahan", "Vagra II", "Q'tahL", "Talax",
  ],
  L: [
    "Nimbus III", "Taurus II", "Janus VI", "Excalbia", "Cestus III",
    "Memory Alpha", "Delta Vega", "Regula I", "Gothos", "Mudd",
  ],
  D: [
    "Regula", "Exo III", "Rura Penthe", "Ardranis", "El-Adrel IV", "Remus",
    "Rigel VII", "Tyree", "Neural", "M-113",
  ],
};
