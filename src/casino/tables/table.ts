﻿import { Deck } from "../../cards/deck";
import { Board } from "./boards/board";

import { TableState } from "./states/table-state";
import { OpenState } from "./states/open-state";
import { Seat } from "./seat";
import { TableRules } from "./table-rules";
import { BetTracker } from "./betting/bet-tracker";
import { Stakes } from "./stakes";
import { Game } from "../../games/game";


export class Table {

    public id: number;

    public game: Game;
    public stakes: Stakes;
    public rules: TableRules;
    public state: TableState;

    public seats: Array<Seat>;

    public board: Board;
    public deck: Deck;

    public betTracker: BetTracker;

    // tracks which seat has the button so that we know where to deal the next card
    public buttonIndex: number;


    constructor(id: number, game: Game, stakes: Stakes, rules: TableRules, deck: Deck) {

        this.id = id;

        this.game = game;
        this.stakes = stakes;
        this.rules = rules;

        this.seats = new Array<Seat>();

        for (let s = 0; s < rules.numSeats; s++) {
            this.seats.push(new Seat(s));
        }

        // Button is not yet assigned
        this.buttonIndex = null;

        this.deck = deck;

        this.betTracker = new BetTracker();

        this.state = new OpenState();

    }



    



    public playHand(): void {

/*


        for (let action of this.game.actions) {

            if (action instanceof BetState)
            {
                console.log('-- Round of betting');

                let betState: BetState = action as BetState;

                // give everyone a card
                let firstToBet: FirstToBet = this.findFirstToBet(betState.firstToBet);
                console.log(`${this.players[firstToBet.seat].name} is first to bet ${firstToBet.description}`);

            }

            else if (action instanceof ShowdownState) {

                console.log('========');
                console.log('SHOWDOWN');
                console.log('========');

                for (let p = 0; p < this.players.length; p++) {

                    let player = this.players[p];

                    if (player != null) {

                        if (player.hasHand()) {

                            for (let card of player.hand.cards) {

                                // flip his cards face up
                                card.isFaceUp = true;

                            }

                            let evaluation = this.game.handSelector.select(this.game.handEvaluator, player.hand, this.board)

                            console.log(`${player.name}, ${player.hand.display()}:  ${this.game.handDescriber.describe(evaluation)}`);

                        }
                        else {
                            console.log('not in hand');
                        }

                    }

                }   // show each player's cards

                let winners: HandWinner[] = this.findWinners();

                for (let winner of winners) {

                    console.log(`${this.players[winner.seat].name} wins ${winner.amount} with ${this.game.handDescriber.describe(winner.evaluation)}`);

                }


            }   // showDown

        }
*/


    }  // playHand

}