import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { DealAction } from "../../actions/deal-action";
import { PokerHandDescriber } from "../poker-hand-describer";
import { ShowdownAction } from "../../actions/showdown-action";
import { BetAction } from "../../actions/betting/bet-action";

export class PokerGameFiveCardStud extends Game {


    constructor() {

        super(new PokerHandEvaluator(), new PokerHandDescriber());

        this.actions.push(new DealAction(false));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.FIRST_POSITION));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.FIRST_POSITION));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.FIRST_POSITION));

        this.actions.push(new DealAction(true));
        this.actions.push(new BetAction(BetAction.FIRST_POSITION));

        this.actions.push(new ShowdownAction());

    }

}