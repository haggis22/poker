import { Table } from "../../table";
import { Stakes } from '../../betting/stakes';
import { Blind } from '../../betting/blind';
import { TableRules } from '../../table-rules';
import { Player } from '../../../../players/player';
import { IButtonController } from '../i-button-controller';
import { DeadButtonController } from '../dead-button-controller';
import { BlindTracker } from '../blind-tracker';
import { RandomBlindAssigner } from '../random-blind-assigner';
import { IBlindAssigner } from '../i-blind-assigner';
import { ExplicitBlindAssigner } from '../explicit-blind-assigner';
import { Limits } from '../../betting/limits';


class Harness
{
    public table: Table;
    public blindTracker: BlindTracker;
    public buttonController: IButtonController;

    constructor(table: Table, blindTracker: BlindTracker, buttonController: IButtonController) {
        this.table = table;
        this.blindTracker = blindTracker;
        this.buttonController = buttonController;
    }
}



function setup(blindAssigner: IBlindAssigner): Harness {

    const blinds: Blind[] =
        [
            new Blind(0, Blind.TYPE_SMALL, "small blind", 50, true, true),
            new Blind(1, Blind.TYPE_BIG, "big blind", 100, true, true)
        ];

    const limits: Limits = new Limits(Limits.NO_LIMIT, 4, /* minBuyIn */ 500, /* maxBuyIn */ 10000);
    const stakes: Stakes = new Stakes(0, blinds, [25, 50]);
    const rules: TableRules = new TableRules(6, 10, 10);

    const table: Table = new Table(1, 'Test', 'Test', limits, stakes, rules);

    table.seats[0].player = new Player(1, 'Danny');
    table.seats[0].player.chips = 1000;

    table.seats[1].player = new Player(5, 'Paul');
    table.seats[1].player.chips = 1000;

    table.seats[2].player = new Player(6, 'Joe');
    table.seats[2].player.chips = 1000;

    table.seats[3].player = new Player(7, 'Mark');
    table.seats[3].player.chips = 1000;

    table.seats[4].player = new Player(8, 'Billy');
    table.seats[4].player.chips = 1000;

    return new Harness(table, new BlindTracker(stakes), new DeadButtonController(blindAssigner));

}



function setInHand(table: Table, activeSeatIndexes: number[]) {

    const set: Set<number> = new Set<number>();
    for (let seatIndex of activeSeatIndexes) {
        set.add(seatIndex);
    }

    for (const seat of table.seats) {

        if (seat.player) {
            seat.player.isSittingOut = !set.has(seat.index);
        }

    }

}


function testHeadsUp() {

    const harness: Harness = setup(new RandomBlindAssigner());

    const { table, blindTracker, buttonController } = harness;

    blindTracker.resetForOpenState(table);

    // Set it so that only Danny & Paul are not sitting out
    setInHand(harness.table, [0, 1]);

    let handNum = 0;

    runHand(++handNum, harness);
    runHand(++handNum, harness);
    runHand(++handNum, harness);

}

function testAddThird() {

    const harness: Harness = setup(new RandomBlindAssigner());

    const { table, blindTracker, buttonController } = harness;

    blindTracker.resetForOpenState(table);

    // Set it so that only Danny & Paul are not sitting out
    setInHand(harness.table, [0, 1]);

    let handNum = 0;

    runHand(++handNum, harness);


    runHand(++handNum, harness);

    // Add Joe into the mix
    setInHand(table, [0, 1, 2]);

    runHand(++handNum, harness);
    runHand(++handNum, harness);
    runHand(++handNum, harness);

}


function testInBetween() {

    const harness: Harness = setup(new ExplicitBlindAssigner(0, 3));

    const { table, blindTracker, buttonController } = harness;

    blindTracker.resetForOpenState(table);

    // Set it so that only Danny & Paul are not sitting out
    setInHand(harness.table, [0, 1, 3]);

    let handNum = 0;

    runHand(++handNum, harness);

    // Add Joe into the mix
    setInHand(table, [0, 1, 2, 3]);

    runHand(++handNum, harness);
    runHand(++handNum, harness);
    runHand(++handNum, harness);

}



function runHand(handNum: number, harness: Harness) {

    console.log(`Hand #${handNum}`);

    const { table, blindTracker, buttonController } = harness;

    blindTracker.resetHand(table);

    console.log(`Dealer: ${table.seats[table.buttonIndex]}`);

    while (buttonController.calculateNextForcedBet(table, blindTracker)) {

        console.log(`betStatus.seatIndex = ${table.betStatus.seatIndex}, betStatus.actionOnUserID = ${table.betStatus.actionOnUserID}`);

        console.log(`Action on ${table.seats[table.betStatus.seatIndex]}: ${table.betStatus.forcedBets.join(' ')}`);

        // Action-On player pays all their forced bets
        blindTracker.addPayments(table, table.betStatus.seatIndex, table.betStatus.actionOnUserID, table.betStatus.forcedBets);

    }

    blindTracker.saveBlindPayments();

}


if (process.argv.includes('dp')) {
    testHeadsUp();
}

if (process.argv.includes('dpj')) {
    testAddThird();
}

if (process.argv.includes('hole')) {
    testInBetween();
}

