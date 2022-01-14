import { UserConstants } from "constants/user-constants";
import { SourceMemory } from "models/source-memory";
import { CreepManager } from "./creep-manager";
import { SpawnManager } from "./spawn-manager";

export class RoomManager {
    private constructor(){}

    public static manage(room: Room): void {
        //Setup the memory object for the room if it isn't set.
        if (!room.memory.isInitialized)
        {
            room.memory.workerLvl = 1;
            room.memory.workerLimit = room.find(FIND_SOURCES).length * 3;
            room.memory.isInitialized = true;
        }

        const prevWorkerLvl = room.memory.workerLvl;
        this.updateRoomWorkerLvl(room);

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (creep.memory.room == room.name && creep.memory.class != "kingsown") {
                try {
                    CreepManager.manage(creep);
                } catch(e: any) {
                    console.log("creep ${creep.name} threw error ${e.message} at\n ${e.stack}");
                }
            }
        }

        const controller = room.controller;
        if (controller != undefined && controller.owner?.username == UserConstants.userName) {
            const spawns = room.find(FIND_MY_SPAWNS)

            if (spawns.length == 0) {
                let creepCount = 0;
                for (const name in Game.creeps) {
                    const creep = Game.creeps[name];
                    if (creep.memory.room == room.name) creepCount++;
                }
                const spawnSite = room.find(FIND_CONSTRUCTION_SITES).filter(cs => cs.structureType == STRUCTURE_SPAWN);
                if (spawnSite.length > 0 && creepCount < 6) {
                    Memory.kingdom.roomInNeedOfAide = room.name;
                }
            } else {
                spawns.map((spawn: StructureSpawn) => {
                    SpawnManager.manage(spawn);
                });
            }

            //console.log("=== lvl ${room.memory.workerLvl} ===")
            //if (prevWorkerLvl < room.memory.workerLvl) {
            if (room.memory.workerLvl == 4) {
                //console.log("=== lvl 4 ===")
                if (!room.memory.sources) {
                    const sourceIds = room.find(FIND_SOURCES).map(s => new SourceMemory(s.id));
                    room.memory.sources = sourceIds;
                }

                room.memory.sources.forEach(s => {
                    this.ensureSoruceSetup(s);
                });
            }
            //} 
        }
    }

    private static ensureSoruceSetup(source: SourceMemory): void {
        //console.log("=== ensuring source setup ===")
        if (!source.container && !source.containerRequested) {
            //console.log("=== source missing container and containerRequested ===")
            const realSource = Game.getObjectById(source.id);
            if (realSource) {
                const room = realSource.room;
                const tiles = room.lookAtArea(realSource.pos.y -1,
                                              realSource.pos.x -1,
                                              realSource.pos.y + 1,
                                              realSource.pos.x + 1,
                                              true);
                if(tiles) {
                    const validTiles = tiles.filter(tile => this.isTileEmpty(tile));
                    if (validTiles.length > 0) {
                        const tile = validTiles[0];
                        room.createConstructionSite(tile.x, tile.y, STRUCTURE_CONTAINER)
                        source.containerRequested = new RoomPosition(tile.x, tile.y, room.name);
                    }
                }
            }
        } else if (!source.container && source.containerRequested) {
            //console.log("=== attempting to find container ===");
            const realSource = Game.getObjectById(source.id);
            if (realSource) {
                //console.log("=== found real source ===");
                const roomPos = new RoomPosition(source.containerRequested.x,
                                                 source.containerRequested.y,
                                                 source.containerRequested.roomName);
                const containers = roomPos.lookFor(LOOK_STRUCTURES);
                //console.log(JSON.stringify(containers));

                if (containers.length > 0) {
                    //console.log("=== found container ===");
                    const container = containers[0] as StructureContainer;
                    if (container) {
                        source.container = container.id;
                        source.minerRequest = true;
                    }
                }
            }
        }
    }

    private static isTileEmpty(tile: LookAtResultWithPos<LookConstant>) {
        return tile.type == LOOK_TERRAIN && (tile.terrain == "plain" || tile.terrain == "swamp");
    }

    private static updateRoomWorkerLvl(room: Room): void {
        const workers = room.find(FIND_MY_CREEPS, {
            filter: (c) => { return c.memory.class == 'worker' }
        });
        
        if (workers.length == 0) room.memory.workerLvl = 1;
        else {
            const energyLvl = Math.trunc(room.energyAvailable / 200);
            if (energyLvl > room.memory.workerLvl) room.memory.workerLvl = energyLvl;
            if (room.memory.workerLvl > 5) room.memory.workerLvl = 5;
        }
    }
    
}

