import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { SetStatusCommand } from "../../commands/table/set-status-command";
import { Player } from "../../players/player";
import { AddChipsCommand } from "../../commands/table/add-chips-command";
import { StartHandState } from "./states/start-hand-state";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/players/player-seated-action";
import { MoveButtonAction } from "../../actions/table/game/move-button-action";
import { DealState } from "./states/dealing/deal-state";
import { Hand } from "../../hands/hand";
import { BetState } from "./states/betting/bet-state";
import { BlindsAndAntesState } from "./states/betting/blinds-and-antes-state";
import { ShowdownState } from "./states/showdown-state";
import { HandCompleteState } from "./states/hand-complete-state";
import { HandWinner } from "../../games/hand-winner";
import { TableSnapshotAction } from "../../actions/table/state/table-snapshot-action";
import { UpdateBetsAction } from "../../actions/table/betting/update-bets-action";
import { WinPotAction } from "../../actions/table/game/pots/win-pot-action";
import { StackUpdateAction } from "../../actions/table/players/stack-update-action";
import { AnteCommand } from "../../commands/table/betting/ante-command";
import { BetCommand } from "../../commands/table/betting/bet-command";
import { Seat } from "./seat";
import { Bet } from "./betting/bet";
import { FoldCommand } from "../../commands/table/betting/fold-command";
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
import { DealCardAction } from "../../actions/table/game/dealing/deal-card-action";
import { BetTurnAction } from "../../actions/table/betting/bet-turn-action";
import { BetReturnedAction } from "../../actions/table/betting/bet-returned-action";
import { FlipCardsAction } from "../../actions/table/game/flip-cards-action";
import { Deck } from "../../cards/deck";
import { TableStateAction } from "../../actions/table/state/table-state-action";
import { MessagePair } from "../../messages/message-pair";
import { DeepCopier } from "../../communication/deep-copier";
import { DeclareHandAction, Card, HandCompleteAction, GatherBetsAction, GatherBetsCompleteAction, Pot, AnteTurnAction, DealBoardState, User, ChatCommand, ChatAction, GatherAntesAction, GatherAntesCompleteAction } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { SetStatusAction } from "../../actions/table/players/set-status-action";
import { BettingCompleteAction } from "../../actions/table/betting/betting-complete-action";
import { FacedownCard } from "../../cards/face-down-card";
import { WonPot } from "./betting/won-pot";
import { IsInHandAction } from "../../actions/table/players/is-in-hand-action";
import { ClearHandAction } from "../../actions/table/game/dealing/clear-hand-action";
import { DealBoardAction } from "../../actions/table/game/dealing/deal-board-action";
import { ClearBoardAction } from "../../actions/table/game/dealing/clear-board-action";
import { LobbyManager } from "../lobby/lobby-manager";
import { BetController } from "./betting/bet-controller";
import { PotCardsUsedAction } from "../../actions/table/game/pots/pot-cards-used-action";
import { ShowdownAction } from "../../actions/table/game/showdown/showdown-action";
import { InvalidBet } from "./betting/invalid-bet";
import { InvalidFold } from "./betting/invalid-fold";
import { UserManager } from "../../players/user-manager";

const logger: Logger = new Logger();


export class TableController implements CommandHandler, MessageBroadcaster {

    private readonly TIME_SET_BUTTON: number = 750;

    private readonly TIME_DEAL_CARD: number = 100;
    private readonly TIME_DEAL_BOARD: number = 300;

    private readonly TIME_ANTE = 100;
    private readonly TIME_BET = 100;
    private readonly TIME_LAST_BET_MADE = 500;
    private readonly TIME_RETURN_BET = 500;
    private readonly TIME_GATHERING_BETS: number = 1250;

    private readonly TIME_SHOWDOWN: number = 500;
    private readonly TIME_WIN_POT: number = 5000;
    private readonly TIME_POST_SHOWDOWN: number = 100;

    private readonly TIME_COMPLETE_HAND: number = 0;

    private readonly TIME_ALL_IN_FLIP_CARDS: number = 1500;


    private userManager: UserManager;


    private table: Table;
    private game: Game;
    private deck: Deck;

    private copier: DeepCopier;

    private messageQueue: Array<Message | MessagePair>;
    private messageHandlers: MessageHandler[];

    // Track betTimers per seat
    private betTimerMap: Map<number, ReturnType<typeof setTimeout>>;

    private betController: BetController;

    private setStatusRequests: Map<number, SetStatusCommand>;




    constructor(userManager: UserManager,  table: Table, deck: Deck) {

        this.userManager = userManager;

        this.table = table;
        this.deck = deck;

        this.copier = new DeepCopier();

        this.messageQueue = new Array<Message | MessagePair>();
        this.messageHandlers = new Array<MessageHandler>();

        this.betTimerMap = new Map<number, ReturnType<typeof setTimeout>>();

        this.betController = new BetController();

        this.setStatusRequests = new Map<number, SetStatusCommand>();

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

        if (command instanceof SetStatusCommand) {

            return await this.setStatus(command);

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

        if (command instanceof ChatCommand) {

            return await this.chat(command);

        }

        throw new Error("Method not implemented.");
    }


    public setGame(game: Game): void {

        this.game = game;

        this.table.board = game.newBoard();

        this.queueAction(new SetGameAction(this.table.id, game.id));

    }


    private createTableSnapshot(userID: number): Table {

        let table: Table = new Table(this.table.id, this.table.stakes, this.table.rules);

        table.betStatus = this.table.betStatus;
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

        console.log('\x1b[31m%s\x1b[0m', `TableController Table ${this.table.id}: ${message}`);

    }



    private async seatPlayer(command: RequestSeatCommand): Promise<void> {

        let user: User = await this.userManager.fetchUserByID(command.userID);

        if (!user) {

            this.log(`Could not find User ${command.userID}`);
            return this.queueMessage(new Message(`User ${command.userID} is unknown`, command.userID));

        }

        let seatIndex = command.seatIndex;
        if (seatIndex === null) {

            for (let s = 0; s < this.table.seats.length; s++) {

                if (this.table.seats[s].player == null) {
                    seatIndex = s;
                    break;
                }

            }  // for each seat

        }  // no seat specified

        this.log(`User ${command.userID} has requested a null seat, so we are giving them ${seatIndex}`);

        if (seatIndex === null) {

            return this.queueMessage(new Message('No seats available', command.userID));

        }

        let seat = seatIndex < this.table.seats.length ? this.table.seats[seatIndex] : null;

        if (seat) {

            if (seat.player == null) {

                seat.player = new Player(user.id, user.name);
                this.queueAction(new PlayerSeatedAction(this.table.id, seat.player, seatIndex));
                return await this.checkStartHand();

            }

            return this.queueMessage(new Message(`${seat.getName()} is already taken`, command.userID));

        }

        return this.queueMessage(new Message(`Could not find seat ${seatIndex}`, command.userID));

    }


    private async setStatus(command: SetStatusCommand): Promise<void> {

        let seat: Seat = this.findSeatByPlayer(command.userID);

        if (seat) {

            // if the player is not in action, then sitting in/out takes effect immediately
            if (!this.table.state.isHandInProgress() || !seat.isInHand) {

                this.processSetStatusCommand(command, seat);

            }
            else {

                // Remember this command for between rounds
                this.setStatusRequests.set(seat.index, command);

            }

            return await this.checkStartHand();

        }

    }   // setStatus


    private processSetStatusCommand(command: SetStatusCommand, seat: Seat): void {

        if (!command || !seat || !seat.player || seat.player.userID != command.userID) {

            return;

        }

        if (command.isSittingOut) {

            // They can always mark themselves as sitting out the next hand
            this.markSittingOut(seat, true);

        }

        else {

            // Only let them mark themselves as back in if they have chips (or are about to add some)
            if (seat.player.chips > 0) {

                this.markSittingOut(seat, false);

            }

        }

    }


    private findSeatByPlayer(userID: number): Seat {

        return this.table.seats.find(s => s.player && s.player.userID == userID);

    }  // findSeatByPlayer


    private findPlayer(userID: number): Player {

        for (let seat of this.table.seats) {

            if (seat.player && seat.player.userID == userID) {
                return seat.player;
            }

        }

        return null;

    }   // findPlayer




    private async addChips(command: AddChipsCommand): Promise<void> {

        if (command.amount <= 0) {

            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return;

        }

        let seat: Seat = this.findSeatByPlayer(command.userID);

        if (seat) {

            let player: Player = seat.player;

            if (!this.table.state.isHandInProgress() || !seat.isInHand) {

                // The player is not current involved in a hand, so we can add their chips immediately
                player.chips += command.amount;

                this.queueAction(new AddChipsAction(this.table.id, player.userID, command.amount));
                this.queueAction(new StackUpdateAction(this.table.id, player.userID, player.chips));
                return await this.checkStartHand();

            }

            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;

            // TODO: create delayed AddChips action
            this.queueMessage(new Message(`${player.name} has bought in for ${command.amount} on the next hand`, command.userID));

            return await this.checkStartHand();

        }
        else {

            return this.queueMessage(new Message('Player is not sitting at table', command.userID));

        }

    }



    private async checkStartHand(): Promise<void> {

        if (!this.table.state.isHandInProgress() && this.isReadyForHand()) {

            this.log(`Starting new hand`);
            return await this.goToNextState();

        }

    }  // checkStartHand


    private clearBetTimeout(seatIndex: number): void {

        clearTimeout(this.betTimerMap.get(seatIndex));
        this.betTimerMap.delete(seatIndex);

    }




    private async ante(command: AnteCommand): Promise<void> {

        this.log(`Received AnteCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        let bettorSeat: Seat = this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);
        if (!bettorSeat) {

            return this.queueMessage(new Message('You are not at the table', command.userID));

        }

        let anteResult: InvalidBet | Bet[] = this.betController.validateBlindsAndAnte(this.table, bettorSeat);

        if (anteResult instanceof InvalidBet) {

            // TODO: Send action indicating invalid bet so that the UI can reset itself
            return this.queueMessage(new Message(anteResult.message, command.userID));

        }
        else {

            this.clearBetTimeout(bettorSeat.index);

            for (let anteBlind of anteResult) {

                this.queueAction(new BetAction(this.table.id, bettorSeat.index, anteBlind));

            }

            this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
            this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

            await this.wait(this.TIME_ANTE);

            // if the player has not specified in or out, then ante-ing put them firmly in the "not-sitting-out" camp
            if (bettorSeat.player.isSittingOut === null) {

                this.markSittingOut(bettorSeat, false);

            }

            return await this.advanceAnteTurn();

        }


    }  // ante


    private isSeatEligibleToBet(seat: Seat): boolean {

        return seat && seat.isInHand && seat.player && seat.player.chips > 0;

    }

    private isSeatEligibleToAnte(seat: Seat): boolean {

        return seat && seat.player && seat.isInHand && seat.player.chips > 0;

    }


    private async bet(command: BetCommand): Promise<void> {

        this.log(`Received BetCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        if (this.table.state instanceof BetState) {

            let bettorSeat: Seat =  this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);

            let betResult: InvalidBet | Bet = this.betController.validateBet(this.table, bettorSeat, command.amount);

            if (betResult instanceof Bet) {

                this.clearBetTimeout(bettorSeat.index);

                this.queueAction(new BetAction(this.table.id, bettorSeat.index, betResult));
                this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));

                // If this bet raised the action, then reset the list of who still needs to act behind this player
                if (betResult.raisesAction) {

                    // re-calculate the bettors remaining to act before updating the BetStatus
                    // Start with the player *after* this bettor
                    // Stop with the player *before* this bettor
                    // The bet tracker is smart enough to roll the indexes off either end
                    this.betController.calculateSeatIndexesRemainToAct(this.table, bettorSeat.index + 1, bettorSeat.index - 1, this.isSeatEligibleToBet);

                }

                this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

                await this.wait(this.TIME_BET);

                return await this.advanceBetTurn();

            }
            else {

                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new Message(betResult.message, command.userID));

            }

        }

        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // bet




    private async foldPlayer(folderSeat: Seat, fold: Fold): Promise<void> {

        this.clearBetTimeout(folderSeat.index);

        // Take away their cards
        folderSeat.clearHand();

        // This will tell watchers that the given seat is no longer in the hand
        this.queueAction(new FoldAction(this.table.id, folderSeat.index, fold));

        return await this.advanceBetTurn();

    }   // foldPlayer


    private async fold(command: FoldCommand): Promise<void> {

        if (this.table.state instanceof BlindsAndAntesState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.isInHand && seat.player && seat.player.userID == command.userID);

            let fold: Fold | InvalidFold = this.betController.fold(this.table.betStatus, folderSeat);

            if (fold instanceof Fold) {

                return await this.rejectAnte(folderSeat);

            }

            return this.queueMessage(new Message(fold.message, command.userID));

        }


        if (this.table.state instanceof BetState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.isInHand && seat.player && seat.player.userID == command.userID);

            let fold: Fold | InvalidFold = this.betController.fold(this.table.betStatus, folderSeat);

            if (fold instanceof Fold) {

                return await this.foldPlayer(folderSeat, fold);

            }

            return this.queueMessage(new Message(fold.message, command.userID));

        }

        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // fold


    private async tableSnapshot(command: TableSnapshotCommand): Promise<void> {

        // Create a snapshot of the table situation, from the given player's perspective
        let table: Table = this.createTableSnapshot(command.userID);

        let tableAction: TableSnapshotAction = new TableSnapshotAction(table.id, table);

        this.log('Generating private snapshot message');
        this.queueMessage(new ActionMessage(tableAction, command.userID));

        // Tell the user which game we are playing at this table
        this.queueMessage(new ActionMessage(new SetGameAction(table.id, this.game.id), command.userID));

    }


    private async chat(command: ChatCommand): Promise<void> {

        let user: User = await this.userManager.fetchUserByID(command.userID);

        if (user) {

            return this.queueAction(new ChatAction(this.table.id, user.id, user.username, command.message));

        }

        this.log(`Could not find User ${command.userID}`);
        return this.queueMessage(new Message(`User ${command.userID} is unknown`, command.userID));

    }


    private isReadyForHand(): boolean {

        let numPlayers = 0;

        for (let seat of this.table.seats) {

            if (seat.player) {

                this.log(`Checking ${seat.player.name}: chips: ${seat.player.chips}, isSttingOut: ${seat.player.isSittingOut}`);

                // isSittingOut could either be undefined or false. If undefined then we will give them a chance to pay the ante/blind (if required)
                if (seat.player.chips === 0) {

                    this.markSittingOut(seat, true);

                }

                if (!seat.player.isSittingOut) {
                    this.log(`In isReadyForHand, ${seat.player.name} is ready`);
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

        this.log('In doBetweenHandsBusiness');

        for (let seat of this.table.seats) {

            // If we're between hands, then none of the seats are in a hand, right?
            this.clearHand(seat);

            if (seat.player) {

                if (seat.player.chipsToAdd) {

                    this.queueAction(new AddChipsAction(this.table.id, seat.player.userID, seat.player.chipsToAdd));

                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    seat.player.chipsToAdd = 0;

                    this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                }   // they have chips waiting to add

                let setStatusCommand: SetStatusCommand = this.setStatusRequests.get(seat.index);

                if (setStatusCommand) {

                    this.processSetStatusCommand(setStatusCommand, seat);

                }

                if (seat.player.chips === 0) {

                    // if they have no chips then they are automatically sitting out
                    this.markSittingOut(seat, true);

                }

            }

        }

        // clear all requests now
        this.setStatusRequests.clear();

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

        if (state instanceof DealBoardState) {

            return await this.dealBoard(state);

        }

        if (state instanceof BlindsAndAntesState) {

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

        this.betController.reset(this.table.betStatus);
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        for (let seat of this.table.seats) {

            // Remove any cards they might have
            seat.clearHand();

            if (seat.player) {

                // if they're not explicitly sitting out, then we will treat them as in so that we can check them for antes/blinds/cards to deal/etc
                seat.isInHand = !seat.player.isSittingOut && seat.player.chips > 0;

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




    private async dealBoard(dealState: DealBoardState): Promise<void> {

        let cards: Array<Card> = [];

        for (let c: number = 0; c < dealState.numCards; c++) {

            let card: Card = this.deck.deal();
            card.isFaceUp = true;
            cards.push(card);
            this.table.board.deal(card);

        }

        // Board activity is always public
        this.queueAction(new DealBoardAction(this.table.id, cards));
        await this.wait(this.TIME_DEAL_BOARD * dealState.numCards);

        // we are done with the button's position (card dealt or not)
        return await this.goToNextState();

    }   // dealBoard



    private async wait(milliseconds: number): Promise<void> {

        return new Promise(res => setTimeout(res, milliseconds));

    }


    private async collectAntes(anteState: BlindsAndAntesState): Promise<void> {

        this.log('In collectAntes');

        this.betController.calculateForcedBets(this.table, this.isSeatEligibleToAnte);

        this.log(`ANTE ORDER: [ ${this.table.betStatus.seatIndexesRemainToAct.join(" ")} ]`);
        return await this.validateAnteerOrMoveOn();

    }   // collectAntes


    private async validateAnteerOrMoveOn(): Promise<void> {

        let seatIndexToAct: number = this.betController.getNextBettorIndex(this.table.betStatus);

        if (seatIndexToAct === undefined) {

            if (this.getSeatIndexesStillInHand().size < 2) {

                // completeBetting will automatically look for bets that need returning if we don't have enough players
                return await this.completeBetting();

            }

            return await this.completeAntesAndBlinds();

        }

        // Make sure they haven't left the table or anything
        let seat: Seat = this.table.seats[seatIndexToAct];

        if (!seat.isInHand) {

            // go to the next seat
            return await this.validateAnteerOrMoveOn();

        }

        await this.setAnteTurn(seatIndexToAct);

    }  // validateAnteerOrMoveOn


    private async setAnteTurn(seatIndexToAct: number): Promise<void> {

        // assume they're in, at least until they fail to pay the ante.
        // The table won't take the ante bet if they're not marked as in already.
        // They need to have a blank hand for the table to accept the ante as a bet
        let anteSeat: Seat = this.table.seats[seatIndexToAct];

        this.table.betStatus.seatIndex = seatIndexToAct;

        let millisToAct: number = this.table.rules.timeToAnte * 1000;
        let timesUp: number = Date.now() + millisToAct;

        // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending an Ante command
        this.betTimerMap.set(seatIndexToAct, setTimeout(async () => {

            return this.rejectAnte(anteSeat);

        }, millisToAct));

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));
        this.queueAction(new AnteTurnAction(this.table.id, this.snapshot(this.table.betStatus), timesUp));


    }  // setAnteTurn


    private async rejectAnte(anteSeat: Seat): Promise<void> {

        this.clearBetTimeout(anteSeat.index);

        this.log(`${anteSeat.getName()} did not ante - marking as sitting out`);

        // they didn't pay the ante, so they're OUT
        this.clearHand(anteSeat);
        this.markSittingOut(anteSeat, true);

        return await this.advanceAnteTurn();

    }   // rejectAnte


    private clearHand(seat: Seat): void {

        seat.clearHand();
        this.queueAction(new IsInHandAction(this.table.id, seat.index, false));

    }  // clearHand


    private markSittingOut(seat: Seat, isSittingOut: boolean): void {

        if (seat.player) {

            // Tell the world whether this player is sitting out
            seat.player.isSittingOut = isSittingOut;
            this.queueAction(new SetStatusAction(this.table.id, seat.player.userID, isSittingOut));

        }

    }  // markSittingOut


    private async advanceAnteTurn(): Promise<void> {

        // this.log('In advanceAnteTurn');
        if (!(this.table.state instanceof BlindsAndAntesState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        return await this.validateAnteerOrMoveOn();

    }   // advanceAnteTurn



    private async makeYourBets(betState: BetState): Promise<void> {

        this.log('In makeYourBets');

        this.betController.increaseBettingRound(this.table.betStatus);
        this.calculateInitialBettingOrder(betState.firstToBet, this.isSeatEligibleToBet);

        return await this.validateBettorOrMoveOn();

    }   // makeYourBets


    private async validateBettorOrMoveOn(): Promise<void> {

        if (this.getSeatIndexesStillInHand().size < 2) {

            // someone probably folded when first to act - no point in going through the list

            // completeBetting will automatically look for bets that need returning if we don't have enough players
            return await this.completeBetting();

        }

        let seatIndexToAct: number = this.betController.getNextBettorIndex(this.table.betStatus);

        if (seatIndexToAct === undefined) {

            return await this.completeBetting();

        }

        // Make sure they haven't left the table or anything
        let seat: Seat = this.table.seats[seatIndexToAct];

        if (!seat.isInHand) {

            // go to the next seat
            return await this.validateBettorOrMoveOn();

        }

        await this.setBetTurn(seatIndexToAct);

    }  // validateBettorOrMoveOn


    private getSeatIndexesStillInHand(): Set<number> {

        // We need to track which seats are still in the hand - if they folded mid-hand then we don't want to necessarily create a side pot
        let seatsStillInHand: Set<number> = new Set<number>();
        for (let seat of this.table.seats) {

            if (seat.isInHand) {
                seatsStillInHand.add(seat.index);
            }

        }

        return seatsStillInHand;
    }


    private async completeAntesAndBlinds(): Promise<void> {

        this.log('Finished betting');

        // It is no longer anyone's turn to act, so turn off the actor and broadcast this state to everyone
        this.table.betStatus.seatIndex = null;
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        this.log('Betting is complete');
        this.queueAction(new BettingCompleteAction(this.table.id));

        await this.wait(this.TIME_LAST_BET_MADE);

        // look for uncalled bets (or pieces of bets of bets that were not fully called)
        // await this.returnBets(this.betController.checkBetsToReturn(this.table.betStatus));

        this.log('Gather antes');
        this.queueAction(new GatherAntesAction(this.table.id));

        this.betController.gatherAntes(this.table.betStatus, this.getSeatIndexesStillInHand());

        // give it a minute before clearing out all the actions
        await this.wait(this.TIME_GATHERING_BETS);

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        this.queueAction(new GatherAntesCompleteAction(this.table.id));

        // See if we maybe want to do something special once players are all-in
        await this.checkAllIn();

        if (!this.table.betStatus.pots.length) {

            // We don't have enough players, so go back to the open state
            return await this.changeTableState(this.game.stateMachine.goToOpenState());

        }

        //      await this.wait(this.TIME_BETTING_COMPLETE);
        return await this.goToNextState();


    }  // completeAntesAndBlinds


    private async completeBetting(): Promise<void> {

        this.log('Finished betting');

        // It is no longer anyone's turn to act, so turn off the actor and broadcast this state to everyone
        this.table.betStatus.seatIndex = null;
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        this.log('Betting is complete');
        this.queueAction(new BettingCompleteAction(this.table.id));

        await this.wait(this.TIME_LAST_BET_MADE);

        // look for uncalled bets (or pieces of bets of bets that were not fully called)
        await this.returnBets(this.betController.checkBetsToReturn(this.table.betStatus));

        this.log('Gather bets');
        this.queueAction(new GatherBetsAction(this.table.id));

        this.betController.gatherBets(this.table.betStatus, this.getSeatIndexesStillInHand());

        // give it a minute before clearing out all the actions
        await this.wait(this.TIME_GATHERING_BETS);

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        this.queueAction(new GatherBetsCompleteAction(this.table.id));

        // See if we maybe want to do something special once players are all-in
        await this.checkAllIn();

        if (!this.table.betStatus.pots.length) {

            // We don't have enough players, so go back to the open state
            return await this.changeTableState(this.game.stateMachine.goToOpenState());

        }

//      await this.wait(this.TIME_BETTING_COMPLETE);
        return await this.goToNextState();

    }  // completeBetting


    private async checkAllIn(): Promise<void> {

        let numSeatsInHand: number = 0;
        let numPlayersWithChips: number = 0;

        for (let seat of this.table.seats) {

            if (seat.isInHand) {

                numSeatsInHand++;

                if (seat.player && seat.player.chips > 0) {
                    numPlayersWithChips++;
                }

            }

        }

        // If we have:
        // 1. Multiple players in the hand, so it's not just a pot won with folding
        // 2. There is not more than one player with the ability to act (everyone or everyone but one is all-in)
        // then let's see everyone's cards
        if (numSeatsInHand >= 2 && numPlayersWithChips <= 1) {

            // Flip all the cards face-up
            for (let seat of this.table.seats) {

                if (seat.hand) {

                    seat.hand.flipCards();
                    this.queueAction(new FlipCardsAction(this.table.id, seat.index, seat.hand));

                }

            }

            await this.wait(this.TIME_ALL_IN_FLIP_CARDS);

        }

    }


    private async setBetTurn(seatIndexToAct: number): Promise<void> {

        this.table.betStatus.seatIndex = seatIndexToAct;

        let millisToAct: number = this.table.rules.timeToAct * 1000;
        let timesUp: number = Date.now() + millisToAct;

        this.queueAction(new BetTurnAction(this.table.id, this.snapshot(this.table.betStatus), timesUp));

        // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending a command
        this.betTimerMap.set(seatIndexToAct, setTimeout(async () => {

            let checkerSeat = this.table.seats[this.table.betStatus.seatIndex];

            // try to check
            let check: InvalidBet | Bet = this.betController.validateBet(this.table, checkerSeat, 0);

            if (check instanceof Bet) {

                this.queueAction(new BetAction(this.table.id, checkerSeat.index, check));
                return await this.advanceBetTurn();

            }

            let fold: Fold = this.betController.fold(this.table.betStatus, checkerSeat);

            if (fold instanceof Fold) {

                return await this.foldPlayer(checkerSeat, fold);

            }

            throw new Error(`TableController could not check or fold ${checkerSeat.getSeatName()}` );

        }, millisToAct));


    }  // setBetTurn


    private async advanceBetTurn(): Promise<void> {

        // this.log('In advanceBetTurn');
        if (!(this.table.state instanceof BetState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        return await this.validateBettorOrMoveOn();

    }   // advanceBetTurn



    private calculateInitialBettingOrder(firstBetRule: number, isSeatEligible: (seat: Seat) => boolean): void {

        this.betController.clearBettorsToAct(this.table.betStatus);

        // First count how many players CAN act this round - if only 1 (or 0) then there's nothing to do
        // This is not the same as blowing through rounds because we're down to just one player because everyone else folded.
        // In this case, at least one person must be all-in, so we're going to keep dealing cards, but we don't need to bet.
        let numEligibleSeats: number = this.table.seats.filter(s => isSeatEligible(s)).length;
        if (numEligibleSeats < 2) {

            // we don't have 2 players with money, so dump out
            return;

        }

        switch (firstBetRule) {
        
            case BetState.FIRST_POSITION:
                {
                    // Start with the player *after* the button
                    // The button will be the last player to act
                    // The bet tracker is smart enough to roll the indexes off either end
                    return this.betController.calculateSeatIndexesRemainToAct(this.table, this.table.buttonIndex + 1, this.table.buttonIndex, isSeatEligible);
                }

            case BetState.AFTER_BIG_BLIND:
                {
                    if (this.table.betStatus.bigBlindIndex === null) {

                        // There is no Big Blind, so start with the player after the button
                        // The button will be the last player to act
                        // The bet tracker is smart enough to roll the indexes off either end
                        return this.betController.calculateSeatIndexesRemainToAct(this.table, this.table.buttonIndex + 1, this.table.buttonIndex, isSeatEligible);

                    }

                    // Start with the player *after* the big blind
                    // The big blind will be the last player to act and will get the option to raise
                    // The bet tracker is smart enough to roll the indexes off either end
                    return this.betController.calculateSeatIndexesRemainToAct(this.table, this.table.betStatus.bigBlindIndex + 1, this.table.betStatus.bigBlindIndex, isSeatEligible);

                }

            case BetState.BEST_HAND:
                {
                    let handWinners: Array<HandWinner> = this.findWinners();

                    // Start with the player with the best hand
                    // Stop with the player *before* the current leader
                    // The bet tracker is smart enough to roll the indexes off either end
                    return this.betController.calculateSeatIndexesRemainToAct(this.table, handWinners[0].seatIndex, handWinners[0].seatIndex - 1, isSeatEligible);
                }
        
        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }   // findFirstToBet


    private findWinners(): Array<HandWinner> {

        let handWinners: Array<HandWinner> = new Array<HandWinner>();

        for (let seat of this.table.seats) {

            if (seat.hand) {

                // Put their best hand on the list
                handWinners.push(new HandWinner(this.game.handSelector.select(this.game.handEvaluator, seat.hand, this.table.board), seat.index))

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


    private async returnBets(returnedBets: Bet[]): Promise<void> {

        if (!returnedBets || !returnedBets.length) {

            // Nothing to do here!
            return;
        }


        for (let bet of returnedBets) {

            let seat: Seat = this.table.seats[bet.seatIndex];

            if (seat.player) {

                this.queueAction(new BetReturnedAction(this.table.id, bet.seatIndex, bet.totalBet));

                // Take the chips from the returned bet and put them back on the player's stack
                seat.player.chips += bet.totalBet;
                this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

            }

        }

        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

        await this.wait(this.TIME_RETURN_BET);

    } // returnBets


    private async showdown(showdownState: ShowdownState): Promise<void> {

        let isShowdownRequired = this.countPlayersInHand() > 1;

        this.queueAction(new ShowdownAction(this.table.id, isShowdownRequired));

        if (isShowdownRequired) {

            // Flip all the cards face-up
            for (let seat of this.table.seats) {

                if (seat.hand) {

                    seat.hand.flipCards();

                    this.log(`There are ${seat.hand.cards.length} cards in the hand`);
                    this.queueAction(new FlipCardsAction(this.table.id, seat.index, seat.hand));

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
            this.log(`TableController: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }

        while (this.table.betStatus.pots.length) {

            let pot: Pot = this.table.betStatus.pots.shift();

            let potWinningHand = null;
            let potWinnerSeatIndexes = new Set<number>();

            // Track all the cards used in the winning hand(s).  We are using a set
            // because there might be multiple winners, and each of them could be using the same cards
            let usedCardsSet: Set<Card> = new Set<Card>();

            for (let winner of winners) {

                if (pot.isSeatInPot(winner.seatIndex)) {

                    if (potWinningHand == null) {

                        potWinningHand = winner.evaluation;
                        potWinnerSeatIndexes.add(winner.seatIndex);

                        if (isShowdownRequired) {

                            // add the cards that the player used to the set so that they will be highlighted on the client
                            // This will include both cards in the player's hand and cards from the board, as relevant.
                            for (let card of winner.evaluation.cards) {
                                usedCardsSet.add(card);
                            }

                        }

                    }
                    else if (winner.evaluation.compareTo(potWinningHand) >= 0) {

                        // Should never be *greater*, since we're going in descending order of hand strength, but whatever
                        potWinnerSeatIndexes.add(winner.seatIndex);

                        if (isShowdownRequired) {

                            // add the cards that the player used to the set so that they will be highlighted on the client
                            // This will include both cards in the player's hand and cards from the board, as relevant.
                            for (let card of winner.evaluation.cards) {
                                usedCardsSet.add(card);
                            }

                        }

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

            this.queueAction(new PotCardsUsedAction(this.table.id, [...usedCardsSet.values()]));

            // we have popped the pot off, so update that so it effectively gets replaced by the WonPot objects
            this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

            await this.wait(this.TIME_WIN_POT);

        }  // while we have pots to work through


        // Update all the player chip counts at once
        for (let seat of this.table.seats) {

            if (seat.player) {

                this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

            }

        }

        // clear all betting action
        this.betController.reset(this.table.betStatus);
        this.queueAction(new UpdateBetsAction(this.table.id, this.snapshot(this.table.betStatus)));

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

        this.queueAction(new HandCompleteAction(this.table.id));
        await this.wait(this.TIME_COMPLETE_HAND);

        for (let seat of this.table.seats) {

            if (seat.isInHand) {

                this.queueAction(new ClearHandAction(this.table.id, seat.index));

            }

        }

        this.table.board.reset();
        this.queueAction(new ClearBoardAction(this.table.id));

        this.betController.reset(this.table.betStatus);
        this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

        return await this.goToNextState();

    }   // completeHand


    private async goToNextState(): Promise<void> {

        let nextState: TableState = this.game.stateMachine.nextState();

        // this.log(`Changing to next state: ${(nextState == null ? 'null' : nextState.constructor.name)}`);

        await this.changeTableState(nextState);

     }







}