export class MemoryManager {
    private constructor(){}

    public static cleanMemory(): void {
        this.cleanMissingCreeps();
        this.cleanMissingSites();
        this.cleanUselessRoads();
        //this.cleanRoads();
    }

    private static cleanRoads(): void {
        for (const index in Game.constructionSites) {
            const cs = Game.constructionSites[index];
            if (cs && cs.structureType == STRUCTURE_ROAD) {
                cs.remove();
            }
        }
    }

    private static cleanMissingCreeps(): void {
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
                //console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    private static cleanMissingSites(): void {
        for (let index in Memory.sites) {
            let site = Memory.sites[index];
            //console.log(site.roomName);
            let siteRoom = Game.rooms[site.roomName];
            if (siteRoom == undefined) {
                Memory.sites.splice(<any>index, 1);
                //console.log('Clearing constructionSite memory in non-found room.');
            } else if (siteRoom.lookForAt(LOOK_CONSTRUCTION_SITES, site.pos.x, site.pos.y).length == 0) {
                Memory.sites.splice(<any>index, 1);
                //console.log('Clearing non-existing constructionSite memory.');
            }
        }
    }

    private static cleanUselessRoads(): void {
        for (let index in Memory.sites) {
            let site = Memory.sites[index];
            if (Game.time - site.timeCreated > 50 && site.priorityCount < 10) {
                let sites: ConstructionSite[] = Game.rooms[site.roomName].lookForAt(LOOK_CONSTRUCTION_SITES, site.pos.x, site.pos.y);

                if (sites.length > 0) {
                    let cs = sites[0];
                    cs.remove();
                    Memory.sites.splice(<any>index, 1);
                    //console.log('Removed unused road site.');
                }
            }
        }
    }
}
