import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { Player } from "../../players/player";
import { AddChipsCommand } from "../../commands/table/add-chips-command";
import { OpenState } from "./states/open-state";
import { StartHandState } from "./states/start-hand-state";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/players/player-seated-action";
import { MoveButtonAction } from "../../actions/table/game/move-button-action";
import { DealState } from "./states/deal-state";
import { DealtCard } from "../../hands/dealt-card";
import { Hand } from "../../hands/hand";
import { BetState } from "./states/betting/bet-state";
import { ShowdownState } from "./states/showdown-state";
import { HandCompleteState } from "./states/hand-complete-state";
import { HandWinner } from "../../games/hand-winner";
import { TableSnapshotAction } from "../../actions/table/state/table-snapshot-action";
import { UpdateBetsAction } from "../../actions/table/betting/update-bets-action";
import { WinPotAction } from "../../actions/table/game/win-pot-action";
import { StackUpdateAction } from "../../actions/table/players/stack-update-action";
import { BetCommand } from "../../commands/table/bet-command";
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
import { SetHandAction } from "../../actions/table/game/set-hand-action";
import { FoldAction } from "../../actions/table/betting/fold-action";
import { TableState } from "./states/table-state";
import { AnteAction } from "../../actions/table/betting/ante-action";
import { DealCardAction } from "../../actions/table/game/deal-card-action";
import { BetTurnAction } from "../../actions/table/game/bet-turn-action";
import { BetReturnedAction } from "../../actions/table/game/bet-returned-action";
import { FlipCardsAction } from "../../actions/table/game/flip-cards-action";
import { Deck } from "../../cards/deck";
import { TableStateAction } from "../../actions/table/state/table-state-action";
import { MessagePair } from "../../messages/message-pair";
import { DeepCopier } from "../../communication/deep-copier";
import { PokerHandDescriber, DeclareHandAction } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { PlayerActiveAction } from "../../actions/table/players/player-active-action";
import { BettingCompleteAction } from "../../actions/table/betting/betting-complete-action";

const logger: Logger = new Logger();


export class TableManager implements CommandHandler, MessageBroadcaster {

    private readonly ALL_ACCESS: number = -1;

    private readonly TIME_DEAL_CARD: number = 750;
    private readonly TIME_BETTING_COMPLETE: number = 2000;

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



    private processCommand(command: Command): void {

        if (command instanceof RequestSeatCommand) {

            return this.seatPlayer(command);

        }

        if (command instanceof AddChipsCommand) {

            return this.addChips(command);

        }

        if (command instanceof BetCommand) {

            return this.bet(command);

        }

        if (command instanceof FoldCommand) {

            return this.fold(command);
        }

        if (command instanceof TableSnapshotCommand) {

            return this.tableSnapshot(command);

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

                    if (card.isFaceUp) {
                        hand.cards.push(card);
                    }
                    else if (this.table.seats[s].player.userID == userID) {
                        hand.cards.push(card);
                    }
                    else {
                        // they get a card with no value, face-down
                        hand.cards.push(new DealtCard(null, false));
                    }

                }

            }  // if the seat has a hand

            table.seats[s].hand = hand;

        }

        return table;

    }  // createTableSnapshot


    private log(message: string): void {

        // console.log('\x1b[31m%s\x1b[0m', `TableManager ${message}`);

    }

    private seatPlayer(command: RequestSeatCommand): void {

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

                this.checkStartHand();

                return;

            }

            return this.queueMessage(new Message(`${seat.getName()} is already taken`, command.user.id));

        }

        return this.queueMessage(new Message(`Could not find seat ${seatIndex}`, command.user.id));

    }


    private findPlayer(userID: number): Player {

        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer




    private addChips(command: AddChipsCommand): void {

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



    private checkStartHand(): void {

        if (!this.table.state.isHandInProgress() && this.isReadyForNextHand()) {

            this.log(`Starting new hand`);
            return this.goToNextState();

        }

    }  // checkStartHand



    private bet(command: BetCommand): void {

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

                return this.advanceBetTurn();

            }
            else {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new Message(bet.message, command.userID));

            }

        }

        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // bet


    private foldPlayer(folderSeat: Seat, fold: Fold): void {

        clearTimeout(this.betTimer);
        this.numTimersKilled++;
        this.logTimers();

        // Take away their cards
        folderSeat.hand = null;

        // This will tell watchers that the given seat is no longer in the hand
        this.queueAction(new SetHandAction(this.table.id, folderSeat.index, false));
        this.queueAction(new FoldAction(this.table.id, folderSeat.index, fold));

        this.advanceBetTurn();

    }   // foldPlayer


    private fold(command: FoldCommand): void {

        if (this.table.state instanceof BetState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.hand && seat.player && seat.player.userID == command.userID);

            let fold: Fold = this.table.betTracker.fold(folderSeat);

            if (fold.isValid) {

                return this.foldPlayer(folderSeat, fold);

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



    private isReadyForNextHand(): boolean {

        return this.table.seats.filter(seat => seat.player && seat.player.isActive && seat.player.chips > 0).length > 1;

    }

    private isReadyForThisHand(): boolean {

        return this.table.seats.filter(seat => seat.player && seat.player.isActive).length > 1;

    }



    private countPlayersInHand(): number {

        return this.table.seats.filter(s => s.hand).length;

    }  // countPlayersInHand


    private doBetweenHandsBusiness() {

        for (let seat of this.table.seats) {

            if (seat.player) {

                if (seat.player.chipsToAdd) {

                    this.queueAction(new AddChipsAction(this.table.id, seat.player.userID, seat.player.chipsToAdd));

                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    seat.player.chipsToAdd = 0;

                    this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                }   // they have chips waiting to add

                if (seat.player.chips == 0) {

                    seat.player.isActive = false;

                    // Tell the world this player is sitting out
                    this.queueAction(new PlayerActiveAction(this.table.id, seat.player.userID, seat.index, false));

                }

            }

        }

    }  // doBetweenHandsBusiness


    private changeTableState(state: TableState): void {

        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);

        this.queueAction(new TableStateAction(this.table.id, state));

        if (state.requiresMultiplePlayers()) {

            if (this.countPlayersInHand() < 2) {

                // blow through this state since there is 0 or 1 person still in the hand at the table.
                return this.goToNextState();
            }

        }

        if (!state.isHandInProgress()) {

            this.doBetweenHandsBusiness();

            if (this.isReadyForNextHand()) {

                // start the next hand
                return this.goToNextState();

            }

            this.log('Table not ready for next hand');
            return;

        }


        if (state instanceof StartHandState) {

            return this.startHand();

        }

        if (state instanceof DealState) {

            return this.dealRound(state);

        }

        if (state instanceof BetState) {

            return this.makeYourBets(state);

        }

        if (state instanceof ShowdownState) {

            return this.showdown(state);
        }

        if (state instanceof HandCompleteState) {

            return this.completeHand(state);
        }

    }


    private startHand() {

        this.deck.shuffle();

        this.table.betTracker.reset();

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

        for (let seat of this.table.seats) {

            // Start off without a hand for the seat...
            seat.hand = null;

            if (seat.player && seat.player.isActive) {

                // assume they're in, at least until they fail to pay the ante.
                // The table won't take the ante bet if they're not marked as in already.
                // They need to have a blank hand for the table to accept the ante as a bet
                seat.hand = new Hand();

                if (this.table.stakes.ante > 0) {

                    // this.log(`There is an ante, and ${seat.getName()} is playing`);

                    // set the betting to the ante's seat or it will not be accepted
                    this.table.betTracker.seatIndex = seat.index;

                    // the minimum amoutn will be the ante - this doesn't respect the minimums for a regular betting round.
                    let ante: Bet = this.table.betTracker.addBet(seat, this.table.stakes.ante, this.table.stakes.ante);

                    // this.log(`ante result: ${ante}`);

                    if (ante.isValid) {

                        this.queueAction(new AnteAction(this.table.id, seat.index, ante));
                        this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));
                        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

                    }  // valid ante
                    else {

                        // this.log(`${seat.getName()} had an invalid ante: ${ante.message} and is being marked as inactive`);

                        // they didn't pay the ante, so take away their (blank) cards
                        seat.hand = null;

                        seat.player.isActive = false;

                        // Tell the world this player is sitting out
                        this.queueAction(new PlayerActiveAction(this.table.id, seat.player.userID, seat.index, false));

                    }

                }  // if there is an ante

            }

            else {

                // this.log(`${seat.getName()} is sitting out`);
                seat.hand = null;

            }

            // This will tell watchers whether or not the given seat is in the hand
            this.queueAction(new SetHandAction(this.table.id, seat.index, seat.hand != null));

        }  // for each seat


        this.completeBetting();

        setTimeout(() => {

            if (!this.isReadyForThisHand()) {

                // We don't have enough players, so go back to the open state
                return this.changeTableState(this.game.stateMachine.goToOpenState());

            }

            this.setButton();

            this.goToNextState();

        }, this.TIME_BETTING_COMPLETE);


    }   // startHand


    private setButton(): void {

        this.table.buttonIndex = this.findNextSeatWithAHand(this.table.buttonIndex == null ? 0 : this.table.buttonIndex + 1);

        this.queueAction(new MoveButtonAction(this.table.id, this.table.buttonIndex));

    }

    private findNextSeatWithAHand(seatIndex: number): number {

        let nextPosition: number = seatIndex;

        if (nextPosition >= this.table.seats.length) {
            nextPosition = 0;
        }

        while (!this.table.seats[nextPosition].hand) {

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


    private checkNeedsCard(dealState: DealState, seatIndex: number): void {

        if (seatIndex >= this.table.seats.length) {

            seatIndex = 0;

        }

        if (this.table.seats[seatIndex].hand) {

            // deal this player a card
            let card = this.deck.deal();
            let seat = this.table.seats[seatIndex];
            let userID = seat.player.userID;

            let dealtCard = new DealtCard(card, dealState.isFaceUp);

            this.table.seats[seatIndex].hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                // It's face-up, so there is only a public action
                this.queueAction(new DealCardAction(this.table.id, seatIndex, card));

            }
            else {

                // It's face-down, so the public action does not include the card info, whereas the private action does
                let publicMessage = new ActionMessage(new DealCardAction(this.table.id, seatIndex, null));
                let privateMessage = new ActionMessage(new DealCardAction(this.table.id, seatIndex, card), userID);

                this.queueMessage(new MessagePair(publicMessage, privateMessage));

            }

            setTimeout(() => {

                this.postDealtCard(dealState, seatIndex);

            }, this.TIME_DEAL_CARD);

            return;

        }

        // we didn't do anything with this place, but see if we need to keep going
        return this.postDealtCard(dealState, seatIndex);

    }  // checkNeedsCard


    private postDealtCard(dealState: DealState, dealtSeatIndex: number) : void {

        if (dealtSeatIndex == this.table.buttonIndex) {

            // we are done with the button's position (card dealt or not)
            return this.goToNextState();

        }

        this.checkNeedsCard(dealState, dealtSeatIndex + 1);

    }  // postDealtCard


    private dealRound(dealState: DealState): void {

        // start one past the button
        this.checkNeedsCard(dealState, this.table.buttonIndex + 1);

    }   // dealRound




    private makeYourBets(betState: BetState): void {

        this.log('In makeYourBets');

        this.table.betTracker.clearBets();

        let firstSeatIndexWithAction: number = this.findFirstToBet(betState.firstToBet);

        if (firstSeatIndexWithAction == null) {

            this.log('No betting action this round');
            return this.goToNextState();

        }

        this.validateBettorOrMoveOn(firstSeatIndexWithAction);

    }   // makeYourBets


    private validateBettorOrMoveOn(bettorSeatIndex: number): void {

        let done: boolean = false;

        while (!done) {

            if (bettorSeatIndex == this.table.betTracker.seatIndexInitiatingAction) {

                this.completeBetting();

                setTimeout(() => {

                    return this.goToNextState();

                }, this.TIME_BETTING_COMPLETE);


                return;

            }

            if (this.table.seats[bettorSeatIndex].player && this.table.seats[bettorSeatIndex].player.chips > 0) {

                done = true;

            }
            else {

                // Otherwise, keep moving the marker
                bettorSeatIndex = this.findNextSeatWithAHand(bettorSeatIndex + 1);

            }

        }  // while !done

        this.setBetTurn(bettorSeatIndex);


    }  // validateBettorOrMoveOn


    private completeBetting() {

        this.table.betTracker.gatherBets();
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
        this.checkBetsToReturn();

        this.queueAction(new BettingCompleteAction(this.table.id));

        this.log('Betting complete');

    }  // bettingComplete


    private logTimers() {

        // this.log(`numTimers: ${this.numTimers}, numTimersElapsed: ${this.numTimersElapsed}, numTimersKilled: ${this.numTimersKilled}`);

    }

    private setBetTurn(seatIndexToAct: number): void {

        this.table.betTracker.seatIndex = seatIndexToAct;
        this.table.betTracker.timeToAct = this.table.rules.timeToAct;

        this.numTimers++;
        this.logTimers();

        this.betTimer = setTimeout(() => {

            this.numTimersElapsed++;
            this.logTimers();

            let checkerSeat = this.table.seats[this.table.betTracker.seatIndex];

            // try to check
            let check: Bet = this.table.betTracker.addBet(checkerSeat, 0, this.table.stakes.minRaise);

            if (check.isValid) {

                this.queueAction(new BetAction(this.table.id, checkerSeat.index, check));
                return this.advanceBetTurn();

            }

            let fold: Fold = this.table.betTracker.fold(checkerSeat);

            if (fold.isValid) {

                return this.foldPlayer(checkerSeat, fold);

            }

            throw new Error(`TableManager could not check or fold ${checkerSeat.getSeatName()}` );

        }, this.table.rules.timeToAct * 1000);

        this.queueAction(new BetTurnAction(this.table.id, this.snapshot(this.table.betTracker)));

    }  // setBetTurn


    private advanceBetTurn(): void {

        // this.log('In advanceBetTurn');
        if (!(this.table.state instanceof BetState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        this.validateBettorOrMoveOn(this.findNextSeatWithAHand(this.table.betTracker.seatIndex + 1));

    }   // advanceBetTurn


    private findFirstToBet(firstBetRule: number): number {

        // First count how many players CAN act this round - if only 1 (or 0) then there's nothing to do
        // This is not the same as blowing through rounds because we're down to just one player because everyone else folded.
        // In this case, at least one person must be all-in, so we're going to keep dealing cards, but we don't need to bet.
        if (this.table.seats.filter(s => s.hand && s.player && s.player.chips).length < 2) {

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


    private showdown(showdownState: ShowdownState) {


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


        for (let winner of winners) {
            this.log(`TableManager: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }

        for (let pot of this.table.betTracker.pots) {

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

                        this.queueAction(new WinPotAction(this.table.id, seatIndex, pot.index, winnerEvaluation, equalShare + remainder));

                        player.chips += (equalShare + remainder);

                        this.queueAction(new StackUpdateAction(this.table.id, player.userID, player.chips));

                        remainder = 0;

                    }

                }

            }

        }  // for each Pot

        // clear the pots
        this.table.betTracker.reset();
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));

        this.goToNextState();

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



    private completeHand(completeState: HandCompleteState) {

        // We're done with this hand - go to the next one

        // This will preserve the `this` reference in the call
        setTimeout(() => {

             this.goToNextState();

        }, 3000);

    }   // completeHand


    private goToNextState(): void {

        let nextState: TableState = this.game.stateMachine.nextState();

        // this.log(`Changing to next state: ${(nextState == null ? 'null' : nextState.constructor.name)}`);

        this.changeTableState(nextState);

     }







}