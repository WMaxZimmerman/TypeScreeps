import { CreepAction } from "enums/creep-actions";
import { ConstructionManager } from "./construction-manager";
import { SoldierManager } from "./soldier-manager";

export class CreepManager {
    private constructor() { }

    public static manage(creep: Creep): void {
        if (!this.ensureCorrectRoom(creep)) return;
        
        if (creep.memory.role == 'harvester') {
            var closestStruct = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.energy < structure.energyCapacity);
                }, algorithm: 'astar'
            });
            if (closestStruct == null) {
                this.upgrade(creep);
            } else {
                this.harvest(creep);
            }
        }
        if (creep.memory.role == 'upgrader') {
            this.upgrade(creep);
        }
        if (creep.memory.role == 'builder') {
            
            if (creep.room.find(FIND_MY_CREEPS, { filter: (c) => { return c.memory.role == 'harvester' } }).length == 0 && creep.room.find(FIND_MY_SPAWNS).length > 0) {
                this.harvest(creep);
            } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length == 0) {
                //    roleRepairman.run(creep);
                //} else if (creep.room.find(FIND_STRUCTURES, { filter: (cs) =>  {
                //    return ((cs.structureType == STRUCTURE_WALL || cs.structureType == STRUCTURE_RAMPART) && cs.hits < cs.hitsMax);
                //}}).length == 0) {
                this.upgrade(creep);
            } else {
                this.build(creep);
            }
        }
        if (creep.memory.role == 'repairman') {
            if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                    this.build(creep);
                } else {
                    this.upgrade(creep);
                }
            } else {
                this.harvest(creep);
            }
        }

        if (creep.memory.militaryRole && creep.memory.class != "kingsown")
        {
            SoldierManager.manage(creep);
        }
    }

    private static build(creep: Creep): void {
        if (creep.memory.class == undefined) creep.memory.class = 'worker';
        if (!creep.memory.isBuilding) creep.memory.isBuilding = false;

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
                this.moveTowardTarget(creep, closestNonRoadConstructionSite, CreepAction.build);
            } else {
                //console.log(JSON.stringify(Memory.prioritySite));
                let prioritySite = ConstructionManager.getPrioritySite(creep.room.name);
                this.moveTowardTarget(creep, prioritySite, CreepAction.build);
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
            this.moveTowardTarget(creep, source, CreepAction.harvest);
        }

        ConstructionManager.checkRoadConstruction(creep);
    }

    private static harvest(creep: Creep): void {
        if (creep.memory.class == undefined) creep.memory.class = 'worker'; //This line can be remove when new spawn logic is in place.
        if (creep.memory.isHarvesting == undefined) creep.memory.isHarvesting = creep.carry.energy < creep.carryCapacity;

        if (creep.carry[RESOURCE_ENERGY] < creep.carryCapacity && creep.memory.isHarvesting == true) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return s.energy > 0;
                }, algorithm: 'astar'
            });

            this.moveTowardTarget(creep, source, CreepAction.harvest);
        }
        else {
            if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) creep.memory.isHarvesting = false;

            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                        (structure.energy < structure.energyCapacity);
                }, algorithm: 'astar'
            });

            if (target == null || target == undefined) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                    }, algorithm: 'astar'
                });
            }

            this.moveTowardTarget(creep, target, CreepAction.transfer);

            if (creep.carry.energy == 0) creep.memory.isHarvesting = true;
        }

        ConstructionManager.checkRoadConstruction(creep);
    }

    private static upgrade(creep: Creep): void {
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
            const controller = creep.room.controller;
            this.moveTowardTarget(creep, controller, CreepAction.upgrade);
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
            this.moveTowardTarget(creep, source, CreepAction.harvest);
            //}
        }

        ConstructionManager.checkRoadConstruction(creep);
    }

    private static moveTowardTarget(creep: Creep, target: any, action: CreepAction) {
        //creep.say('move');
        let actionCode;
        // switch (action) {
        //     case CreepAction.upgrade: {
        //         console.log("upgrading");
        //         actionCode = creep.upgradeController(target);
        //     }
        //     case CreepAction.harvest: {
        //         console.log("harvesting");
        //         actionCode = creep.harvest(target);
        //     }
        //     case CreepAction.transfer: {
        //         console.log("transfering");
        //         actionCode = creep.transfer(target, RESOURCE_ENERGY);
        //     }
        //     case CreepAction.repair: {
        //         console.log("repairing");
        //         actionCode = creep.repair(target);
        //     }
        // }

        if (action == CreepAction.upgrade) {
            //console.log("upgrading");
            actionCode = creep.upgradeController(target);
        } else if (action == CreepAction.harvest) {
            //console.log("harvesting");
            actionCode = creep.harvest(target);
        } else if (action == CreepAction.transfer) {
            //console.log("transfering");
            actionCode = creep.transfer(target, RESOURCE_ENERGY);
        } else if (action == CreepAction.repair) {
            //console.log("repairing");
            actionCode = creep.repair(target);
        } else if (action == CreepAction.build) {
            console.log("building");
            actionCode = creep.build(target);
        }

        //creep.say(actionCode);
        console.log("action '" + action + "' has status of '" + actionCode + "'");
        console.log(JSON.stringify(target));
        if (target != null && actionCode == ERR_NOT_IN_RANGE) {
            let moveCode = creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreRoads: true, swampCost: 1, plainCost: 1 });
            if (moveCode == ERR_NO_PATH) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, ignoreRoads: true, swampCost: 1, plainCost: 1 });
            }
        }
    }

    public static ensureCorrectRoom(creep: Creep): boolean {
        const targetRoom = creep.memory.room;
        //console.log(JSON.stringify(targetRoom));
        if (targetRoom != undefined && targetRoom != null) {
            if (creep.room.name != targetRoom || (creep.room.name == targetRoom && this.borderPosition(creep))) {
                console.log(creep.room.name);
                const middleOfTargetRoom = new RoomPosition(24, 24, targetRoom);
                creep.moveTo(middleOfTargetRoom, { reusePath: 100 });
                return false;
            }
        }

        return true;
    }

    private static borderPosition(creep: Creep): boolean {
        return creep.pos.x == 0
            || creep.pos.x == 49
            || creep.pos.y == 0
            || creep.pos.y == 49;
    }
}