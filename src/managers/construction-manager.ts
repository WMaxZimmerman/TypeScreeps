export class ConstructionManager {
    private constructor(){}

    public static checkRoadConstruction(creep: Creep): void {
        if (Memory.sites == undefined) Memory.sites = [];
        let objs = creep.room.lookAt(creep);
        let constructionSites = objs.filter(t => t.type == 'constructionSite');
        if (constructionSites.length > 0) {
            let constructionSite = constructionSites[0].constructionSite as any;
            if (constructionSite.structureType == 'road') {

                for (let index in Memory.sites) {
                    let site = Memory.sites[index];
                    //console.log(JSON.stringify(site));
                    //console.log('sRoom: ' + site.roomName + ', cRoom: ' + creep.room.name);
                    //console.log(site.priorityCount);
                    if (JSON.stringify(site.pos) == JSON.stringify(creep.pos)) {
                        site.priorityCount = site.priorityCount + 1;
                    }
                }

                //console.log(constructionSite.structureType);
            }
        } else {
            if (objs.filter(t => t.type == 'structure' && t.structure?.structureType == 'road').length > 0) return; //Is a Road
            //console.log(Memory.sites.length);
            if (Memory.sites.length < 80) {
                if (creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD) == 0) {
                    let newSite = {
                        roomName: creep.room.name,
                        pos: creep.pos,
                        priorityCount: 0,
                        timeCreated: Game.time
                    };
                    Memory.sites.push(newSite);
                }
            }
        }
    }

    public static setPrioritySite(): void {
        if (Memory.sites == undefined) return;
        let prioritizedSites = Memory.sites.sort(function(a, b) {
            if (a.priorityCount > b.priorityCount) {
                return -1;
            } else {
                return 1;
            }
        });

        if (prioritizedSites.length == 0) return;

        let topSite = prioritizedSites[0].pos;
        let roomName = prioritizedSites[0].roomName;
        //console.log('top: ' + JSON.stringify(topSite));
        let topTargets = Game.rooms[roomName].lookForAt(LOOK_CONSTRUCTION_SITES, topSite.x, topSite.y);
        //console.log('sites: ' + topTargets.length);
        //console.log('topSite: ' + JSON.stringify(topTargets[0]));

        if (topTargets.length > 0) {
            Memory.prioritySite = topTargets[0];
        } else {
            Memory.prioritySite = undefined;
        }
    }

    public static getPrioritySite(name: String): ConstructionSite<BuildableStructureConstant> | undefined {
        let prioritizedSites = Memory.sites.sort(function(a, b) {
            if (a.priorityCount > b.priorityCount) {
                return -1;
            } else {
                return 1;
            }
        }).filter(s => s.roomName == name); // && (Game.time - s.timeCreate) >= 50);

        if (prioritizedSites.length == 0) return undefined;

        let topSite = prioritizedSites[0].pos;
        let roomName = prioritizedSites[0].roomName;
        //console.log('top: ' + JSON.stringify(topSite));
        let topTargets = Game.rooms[roomName].lookForAt(LOOK_CONSTRUCTION_SITES, topSite.x, topSite.y);
        //console.log('sites: ' + topTargets.length);
        //console.log('topSite: ' + JSON.stringify(topTargets[0]));

        if (topTargets.length > 0) {
            return topTargets[0];
        } else {
            return undefined;
        }
    }

    public static cleanUselessRoads(): void {
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
