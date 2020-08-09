import * as fs from 'fs'


export class Logger {



    private path: string;

    constructor() {
        this.path = "logs/poker.log";
    }


    private write(message: string): void {

        console.log(message);

/*
        return new Promise((resolve, reject) => {

            fs.appendFile(this.path, message + '\n', 'utf8', (err) => {

                if (err) { return reject(err); }

                resolve();

            });  // fs.appendFile

        });
*/

    }

    public debug(message: string): void {

        return this.write(message);
    }

    public info(message: string): void {

        return this.write(message);
    }

}