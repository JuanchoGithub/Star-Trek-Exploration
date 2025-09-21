import React from 'react';
import { StarbaseType } from '../../../types';
import { StarbaseIcon, ScienceStationIcon, TradingOutpostIcon, MilitaryOutpostIcon, DeepSpaceSensorIcon } from '../icons';
import { StarbaseWireframe, ScienceStationWireframe, TradingOutpostWireframe, MilitaryOutpostWireframe, DeepSpaceSensorWireframe } from '../wireframes';

export interface StarbaseTypeConfig {
    key: StarbaseType;
    name: string;
    namePrefix: string[];
    maxHull: number;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
    description: string;
}

export const starbaseTypes: Record<StarbaseType, StarbaseTypeConfig> = {
    command_station: {
        key: 'command_station',
        name: 'Command Station',
        namePrefix: ['Starbase', 'Deep Space Station', 'Fleet Command'],
        maxHull: 500,
        icon: StarbaseIcon,
        wireframe: StarbaseWireframe,
        colorClass: 'text-cyan-300',
        description: 'Large, multi-purpose stations serving as hubs for Starfleet operations. They offer full repair and resupply services and are heavily defended.'
    },
    military_outpost: {
        key: 'military_outpost',
        name: 'Military Outpost',
        namePrefix: ['Outpost', 'Watchtower', 'Fortress'],
        maxHull: 750,
        icon: MilitaryOutpostIcon,
        wireframe: MilitaryOutpostWireframe,
        colorClass: 'text-red-400',
        description: 'Fortified installations designed for defense and fleet staging. While they offer repairs, their primary role is tactical, bristling with weapon emplacements.'
    },
    science_station: {
        key: 'science_station',
        name: 'Science Station',
        namePrefix: ['Science Station', 'Research Outpost', 'Observatory'],
        maxHull: 350,
        icon: ScienceStationIcon,
        wireframe: ScienceStationWireframe,
        colorClass: 'text-blue-300',
        description: 'Facilities dedicated to research and analysis. They are lightly armed but may offer unique scientific data or specialized support.'
    },
    trading_outpost: {
        key: 'trading_outpost',
        name: 'Trading Outpost',
        namePrefix: ['Trading Post', 'Freeport', 'Exchange'],
        maxHull: 400,
        icon: TradingOutpostIcon,
        wireframe: TradingOutpostWireframe,
        colorClass: 'text-yellow-300',
        description: 'Civilian-run hubs of commerce. While not officially Starfleet, they provide a place to trade, gather information, and make basic repairs.'
    },
    deep_space_sensor: {
        key: 'deep_space_sensor',
        name: 'Deep Space Sensor',
        namePrefix: ['Relay Station', 'Sensor Array', 'Listening Post'],
        maxHull: 250,
        icon: DeepSpaceSensorIcon,
        wireframe: DeepSpaceSensorWireframe,
        colorClass: 'text-purple-300',
        description: 'Automated or minimally-crewed stations designed for long-range surveillance and communication. They are fragile and have no repair capabilities.'
    }
};