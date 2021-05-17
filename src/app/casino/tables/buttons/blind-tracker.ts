import { RoundPayments } from './round-payments';
import { Blind } from '../betting/blind';
import { Stakes } from '../betting/stakes';
import { Table } from '../table';
import { Ante } from '../betting/ante';
import { Seat } from '../seat';

export class BlindTracker {

    public static readonly STEP_BIG_BLIND: number = 1;
    // We will move the button once the big blind is established
    public static readonly STEP_OTHER_REGULAR_BLINDS: number = 2;
    public static readonly STEP_JOIN_BLINDS: number = 3;
    public static readonly STEP_ANTES: number = 5;
    public static readonly STEP_DONE: number = 6;

    public currentStep: number;


    // This is the set of userIDs that are paid up and eligible to get the button
    public activePlayers: Set<number>;

    public ante: number;
    public blinds: Blind[];

    public  roundPayments: RoundPayments[];

    public currentRoundPayments: RoundPayments;

    public buttonIndex: number;
    public bigBlindIndex: number;

    // The indexes of all the blinds that have been paid already
    public paidBlinds: Set<number>;

    // All of the users that have chipped in their ante for the given round
    public paidAntes: Set<number>;




    constructor(stakes: Stakes) {

        this.activePlayers = new Set<number>();

        this.ante = stakes.ante;
        this.blinds = stakes.blinds;

        this.roundPayments = [];

        this.buttonIndex = null;
        this.bigBlindIndex = null;

        this.paidBlinds = new Set<number>();

        this.paidAntes = new Set<number>();


    }

    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `BlindTracker: ${message}`);

    }


    public resetForOpenState(table: Table): void {

        this.activePlayers.clear();

    }

    public resetHand(table: Table): void {

        this.currentRoundPayments = null;

        this.currentStep = BlindTracker.STEP_BIG_BLIND;

        this.paidBlinds.clear();
        this.paidAntes.clear();

        this.checkActivePlayers(table);

    }


    public addPayments(table: Table, userID: number, forcedBets: (Ante | Blind)[]) {

        if (!this.currentRoundPayments) {
            this.currentRoundPayments = new RoundPayments();
        }

        // We're taking payment for this player, so they must be active
        this.activePlayers.add(userID);

        for (let bet of forcedBets) {

            if (bet instanceof Blind) {

                if (bet.isBasicBlind) {

                    // This is one of the normal small/big blinds, so mark it as paid
                    this.paidBlinds.add(bet.index);

                }

                let seat: Seat = table.seats.find(s => s.player && s.player.userID == userID);
                if (seat) {
                    this.log(`${seat} pays ${bet.name}`);
                }

                // Mark each blind index that they paid this round
                this.currentRoundPayments.addPayment(userID, bet.index);

            }
            else if (bet instanceof Ante) {

                // Mark this user as having paid their ante this round
                this.paidAntes.add(userID);

                let seat: Seat = table.seats.find(s => s.player && s.player.userID == userID);
                if (seat) {
                    this.log(`${seat} pays ${bet}`);
                }

            }

        }

    }


    public markAllBlindsPaid() {

        for (let blind of this.blinds) {
            this.paidBlinds.add(blind.index);
        }

    }

    public saveBlindPayments(): void {

        if (this.currentRoundPayments != null) {

            this.roundPayments.push(this.currentRoundPayments);

        }

        this.currentRoundPayments = null;

    }


    /// This will see if we have NO active players - if that's the case then we will add everyone that is not sitting out
    private checkActivePlayers(table: Table): void {

        // If NONE of the players are active, then mark everyone that is in the hand as active
        let needsActivePlayers: boolean = this.activePlayers.size === 0;

        for (let seat of table.seats) {

            if (seat.player) {

                if (needsActivePlayers && seat.isAvailableForHand()) {
                    this.activePlayers.add(seat.player.userID);
                }

            }

        }


    }



}