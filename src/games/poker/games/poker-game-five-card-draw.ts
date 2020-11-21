import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { PokerHandDescriber } from "../poker-hand-describer";
import { Board } from "../../../casino/tables/boards/board";
import { NoBoard } from "../../../casino/tables/boards/no-board";
import { Best5InHandSelector } from "../../hand-selectors/best-5-in-hand-selector";
import { StartHandState, DealState, BetState, ShowdownState, HandCompleteState, TableState, AnteState } from "../../../communication/serializable";

export class PokerGameFiveCardDraw extends Game {

    public static readonly ID: string = 'five-card-draw';


    constructor() {

        super(PokerGameFiveCardDraw.ID, new Best5InHandSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

    }

    public newBoard(): Board {
        return new NoBoard();
    }


    public getName(): string {
        return 'Five Card Draw';
    }


    protected getStates(): TableState[] {

        return [

            new StartHandState(),

            new AnteState(),

            new DealState(false),
            new DealState(false),
            new DealState(false),
            new DealState(false),
            new DealState(false),

            new BetState(BetState.FIRST_POSITION),

            new ShowdownState(),

            new HandCompleteState()

        ];



    }


}