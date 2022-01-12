import { OldRoomManager } from "room.manager";

export const autospawn = function(spawn: StructureSpawn) {
    if (spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            { align: 'left', opacity: 0.8 });
        return;
    }

    let roomCreeps: Creep[] = spawn.room.find(FIND_MY_CREEPS);
    let harvesters = _.filter(roomCreeps, (creep) => creep.memory.role == 'harvester');
    let builders = _.filter(roomCreeps, (creep) => creep.memory.role == 'builder');
    let upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
    let roleCap = 2;
    let workerLvl = spawn.room.memory.workerLvl;
    let workerCost = (200 * workerLvl);
    // var workerBody = [WORK,CARRY,MOVE];
    // if (workerLvl >= 2) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE];
    // if (workerLvl >= 3) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
    // if (workerLvl >= 4) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
    // if (workerLvl >= 5) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];

    const roomManager = new OldRoomManager();
    if (harvesters.length < roleCap && spawn.room.energyAvailable >= workerCost) {
        roomManager.spawnWorker(spawn, "harvester", workerLvl);
    } else if (upgraders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
        roomManager.spawnWorker(spawn, "upgrader", workerLvl);
    } else if (builders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
        roomManager.spawnWorker(spawn, "builder", workerLvl);
    }
}
