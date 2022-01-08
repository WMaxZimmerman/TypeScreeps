import { loop } from '../src/main';

describe('Main', () => {

    it('should export itself as a function', () => {
        expect(typeof loop).toBe('function');
    });

    it('should return void when called with no context', () => {
        expect(loop()).toBe(undefined);
    });

    it('automatically deletes memory of missing creeps', () => {
        loop();

        expect(Memory.creeps[0]).toBeTruthy();
        expect(Memory.creeps[1]).toBeFalsy();
    })
})