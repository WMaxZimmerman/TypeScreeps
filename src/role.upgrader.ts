import { constructionManager } from "./construction.manager"

export const roleUpgrader = function(creep: Creep) {
    let constructManager = new constructionManager();

    if (creep.memory.class == undefined) creep.memory.class = 'worker';

    if (creep.memory.isUpgrading && creep.carry[RESOURCE_ENERGY] == 0) {
        creep.memory.isUpgrading = false;
        creep.say('🔄 harvest');
    }
    if (!creep.memory.isUpgrading && creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
        creep.memory.isUpgrading = true;
        creep.say('⚡ upgrade');
    }

    if (creep.memory.isUpgrading) {
        var controller = creep.room.controller;
        constructManager.moveTowardTarget(creep, controller, 'upgrade');
    }
    else {
        // if (creep.memory.role == 'upgrader' && creep.room.name == Game.spawns['Spawn1'].room.name) {
        //     var exitDir = Game.map.findExit('W27N38', 'W27N39');
        //     var exit = creep.pos.findClosestByPath(exitDir, { algorithm: 'astar', ignoreRoads: true, swampCost: 1, plainCost: 1, ignoreCreeps: true });
        //     creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
        //} else {
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
        //}
    }

    constructManager.checkRoadConstruction(creep);
}
