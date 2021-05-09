export class CardUI {

    public index: number;
    public top: number;
    public left: number;
    public isFacedown: boolean;
    public isDealing: boolean;

    constructor(index: number, isDealing: boolean) {
        this.index = index;
        this.top = this.left = null;
        this.isFacedown = false;
        this.isDealing = isDealing;
    }

}