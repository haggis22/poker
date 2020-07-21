﻿import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { PokerHandDescriber } from "../poker-hand-describer";
import { Board } from "../../../casino/tables/boards/board";
import { NoBoard } from "../../../casino/tables/boards/no-board";
import { Best5InHandSelector } from "../../hand-selectors/best-5-in-hand-selector";
import { FiveCardDrawStateMachine } from "./five-card-draw-state-machine";

export class PokerGameFiveCardDraw extends Game {


    constructor() {

        super(new FiveCardDrawStateMachine(), new Best5InHandSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

    }

    newBoard(): Board {
        return new NoBoard();
    }


}