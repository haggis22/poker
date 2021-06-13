export class Commentary {

    public static TYPE =
        {
            ACTION: 1,
            CHAT: 2
        };

    public message: string;
    public type: number;


    constructor(type: number, message: string) {
        this.type = type;
        this.message = message;
    }

}