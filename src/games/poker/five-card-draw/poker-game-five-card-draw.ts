import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { DealAction } from "../../actions/deal-action";
import { PokerHandDescriber } from "../poker-hand-describer";
import { ShowdownAction } from "../../actions/showdown-action";

export class PokerGameFiveCardDraw extends Game {


    constructor() {

        super(new PokerHandEvaluator(), new PokerHandDescriber());

        this.actions.push(new DealAction(false));
        this.actions.push(new DealAction(false));
        this.actions.push(new DealAction(false));
        this.actions.push(new DealAction(false));
        this.actions.push(new DealAction(false));

        this.actions.push(new ShowdownAction());

    }

}