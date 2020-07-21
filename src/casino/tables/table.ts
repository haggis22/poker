import { Player } from "../../players/player";
import { Deck } from "../../cards/deck";
import { Game } from "../../games/game";
import { HandWinner } from "../../games/hand-winner";
import { DealAction } from "../../games/actions/deal-action";
import { DealtCard } from "../../hands/dealt-card";
import { ShowdownAction } from "../../games/actions/showdown-action";
import { BetAction } from "../../games/actions/betting/bet-action";
import { Board } from "./boards/board";
import { FirstToBet } from "./first-to-bet";
import { IChipFormatter } from "../chips/chip-formatter";
import { Pot } from "./pot";

export class Table {

    public numSeats: number;
    public players: Array<Player>;
    public board: Board;
    public deck: Deck;
    public game: Game;
    public chipFormatter: IChipFormatter;
    public pots: Pot[];

    // tracks which seat has the button so that we know where to deal the next card
    private button: number;

    constructor(numSeats: number, deck: Deck) {
        this.numSeats = numSeats;
        this.players = new Array<Player>(numSeats);
        this.deck = deck;
        this.button = null;

        this.pots = new Array<Pot>();
    }


    public seatPlayer(player: Player, chips: number) : boolean {

        for (let s = 0; s < this.numSeats; s++) {

            if (this.players[s] == null) {

                player.addChips(chips);
                this.players[s] = player;
                return true;

            }

        }

        // No room at the table
        return false;

    }


    public setGame(game: Game): void {

        this.game = game;
        this.board = game.newBoard();

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


    private findFirstToBet(firstBetRule: number): FirstToBet {

        switch (firstBetRule) {


            case BetAction.FIRST_POSITION:
                return new FirstToBet(this.findNextOccupiedSeat(this.button + 1), "because he is in first position");

            case BetAction.BEST_HAND:
                {
                    let handWinners: Array<HandWinner> = this.findWinners();
                    return new FirstToBet(handWinners[0].seat, `with ${this.game.handDescriber.describe(handWinners[0].evaluation)}`);
                }

        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }   // findFirstToBet


    
    private findWinners(): Array<HandWinner> {

        let handWinners: Array<HandWinner> = new Array<HandWinner>();

        for (let p = 0; p < this.players.length; p++) {

            if (this.players[p] != null && this.players[p].hasHand()) {

                // Put their best hand on the list
                handWinners.push(new HandWinner(this.game.handSelector.select(this.game.handEvaluator, this.players[p].hand, this.board), p, 0))

            }

        }

        // rank the hands, from best to worst
        handWinners.sort(function (w1, w2) {


            let compare = w1.evaluation.compareTo(w2.evaluation);

            if (compare > 0) {

                // The first hand is better, so keep it first
                return -1;
            }

            if (compare < 0) {

                // the first hand is worse, so swap them
                return 1;
            }

            // They have the same value, so go with the earlier seat
            // TODO: depending on where the button is, then higher-numbered seats could be in earlier position than lower-numbered seats
            return w2.seat - w1.seat;

        });


        return handWinners;

    }



    public playHand(): void {

        this.deck.shuffle();

        this.setButton();

        this.pots.length = 0;

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
                let firstToBet: FirstToBet = this.findFirstToBet(betAction.firstToBet);
                console.log(`${this.players[firstToBet.seat].name} is first to bet ${firstToBet.description}`);
                let playerPointer: number = firstToBet.seat;
                let whoInitiatedAction = null;

                while (playerPointer != whoInitiatedAction) {

                    let player = this.players[playerPointer];

                    console.log(`  ${player.name}'s turn to bet`);

                    let bet = Math.min(50, player.chips);

                    player.chips -= bet;

                    if (this.pots.length == 0) {

                        this.pots.push(new Pot());

                    }

                    let pot: Pot = this.pots[0];
                    pot.addChips(bet, playerPointer);

                    if (whoInitiatedAction == null) {
                        whoInitiatedAction = playerPointer;
                    }

                    playerPointer = this.findNextOccupiedSeat(playerPointer + 1);

                }

                console.log('-- Betting complete');
                for (let pot of this.pots) {
                    console.log(`Pot: ${this.chipFormatter.format(pot.amount)} : ${pot.seats.size} player(s)`);
                }

            }

            else if (action instanceof ShowdownAction) {

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



    }

}