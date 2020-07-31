import { Pot } from "./pot";

export class BetTracker {



    // Tracks how much each seat has bet so far in this round
    public bets: Map<number, number>;

    public pots: Pot[];
    private currentBet: number;
    private deadRaise: boolean;

    constructor() {

        this.pots = [];
        this.bets = new Map<number, number>();

    }


    public reset(): void {

        this.pots.length = 0;
        this.clearBets();

    }

    private clearBets(): void {

        this.bets.clear();
        this.currentBet = 0;
        this.deadRaise = false;


    }


    public startBettingRound(): void {

        this.currentBet = 0;
        this.bets.clear();

    }


    public getCurrentBet(): number {

        return this.currentBet;

    }  // getCurrentBet


    public isDeadRaise(): boolean {

        return this.deadRaise;

    }


    public addBet(seatIndex: number, amount: number): void {

        if (amount > this.currentBet) {

            this.currentBet = amount;

        }

        this.bets.set(seatIndex, (this.bets.has(seatIndex) ? this.bets.get(seatIndex) : 0) + amount);

    }


    public gatherBets(): void {

        if (this.pots.length == 0) {

            // Create a new pot
            this.pots.push(new Pot(0));

        }

        // Everyone still betting should be active in the most recent pot
        let pot = this.pots[this.pots.length - 1];

        let done: boolean = false;

        while (!done) {

            let smallestBet = Number.MAX_VALUE;

            for (let amount of this.bets.values()) {

                if (amount > 0) {

                    smallestBet = Math.min(smallestBet, amount);

                }

            }

            done = true;

            for (let seatIndex of this.bets.keys()) {

                pot.addChips(smallestBet, seatIndex);
                this.bets.set(seatIndex, this.bets.get(seatIndex) - smallestBet);

                if (this.bets.get(seatIndex) > 0) {

                    done = false;

                }

            }

            if (!done) {

                // Create a new side pot - it will become the active pot to which bets get added
                this.pots.push(new Pot(this.pots.length));
                pot = this.pots[this.pots.length = 1];

            }

        }   // while !done

        this.clearBets();

    }   // gatherBets

}