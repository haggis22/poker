import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { PokerHandDescriber } from "../poker-hand-describer";

import { Board } from "../../../casino/tables/boards/board";
import { NoBoard } from "../../../casino/tables/boards/no-board";
import { Best5InHandSelector } from "../../hand-selectors/best-5-in-hand-selector";
import { FiveCardStudStateMachine } from "./five-card-stud-state-machine";

export class PokerGameFiveCardStud extends Game {


    public static readonly ID: string = 'five-card-stud';

    constructor() {

        super(PokerGameFiveCardStud.ID, new FiveCardStudStateMachine(), new Best5InHandSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

    }

    newBoard(): Board {
        return new NoBoard();
    }


}