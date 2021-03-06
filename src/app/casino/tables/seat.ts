﻿import { Hand } from "../../hands/hand";
import { Player } from "../../players/player";
import { Card } from "../../cards/card";
import { FacedownCard } from "../../cards/face-down-card";
import { Timer } from '../../timers/timer';

export class Seat {

    public index: number;
    public player: Player;
    public hand: Hand;

    // set to true by the TableController whenever a hand is started and the player is not sitting out
    public isInHand: boolean;

    public muckedCards: Array<Card | FacedownCard>;

    public action: string;
    public timer: Timer;
    public chanceToWin: number;



    constructor(index: number) {

        this.index = index;

        this.player = null;
        this.hand = null;
        this.isInHand = false;

        this.muckedCards = [];

        this.action = null;
        this.timer = null;
        this.chanceToWin = null;

    }

    public getName(): string {

        return this.player ? this.player.name : this.getSeatName();

    }

    public getSeatName(): string {

        return `Seat ${(this.index + 1)}`;

    }

    public toString(): string {

        return `[Seat ${this.index}: ${this.player ? this.player.name : 'Empty'}]`;

    }

    public deal(card: Card | FacedownCard): void {

        if (!this.hand) {
            this.hand = new Hand();
        }

        this.hand.deal(card);

    }


    public clearHand(): Array<Card | FacedownCard> {

        let muckedCards: Array<Card | FacedownCard> = new Array<Card | FacedownCard>();

        if (this.hand && this.hand.cards) {
            muckedCards.push(...this.hand.cards);
        }

        this.hand = null;
        this.isInHand = false;

        return muckedCards;

    }


    public isAllIn(): boolean {

        return this.isInHand && this.player && this.player.chips === 0;

    }

}