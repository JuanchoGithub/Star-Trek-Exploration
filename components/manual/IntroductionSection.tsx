import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const IntroductionSection: React.FC = () => (
    <div>
        <SectionHeader>Starfleet Field Manual</SectionHeader>
        <p className="text-lg text-text-secondary italic">Issued to Captain, U.S.S. Endeavour, Stardate 47458.2</p>
        
        <SubHeader>Historical Primer: The Rise of the Federation</SubHeader>
        <p className="mb-4 text-text-secondary indent-8">
            The story of the United Federation of Planets is one of optimism born from ashes. In the mid-21st century, Earth was devastated by World War III, a conflict that saw the planet's great powers annihilate one another. From this chaos, a unified global government emerged, focused on rebuilding and renouncing the petty nationalisms of the past. The turning point in human history came on April 5, 2063, when Zefram Cochrane's successful warp flight from Bozeman, Montana, attracted the attention of a passing Vulcan survey ship. This "First Contact" ended humanity's isolation and ushered in an era of unprecedented technological and cultural growth.
        </p>
        <p className="mb-4 text-text-secondary indent-8">
            Over the next century, humanity, with Vulcan guidance, reached for the stars, forming alliances with species like the Andorians and Tellarites. These relationships, though often strained by cultural differences—the Vulcan's logic clashing with Andorian passion and Tellarite obstinance—formed the nucleus of a revolutionary idea: a multispecies, democratic union dedicated to peace, diplomacy, and exploration. In 2161, this vision was formalized with the signing of the Federation Charter on Earth.
        </p>

        <SubHeader>A History of Conflict</SubHeader>
        <p className="mb-4 text-text-secondary indent-8">
            The Federation's history has not been without its trials. The Earth-Romulan War of the 2150s was a brutal, anonymous conflict fought with primitive nuclear weapons and early warp ships. Fought before the age of ship-to-ship visual communication, no human ever saw a Romulan, and vice versa. It was a war against a ghost, concluding with the establishment of the Neutral Zone via subspace radio—a peace treaty between unseen enemies that would define galactic politics for a century.
        </p>
        <p className="mb-4 text-text-secondary indent-8">
            A century later, tensions with the Klingon Empire led to decades of cold war, punctuated by bloody battles and fragile peace treaties brokered at Organia and Khitomer. The Klingons, a warrior race driven by a code of honor, saw the Federation's expansion as a threat to their way of life. It was only after the Praxis disaster, which threatened their homeworld's very survival, that true peace became possible, leading to a hard-won, and often tested, alliance.
        </p>
        <p className="mb-4 text-text-secondary indent-8">
            More recently, the entire Alpha Quadrant was reshaped by the Dominion War (2373-2375). This devastating conflict against the Gamma Quadrant's Dominion—a ruthless empire led by the shapeshifting Founders—allied with the Cardassian Union and the Breen, cost billions of lives and saw Starfleet suffer its most grievous losses. The fleet has been rebuilt, but the memory of the Borg attack at Wolf 359 and the fall of Betazed serves as a constant reminder of the price of freedom. The Federation emerged victorious, but only through a desperate, quadrant-spanning alliance with our old enemies, the Klingons and the Romulans. The scars of that war run deep.
        </p>

        <SubHeader>Major Powers in the Expanse</SubHeader>
        <p className="mb-4 text-text-secondary">
            Your mission takes you to a region where the Federation's ideals will be tested against the ambitions of old rivals and new threats. The post-war landscape is a fragile one.
        </p>
        <ul className="list-none space-y-3">
            <li>
                <strong className="text-red-400">The Klingon Empire:</strong> Currently led by Chancellor Martok, a commoner who rose through the ranks to become a hero of the Dominion War, the Empire is enjoying a resurgence of traditional values. The decadence of the old houses is being swept away in favor of true honor. They are our allies, but it is an alliance born of shared sacrifice, not shared values. Klingon captains are driven by a desire for glorious battle and will test any perceived weakness. They respect strength above all else.
            </li>
            <li>
                <strong className="text-green-400">The Romulan Star Empire:</strong> Following their participation in the Dominion War and a recent, destabilizing internal coup, the Romulans have retreated into their customary isolationism. Their internal politics are a mystery, but the Tal Shiar, their intelligence agency, is undoubtedly active, more paranoid than ever. Romulan vessels operate with stealth and cunning, viewing outsiders with deep suspicion and striking from the shadows. They see conspiracy in every corner and opportunity in every crisis.
            </li>
            <li>
                <strong className="text-orange-400">The Orion Syndicate & Other Raiders:</strong> The political instability following the war has created a power vacuum that criminal organizations like the Orion Syndicate have been eager to fill. These pirates are motivated by profit and operate without a code of honor, preying on the weak and undefended. Their ships are often heavily modified civilian freighters or stolen military craft, making them unpredictable and dangerous.
            </li>
        </ul>

        <SubHeader>Letter from the Admiralty</SubHeader>
        <p className="mb-4">Captain,</p>
        <p className="mb-4 text-text-secondary indent-8">Welcome to the Typhon Expanse. Your mission is threefold: to explore this uncharted and volatile region of space, to extend the hand of diplomacy to any new life you may encounter, and to defend the Federation from those who would see it fall. The Expanse is home to Klingon patrols, Romulan spies, and lawless pirates. It is a tinderbox waiting for a spark.</p>
        <p className="mb-4 text-text-secondary indent-8">The U.S.S. Endeavour is one of the finest ships in the fleet, but she is only as good as her crew. Your command decisions will determine the success or failure of this five-year mission. This manual contains all the tactical and operational data you will need to command your vessel effectively. Study it. The lives of your crew depend on it.</p>
        <p className="font-bold">Admiral J. P. Hanson</p>
        <p className="text-sm text-text-disabled">Starfleet Command</p>
    </div>
);
