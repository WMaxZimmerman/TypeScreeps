import { KingsownManager } from "./kingsown-manager";

export class ExpansionManager {
    private constructor(){}

    public static manage(): void {
        const claimFlag = Game.flags['Claim'];
        if (claimFlag) {
            Memory.kingdom.claimerNeeded = true;
        }

        
        console.log("================EXPANSION================");
        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (creep.memory.class == "kingsown") {
                console.log("================KINGSOWN================");
                KingsownManager.manage(creep);
                console.log("================KINGSOWN================");
            }
        }
    }
}
