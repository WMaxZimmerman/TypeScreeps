import { UserConstants } from "constants/user-constants";
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

        this.updateRoomWorkerLvl(room);

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            if (creep.memory.room == room.name && creep.memory.class != "kingsown") {
                CreepManager.manage(creep);
            }
        }

        const controller = room.controller;
        if (controller != undefined) {
            if (controller.owner?.username == UserConstants.userName) {
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
            }
        }
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

