import { Board } from "./boards/board";

import { TableState } from "./states/table-state";
import { OpenState } from "./states/open-state";
import { Seat } from "./seat";
import { TableRules } from "./table-rules";
import { BetTracker } from "./betting/bet-tracker";
import { Stakes } from "./betting/stakes";
import { Game } from "../../games/game";


export class Table {

    public id: number;

    public stakes: Stakes;
    public rules: TableRules;
    public state: TableState;

    public seats: Array<Seat>;

    public board: Board;

    public betTracker: BetTracker;

    // tracks which seat has the button so that we know where to deal the next card
    public buttonIndex: number;


    constructor(id: number, stakes: Stakes, rules: TableRules) {

        this.id = id;

        this.stakes = stakes;
        this.rules = rules;

        this.seats = new Array<Seat>();

        for (let s = 0; s < rules.numSeats; s++) {
            this.seats.push(new Seat(s));
        }

        // Button is not yet assigned
        this.buttonIndex = null;

        this.betTracker = new BetTracker();

        this.state = new OpenState();

    }


}