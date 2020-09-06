export class Fold {

    public isValid: boolean;
    public message: string;

    constructor(isValid: boolean, message: string) {

        this.isValid = isValid;
        this.message = message;

    }


    public toString(): string {

        return JSON.stringify(this);

    }


}