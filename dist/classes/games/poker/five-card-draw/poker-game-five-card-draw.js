"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerGameFiveCardDraw = void 0;
const game_1 = require("../../game");
const poker_hand_evaluator_1 = require("../poker-hand-evaluator");
const poker_hand_describer_1 = require("../poker-hand-describer");
const no_board_1 = require("../../../casino/tables/boards/no-board");
const best_5_in_hand_selector_1 = require("../../hand-selectors/best-5-in-hand-selector");
const serializable_1 = require("../../../communication/serializable");
class PokerGameFiveCardDraw extends game_1.Game {
    constructor() {
        super(PokerGameFiveCardDraw.ID, new best_5_in_hand_selector_1.Best5InHandSelector(), new poker_hand_evaluator_1.PokerHandEvaluator(), new poker_hand_describer_1.PokerHandDescriber());
    }
    newBoard() {
        return new no_board_1.NoBoard();
    }
    getName() {
        return 'Five Card Draw';
    }
    getStates() {
        return [
            new serializable_1.StartHandState(),
            new serializable_1.DealState(false),
            new serializable_1.DealState(false),
            new serializable_1.DealState(false),
            new serializable_1.DealState(false),
            new serializable_1.DealState(false),
            new serializable_1.BetState(serializable_1.BetState.FIRST_POSITION),
            new serializable_1.ShowdownState(),
            new serializable_1.HandCompleteState()
        ];
    }
}
exports.PokerGameFiveCardDraw = PokerGameFiveCardDraw;
PokerGameFiveCardDraw.ID = 'five-card-draw';
