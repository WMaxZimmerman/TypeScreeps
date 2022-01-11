import { constructionManager } from "./construction.manager";

export const roleHarvester = function(creep: Creep) {
    let constructManager = new constructionManager();
    if (creep.memory.class == undefined) creep.memory.class = 'worker'; //This line can be remove when new spawn logic is in place.
    if (creep.memory.isHarvesting == undefined) creep.memory.isHarvesting = creep.carry.energy < creep.carryCapacity;

    if (creep.carry[RESOURCE_ENERGY] < creep.carryCapacity && creep.memory.isHarvesting == true) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES, {
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
    else {
        if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) creep.memory.isHarvesting = false;

        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure: any) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_CONTAINER) &&
                    (structure.energy < structure.energyCapacity);
            }, algorithm: 'astar'
        });

        if (target == null) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                }, algorithm: 'astar'
            });
        }

        constructManager.moveTowardTarget(creep, target, 'transfer');

        if (creep.carry.energy == 0) creep.memory.isHarvesting = true;
    }

    constructManager.checkRoadConstruction(creep);
}
