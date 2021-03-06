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
        } else if (creep.memory.role == 'upgrader') {
            this.upgrade(creep);
        } else if (creep.memory.role == 'builder') {
            
            if (creep.room.find(FIND_MY_CREEPS, { filter: (c) => { return c.memory.role == 'harvester' } }).length == 0 && creep.room.find(FIND_MY_SPAWNS).length > 0) {
                this.harvest(creep);
            } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length == 0) {
                this.upgrade(creep);
            } else {
                this.build(creep);
            }
        } else if (creep.memory.role == "miner") {
            this.miner(creep);
        } else if (creep.memory.militaryRole && creep.memory.class != "kingsown") {
            SoldierManager.manage(creep);
        }
    }

    private static miner(creep: Creep): void {
        if (creep.memory.targetContainer) {
            console.log("1");
            const container = Game.getObjectById(creep.memory.targetContainer);
            if (container) {
                console.log("2")
                if (container.hits < container.hitsMax) {
                    console.log("3")
                    if (container.ticksToDecay < 200) {
                        console.log("4")
                        creep.repair(container);
                    }
                }
            }
        }

        const tPos = creep.memory.target;
        if (tPos && this.isOnPos(creep, tPos) == false) {
            console.log("5")
            const pos = new RoomPosition(tPos.x, tPos.y, tPos.roomName);
            creep.moveTo(pos);
        } else {
            console.log("6")
            if (creep.memory.targetSource) {
                console.log("7")
                const source = Game.getObjectById(creep.memory.targetSource);
                if (source){
                    console.log("8")
                    creep.harvest(source);
                }
            }
        }
    }

    public static creepExists(name: string): boolean {
        const creep =  Game.creeps[name];
        return creep != null && creep != undefined;
    }

    private static isOnPos(creep: Creep, pos: RoomPosition) {        
        return creep.pos.x == pos.x
            && creep.pos.y == pos.y
            && creep.pos.roomName == pos.roomName;
    }

    private static build(creep: Creep): void {
        if (creep.memory.class == undefined) creep.memory.class = 'worker';
        if (!creep.memory.isBuilding) creep.memory.isBuilding = false;

        if (creep.memory.isBuilding && creep.carry[RESOURCE_ENERGY] == 0) {
            creep.memory.isBuilding = false;
            creep.say('???? harvest');
        }
        if (!creep.memory.isBuilding && creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.isBuilding = true;
            creep.say('???? build');
        }

        if (creep.memory.isBuilding) {
            let closestNonRoadConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                filter: (structure) => {
                    return (structure.structureType != STRUCTURE_ROAD);
                }, algorithm: 'astar'
            });

            if (closestNonRoadConstructionSite != undefined && closestNonRoadConstructionSite != null) {
                this.moveTowardTarget(creep, closestNonRoadConstructionSite, CreepAction.build);
            } else {
                let prioritySite = ConstructionManager.getPrioritySite(creep.room.name);
                this.moveTowardTarget(creep, prioritySite, CreepAction.build);
            }
        } else {
            this.getEnergy(creep);
        }
    }

    private static getEnergy(creep: Creep): void {
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType == "container" && s.store[RESOURCE_ENERGY] > 0;
            }, algorithm: 'astar'
        });

        if (container) {
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

        ConstructionManager.checkRoadConstruction(creep);
    }

    private static upgrade(creep: Creep): void {
        if (creep.memory.class == undefined) creep.memory.class = 'worker';

        if (creep.memory.isUpgrading && creep.carry[RESOURCE_ENERGY] == 0) {
            creep.memory.isUpgrading = false;
            creep.say('???? harvest');
        }
        if (!creep.memory.isUpgrading && creep.carry[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.isUpgrading = true;
            creep.say('??? upgrade');
        }

        if (creep.memory.isUpgrading) {
            const controller = creep.room.controller;
            this.moveTowardTarget(creep, controller, CreepAction.upgrade);
        }
        else {
            this.getEnergy(creep);
        }

        ConstructionManager.checkRoadConstruction(creep);
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
            let moveCode = creep.moveTo(target, { ignoreRoads: false, swampCost: 2, plainCost: 1, reusePath: 100 });
            if (moveCode == ERR_NO_PATH) {
                creep.moveTo(target, { ignoreCreeps: true, ignoreRoads: false, swampCost: 2, plainCost: 1, reusePath: 100 });
            }
        }
    }

    public static ensureCorrectRoom(creep: Creep): boolean {
        const targetRoom = creep.memory.room;
        if (targetRoom != undefined && targetRoom != null) {
            if (creep.room.name != targetRoom || (creep.room.name == targetRoom && this.borderPosition(creep))) {
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
