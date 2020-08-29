export class Message {

    public text: string;
    public userID: number;

    constructor(text: string, userID?: number) {

        this.text = text;
        this.userID = userID;

    }


}