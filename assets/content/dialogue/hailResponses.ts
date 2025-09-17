export const hailResponses: Record<string, Record<string, string>> = {
  Independent: {
    greeting: "This is the trader vessel 'Stardust'. State your intentions.",
    threatened: "We're just simple traders, we don't want any trouble!",
    destroyed: "You'll pay for this, Federation!",
  },
  Klingon: {
    greeting: "You are foolish to approach a Klingon vessel! Prepare to die with honor!",
    threatened: "A coward's tactic! Face us in glorious combat!",
    destroyed: "Today is a good day to die!",
  },
  Romulan: {
    greeting: "You have entered Romulan space. Identify yourself or be destroyed.",
    threatened: "Your aggression is noted, Federation. The Star Empire will not forget this.",
    destroyed: "For the glory of the Empire!",
  },
  Pirate: {
    greeting: "Heh, a Federation prize. Drop your shields and prepare to be boarded. We'll make this quick.",
    threatened: "So, you want a fight? Fine by us! More scrap to sell!",
    destroyed: "Argh, you haven't seen the last of us!",
  }
};
