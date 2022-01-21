export class Event {
    public id: Id<Source>;
    public container?: Id<StructureContainer>;
    public containerRequested?: RoomPosition;
    public miner?: string;
    public minerRequest?: boolean;

    constructor(id: Id<Source>) {
        this.id = id;
    }
}
