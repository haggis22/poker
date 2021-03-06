﻿import { Game } from "../../game";
import { PokerHandEvaluator } from "../poker-hand-evaluator";
import { PokerHandDescriber } from "../poker-hand-describer";

import { Board } from "../../../casino/tables/boards/board";
import { TableState, HandCompleteState, ShowdownState, BetState, DealState, StartHandState } from "../../../communication/serializable";
import { BlindsAndAntesState } from "../../../casino/tables/states/betting/blinds-and-antes-state";
import { DealBoardState } from "../../../casino/tables/states/dealing/deal-board-state";
import { HoldEmBoard } from "../../../casino/tables/boards/hold-em-board";
import { HoldEmSelector } from "../../hand-selectors/hold-em-selector";

export class PokerGameTexasHoldEm extends Game {


    public static readonly ID: string = 'texas-hold-em';

    constructor() {

        super(PokerGameTexasHoldEm.ID, new HoldEmSelector(), new PokerHandEvaluator(), new PokerHandDescriber());

    }

    public newBoard(): Board {
        return new HoldEmBoard();
    }

    public getName(): string {
        return 'Texas Hold\'em';
    }

    protected getStates(): TableState[] {

        return [

            new StartHandState(),

            new BlindsAndAntesState(),

            new DealState(false),
            new DealState(false),

            new BetState(BetState.AFTER_BIG_BLIND),

            // Flop
            new DealBoardState(3),

            new BetState(BetState.FIRST_POSITION),

            // Turn
            new DealBoardState(1),

            new BetState(BetState.FIRST_POSITION),

            // River
            new DealBoardState(1),

            new BetState(BetState.FIRST_POSITION),

            new ShowdownState(),

            new HandCompleteState()

        ];

    }



}