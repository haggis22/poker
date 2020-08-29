"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameFactory = void 0;
const poker_game_five_card_draw_1 = require("./poker/five-card-draw/poker-game-five-card-draw");
const poker_game_five_card_stud_1 = require("./poker/five-card-stud/poker-game-five-card-stud");
class GameFactory {
    constructor() {
    }
    create(gameID) {
        switch (gameID) {
            case poker_game_five_card_stud_1.PokerGameFiveCardStud.ID:
                return new poker_game_five_card_stud_1.PokerGameFiveCardStud();
            case poker_game_five_card_draw_1.PokerGameFiveCardDraw.ID:
                return new poker_game_five_card_draw_1.PokerGameFiveCardDraw();
        } // switch
    } // create
}
exports.GameFactory = GameFactory;
