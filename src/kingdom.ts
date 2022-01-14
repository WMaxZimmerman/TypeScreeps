import { ConstructionManager } from "managers/construction-manager";
import { EventManager } from "managers/event-manager";
import { ExpansionManager } from "managers/expansion-manager";
import { MemoryManager } from "managers/memory-manager";
import { RoomManager } from "managers/room-manager";
import { KingdomMemory } from "models/kingdom";

export class Kingdom {
    private constructor() { }
    
    public static run(): void {
        if (!Memory.kingdom) {
            Memory.kingdom = new KingdomMemory(false);
        }
        
        console.log(`==== Current game tick is ${Game.time} ====`);
        MemoryManager.cleanMemory();
        
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

        EventManager.creepCountChanged();
        ExpansionManager.manage();

        for (let roomName in Game.rooms) {
            let room: Room = Game.rooms[roomName];
            if (room != undefined) {
                let owner = room.controller?.owner;
                if (owner != undefined && owner != null) {
                    if (room != undefined && room.controller?.owner?.username == "SmileyFace") {
                        EventManager.rclUpgrade(room);
                    }
                }
            }
        }

        ConstructionManager.setPrioritySite();

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
        MemoryManager.cleanMemory();

        //Manage Rooms        
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            RoomManager.manage(room);
        }
    }
}
