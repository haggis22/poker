import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { SitInCommand } from "../../commands/table/sit-in-command";
import { Player } from "../../players/player";
import { AddChipsCommand } from "../../commands/table/add-chips-command";
import { StartHandState } from "./states/start-hand-state";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/players/player-seated-action";
import { MoveButtonAction } from "../../actions/table/game/move-button-action";
import { DealState } from "./states/deal-state";
import { Hand } from "../../hands/hand";
import { BetState } from "./states/betting/bet-state";
import { AnteState } from "./states/betting/ante-state";
import { ShowdownState } from "./states/showdown-state";
import { HandCompleteState } from "./states/hand-complete-state";
import { HandWinner } from "../../games/hand-winner";
import { TableSnapshotAction } from "../../actions/table/state/table-snapshot-action";
import { UpdateBetsAction } from "../../actions/table/betting/update-bets-action";
import { WinPotAction } from "../../actions/table/game/win-pot-action";
import { StackUpdateAction } from "../../actions/table/players/stack-update-action";
import { AnteCommand } from "../../commands/table/betting/ante-command";
import { BetCommand } from "../../commands/table/betting/bet-command";
import { Seat } from "./seat";
import { Bet } from "./betting/bet";
import { FoldCommand } from "../../commands/table/fold-command";
import { Fold } from "./betting/fold";
import { Logger } from "../../logging/logger";
import { TableSnapshotCommand } from "../../commands/table/table-snapshot-command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { AddChipsAction } from "../../actions/table/players/add-chips-action";
import { BetAction } from "../../actions/table/betting/bet-action";
import { FoldAction } from "../../actions/table/betting/fold-action";
import { TableState } from "./states/table-state";
import { AnteAction } from "../../actions/table/antes/ante-action";
import { DealCardAction } from "../../actions/table/game/deal-card-action";
import { BetTurnAction } from "../../actions/table/betting/bet-turn-action";
import { BetReturnedAction } from "../../actions/table/betting/bet-returned-action";
import { FlipCardsAction } from "../../actions/table/game/flip-cards-action";
import { Deck } from "../../cards/deck";
import { TableStateAction } from "../../actions/table/state/table-state-action";
import { MessagePair } from "../../messages/message-pair";
import { DeepCopier } from "../../communication/deep-copier";
import { DeclareHandAction, Card, HandCompleteAction, GatherBetsAction, Pot, AnteTurnAction } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { SittingOutAction } from "../../actions/table/players/sitting-out-action";
import { BettingCompleteAction } from "../../actions/table/betting/betting-complete-action";
import { FacedownCard } from "../../cards/face-down-card";
import { WonPot } from "./betting/won-pot";
import { IsInHandAction } from "../../actions/table/players/is-in-hand-action";

const logger: Logger = new Logger();


export class TableManager implements CommandHandler, MessageBroadcaster {

    private readonly TIME_SET_BUTTON: number = 750;

    private readonly TIME_DEAL_CARD: number = 300;

    private readonly TIME_ANTE = 1500;
    private readonly TIME_BET = 100;
    private readonly TIME_BETTING_COMPLETE: number = 1250;

    private readonly TIME_SHOWDOWN: number = 1000;
    private readonly TIME_WIN_POT: number = 2000;
    private readonly TIME_POST_SHOWDOWN: number = 2000;

    private readonly TIME_COMPLETE_HAND: number = 1000;


    public tableID: number;
    private table: Table;
    private game: Game;
    private deck: Deck;

    private copier: DeepCopier;

    private messageQueue: Array<Message | MessagePair>;
    private messageHandlers: MessageHandler[];

    private betTimer: ReturnType<typeof setTimeout>;

    private numTimers: number;
    private numTimersElapsed: number;
    private numTimersKilled: number;



    constructor(tableID: number, table: Table, deck: Deck) {

        this.tableID = tableID;
        this.table = table;
        this.deck = deck;

        this.copier = new DeepCopier();

        this.messageQueue = new Array<Message | MessagePair>();
        this.messageHandlers = new Array<MessageHandler>();

        this.numTimers = this.numTimersElapsed = this.numTimersKilled = 0;
    }


    private snapshot(obj: any): any {

        return this.copier.copy(obj);

    }

    public registerMessageHandler(handler: MessageHandler): void {

        this.messageHandlers.push(handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.messageHandlers = this.messageHandlers.filter(o => o != handler);

    }


    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    private broadcastMessage(message: Message | MessagePair): void {

        for (let handler of this.messageHandlers) {

            handler.handleMessage(message);

        }

    }   // broadcastMessage


    private queueAction(action: Action, userID?: number) {

        this.queueMessage(new ActionMessage(action, userID));

    }

    private queueMessage(message: Message | MessagePair): void {

        if (message instanceof ActionMessage) {

            this.log(`Queueing ${message.action.constructor.name}`);

            if (message.action instanceof BetTurnAction) {

                // this.log(`Queueing ${message.action.constructor.name} for ${message.action.bets.seatIndex}`);

            }

        }
        else if (message instanceof MessagePair) {

            let publicMessage: string = message.publicMessage && message.publicMessage instanceof ActionMessage ? message.publicMessage.action.constructor.name : '[No public message]';
            let privateMessage: string = message.privateMessage && message.privateMessage instanceof ActionMessage ? message.privateMessage.action.constructor.name : '[No private message]';

            this.log(`Queueing public: ${publicMessage}, private: ${privateMessage} `);

        }

        this.messageQueue.push(message);

        this.pumpQueues();

    }


    public handleCommand(command: Command): void {

        this.log(`received ${command.constructor.name}`);

        this.processCommand(command);

        this.pumpQueues();

    }   // handleCommand



    private async processCommand(command: Command): Promise<void> {

        if (command instanceof RequestSeatCommand) {

            return await this.seatPlayer(command);

        }

        if (command instanceof SitInCommand) {

            return await this.sitIn(command);

        }

        if (command instanceof AddChipsCommand) {

            return await this.addChips(command);

        }

        if (command instanceof BetCommand) {

            return await this.bet(command);

        }

        if (command instanceof AnteCommand) {

            return await this.ante(command);

        }

        if (command instanceof FoldCommand) {

            return await this.fold(command);
        }

        if (command instanceof TableSnapshotCommand) {

            return await this.tableSnapshot(command);

        }

        throw new Error("Method not implemented.");
    }


    public setGame(game: Game): void {

        this.game = game;
        this.queueAction(new SetGameAction(this.table.id, game.id));

    }


    private createTableSnapshot(userID: number): Table {

        let table: Table = new Table(this.table.id, this.table.stakes, this.table.rules);

        table.betTracker = this.table.betTracker;
        table.buttonIndex = this.table.buttonIndex;
        table.board = this.table.board;

        for (let s = 0; s < this.table.seats.length; s++) {

            table.seats[s].player = this.table.seats[s].player;

            let hand:Hand = null;

            if (this.table.seats[s].hand != null) {

                hand = new Hand();

                for (let card of this.table.seats[s].hand.cards) {

                    // On the server, these should *always* be Card and not FacedownCard
                    if (card instanceof Card) {

                        if (card.isFaceUp || this.table.seats[s].player.userID == userID) {
                            hand.cards.push(card);
                        }
                        else {
                            // they get a card with no value, face-down
                            hand.cards.push(new FacedownCard());
                        }

                    }
                    else {

                        // shouldn't actually ever get here
                        hand.cards.push(new FacedownCard());

                    }


                }

            }  // if the seat has a hand

            table.seats[s].hand = hand;

        }

        return table;

    }  // createTableSnapshot


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `TableManager ${message}`);

    }

    private async seatPlayer(command: RequestSeatCommand): Promise<void> {

        let seatIndex = command.seatIndex;
        if (seatIndex === null) {

            for (let s = 0; s < this.table.seats.length; s++) {

                if (this.table.seats[s].player == null) {
                    seatIndex = s;
                    break;
                }

            }  // for each seat

        }  // no seat specified

        if (seatIndex === null) {

            return this.queueMessage(new Message('No seats available', command.user.id));

        }

        let seat = seatIndex < this.table.seats.length ? this.table.seats[seatIndex] : null;

        if (seat) {

            if (seat.player == null) {

                seat.player = new Player(command.user.id, command.user.name);

                this.queueAction(new PlayerSeatedAction(this.table.id, seat.player, seatIndex));

                return await this.checkStartHand();

            }

            return this.queueMessage(new Message(`${seat.getName()} is already taken`, command.user.id));

        }

        return this.queueMessage(new Message(`Could not find seat ${seatIndex}`, command.user.id));

    }


    private async sitIn(command: SitInCommand): Promise<void> {

        let player = this.findPlayer(command.userID);

        if (player) {

            // Only let them mark themselves as back in if they have chips (or are about to add some)
            if (player.getTotalChips() > 0) {

                player.isSittingOut = false;
                this.queueAction(new SittingOutAction(this.table.id, command.userID, false));

            }

        }

    }   // sitIn


    private findPlayer(userID: number): Player {

        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer




    private async addChips(command: AddChipsCommand): Promise<void> {

        if (command.amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return;

        }

        let player: Player = this.findPlayer(command.userID);

        if (!player) {
            return this.queueMessage(new Message('Player is not sitting at table', command.userID));
        }

        if (this.table.state.isHandInProgress()) {

            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;

            // TODO: create delayed AddChips action
            this.queueMessage(new Message(`${player.name} has bought in for ${command.amount} on the next hand`, command.userID));
            return;

        }

        player.chips += command.amount;

        this.queueAction(new AddChipsAction(this.table.id, player.userID, command.amount));
        this.queueAction(new StackUpdateAction(this.table.id, player.userID, player.chips));

    }



    private async checkStartHand(): Promise<void> {

        if (!this.table.state.isHandInProgress() && this.isReadyForHand()) {

            this.log(`Starting new hand`);
            return await this.goToNextState();

        }

    }  // checkStartHand


    private async ante(command: AnteCommand): Promise<void> {

        this.log(`Received AnteCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        if (this.table.state instanceof AnteState) {

            let bettorSeat: Seat = this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);

            if (!bettorSeat.isInHand) {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new Message('You are not in this hand', command.userID));

            }

            let ante: Bet = this.table.betTracker.addBet(bettorSeat, command.amount, this.table.stakes.ante);

            if (ante.isValid) {

                clearTimeout(this.betTimer);
                this.numTimersKilled++;
                this.logTimers();

                this.queueAction(new BetAction(this.table.id, bettorSeat.index, ante));
                this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
                this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

                await this.wait(this.TIME_ANTE);

                // this was maybe undefined, so make sure it is false
                bettorSeat.player.isSittingOut = false;

                return await this.advanceAnteTurn();

            }
            else {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new Message(ante.message, command.userID));

            }

        }

        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.queueMessage(new Message('It is not time to ante', command.userID));

    }  // ante



    private async bet(command: BetCommand): Promise<void> {

        this.log(`Received BetCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        if (this.table.state instanceof BetState) {

            let bettorSeat: Seat =  this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);

            let oldActionInitiator = this.table.betTracker.seatIndexInitiatingAction;

            let bet: Bet = this.table.betTracker.addBet(bettorSeat, command.amount, this.table.stakes.minRaise);

            if (bet.isValid) {

                clearTimeout(this.betTimer);
                this.numTimersKilled++;
                this.logTimers();

                this.queueAction(new BetAction(this.table.id, bettorSeat.index, bet));
                this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
                this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

                if (bet.betType == Bet.RAISE) {

                    let newActionInitiator = this.table.betTracker.seatIndexInitiatingAction;

                    this.log(`**************************************** RAISE: oldActionInitiator = ${oldActionInitiator}, newActionInitiator = ${newActionInitiator}`);

                }

                await this.wait(this.TIME_BET);

                return await this.advanceBetTurn();

            }
            else {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new Message(bet.message, command.userID));

            }

        }

        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // bet


    private async foldPlayer(folderSeat: Seat, fold: Fold): Promise<void> {

        clearTimeout(this.betTimer);
        this.numTimersKilled++;
        this.logTimers();

        // Take away their cards
        folderSeat.fold();

        // This will tell watchers that the given seat is no longer in the hand
        this.queueAction(new FoldAction(this.table.id, folderSeat.index, fold));

        return await this.advanceBetTurn();

    }   // foldPlayer


    private async fold(command: FoldCommand): Promise<void> {

        if (this.table.state instanceof BetState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.isInHand && seat.player && seat.player.userID == command.userID);

            let fold: Fold = this.table.betTracker.fold(folderSeat);

            if (fold.isValid) {

                return await this.foldPlayer(folderSeat, fold);

            }

            return this.queueMessage(new Message(fold.message, command.userID));

        }

        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // fold


    private tableSnapshot(command: TableSnapshotCommand): void {

        // Create a snapshot of the table situation, from the given player's perspective
        let table: Table = this.createTableSnapshot(command.userID);

        let tableAction: TableSnapshotAction = new TableSnapshotAction(table.id, table);

        this.log('Generating private snapshot message');
        this.queueMessage(new ActionMessage(tableAction, command.userID));

        // Tell the user which game we are playing at this table
        this.queueMessage(new ActionMessage(new SetGameAction(table.id, this.game.id), command.userID));

    }


    private isReadyForHand(): boolean {

        let numPlayers = 0;

        for (let seat of this.table.seats) {

            if (seat.player) {

                // isSittingOut could either be undefined or false. If undefined then we will give them a chance to pay the ante/blind (if required)
                if (seat.player.chips === 0) {

                    seat.player.isSittingOut = true;

                }

                if (!seat.player.isSittingOut) {
                    numPlayers++;
                }

            }

        }

        this.log(`In isReadyForHand, numPlayers = ${numPlayers}`);
        return numPlayers > 1;

    }  // isReadyForHand


    private isHandStillLive(): boolean {

        return this.table.seats.filter(seat => seat.isInHand).length > 1;

    }   // isHandStillLive





    private countPlayersInHand(): number {

        return this.table.seats.filter(s => s.isInHand).length;

    }  // countPlayersInHand


    private doBetweenHandsBusiness() {

        for (let seat of this.table.seats) {

            // If we're between hands, then none of the seats are in a hand, right?
            seat.isInHand = false;
            this.queueAction(new IsInHandAction(this.table.id, seat.index, seat.isInHand));

            if (seat.player) {

                if (seat.player.chipsToAdd) {

                    this.queueAction(new AddChipsAction(this.table.id, seat.player.userID, seat.player.chipsToAdd));

                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    seat.player.chipsToAdd = 0;

                    this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                }   // they have chips waiting to add

                if (seat.player.chips === 0) {

                    // if they have no chips then they are automatically sitting out
                    seat.player.isSittingOut = true;

                    // Tell the world this player is sitting out
                    this.queueAction(new SittingOutAction(this.table.id, seat.player.userID, true));

                }

            }

        }

    }  // doBetweenHandsBusiness


    private async changeTableState(state: TableState): Promise<void> {

        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);

        this.queueAction(new TableStateAction(this.table.id, state));

        if (state.requiresMultiplePlayers()) {

            if (this.countPlayersInHand() < 2) {

                // blow through this state since there is 0 or 1 person still in the hand at the table.
                return await this.goToNextState();
            }

        }

        if (!state.isHandInProgress()) {

            this.doBetweenHandsBusiness();

            if (this.isReadyForHand()) {

                // start the next hand
                return await this.goToNextState();

            }

            this.log('Table not ready for next hand');
            return;

        }


        if (state instanceof StartHandState) {

            return await this.startHand();

        }

        if (state instanceof DealState) {

            return await this.dealRound(state);

        }

        if (state instanceof AnteState) {

            return await this.collectAntes(state);

        }

        if (state instanceof BetState) {

            return await this.makeYourBets(state);

        }

        if (state instanceof ShowdownState) {

            return await this.showdown(state);
        }

        if (state instanceof HandCompleteState) {

            return await this.completeHand(state);
        }

    }


    private async startHand(): Promise<void> {

        this.deck.shuffle();

        this.table.betTracker.reset();
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

        for (let seat of this.table.seats) {

            if (seat.player) {

                // if they're not explicitly sitting out, then we will treat them as in so that we can check them for antes/blinds/cards to deal/etc
                seat.isInHand = !seat.player.isSittingOut;

            }
            else {

                seat.isInHand = false;

            }

            this.queueAction(new IsInHandAction(this.table.id, seat.index, seat.isInHand));

        }

        await this.setButton();

        return await this.goToNextState();

    }   // startHand


    private async setButton(): Promise<void> {

        if (!this.isHandStillLive()) {

            // We don't have enough players, so go back to the open state
            return await this.changeTableState(this.game.stateMachine.goToOpenState());

        }

        let foundButton = false;
        let buttonIndex: number = this.table.buttonIndex == null ? 0 : (this.table.buttonIndex + 1);

        while (!foundButton) {

            if (buttonIndex >= this.table.seats.length) {

                buttonIndex = 0;

            }

            if (this.table.seats[buttonIndex].isInHand) {
                foundButton = true;
            }
            else {
                buttonIndex++;
            }

        }

        this.table.buttonIndex = buttonIndex;

        this.queueAction(new MoveButtonAction(this.table.id, this.table.buttonIndex));

        await this.wait(this.TIME_SET_BUTTON);

    }   // setButton


    private findNextSeatWithAHand(seatIndex: number): number {

        let nextPosition: number = seatIndex;

        if (nextPosition >= this.table.seats.length) {
            nextPosition = 0;
        }

        while (!this.table.seats[nextPosition].isInHand) {

            nextPosition++;

            if (nextPosition >= this.table.seats.length) {
                nextPosition = 0;
            }

            if (nextPosition == seatIndex) {
                throw new Error("Could not find the next player");
            }

        }

        return nextPosition;

    }   // findNextOccupiedSeatIndex


    private async checkNeedsCard(dealState: DealState, seatIndex: number): Promise<void> {

        if (seatIndex >= this.table.seats.length) {

            seatIndex = 0;

        }


        if (this.table.seats[seatIndex].isInHand) {

            // deal this player a card
            let card = this.deck.deal();
            let seat = this.table.seats[seatIndex];
            let userID = seat.player.userID;

            card.isFaceUp = dealState.isFaceUp;

            this.table.seats[seatIndex].deal(card);

            if (card.isFaceUp) {

                // It's face-up, so there is only a public action
                this.queueAction(new DealCardAction(this.table.id, seatIndex, card));

            }
            else {

                // It's face-down, so the public action does not include the card info, whereas the private action does
                let publicMessage = new ActionMessage(new DealCardAction(this.table.id, seatIndex, new FacedownCard()));
                let privateMessage = new ActionMessage(new DealCardAction(this.table.id, seatIndex, card), userID);

                this.queueMessage(new MessagePair(publicMessage, privateMessage));

            }

            await this.wait(this.TIME_DEAL_CARD);

        }

        // we didn't do anything with this place, but see if we need to keep going
        return await this.postDealtCard(dealState, seatIndex);

    }  // checkNeedsCard


    private async postDealtCard(dealState: DealState, dealtSeatIndex: number) : Promise<void> {

        if (dealtSeatIndex == this.table.buttonIndex) {

            // we are done with the button's position (card dealt or not)
            return await this.goToNextState();

        }

        await this.checkNeedsCard(dealState, dealtSeatIndex + 1);

    }  // postDealtCard


    private async dealRound(dealState: DealState): Promise<void> {

        // start one past the button
        await this.checkNeedsCard(dealState, this.table.buttonIndex + 1);

    }   // dealRound


    private async wait(milliseconds: number): Promise<void> {

        return new Promise(res => setTimeout(res, milliseconds));

    }


    private async collectAntes(anteState: AnteState): Promise<void> {

        this.log('In collectAntes');

        this.table.betTracker.clearBets();
        this.table.betTracker.setAnte(this.table.stakes.ante);

        if (this.table.stakes.ante === 0) {

            this.log('No ante - moving on');
            return await this.goToNextState();

        }

        return await this.validateAnteerOrMoveOn(this.table.buttonIndex + 1);

    }   // collectAntes


    private async validateAnteerOrMoveOn(bettorSeatIndex: number): Promise<void> {

        let done: boolean = false;

        while (!done) {

            if (bettorSeatIndex >= this.table.seats.length) {
                bettorSeatIndex = 0;
            }

            if (bettorSeatIndex == this.table.betTracker.seatIndexInitiatingAction) {

                // We're back to the beginning

                // TODO: See how many people ante'd - if not at least 2 then don't continue
                // TODO: Return antes that have already been given if we're not continuing

                await this.completeBetting();

                if (!this.isReadyForHand()) {

                    // We don't have enough players, so go back to the open state
                    return await this.changeTableState(this.game.stateMachine.goToOpenState());

                }


                return await this.goToNextState();

            }

            if (this.table.betTracker.seatIndexInitiatingAction == null) {

                this.table.betTracker.seatIndexInitiatingAction = bettorSeatIndex;

            }

            if (this.table.seats[bettorSeatIndex].isInHand && this.table.seats[bettorSeatIndex].player) {

                done = true;

            }
            else {

                // Otherwise, keep moving the marker
                bettorSeatIndex = bettorSeatIndex + 1;

            }

        }  // while !done

        await this.setAnteTurn(bettorSeatIndex);

    }  // validateAnteerOrMoveOn


    private async setAnteTurn(seatIndexToAct: number): Promise<void> {

        // assume they're in, at least until they fail to pay the ante.
        // The table won't take the ante bet if they're not marked as in already.
        // They need to have a blank hand for the table to accept the ante as a bet
        let anteSeat: Seat = this.table.seats[seatIndexToAct];

        this.table.betTracker.seatIndex = seatIndexToAct;
        this.table.betTracker.timeToAct = this.table.rules.timeToAnte;

        this.numTimers++;
        this.logTimers();

        // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending an Ante command
        this.betTimer = setTimeout(async () => {

            this.numTimersElapsed++;
            this.logTimers();

            return this.rejectAnte(anteSeat);

        }, this.table.rules.timeToAnte * 1000);

        this.queueAction(new AnteTurnAction(this.table.id, this.snapshot(this.table.betTracker)));

    }  // setAnteTurn


    private async rejectAnte(anteSeat: Seat): Promise<void> {

        clearTimeout(this.betTimer);
        this.numTimersKilled++;
        this.logTimers();

        this.log(`${anteSeat.getName()} did not ante - marking as sitting out`);

        // they didn't pay the ante, so they're OUT
        anteSeat.isInHand = false;
        anteSeat.player.isSittingOut = true;

        // Tell the world this player is sitting out
        this.queueAction(new IsInHandAction(this.table.id, anteSeat.index, anteSeat.isInHand));
        this.queueAction(new SittingOutAction(this.table.id, anteSeat.player.userID, true));

        return await this.advanceAnteTurn();

    }   // rejectAnte


    private async advanceAnteTurn(): Promise<void> {

        // this.log('In advanceAnteTurn');
        if (!(this.table.state instanceof AnteState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        return await this.validateAnteerOrMoveOn(this.table.betTracker.seatIndex + 1);

    }   // advanceAnteTurn



    private async makeYourBets(betState: BetState): Promise<void> {

        this.log('In makeYourBets');

        this.table.betTracker.clearBets();

        let firstSeatIndexWithAction: number = this.findFirstToBet(betState.firstToBet);

        if (firstSeatIndexWithAction == null) {

            this.log('No betting action this round');
            return await this.goToNextState();

        }

        return await this.validateBettorOrMoveOn(firstSeatIndexWithAction);

    }   // makeYourBets


    private async validateBettorOrMoveOn(bettorSeatIndex: number): Promise<void> {

        let done: boolean = false;

        while (!done) {

            if (bettorSeatIndex == this.table.betTracker.seatIndexInitiatingAction) {

                await this.completeBetting();

                return await this.goToNextState();

            }

            if (this.table.seats[bettorSeatIndex].player && this.table.seats[bettorSeatIndex].player.chips > 0) {

                done = true;

            }
            else {

                // Otherwise, keep moving the marker
                bettorSeatIndex = this.findNextSeatWithAHand(bettorSeatIndex + 1);

            }

        }  // while !done

        await this.setBetTurn(bettorSeatIndex);

    }  // validateBettorOrMoveOn


    private async completeBetting(): Promise<void> {

        // It is no longer anyone's turn to act, so turn off the actor and broadcast this state to everyone
        this.table.betTracker.seatIndex = null;
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));


        console.log('Server: gather bets');
        this.queueAction(new GatherBetsAction(this.table.id));
        this.table.betTracker.gatherBets();
        console.log('Server: update bets');

        // give it a minute before clearing out all the actions
        await this.wait(this.TIME_BETTING_COMPLETE);

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
        this.checkBetsToReturn();

        console.log('Server: betting is complete');

        console.log('Server: sending BettingCompleteAction');
        this.queueAction(new BettingCompleteAction(this.table.id));
        this.log('Betting complete');

//        return await this.wait(this.TIME_BETTING_COMPLETE);

    }  // completeBetting


    private logTimers() {

        // this.log(`numTimers: ${this.numTimers}, numTimersElapsed: ${this.numTimersElapsed}, numTimersKilled: ${this.numTimersKilled}`);

    }

    private async setBetTurn(seatIndexToAct: number): Promise<void> {

        this.table.betTracker.seatIndex = seatIndexToAct;
        this.table.betTracker.timeToAct = this.table.rules.timeToAct;

        this.numTimers++;
        this.logTimers();

        // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending a command
        this.betTimer = setTimeout(async () => {

            this.numTimersElapsed++;
            this.logTimers();

            let checkerSeat = this.table.seats[this.table.betTracker.seatIndex];

            // try to check
            let check: Bet = this.table.betTracker.addBet(checkerSeat, 0, this.table.stakes.minRaise);

            if (check.isValid) {

                this.queueAction(new BetAction(this.table.id, checkerSeat.index, check));
                return await this.advanceBetTurn();

            }

            let fold: Fold = this.table.betTracker.fold(checkerSeat);

            if (fold.isValid) {

                return await this.foldPlayer(checkerSeat, fold);

            }

            throw new Error(`TableManager could not check or fold ${checkerSeat.getSeatName()}` );

        }, this.table.rules.timeToAct * 1000);

        this.queueAction(new BetTurnAction(this.table.id, this.snapshot(this.table.betTracker)));

    }  // setBetTurn


    private async advanceBetTurn(): Promise<void> {

        // this.log('In advanceBetTurn');
        if (!(this.table.state instanceof BetState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        return await this.validateBettorOrMoveOn(this.findNextSeatWithAHand(this.table.betTracker.seatIndex + 1));

    }   // advanceBetTurn


    private findFirstToBet(firstBetRule: number): number {

        // First count how many players CAN act this round - if only 1 (or 0) then there's nothing to do
        // This is not the same as blowing through rounds because we're down to just one player because everyone else folded.
        // In this case, at least one person must be all-in, so we're going to keep dealing cards, but we don't need to bet.
        if (this.table.seats.filter(s => s.isInHand && s.player && s.player.chips).length < 2) {

            // we don't have 2 players with money, so dump out
            return null;

        }

        switch (firstBetRule) {
        
            case BetState.FIRST_POSITION:
                {
                    return this.findNextSeatWithAHand(this.table.buttonIndex + 1);
                }

            case BetState.BEST_HAND:
                {
                    let handWinners: Array<HandWinner> = this.findWinners();
                    return handWinners[0].seatIndex;
                }
        
        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }   // findFirstToBet


    private findWinners(): Array<HandWinner> {

        let handWinners: Array<HandWinner> = new Array<HandWinner>();

        for (let seat of this.table.seats) {

            if (seat.hand) {

                // Put their best hand on the list
                handWinners.push(new HandWinner(this.game.handSelector.select(this.game.handEvaluator, seat.hand, this.table.board), seat.index, 0))

            }

        }

        // rank the hands, from best to worst
        handWinners.sort(function (w1, w2) {

            let compare = w1.evaluation.compareTo(w2.evaluation);

            if (compare > 0) {

                // The first hand is better, so keep it first in the list
                return -1;
            }

            if (compare < 0) {

                // the first hand is worse, so swap them
                return 1;
            }

            // They have the same value, so go with the earlier seat
            // TODO: depending on where the button is, then higher-numbered seats could be in earlier position than lower-numbered seats
            return 0;

        });

        return handWinners;

    }


    private checkBetsToReturn() {

        let potIndexesToKill: Set<number> = new Set<number>();

        for (let pot of this.table.betTracker.pots) {

            if (pot.getNumPlayers() === 1) {

                // Convert the set (of 1 element) to an array, and take its first element
                let seat = this.table.seats[pot.getSeatsInPot()[0]];

                if (seat) {

                    potIndexesToKill.add(pot.index);

                    this.queueAction(new BetReturnedAction(this.table.id, seat.index, pot.amount));

                    if (seat.player) {

                        seat.player.chips += pot.amount;
                        this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                    }  // if player is not null

                }  // if seat

            }   // if pot only has 1 bettor in it

        }

        if (potIndexesToKill.size > 0) {

            this.table.betTracker.killPots(potIndexesToKill);
            this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

        }

    } // checkBetsToReturn


    private async showdown(showdownState: ShowdownState): Promise<void> {


        let isShowdownRequired = this.countPlayersInHand() > 1;

        if (isShowdownRequired) {

            // Flip all the cards face-up
            for (let seat of this.table.seats) {

                if (seat.hand) {

                    seat.hand.flipCards();

                    this.queueAction(new FlipCardsAction(this.table.id, seat.index, seat.hand))

                }

            }

        }

        // We have to find the winners and evaluate hands AFTER we have flipped the cards face-up
        let winners: HandWinner[] = this.findWinners();

        if (isShowdownRequired) {

            this.declareHands(winners);

        }

        await this.wait(this.TIME_SHOWDOWN);

        for (let winner of winners) {
            this.log(`TableManager: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }

        while (this.table.betTracker.pots.length) {

            let pot: Pot = this.table.betTracker.pots.shift();

            let potWinningHand = null;
            let potWinnerSeatIndexes = new Set<number>();

            for (let winner of winners) {

                if (pot.isInPot(winner.seatIndex)) {

                    if (potWinningHand == null) {

                        potWinningHand = winner.evaluation;
                        potWinnerSeatIndexes.add(winner.seatIndex);

                    }
                    else if (winner.evaluation.compareTo(potWinningHand) >= 0) {

                        // Should never be *greater*, since we're going in descending order of hand strength
                        potWinnerSeatIndexes.add(winner.seatIndex);

                    }

                }

            }

            let equalShare: number = Math.floor(pot.amount / potWinnerSeatIndexes.size);
            let remainder = pot.amount - (potWinnerSeatIndexes.size * equalShare);

            for (let seatIndex of potWinnerSeatIndexes) {

                let winnerHand = winners.find(hw => hw.seatIndex == seatIndex);

                if (winnerHand) {

                    let player = this.table.seats[seatIndex].player;

                    if (player) {

                        let winnerEvaluation = isShowdownRequired ? winnerHand.evaluation : null;

                        let wonPot = new WonPot(pot.index, equalShare + remainder, seatIndex, winnerEvaluation);
                        this.queueAction(new WinPotAction(this.table.id, wonPot));

                        player.chips += (equalShare + remainder);

                        remainder = 0;

                    }

                }

            }

            // we have popped the pot off, so update that so it effectively gets replaced by the WonPot objects
            this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

            await this.wait(this.TIME_WIN_POT);

        }  // while we have pots to work through


        // Update all the player chip counts at once
        for (let seat of this.table.seats) {

            if (seat.player) {

                this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

            }

        }

        // clear all betting action
        this.table.betTracker.reset();
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

        await this.wait(this.TIME_POST_SHOWDOWN);

        return await this.goToNextState();

    }   // showdown


    private declareHands(winners: HandWinner[]): void {

        let declaredSet: Set<number> = new Set<number>();

        let handIndex: number = this.findNextSeatWithAHand(this.table.buttonIndex+1);

        while (!declaredSet.has(handIndex)) {

            let handWinner: HandWinner = winners.find(w => w.seatIndex == handIndex);

            if (handWinner) {

                this.queueAction(new DeclareHandAction(this.table.id, handIndex, handWinner.evaluation));

            }

            // Mark it as seen for when we come back around
            declaredSet.add(handIndex);

            handIndex = this.findNextSeatWithAHand(handIndex+1);

        }

    }



    private async completeHand(completeState: HandCompleteState): Promise<void> {

        // We're done with this hand - go to the next one

        this.queueAction(new HandCompleteAction(this.tableID));
        await this.wait(this.TIME_COMPLETE_HAND);

        return await this.goToNextState();

    }   // completeHand


    private async goToNextState(): Promise<void> {

        let nextState: TableState = this.game.stateMachine.nextState();

        // this.log(`Changing to next state: ${(nextState == null ? 'null' : nextState.constructor.name)}`);

        await this.changeTableState(nextState);

     }







}