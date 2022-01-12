export class EventManager {
    private constructor(){}
    
    public static creepCountChanged(): void {
        //console.log(Memory.currentCreepCount);
        var currentCreepCount = _.filter(Game.creeps, (creep) => creep.memory.role != '').length;
        if (Memory.currentCreepCount == undefined) Memory.currentCreepCount = currentCreepCount;

        if (currentCreepCount != Memory.currentCreepCount) {
            Memory.currentCreepCount = currentCreepCount;
            console.log('Current Creeps: ' + Memory.currentCreepCount + ' -------------------------------');
            console.log('Harvesters: ' + _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length);
            console.log('Upgraders: ' + _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length);
            console.log('Builders: ' + _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length);
            console.log('Fighters: ' + _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter').length);
        }
    }

    public static rclUpgrade(room: Room): void {
        var controller = room.controller;
        if (!controller) return;
        var currentExtensions = room.find(FIND_STRUCTURES, { filter: (s) => { return s.structureType == 'extension' } }).length;
        if (currentExtensions < (controller.level - 2) * 5) {
            console.log('RCL Upgraded to lvl ' + controller.level);
            // room.find(FIND_FLAGS).forEach(function(flag) {
            //     // room.lookForAt(LOOK_CONSTRUCTION_SITES, flag.x,  flag.y).forEach(function(site){
            //     //     site.remove();
            //     // });
            //     // room.lookForAt(LOOK_STRUCTURES, flag.x,  flag.y).forEach(function(structure){
            //     //     structure.destroy();
            //     // });
            //     // room.createConstructionSite(flag.pos, STRUCTURE_EXTENSION);
            // });
        }
    }
}
