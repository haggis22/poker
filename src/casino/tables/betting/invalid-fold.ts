export class InvalidFold {

    public message: string;

    constructor(message: string) {

        this.message = message;

    }


    public toString(): string {

        return JSON.stringify(this);

    }


}