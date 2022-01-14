import { UserConstants } from "constants/user-constants";
import { MilitaryRole } from "enums/military-roles";
import { CreepManager } from "./creep-manager";

export class KingsownManager {
    private constructor() { }

    public static manage(creep: Creep): void {
        const role = creep.memory.role;
        if (!role) return;

        if (role == "claimer") {
            //console.log("================CLAIMER================");
            this.claim(creep);
            //console.log("================CLAIMER================");
        }

        const militaryRole = creep.memory.militaryRole;
        if (militaryRole) {
            if (CreepManager.ensureCorrectRoom(creep)) {
                if (militaryRole == MilitaryRole.invader) {
                    this.invade(creep);
                }
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
                } else {
                    Memory.kingdom.invadersNeeded = undefined;
                }
            }
        }
    }

    private static claim(creep: Creep): void {
        const target = creep.memory.target;
        if (!target) return;

        const targetRoomName = target.roomName;
        //console.log(JSON.stringify(targetRoomName));
        if (targetRoomName != undefined && targetRoomName != null) {
            if (creep.room.name != targetRoomName || (creep.room.name == targetRoomName && this.borderPosition(creep))) {
                //console.log(creep.room.name);
                //const flagPath = creep.pos.findPathTo(target.x, target.y);
                //const temp = creep.moveTo(target, { reusePath: 10});
                //console.log(temp);
                const temp1 = new RoomPosition(target.x, target.y, targetRoomName);
                const temp3 = creep.moveTo(temp1, { reusePath: 10 });

                //console.log(temp3);

            } else {
                const controller = creep.room.controller;
                if (controller) {
                    const claimCode = creep.claimController(controller);
                    if (claimCode == ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller);
                    } else if (claimCode != 0) {
                        creep.say("" + claimCode);
                    }
                    if (claimCode == ERR_INVALID_TARGET) {
                        if (controller.owner?.username == UserConstants.userName) {
                            creep.suicide();
                        }
                    }
                }
            }
        }
    }

    private static borderPosition(creep: Creep): boolean {
        return creep.pos.x == 0
            || creep.pos.x == 49
            || creep.pos.y == 0
            || creep.pos.y == 49;
    }
}

