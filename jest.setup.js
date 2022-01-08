const Chance = require('chance');

global.chance = new Chance();


chance.mixin({
    'game': function () {
        return {
            creeps: [],
            rooms: [],
            spawns: [],
            time: chance.timestamp(),
        }
    },
    'memory': function () {
        return {
            creeps: []
        }
    }
});

global.Game = chance.game();

global.Memory = chance.memory();

Memory.creeps = [{ name: 'creep1' }, { name: 'creep2' }];
Game.creeps = [{ name: 'creep1' }];