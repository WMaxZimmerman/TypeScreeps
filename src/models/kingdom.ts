export class KingdomMemory {
    public claimerNeeded: boolean;
    public invadersNeeded?: string;
    public roomInNeedOfAide?: string;

    constructor(claimerNeeded: boolean) {
        this.claimerNeeded = claimerNeeded;
    }
}
