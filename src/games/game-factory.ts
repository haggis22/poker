import { Game } from "./game";
import { PokerGameFiveCardDraw } from "./poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./poker/five-card-stud/poker-game-five-card-stud";

export class GameFactory {


    constructor() {

    }


    public create(gameID: string): Game {

        switch (gameID) {

            case PokerGameFiveCardStud.ID:
                return new PokerGameFiveCardStud();

            case PokerGameFiveCardDraw.ID:
                return new PokerGameFiveCardDraw();


        }  // switch


    }  // create

}