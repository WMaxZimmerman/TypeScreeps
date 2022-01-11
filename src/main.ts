import { ErrorMapper } from "utils/ErrorMapper";
import { autospawn } from "./auto.spawner";
import { constructionManager } from "./construction.manager";
import { eventHandler } from "./event.handler";
import { RoomManager } from "./room.manager";

declare global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)
  
      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        sites: any[];
        currentCreepCount: number;
        prioritySite?: ConstructionSite<BuildableStructureConstant>;
    }

    interface RoomMemory {
        isInitialized: boolean;
        workerLvl: number;
        workerLimit: number;
    }

    interface CreepMemory {
        role: string;
        class: string;
        room: string;
        working: boolean;
        isHarvesting?: boolean;
        isUpgrading?: boolean;
        isBuilding?: boolean;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    let eventHndlr = new eventHandler();
    let constuctionMngr = new constructionManager();
    let roomMngr = new RoomManager();
    //Temporary cleanup of roads
    // for (var index in Game.constructionSites) {
    //     var cs = Game.constructionSites[index];
    //     if (cs != undefined && cs.room != undefined && cs.room.name != 'W25N38' || cs.pos.y < 9) {
    //         cs.remove();
    //     }
    // }

    // for (var index in Game.rooms['W27N38'].find(FIND_STRUCTURES)) {
    //     var cs = Game.rooms['W27N38'].find(FIND_STRUCTURES)[index];
    //     if (cs.structureType == 'road') {
    //         cs.destroy();
    //     }
    // }

    eventHndlr.creepCountChanged();

    for (let roomName in Game.rooms) {
        let room: Room = Game.rooms[roomName];
        if (room != undefined) {
            let owner = room.controller?.owner;
            if (owner != undefined && owner != null) {
                if (room != undefined && room.controller?.owner?.username == "SmileyFace") {
                    eventHndlr.rclUpgrade(room);
                }
            }
        }
    }

    constuctionMngr.setPrioritySite();

    for (let structureId in Game.structures) {
        let structure = Game.structures[structureId];

        if (structure instanceof StructureTower) {
            let closestDamagedStructure = structure.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < 100000) && (structure.structureType == 'rampart');
                }
            });

            if (closestDamagedStructure instanceof Structure) {
                structure.repair(closestDamagedStructure);
            }

            let closestHostile = structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile instanceof Creep) {
                structure.attack(closestHostile);
            }
        }
    }

    //Memory Management
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

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

    constuctionMngr.cleanUselessRoads();

    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        let controller = room.controller;

        roomMngr.manageRoom(room);

        if (controller != undefined) {
            if (controller.owner?.username == 'SmileyFace') {
                room.find(FIND_MY_SPAWNS).map((spawn: StructureSpawn) => {
                    autospawn(spawn);
                });
            }
        }
    }
});
