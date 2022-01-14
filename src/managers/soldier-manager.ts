import { MilitaryRole } from "enums/military-roles";

export class SoldierManager {
    private constructor() { }

    public static manage(creep: Creep): void {
        const role = creep.memory.militaryRole;
        if (!role) return;

        if (role == MilitaryRole.invader) {
                this.invade(creep);
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
        const closestSpawn = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, { algorithm: 'astar' });
        const attackerCreeps = creep.room.find(FIND_HOSTILE_CREEPS).filter(
            c => c.body.filter(b => b.type == ATTACK || b.type == RANGED_ATTACK).length > 0
        );

        if (attackerCreeps.length > 0) {
            const closestAttacker = creep.pos.findClosestByPath(attackerCreeps);

            if (closestAttacker != null) {
                if (creep.pos.inRangeTo(closestAttacker, 3)) {
                    creep.rangedAttack(closestAttacker);
                    if (creep.pos.inRangeTo(closestAttacker, 2)) {
                        const attackerDirection = creep.pos.getDirectionTo(closestAttacker);

                        if (attackerDirection == TOP) {
                            creep.move(BOTTOM);
                        } else if (attackerDirection == TOP_RIGHT) {
                            creep.move(BOTTOM_LEFT);
                        } else if (attackerDirection == RIGHT) {
                            creep.move(LEFT);
                        } else if (attackerDirection == BOTTOM_RIGHT) {
                            creep.move(TOP_LEFT);
                        } else if (attackerDirection == BOTTOM) {
                            creep.move(TOP);
                        } else if (attackerDirection == BOTTOM_LEFT) {
                            creep.move(TOP_RIGHT);
                        } else if (attackerDirection == LEFT) {
                            creep.move(RIGHT);
                        } else if (attackerDirection == TOP_LEFT) {
                            creep.move(BOTTOM_RIGHT);
                        }
                    }
                } else {
                    creep.moveTo(closestAttacker);
                }
            }
        } else {
            if (closestSpawn != null) {
                //console.log('attacking enemy spawn');
                if (creep.rangedAttack(closestSpawn) == ERR_NOT_IN_RANGE) {
                    //creep.rangedAttack(closestSpawn);
                    //let closestWall = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_WALL});
                    //let attackCode = creep.dismantle(closestWall);
                    //console.log('dismantle code: ' + attackCode);
                    const path = creep.pos.findPathTo(closestSpawn);
                    creep.moveByPath(path);
                }
            } else {
                //console.log('hunting enemy creeps');
                const closestEnemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

                if (closestEnemy != null) {
                    if (creep.pos.inRangeTo(closestEnemy, 3)) {
                        creep.rangedAttack(closestEnemy);
                    }
                    creep.moveTo(closestEnemy);
                }
            }
        }
    }
}
