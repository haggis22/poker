import * as fs from 'fs'


export class Logger {



    private path: string;

    constructor() {
        this.path = "logs/poker.log";
    }


    private async write(message: string): Promise<any> {

        console.log(message);

        return new Promise((resolve, reject) => {

            fs.appendFile(this.path, message + '\n', 'utf8', (err) => {

                if (err) { return reject(err); }

                resolve();

            });  // fs.appendFile

        });

    }

    public async debug(message: string): Promise<any> {

        return this.write(message);
    }

    public async info(message: string): Promise<any> {

        return this.write(message);
    }

}