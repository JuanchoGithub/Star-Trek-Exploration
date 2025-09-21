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
import { StarfleetLogoIcon } from './StarfleetLogoIcon';
import { ShuttleIcon } from './ShuttleIcon';
import { PhaserIcon } from './PhaserIcon';
import { CloakIcon } from './CloakIcon';

// Klingon
import { KlingonWeaponIcon } from './klingon/KlingonWeaponIcon';
import { KlingonShieldIcon } from './klingon/KlingonShieldIcon';
import { KlingonEngineIcon } from './klingon/KlingonEngineIcon';
import { KlingonTorpedoIcon } from './klingon/KlingonTorpedoIcon';
import { KlingonSecurityIcon } from './klingon/KlingonSecurityIcon';
import { BatlethIcon } from './klingon/BatlethIcon';
import { KlingonLogoIcon } from './klingon/KlingonLogoIcon';

// Romulan
import { RomulanWeaponIcon } from './romulan/RomulanWeaponIcon';
import { RomulanShieldIcon } from './romulan/RomulanShieldIcon';
import { RomulanEngineIcon } from './romulan/RomulanEngineIcon';
import { RomulanTorpedoIcon } from './romulan/RomulanTorpedoIcon';
import { RomulanSecurityIcon } from './romulan/RomulanSecurityIcon';
import { DisruptorIcon } from './romulan/DisruptorIcon';
import { RomulanLogoIcon } from './romulan';

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
    CloakIcon,
    HailIcon: StarfleetLogoIcon,
    BoardingIcon: ShuttleIcon,
    StrikeTeamIcon: PhaserIcon,
};

const klingonIcons = {
    ...federationIcons, // Fallback for icons not yet created
    WeaponIcon: KlingonWeaponIcon,
    ShieldIcon: KlingonShieldIcon,
    EngineIcon: KlingonEngineIcon,
    TorpedoIcon: KlingonTorpedoIcon,
    SecurityIcon: KlingonSecurityIcon,
    StrikeTeamIcon: BatlethIcon,
    HailIcon: KlingonLogoIcon,
};

const romulanIcons = {
    ...federationIcons, // Fallback
    WeaponIcon: RomulanWeaponIcon,
    ShieldIcon: RomulanShieldIcon,
    EngineIcon: RomulanEngineIcon,
    TorpedoIcon: RomulanTorpedoIcon,
    SecurityIcon: RomulanSecurityIcon,
    StrikeTeamIcon: DisruptorIcon,
    HailIcon: RomulanLogoIcon,
};


const iconSets = {
    federation: federationIcons,
    klingon: klingonIcons,
    romulan: romulanIcons,
};

export const getFactionIcons = (themeName: ThemeName) => {
    return iconSets[themeName] || iconSets.federation;
};