import { BettingCommand } from './betting-command';

export class FoldCommand extends BettingCommand {


    constructor(tableID: number) {

        super(tableID);

    }

}