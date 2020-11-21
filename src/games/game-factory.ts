import { Game } from "./game";
import { PokerGameFiveCardDraw } from "./poker/games/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./poker/games/poker-game-five-card-stud";
import { PokerGameSevenCardStud } from "./poker/games/poker-game-seven-card-stud";

export class GameFactory {


    constructor() {

    }


    public create(gameID: string): Game {

        switch (gameID) {

            case PokerGameFiveCardStud.ID:
                return new PokerGameFiveCardStud();

            case PokerGameFiveCardDraw.ID:
                return new PokerGameFiveCardDraw();

            case PokerGameSevenCardStud.ID:
                return new PokerGameSevenCardStud();


        }  // switch


    }  // create

}