import { ComputedRef } from 'vue';

export class CardUI {

    public index: number;
    public top: ComputedRef<number>;
    public left: ComputedRef<number>;
    public isFacedown: boolean;
    public isDealing: boolean;


    constructor(index: number, isDealing: boolean) {
        this.index = index;
        this.top = this.left = null;
        this.isFacedown = false;
        this.isDealing = isDealing;
    }

}