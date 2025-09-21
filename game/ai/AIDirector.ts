
import { FactionAI } from './FactionAI';

class Director {
    private aiMap: Record<string, FactionAI> = {};
    private defaultAI: FactionAI | null = null; 

    public register(factionName: string, aiInstance: FactionAI): void {
        this.aiMap[factionName] = aiInstance;
    }
    
    public setDefault(aiInstance: FactionAI): void {
        if (!this.defaultAI) {
            this.defaultAI = aiInstance;
        }
    }

    public getAIForFaction(faction: string): FactionAI {
        const ai = this.aiMap[faction];
        if (ai) return ai;
        
        if (!this.defaultAI) {
            throw new Error("No AI has been registered and no default AI is set.");
        }
        return this.defaultAI;
    }
}
export const AIDirector = new Director();
