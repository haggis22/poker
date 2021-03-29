import { BettingCommand } from './betting-command';

export class AnteCommand extends BettingCommand {


    constructor(tableID: number) {

        super(tableID);

    }


    public toString(): string {

        return `[ AnteCommand, userID: ${this.userID} ]`;

    }

}