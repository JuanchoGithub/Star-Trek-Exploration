import { ThemeName } from '../../../themes';

// Federation (default)
import { WeaponIcon } from './WeaponIcon';
import { ShieldIcon } from './ShieldIcon';
import { EngineIcon } from './EngineIcon';
import { TorpedoIcon } from './TorpedoIcon';
import { SecurityIcon } from './SecurityIcon';
import { ScienceIcon } from './ScienceIcon';
import { EngineeringIcon } from './EngineeringIcon';
import { TransporterIcon } from './TransporterIcon';
import { DilithiumIcon } from './DilithiumIcon';
import { ScanIcon } from './ScanIcon';
import { RetreatIcon } from './RetreatIcon';
import { HailIcon } from './HailIcon';

// Klingon
import { KlingonWeaponIcon } from './klingon/KlingonWeaponIcon';
import { KlingonShieldIcon } from './klingon/KlingonShieldIcon';
import { KlingonEngineIcon } from './klingon/KlingonEngineIcon';
import { KlingonTorpedoIcon } from './klingon/KlingonTorpedoIcon';
import { KlingonSecurityIcon } from './klingon/KlingonSecurityIcon';

// Romulan
import { RomulanWeaponIcon } from './romulan/RomulanWeaponIcon';
import { RomulanShieldIcon } from './romulan/RomulanShieldIcon';
import { RomulanEngineIcon } from './romulan/RomulanEngineIcon';
import { RomulanTorpedoIcon } from './romulan/RomulanTorpedoIcon';
import { RomulanSecurityIcon } from './romulan/RomulanSecurityIcon';

const federationIcons = {
    WeaponIcon,
    ShieldIcon,
    EngineIcon,
    TorpedoIcon,
    SecurityIcon,
    ScienceIcon,
    EngineeringIcon,
    TransporterIcon,
    DilithiumIcon,
    ScanIcon,
    RetreatIcon,
    HailIcon,
};

const klingonIcons = {
    ...federationIcons, // Fallback for icons not yet created
    WeaponIcon: KlingonWeaponIcon,
    ShieldIcon: KlingonShieldIcon,
    EngineIcon: KlingonEngineIcon,
    TorpedoIcon: KlingonTorpedoIcon,
    SecurityIcon: KlingonSecurityIcon,
};

const romulanIcons = {
    ...federationIcons, // Fallback
    WeaponIcon: RomulanWeaponIcon,
    ShieldIcon: RomulanShieldIcon,
    EngineIcon: RomulanEngineIcon,
    TorpedoIcon: RomulanTorpedoIcon,
    SecurityIcon: RomulanSecurityIcon,
};


const iconSets = {
    federation: federationIcons,
    klingon: klingonIcons,
    romulan: romulanIcons,
};

export const getFactionIcons = (themeName: ThemeName) => {
    return iconSets[themeName] || iconSets.federation;
};
