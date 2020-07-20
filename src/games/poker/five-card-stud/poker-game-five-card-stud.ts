import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { DealAction } from "../../actions/deal-action";
import { PokerHandDescriber } from "../poker-hand-describer";
import { ShowdownAction } from "../../actions/showdown-action";
import { BetAction } from "../../actions/betting/bet-action";

import { Board } from "../../../casino/tables/boards/board";
import { NoBoard } from "../../../casino/tables/boards/no-board";
import { Best5InHandSelector } from "../../hand-selectors/best-5-in-hand-selector";

export class PokerGameFiveCardStud extends Game {


    constructor() {

        super(new Best5InHandSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

        this.actions.push(new DealAction(false));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.BEST_HAND));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.BEST_HAND));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.BEST_HAND));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.BEST_HAND));

        this.actions.push(new ShowdownAction());

    }

    newBoard(): Board {
        return new NoBoard();
    }


}