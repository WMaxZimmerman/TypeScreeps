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
                        structure.structureType == STRUCTURE_TOWER) &&
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

        if (creep.memory.role == "miner") {
            this.miner(creep);
        }

        if (creep.memory.militaryRole && creep.memory.class != "kingsown")
        {
            SoldierManager.manage(creep);
        }
    }

    private static miner(creep: Creep): void {
        //console.log("=== im a miner ===");
        if (creep.memory.targetContainer) {
            //console.log("=== found a container ===");
            const container = Game.getObjectById(creep.memory.targetContainer);
            if (container) {
                //console.log("=== found a real container ===");
                if (container.hits < container.hitsMax) {
                    //console.log("=== it is hurt ===");
                    if (container.ticksToDecay < 200) {
                        //console.log("=== gonna fix it ===");
                        creep.repair(container);
                    }
                }
            }
        }
        
        if (creep.memory.target && (creep.pos.x != creep.memory.target.x || creep.pos.y || creep.memory.target.y || creep.pos.roomName != creep.memory.target.roomName)) {
            //console.log("=== im not on my post ===");
            const pos = new RoomPosition(creep.memory.target.x, creep.memory.target.y, creep.memory.target.roomName);
            creep.moveTo(pos);
        } else {
            //console.log("=== I am on my post ===");
            if (creep.memory.targetSource) {
                //console.log("=== gonna harvet ===");
                const source = Game.getObjectById(creep.memory.targetSource);
                if (source){
                    //console.log("=== with this source i found ===");
                    creep.harvest(source);
                }
            }
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
            this.getEnergy(creep);
        }

        //ConstructionManager.checkRoadConstruction(creep);
    }

    private static getEnergy(creep: Creep): void {
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType == "container" && s.store[RESOURCE_ENERGY] > 0;
            }, algorithm: 'astar'
        });

        if (container) {
            //console.log("=== I see container ===");
            //console.log(JSON.stringify(container));
            this.moveTowardTarget(creep, container, CreepAction.withdraw);
            return;
        }
        
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

    private static harvest(creep: Creep): void {
        if (creep.memory.class == undefined) creep.memory.class = 'worker'; //This line can be remove when new spawn logic is in place.
        if (creep.memory.isHarvesting == undefined) creep.memory.isHarvesting = creep.carry.energy < creep.carryCapacity;

        if (creep.carry[RESOURCE_ENERGY] < creep.carryCapacity && creep.memory.isHarvesting == true) {
            this.getEnergy(creep);
        }
        else {
            if (creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) creep.memory.isHarvesting = false;

            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
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

        //ConstructionManager.checkRoadConstruction(creep);
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
            this.getEnergy(creep);
        }
    }

    private static moveTowardTarget(creep: Creep, target: any, action: CreepAction) {
        let actionCode;
        if (action == CreepAction.upgrade) {
            actionCode = creep.upgradeController(target);
        } else if (action == CreepAction.harvest) {
            actionCode = creep.harvest(target);
        } else if (action == CreepAction.transfer) {
            actionCode = creep.transfer(target, RESOURCE_ENERGY);
        } else if (action == CreepAction.repair) {
            actionCode = creep.repair(target);
        } else if (action == CreepAction.build) {
            actionCode = creep.build(target);
        } else if (action == CreepAction.withdraw) {
            actionCode = creep.withdraw(target, RESOURCE_ENERGY);
        }
        
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
                //console.log(creep.room.name);
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
