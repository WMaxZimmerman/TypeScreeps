import { MilitaryRole } from "enums/military-roles";

export class SpawnManager {
    private constructor() { }

    public static manage(spawn: StructureSpawn): void {
        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 });
            return;
        }

        const roomCreeps: Creep[] = spawn.room.find(FIND_MY_CREEPS);
        const harvesters = _.filter(roomCreeps, (creep) => creep.memory.role == 'harvester');
        const builders = _.filter(roomCreeps, (creep) => creep.memory.role == 'builder');
        const upgraders = _.filter(roomCreeps, (creep) => creep.memory.role == 'upgrader');
        const repairmen = _.filter(roomCreeps, (creep) => creep.memory.role == 'repairman');
        const fighters = _.filter(roomCreeps, (creep) => creep.memory.militaryRole);
        const roleCap = 2;
        const workerLvlCap = 3;
        const workerLvl = spawn.room.memory.workerLvl > workerLvlCap ? workerLvlCap : spawn.room.memory.workerLvl;
        const workerCost = (200 * workerLvl);
        // var workerBody = [WORK,CARRY,MOVE];
        // if (workerLvl >= 2) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 3) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 4) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 5) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];


        
        if (spawn.room.memory.workerLvl >= 4) {
            const sources = spawn.room.memory.sources;
            if (sources) {
                //console.log("=== found sources ===");
                sources.forEach(s => {
                    if (s.container) {
                        //console.log("=== found a container ===");
                        const container = Game.getObjectById(s.container);
                        if (container) {
                            //console.log("=== found a real container ===");
                            if (s.minerRequest && (!s.miner || !Game.creeps[s.miner]) && spawn.room.energyAvailable >= 600) {
                                //console.log("=== spawning a miner ===");
                                const newName = 'Worker_Miner_' + Game.time;
                                spawn.spawnCreep([MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK], newName,{memory: {
                                    class: 'worker',
                                    room: spawn.room.name,
                                    working: false,
                                    target: container.pos,
                                    targetSource: s.id,
                                    targetContainer: s.container,
                                    role: 'miner'
                                }});
                                s.miner = newName;
                            }
                        }
                    }
                });
            }            
        }
        
        if (harvesters.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "harvester", workerLvl);
        } else if (upgraders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "upgrader", workerLvl);
        } else if (builders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "builder", workerLvl);
        } else if (fighters.length < roleCap /2 &&  spawn.room.energyAvailable >= 300) {
            const newName = 'Fighter_' + Game.time;
            //console.log('Spawning new fighter: ' + newName);
            spawn.spawnCreep([MOVE, MOVE, MOVE, RANGED_ATTACK], newName,{memory: {
                class: 'fighter',
                room: spawn.room.name,
                working: false,
                militaryRole: MilitaryRole.invader,
                role: 'invader'
            }});
        } else if(spawn.room.energyAvailable >= 800 && Memory.kingdom.claimerNeeded) { //&& harvesters.length > 3 && upgraders.length > 2 && builders.length > 2 && Game.gcl >= 3) {
            const newName = 'Kingsown_Claimer_' + Game.time;
            //console.log('Spawning new claimer: ' + newName);
            Memory.kingdom.claimerNeeded = false;
            const claimFlag = Game.flags['Claim'];
            spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, CLAIM], newName, {
                memory: {
                    class: 'kingsown',
                    role: 'claimer',
                    room: claimFlag.room?.name ?? spawn.room.name,
                    working: false,
                    target: claimFlag.pos
                }
            });
            claimFlag.remove();
        } else if (Memory.kingdom.roomInNeedOfAide && spawn.room.energyAvailable >= workerCost) {
            const aideLvl = workerLvl > 1 ? (workerLvl - 1) : workerLvl;
            this.spawnWorker(spawn, "builder", aideLvl, Memory.kingdom.roomInNeedOfAide);
            Memory.kingdom.roomInNeedOfAide = undefined;
        } else if (Memory.kingdom.invadersNeeded && spawn.room.energyAvailable >= 300) {
            const newName = 'Fighter_' + Game.time;
            //console.log('Spawning new fighter: ' + newName);
            spawn.spawnCreep([MOVE, MOVE, MOVE, RANGED_ATTACK], newName,{memory: {
                class: 'kingsown',
                room: Memory.kingdom.invadersNeeded,
                working: false,
                militaryRole: MilitaryRole.invader,
                role: 'invader'
            }});
        }
        // else if (spawn.room.energyAvailable >= workerCost && harvesters.length < roleCap) {
        //     var newName = 'Harvester' + Game.time;
        //     console.log('Spawning new harvester: ' + newName);
        //     spawn.spawnCreep(workerBody, newName,
        //         {memory: {role: 'harvester'}});
        // }
    }

    private static spawnWorker(spawn: StructureSpawn, role: string, workerLvl: number, targetRoom?: string): void {
        const workerBody = this.getWorkerBody(workerLvl, spawn.room);
        const workerName = 'Worker_' + workerLvl + '_' + Game.time;
        const room = targetRoom ?? spawn.room.name;
        
        //console.log('Spawning new Worker: ' + workerName + ' (' + role + ')');
        
        spawn.spawnCreep(workerBody, workerName, { memory: {
            class: 'worker',
            role: role,
            room: room,
            working: false
        } });
    }

    private static getWorkerBody(workerLvl: number, room: Room): BodyPartConstant[] {
        const capacity = room.energyCapacityAvailable;
        if (capacity < 200) return [];
        // let workerBody = [WORK, CARRY, CARRY, CARRY, MOVE];
        // if (workerLvl >= 2) workerBody = [WORK, CARRY, CARRY, CARRY, MOVE, WORK, CARRY, CARRY, MOVE];
        // if (workerLvl >= 3) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 4) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 5) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];

        const body: BodyPartConstant[] = [];

        for (var i = 0; i < workerLvl; i++) {
            if (body.length >= 47) break; //Max amount of body parts is 50
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }

        return body;
    }
}
