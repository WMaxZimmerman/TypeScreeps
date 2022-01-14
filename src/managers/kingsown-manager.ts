import { UserConstants } from "constants/user-constants";

export class KingsownManager {
    private constructor() { }

    public static manage(creep: Creep): void {
        const role = creep.memory.role;
        if (!role) return;

        if (role == "claimer") {
            console.log("================CLAIMER================");
            this.claim(creep);
            console.log("================CLAIMER================");
        }
    }

    private static claim(creep: Creep): void {
        const target = creep.memory.target;
        if (!target) return;

        const targetRoomName = target.roomName;
        console.log(JSON.stringify(targetRoomName));
        if (targetRoomName != undefined && targetRoomName != null) {
            if (creep.room.name != targetRoomName || (creep.room.name == targetRoomName && this.borderPosition(creep))) {
                console.log(creep.room.name);
                //const flagPath = creep.pos.findPathTo(target.x, target.y);
                //const temp = creep.moveTo(target, { reusePath: 10});
                //console.log(temp);
                const temp1 = new RoomPosition(target.x, target.y, targetRoomName);
                const temp3 = creep.moveTo(temp1, { reusePath: 10 });

                console.log(temp3);

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

