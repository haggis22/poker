import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { Player } from "../../players/player";
import { AddChipsCommand } from "../../commands/table/add-chips-command";
import { StartGameCommand } from "../../commands/table/start-game-command";
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
import { MoneyFormatter } from "../../clients/chips/money-formatter";
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
import { IChipFormatter } from "../../clients/chips/chip-formatter";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { TableAction } from "../../actions/table/table-action";
import { Deck } from "../../cards/deck";

const logger: Logger = new Logger();


export class TableManager implements CommandHandler, CommandBroadcaster, MessageBroadcaster, MessageHandler {

    private readonly ALL_ACCESS: number = -1;

    private isMaster: boolean;
    public tableID: number;

    private table: Table;
    private deck: Deck;


    private commandHandlers: CommandHandler[];
    private messageHandlers: MessageHandler[];

    private betTimer: ReturnType<typeof setTimeout>;

    private numTimers: number;
    private numTimersElapsed: number;
    private numTimersKilled: number;


    constructor(isMaster: boolean, tableID: number, table: Table, deck: Deck) {

        this.isMaster = isMaster;
        this.tableID = tableID;
        this.table = table;
        this.deck = deck;

        this.commandHandlers = new Array<CommandHandler>();
        this.messageHandlers = new Array<MessageHandler>();

        this.numTimers = this.numTimersElapsed = this.numTimersKilled = 0;
    }

    public registerMessageHandler(handler: MessageHandler): void {

        this.messageHandlers.push(handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.messageHandlers = this.messageHandlers.filter(o => o != handler);

    }


    public handleMessage(publicMessage: Message, privateMessage?: Message): void {

        // By the time it gets here, there should never be a privateMessage

        let message: ActionMessage = publicMessage as ActionMessage;

        if (message && message.action instanceof TableAction) {

            if (this.handleAction(message.action)) {

                // We have handled it
                return;

            }

        }

        // Pass it along
        this.broadcastMessage(publicMessage);

    }

    private handleAction(action: TableAction): boolean {

        if (!action || action.tableID !== this.tableID) {

            // Not a TableAction, or not my table - I don't care
            return false;

        }

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.grabTableData(action);
                return true;

            }

            // we don't have a table yet, so we can't do anything
            return false;

        }

        if (action instanceof PlayerSeatedAction) {

            // this.log(` yes - it is a PlayerSeatedAction`);
            this.seatPlayer(action);
            return true;

        }

        if (action instanceof AddChipsAction) {

            // This is just a pass-through notification; only update the chip count on a StackUpdateAction
            this.broadcastAction(action);
            return true;
        }

        if (action instanceof StackUpdateAction) {

            this.updateStack(action);
            return true;
        }


        /*
        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof SetHandAction) {

            return this.setHand(action);
        }



        if (action instanceof DealCardAction) {

            return this.dealCard(action);
        }

        if (action instanceof BetTurnAction) {

            return this.betTurn(action);

        }

        if (action instanceof FlipCardsAction) {

            return this.flipCards(action);

        }

        if (action instanceof AnteAction) {

            return this.ante(action);

        }

        if (action instanceof BetAction) {

            return this.bet(action);

        }

        if (action instanceof FoldAction) {

            return this.fold(action);

        }


        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPot(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.returnBet(action);
        }
*/

        return false;

    }


    private grabTableData(action: TableSnapshotAction): void {

        this.table = action.table;

        this.broadcastAction(action);

    }

    private seatPlayer(action: PlayerSeatedAction): void {

        // this.log(' in seatPlayer (action)');

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            // this.log(` set player for seat ${seat.index}`);

            seat.player = action.player;

            this.log(` ${action.player.name} sat in ${seat.getName()}`);

        }

        this.broadcastAction(action);

    }


    private updateStack(action: StackUpdateAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            //            logger.info(`${player.name} has ${this.chipFormatter.format(action.chips)}`);

        }

        this.broadcastAction(action);

    }  // updateStack


    private broadcastMessage(publicMessage: Message, privateMessage?: Message): void {

        for (let observer of this.messageHandlers) {

            observer.handleMessage(publicMessage, privateMessage);

        }

    }   // broadcastMessage

    private sendPrivateMessage(privateMessage: Message): void {

        this.log(`I have ${this.messageHandlers.length} message handlers`);
        for (let handler of this.messageHandlers) {

            handler.handleMessage(null, privateMessage);

        }

    }   // sendPrivateMessage


    private broadcastAction(action: Action) {

        this.log(`broadcast ${action.constructor.name} to ${this.messageHandlers.length} listeners`);

        this.broadcastMessage(new ActionMessage(action));

    }




    registerCommandHandler(handler: CommandHandler): void {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler): void {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    broadcastCommand(command: Command): void {

        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }

    }



    public handleCommand(command: Command): void {

        this.log(`received ${ command.constructor.name }`);

        // Pass it along
        this.broadcastCommand(command);

        if (!this.isMaster) {

            // don't actually process the command yourself
            return;

        }

        if (command instanceof RequestSeatCommand) {

            return this.commandSeatPlayer(command);

        }

        if (command instanceof AddChipsCommand) {

            return this.commandAddChips(command);

        }

        if (command instanceof StartGameCommand) {

            return this.startGame(command);

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



    private createTableSnapshot(userID: number): Table {

        let table: Table = new Table(this.table.id, this.table.game, this.table.stakes, this.table.rules);

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

        let color: string = this.isMaster ? '\x1b[31m%s\x1b[0m' : '\x1b[32m%s\x1b[0m';

        let msg = `${(this.isMaster ? 'Server' : 'Client')} TableManager ${message}`;

        if (this.isMaster) {

            console.log(color, msg);

        }

        // logger.debug();


    }

    private commandSeatPlayer(command: RequestSeatCommand): void {

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

            return this.sendPrivateMessage(new Message('No seats available', command.user.id));

        }

        let seat = seatIndex < this.table.seats.length ? this.table.seats[seatIndex] : null;

        if (seat) {

            if (seat.player == null) {

                // let player:Player = new Player(command.user);
                let player: Player = new Player();
                player.userID = command.user.id;
                player.name = command.user.name;

                this.handleAction(new PlayerSeatedAction(this.table.id, player, seatIndex));
                return;

            }

            return this.sendPrivateMessage(new Message(`${seat.getName()} is already taken`, command.user.id));

        }

        return this.sendPrivateMessage(new Message(`Could not find seat ${seatIndex}`, command.user.id));

    }


    private findPlayer(userID: number): Player {

        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer




    private commandAddChips(command: AddChipsCommand): void {

        if (command.amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return;

        }

        let player: Player = this.findPlayer(command.userID);

        if (!player) {
            return this.sendPrivateMessage(new Message('Player is not sitting at table', command.userID));
        }

        if (this.table.state.isHandInProgress()) {

            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;

            // TODO: create delayed AddChips action
            this.sendPrivateMessage(new Message(`${player.name} has bought in for ${command.amount} on the next hand`));
            return;

        }

        this.broadcastAction(new AddChipsAction(this.table.id, player.userID, command.amount));

        player.chips += command.amount;
        this.broadcastAction(new StackUpdateAction(this.table.id, player.userID, player.chips));

    }



    private startGame(command: StartGameCommand): void {

        if (this.table.state instanceof OpenState) {

            logger.info("Started game");
            return this.goToNextState();

        }

        logger.info("Game is already in progress");

    }  // startGame



    private bet(command: BetCommand): void {

        if (this.table.state instanceof BetState) {

            let bettorSeat: Seat = this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);

            let bet: Bet = this.table.betTracker.addBet(bettorSeat, command.amount);

            if (bet.isValid) {

                clearTimeout(this.betTimer);
                this.numTimersKilled++;
                this.logTimers();

                this.broadcastAction(new BetAction(this.table.id, bettorSeat.index, bet));
                this.broadcastAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
                this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

                this.advanceBetTurn();

            }
            else {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.sendPrivateMessage(new Message(bet.message, command.userID));

            }

        }

        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.sendPrivateMessage(new Message('It is not time to bet', command.userID));

    }  // bet


    private fold(command: FoldCommand): void {

        if (this.table.state instanceof BetState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.hand && seat.player && seat.player.userID == command.userID);

            let fold: Fold = this.table.betTracker.fold(folderSeat);

            if (fold.isValid) {

                clearTimeout(this.betTimer);
                this.numTimersKilled++;
                this.logTimers();

                // Take away their cards
                folderSeat.hand = null;

                // This will tell watchers that the given seat is no longer in the hand
                this.broadcastAction(new SetHandAction(this.table.id, folderSeat.index, false));
                this.broadcastAction(new FoldAction(this.table.id, folderSeat.index, fold));

                this.advanceBetTurn();

                return;

            }
            else {

                return this.sendPrivateMessage(new Message(fold.message, command.userID));

            }

        }

        return this.sendPrivateMessage(new Message('It is not time to bet', command.userID));

    }  // fold


    private tableSnapshot(command: TableSnapshotCommand): void {

        // Create a snapshot of the table situation, from the given player's perspective
        let table: Table = this.createTableSnapshot(command.userID);

        let tableAction: TableSnapshotAction = new TableSnapshotAction(table.id, table);

        this.log('Generating private snapshot message');
        this.sendPrivateMessage(new ActionMessage(tableAction, command.userID));

    }



    private isReadyForHand(): boolean {

        return this.table.seats.filter(seat => seat.player && seat.player.isActive && (seat.player.chips + seat.player.chipsToAdd) > 0).length > 1;

    }


    private countPlayersInHand(): number {

        return this.table.seats.filter(s => s.hand).length;

    }  // countPlayersInHand


    private changeTableState(state: TableState): void {

        if (state == null) {


            if (this.isReadyForHand()) {

                // start the next hand
                return this.goToNextState();

            }
            else {

                logger.info('Table not ready - putting into open state');
                this.table.state = new OpenState();
                return;

            }

        }

        if (state.requiresMultiplePlayers()) {

            if (this.countPlayersInHand()  < 2) {

                // blow through this state since there is 0 or 1 person still in the hand at the table.
                return this.goToNextState();
            }

        }

        this.table.state = state;

        this.log(`TableState: ${state.constructor.name}`);

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

        let chipFormatter: IChipFormatter = new MoneyFormatter();

        for (let seat of this.table.seats) {

            if (seat.player) {

                if (seat.player.chipsToAdd) {

                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    this.handleAction(new AddChipsAction(this.table.id, seat.player.userID, seat.player.chipsToAdd));

                    seat.player.chipsToAdd = 0;
                    this.handleAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                }   // they have chips waiting to add

                if (seat.player.chips == 0) {

                    seat.player.isActive = false;

                    // TODO: Broadcast sitting out event

                }

            }

        }

        for (let seat of this.table.seats) {

            if (seat.player) {

                logger.info(`${seat.getName()}: ${chipFormatter.format(seat.player.chips)}${seat.player.isActive ? '' : ' [sitting out]'}`);

            }

        }


        this.deck.shuffle();

        this.table.betTracker.reset();

        this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

        for (let seat of this.table.seats) {

            // Start off without a hand for the seat...
            seat.hand = null;

            if (seat.player && seat.player.isActive) {

                // assume they're in, at least until they fail to pay the ante.
                // The table won't take the ante bet if they're not marked as in already.
                // They need to have a blank hand for the table to accept the ante as a bet
                seat.hand = new Hand();

                if (this.table.stakes.ante > 0) {

                    // logger.info(`There is an ante, and ${seat.getName()} is playing`);

                    // set the betting to the ante's seat or it will not be accepted
                    this.table.betTracker.seatIndex = seat.index;

                    let ante: Bet = this.table.betTracker.addBet(seat, this.table.stakes.ante);

                    // logger.info(`ante result: ${ante}`);

                    if (ante.isValid) {

                        this.broadcastAction(new AnteAction(this.table.id, seat.index, ante));
                        this.broadcastAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));
                        this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

                    }  // valid ante
                    else {

                        // they didn't pay the ante, so take away their (blank) cards
                        seat.hand = null;

                    }

                }  // if there is an ante

            }

            else {

                logger.info(`${seat.getName()} is sitting out`);
                seat.hand = null;

            }

            // This will tell watchers whether or not the given seat is in the hand
            this.broadcastAction(new SetHandAction(this.table.id, seat.index, seat.hand != null));

        }  // for each seat

        this.table.betTracker.gatherBets();

        this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

        this.checkBetsToReturn();

        this.setButton();

        this.goToNextState();

    }   // startHand


    private setButton(): void {

        this.table.buttonIndex = this.findNextOccupiedSeatIndex(this.table.buttonIndex == null ? 0 : this.table.buttonIndex + 1);

        this.broadcastAction(new MoveButtonAction(this.table.id, this.table.buttonIndex));

    }

    private findNextOccupiedSeatIndex(seatIndex: number): number {

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


    private dealRound(dealState: DealState) {

        let seatsNeedingCards = [];

        let seatIndex = this.table.buttonIndex + 1;
        let hasGoneAround = false;

        while (!hasGoneAround) {

            if (seatIndex >= this.table.seats.length) {
                seatIndex = 0;
            }

            if (this.table.seats[seatIndex].hand) {

                seatsNeedingCards.push(seatIndex);

            }

            if (seatIndex == this.table.buttonIndex) {
                hasGoneAround = true;
            }
            else {

                seatIndex++;

                if (seatIndex >= this.table.seats.length) {
                    seatIndex = 0;
                }

            }


        }

        for (let seatIndex of seatsNeedingCards) {

            let card = this.deck.deal();
            let seat = this.table.seats[seatIndex];
            let userID = seat.player.userID;

            let dealtCard = new DealtCard(card, dealState.isFaceUp);

            this.table.seats[seatIndex].hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                // It's face-up, so there is only a public action
                this.broadcastAction(new DealCardAction(this.table.id, seatIndex, card));

            }
            else {

                // It's face-down, so the public action does not include the card info, whereas the private action does
                let publicAction = new ActionMessage(new DealCardAction(this.table.id, seatIndex, null));
                let privateAction = new ActionMessage(new DealCardAction(this.table.id, seatIndex, card), userID);

                this.broadcastMessage(publicAction, privateAction);

            }

        }  // for each seatIndex in seatsNeedingCards

        this.goToNextState();

    }   // dealRound


    private makeYourBets(betState: BetState): void {

        logger.info('In makeYourBets');

        this.table.betTracker.clearBets();
        this.table.betTracker.minRaise = this.table.stakes.minRaise;

        let firstSeatIndexWithAction: number = this.findFirstToBet(betState.firstToBet);

        if (firstSeatIndexWithAction == null) {

            logger.info('No betting action this round');
            return this.goToNextState();

        }

        this.table.betTracker.seatIndexInitiatingAction = firstSeatIndexWithAction;

        this.setBetTurn(firstSeatIndexWithAction);

    }   // makeYourBets


    private logTimers() {

        // logger.info(`numTimers: ${this.numTimers}, numTimersElapsed: ${this.numTimersElapsed}, numTimersKilled: ${this.numTimersKilled}`);

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
            let check: Bet = this.table.betTracker.addBet(checkerSeat, null);

            if (check.isValid) {

                this.broadcastAction(new BetAction(this.table.id, checkerSeat.index, check));
                this.advanceBetTurn();

            }
            else {

                // TODO: Fold player
                this.advanceBetTurn();

            }


        }, this.table.rules.timeToAct * 1000);

        this.broadcastAction(new BetTurnAction(this.table.id, this.table.betTracker));

    }  // setBetTurn


    private advanceBetTurn(): void {

        // logger.info('In advanceBetTurn');
        if (this.table.state instanceof HandCompleteState) {

            let error = new Error('Should not be here');
            logger.info(error.stack);
            throw error;

        }

        let nextSeatIndex = this.findNextOccupiedSeatIndex(this.table.betTracker.seatIndex + 1);

        let done: boolean = false;

        while (!done) {

            if (nextSeatIndex == this.table.betTracker.seatIndexInitiatingAction) {

                logger.info('Betting complete');

                this.table.betTracker.gatherBets();
                this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

                this.checkBetsToReturn();

                return this.goToNextState();

            }

            if (this.table.seats[nextSeatIndex].player && this.table.seats[nextSeatIndex].player.chips > 0) {

                done = true;

            }
            else {

                // Otherwise, keep moving the marker
                nextSeatIndex = this.findNextOccupiedSeatIndex(nextSeatIndex + 1);

            }

        }  // while !done

        this.setBetTurn(nextSeatIndex);


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
                    return this.findNextOccupiedSeatIndex(this.table.buttonIndex + 1);
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
                handWinners.push(new HandWinner(this.table.game.handSelector.select(this.table.game.handEvaluator, seat.hand, this.table.board), seat.index, 0))

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

        this.table.betTracker.gatherBets();

        let potIndexesToKill: Set<number> = new Set<number>();

        for (let pot of this.table.betTracker.pots) {

            if (pot.seats.size === 1) {

                // Convert the set (of 1 element) to an array, and take its first element
                let seat = this.table.seats[[...pot.seats][0]];

                if (seat) {


                    potIndexesToKill.add(pot.index);

                    this.broadcastAction(new BetReturnedAction(this.table.id, seat.index, pot.amount));

                    if (seat.player) {

                        seat.player.chips += pot.amount;
                        this.broadcastAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                    }  // if player is not null

                }  // if seat

            }   // if pot only has 1 bettor in it

        }

        if (potIndexesToKill.size > 0) {

            this.table.betTracker.killPots(potIndexesToKill);
            this.broadcastAction(new UpdateBetsAction(this.table.id, this.table.betTracker));

        }

    } // checkBetsToReturn


    private showdown(showdownState: ShowdownState) {

        let isShowdownRequired = this.countPlayersInHand() > 1;

        if (isShowdownRequired) {

            // Flip all the cards face-up
            for (let seat of this.table.seats) {

                if (seat.hand) {

                    seat.hand.flipCards();

                    this.broadcastAction(new FlipCardsAction(this.table.id, seat.index, seat.hand))

                }

            }

        }

        let winners: HandWinner[] = this.findWinners();

/*
        for (let winner of winners) {
            logger.info(`TableManager: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }
*/

        for (let pot of this.table.betTracker.pots) {

            let potWinningHand = null;
            let potWinnerSeatIndexes = new Set<number>();

            for (let winner of winners) {

                if (pot.seats.has(winner.seatIndex)) {

                    if (potWinningHand == null) {

                        potWinningHand = winner.evaluation;
                        potWinnerSeatIndexes.add(winner.seatIndex);

                    }
                    else if (winner.evaluation.compareTo(potWinningHand) >= 0) {

                        // Should never be *greater*, since we're going to descending order of hand strength
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

                        this.broadcastAction(new WinPotAction(this.table.id, seatIndex, pot.index, winnerEvaluation, equalShare + remainder));

                        player.chips += (equalShare + remainder);

                        this.broadcastAction(new StackUpdateAction(this.table.id, player.userID, player.chips));

                        remainder = 0;

                    }

                }

            }

        }  // for each Pot


        this.goToNextState();


    }   // showdown


    private completeHand(completeState: HandCompleteState) {

        // We're done with this hand - go to the next one

        // This will preserve the `this` reference in the call
        setTimeout(() => {

            this.goToNextState();

        }, 2000);

    }   // completeHand


    private goToNextState(): void {

        this.changeTableState(this.table.game.stateMachine.nextState());

    }







}