import { constructionManager } from "./construction.manager";

export const roleBuilder = function(creep: Creep) {
    let constructManager = new constructionManager();
    // var flag = Game.flags['Flag1'];
    // targetRoom = flag.pos.roomName;
    // console.log(JSON.stringify(targetRoom));
    // if (targetRoom != undefined && targetRoom != null) {
    //     if (creep.room.name != targetRoom) {
    //         console.log(creep.room.name);
    //         var flagPath = creep.pos.findPathTo(flag, {algorithm: 'astar'});
    //         creep.moveTo(flag);
    //         return;
    //     }
    // }

    if (creep.memory.class == undefined) creep.memory.class = 'worker';
    //creep.moveTo(40, 24);
    //return;

    if (creep.memory.isBuilding && creep.carry[RESOURCE_ENERGY] == 0) {
        creep.memory.isBuilding = false;
        creep.say('🔄 harvest');
    }
    if (!creep.memory.isBuilding && creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
        creep.memory.isBuilding = true;
        creep.say('🚧 build');
    }

    if (creep.memory.isBuilding) {
        let closestNonRoadConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType != STRUCTURE_ROAD);
            }, algorithm: 'astar'
        });

        if (closestNonRoadConstructionSite != undefined && closestNonRoadConstructionSite != null) {
            //console.log('found not road');
            constructManager.moveTowardTarget(creep, closestNonRoadConstructionSite, 'build');
        } else {
            //console.log(JSON.stringify(Memory.prioritySite));
            let prioritySite = constructManager.getPrioritySite(creep.room.name);
            constructManager.moveTowardTarget(creep, prioritySite, 'build');
        }
    } else {
        let source = creep.pos.findClosestByPath(FIND_SOURCES, {
            filter: (s) => {
                return s.energy > 0;
            }, algorithm: 'astar'
        });

        if (source == null) {
            source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return s.energy > 0;
                }, algorithm: 'astar'
            });
        }
        constructManager.moveTowardTarget(creep, source, 'harvest');
    }

    constructManager.checkRoadConstruction(creep);
}
