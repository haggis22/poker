import { Player } from "../players/player";
import { Deck } from "../cards/deck";
import { Game } from "../games/game";
import { DealAction } from "../games/actions/deal-action";
import { DealtCard } from "../hands/dealt-card";
import { ShowdownAction } from "../games/actions/showdown-action";
import { BetAction } from "../games/actions/betting/bet-action";

export class Table {

    public numSeats: number;
    public players: Array<Player>;
    public deck: Deck;
    public game: Game;

    // tracks which seat has the button so that we know where to deal the next card
    private button: number;

    constructor(numSeats: number, deck: Deck) {
        this.numSeats = numSeats;
        this.players = new Array<Player>(numSeats);
        this.deck = deck;
        this.button = null;
    }


    public seatPlayer(player: Player) : boolean {

        for (let s = 0; s < this.numSeats; s++) {

            if (this.players[s] == null) {

                this.players[s] = player;
                return true;

            }

        }

        // No room at the table
        return false;

    }


    public setGame(game: Game): void {

        this.game = game;

    }

    private setButton(): void {

        this.button = this.findNextOccupiedSeat(this.button == null ? 0 : this.button + 1);

    }

    private findNextOccupiedSeat(position: number): number {

        let nextPosition: number = position;

        if (nextPosition > this.numSeats) {
            nextPosition = 0;
        }

        while (this.players[nextPosition] == null) {
            nextPosition++;

            if (nextPosition > this.numSeats) {
                nextPosition = 0;
            }

            if (nextPosition == position) {
                throw new Error("Could not find the next player");
            }

        }

        return nextPosition;

    }


    private findFirstToBet(firstBetRule: number): number {

        switch (firstBetRule) {


            case BetAction.FIRST_POSITION:
                return this.findNextOccupiedSeat(this.button + 1);

        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }



    public playHand(): void {

        this.deck.shuffle();

        this.setButton();

        for (let action of this.game.actions) {

            if (action instanceof DealAction) {

                let dealAction: DealAction = action as DealAction;

                // give everyone a card
                let playerPointer: number = this.findNextOccupiedSeat(this.button + 1);

                let everyoneGotOne = false;

                while (!everyoneGotOne) {

                    let dealtCard = new DealtCard(this.deck.deal(), dealAction.isFaceUp);

                    this.players[playerPointer].hand.deal(dealtCard);

                    if (dealtCard.isFaceUp) {
                        console.log(`${this.players[playerPointer].name} gets ${dealtCard.card.value.symbol}${dealtCard.card.suit.symbol}`);
                    }
                    else {
                        console.log(`${this.players[playerPointer].name} gets a card`);
                    }

                    if (playerPointer == this.button) {
                        everyoneGotOne = true;
                    }
                    else {
                        playerPointer = this.findNextOccupiedSeat(playerPointer + 1);
                    }

                }  // while !everyoneGotOne

            }

            else if (action instanceof BetAction)
            {
                console.log('-- Round of betting');

                let betAction: BetAction = action as BetAction;

                // give everyone a card
                let playerPointer: number = this.findFirstToBet(betAction.firstToBet);
                let whoInitiatedAction = null;

                while (playerPointer != whoInitiatedAction) {

                    console.log(`  ${this.players[playerPointer].name}'s turn to bet`);

                    if (whoInitiatedAction == null) {
                        whoInitiatedAction = playerPointer;
                    }

                    playerPointer = this.findNextOccupiedSeat(playerPointer + 1);

                }

                console.log('-- Betting complete');

            }

            else if (action instanceof ShowdownAction) {

                for (let p = 0; p < this.players.length; p++) {

                    let player = this.players[p];

                    if (player != null) {

                        let hand = player.hand;

                        let evaluation = this.game.handEvaluator.evaluate(hand);

                        console.log(`${player.name}, ${hand.display()}:  ${this.game.handDescriber.describe(evaluation)}`);

                    }


                }


            }

        }



    }

}