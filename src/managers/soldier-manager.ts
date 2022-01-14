import { MilitaryRole } from "enums/military-roles";

export class SoldierManager {
    private constructor() { }

    public static manage(creep: Creep): void {
        const role = creep.memory.militaryRole;
        if (!role) return;
        
        switch(role) {
            case MilitaryRole.guard: {
                this.guard(creep);
            }
            case MilitaryRole.invader: {
                this.invade(creep);
            }
        }
    }

    private static patrol(creep: Creep): void {
        console.log("creep '" + creep.name + "' is on patrol");
    }

    private static guard(creep: Creep, /*targetName: String, targetType: String */) {
        // let target;
        // if (targetType == 'flag') {
        //     target = Game.flags[targetName];
        // }

        const closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (closestEnemy != null && closestEnemy != undefined) {
            if (creep.rangedAttack(closestEnemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestEnemy, { visualizePathStyle: { stroke: '#ba2807' } });
            }
        }
    }

    private static invade(creep: Creep): void {
        const flag: Flag = Game.flags['EnemySpawn'];
        const targetRoom = flag.pos.roomName;
        console.log(JSON.stringify(targetRoom));
        if (targetRoom == undefined || targetRoom == null) {

        } else {
            console.log('0');
            if (creep.room.name != targetRoom) {
                console.log(creep.room.name);
                creep.moveTo(flag);
            } else {
                //let flagPath = creep.pos.findPathTo(flag, {algorithm: 'astar'});
                //creep.moveTo(flag);
                //return;
                const closestSpawn = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, { algorithm: 'astar' });

                if (closestSpawn != null) {
                    console.log('2');
                    if (creep.dismantle(closestSpawn) == ERR_NOT_IN_RANGE) {
                        //creep.rangedAttack(closestSpawn);
                        //let closestWall = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_WALL});
                        //let attackCode = creep.dismantle(closestWall);
                        //console.log('dismantle code: ' + attackCode);
                        const path = creep.pos.findPathTo(closestSpawn);
                        creep.moveByPath(path);
                    }
                } else {
                    const closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

                    if (closestEnemy != null) {
                        if (creep.pos.inRangeTo(closestEnemy, 1)) {
                            creep.attack(closestEnemy);
                        } else if (creep.pos.inRangeTo(closestEnemy, 3)) {
                            creep.rangedAttack(closestEnemy);
                        }
                        creep.moveTo(closestEnemy);
                    } else {
                        creep.moveTo(Game.spawns['Spawn1']);
                    }
                }

                if (creep.hits < (creep.hitsMax / 2)) {
                    creep.heal(creep);
                }
            }
        }
    }
}
