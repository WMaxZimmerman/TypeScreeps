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
        const workerLvl = spawn.room.memory.workerLvl;
        const workerCost = (200 * workerLvl);
        // var workerBody = [WORK,CARRY,MOVE];
        // if (workerLvl >= 2) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 3) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 4) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];
        // if (workerLvl >= 5) workerBody = [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE];

        if (harvesters.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "harvester", workerLvl);
        } else if (upgraders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "upgrader", workerLvl);
        } else if (builders.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            this.spawnWorker(spawn, "builder", workerLvl);
        } else if(repairmen.length < roleCap && spawn.room.energyAvailable >= workerCost) {
            // var newName = 'Repairman' + Game.time;
            // console.log('Spawning new repairman: ' + newName);
            // spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE], newName, {memory: {role: 'repairman'}});
        } else if(fighters.length < roleCap / 2 && spawn.room.energyAvailable >= 800) { //&& harvesters.length > 3 && upgraders.length > 2 && builders.length > 2 && Game.gcl >= 3) {
            const newName = 'Fighter' + Game.time;
            console.log('Spawning new fighter: ' + newName);
            spawn.spawnCreep([MOVE, WORK, CARRY,CLAIM], newName,{memory: {
                class: 'fighter',
                role: 'claimer',
                room: spawn.room.name,
                working: false
            }});
        }
        // else if (spawn.room.energyAvailable >= workerCost && harvesters.length < roleCap) {
        //     var newName = 'Harvester' + Game.time;
        //     console.log('Spawning new harvester: ' + newName);
        //     spawn.spawnCreep(workerBody, newName,
        //         {memory: {role: 'harvester'}});
        // }
    }

    private static spawnWorker(spawn: StructureSpawn, role: string, workerLvl: number): void {
        function getWorkerBody(workerLvl: number): BodyPartConstant[] {
            var body: BodyPartConstant[] = [];

            for (var i = 0; i < workerLvl; i++) {
                if (body.length >= 47) break; //Max amount of body parts is 50
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }

            return body;
        }

        let workerBody = getWorkerBody(workerLvl);
        let workerName = 'Worker_' + workerLvl + '_' + Game.time;
        console.log('Spawning new Worker: ' + workerName + ' (' + role + ')');
        spawn.spawnCreep(workerBody, workerName, { memory: {
            class: 'worker',
            role: role,
            room: spawn.room.name,
            working: false
        } });
    }
}
