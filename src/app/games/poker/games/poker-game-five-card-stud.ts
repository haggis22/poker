import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { PokerHandDescriber } from "../poker-hand-describer";

import { Board } from "../../../casino/tables/boards/board";
import { NoBoard } from "../../../casino/tables/boards/no-board";
import { Best5InHandSelector } from "../../hand-selectors/best-5-in-hand-selector";
import { TableState, HandCompleteState, ShowdownState, BetState, DealState, StartHandState } from "../../../communication/serializable";
import { BlindsAndAntesState } from "../../../casino/tables/states/betting/blinds-and-antes-state";

export class PokerGameFiveCardStud extends Game {


    public static readonly ID: string = 'five-card-stud';

    constructor() {

        super(PokerGameFiveCardStud.ID, new Best5InHandSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

    }

    public newBoard(): Board {
        return new NoBoard();
    }

    public getName(): string {
        return 'Five Card Stud';
    }

    protected getStates(): TableState[] {

        return [

            new StartHandState(),

            new BlindsAndAntesState(),

            new DealState(false),

            new DealState(true),
            new BetState(BetState.BEST_HAND),

            new DealState(true),
            new BetState(BetState.BEST_HAND),

            new DealState(true),
            new BetState(BetState.BEST_HAND),

            new DealState(true),
            new BetState(BetState.BEST_HAND),

            new ShowdownState(),

            new HandCompleteState()

        ];

    }



}