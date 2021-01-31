export class CardUI {

    public index: number;
    public top: number;
    public left: number;
    public isFacedown: boolean;

    constructor(index: number) {
        this.index = index;
        this.top = this.left = null;
        this.isFacedown = false;
    }

}