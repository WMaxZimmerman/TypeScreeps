export class roleFighter {
    patrol(creep: Creep) {
        creep.moveTo(40, 12);
    }

    guard(creep: Creep, /*targetName: String, targetType: String */) {
        // let target;
        // if (targetType == 'flag') {
        //     target = Game.flags[targetName];
        // }

        let closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (closestEnemy != null && closestEnemy != undefined) {
            if (creep.rangedAttack(closestEnemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestEnemy, { visualizePathStyle: { stroke: '#ba2807' } });
            }
        }
    }

    claim(creep: Creep) {
        let flag: Flag = Game.flags['Claim'];
        let targetRoom = flag.pos.roomName;
        console.log(JSON.stringify(targetRoom));
        if (targetRoom != undefined && targetRoom != null) {
            if (creep.room.name != targetRoom) {
                console.log(creep.room.name);
                creep.moveTo(flag);
            } else {
                let controller = creep.room.controller;
                if (!controller) return;
                let claimCode = creep.claimController(controller);
                if (claimCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                } else if (claimCode != 0) {
                    creep.say(claimCode.toString());
                }
            }
        }

    }

    invade(creep: Creep) {
        let flag: Flag = Game.flags['EnemySpawn'];
        let targetRoom = flag.pos.roomName;
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
                let closestSpawn = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, { algorithm: 'astar' });

                if (closestSpawn != null) {
                    console.log('2');
                    if (creep.dismantle(closestSpawn) == ERR_NOT_IN_RANGE) {
                        //creep.rangedAttack(closestSpawn);
                        //let closestWall = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_WALL});
                        //let attackCode = creep.dismantle(closestWall);
                        //console.log('dismantle code: ' + attackCode);
                        let path = creep.pos.findPathTo(closestSpawn);
                        creep.moveByPath(path);
                    }
                } else {
                    let closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

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
