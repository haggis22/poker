export class Stakes {

    public blinds: number[];
    public ante: number;
    public minRaise: number;


    constructor(blinds: number[], ante: number, minRaise: number) {
        this.blinds = blinds;
        this.ante = ante;
        this.minRaise = minRaise;
    }

}