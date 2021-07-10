import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { StandUpCommand } from "../../commands/table/stand-up-command";
import { SetStatusCommand } from "../../commands/table/set-status-command";
import { Player } from "../../players/player";
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
import { DeclareHandAction, Card, HandCompleteAction, GatherBetsAction, GatherBetsCompleteAction, Pot, AnteTurnAction, DealBoardState, User, ChatCommand, ChatAction, GatherAntesAction, GatherAntesCompleteAction, TableSummary, SeatVacatedAction, TableConnectedAction, ErrorMessage, OpenState, ClearTimerAction, Stakes, ClearBettingActionsAction, BettingActionAction, Blind, Board, HandEvaluation } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { SetStatusAction } from "../../actions/table/players/set-status-action";
import { SetStatusAckedAction } from "../../actions/table/players/set-status-acked-action";
import { BettingCompleteAction } from "../../actions/table/betting/betting-complete-action";
import { FacedownCard } from "../../cards/face-down-card";
import { WonPot } from "./betting/won-pot";
import { IsInHandAction } from "../../actions/table/players/is-in-hand-action";
import { ClearHandAction } from "../../actions/table/game/dealing/clear-hand-action";
import { DealBoardAction } from "../../actions/table/game/dealing/deal-board-action";
import { ClearBoardAction } from "../../actions/table/game/dealing/clear-board-action";
import { LobbyManager } from "../lobby/lobby-manager";
import { betController } from "./betting/bet-controller";
import { PotCardsUsedAction } from "../../actions/table/game/pots/pot-cards-used-action";
import { ShowdownAction } from "../../actions/table/game/showdown/showdown-action";
import { InvalidBet } from "./betting/invalid-bet";
import { InvalidFold } from "./betting/invalid-fold";
import { IServerClient } from "../../communication/server-side/i-server-client";
import { IButtonController } from "./buttons/i-button-controller";
import { CashierManager } from '../cashier/cashier-manager';
import { BlindTracker } from './buttons/blind-tracker';
import { RemainingActor } from './betting/remaining-actor';
import { v4 as uuidv4 } from 'uuid';
import { IChipFormatter } from './chips/chip-formatter';
import { Timer } from '../../timers/timer';
import { ProbabilityAction } from '../../actions/table/probability/probability-action';
import { Limits } from './betting/limits';
import { ChipFormatterFactory } from './chips/chip-formatter-factory';

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

    private readonly TIME_ALL_IN_FLIP_CARDS: number = 2000;


    private cashierManager: CashierManager;
    private lobbyManager: LobbyManager;


    private table: Table;
    private game: Game;
    private deck: Deck;
    private chipFormatter: IChipFormatter;

    private copier: DeepCopier;

    private messageQueue: Array<Message | MessagePair>;

    // A map of MessageHandlers
    // Key = MessageHandler.id, so that the same handler will not be added more than once
    // Value = MessageHandler object
    private messageHandlers: Map<string, MessageHandler>;

    // Track betTimers per seat
    private betTimerMap: Map<number, ReturnType<typeof setTimeout>>;

    private buttonController: IButtonController;
    private blindTracker: BlindTracker;

    private setStatusRequests: Map<number, SetStatusCommand>;
    private standUpRequests: Map<number, StandUpCommand>;

    // Key = userID
    // Value = number of chips to add on, when possible
    private chipsToAdd: Map<number, number>;

    // A map of Server Clients
    // Key = IServerClient.id, so that the same server client will not be added more than once
    // Value = IServerClient object
    private clients: Map<string, IServerClient>;

    public id: string;


    constructor(cashierManager: CashierManager,
                    lobbyManager: LobbyManager,
                    table: Table,
                    deck: Deck,
                    buttonController: IButtonController) {

        this.id = uuidv4();

        this.cashierManager = cashierManager;
        this.lobbyManager = lobbyManager;

        this.table = table;
        this.deck = deck;

        const chipFormatterFactory = new ChipFormatterFactory();
        this.chipFormatter = chipFormatterFactory.create(table.chipFormatterType);

        this.copier = new DeepCopier();

        this.messageQueue = new Array<Message | MessagePair>();
        this.messageHandlers = new Map<string, MessageHandler>();

        this.betTimerMap = new Map<number, ReturnType<typeof setTimeout>>();

        this.buttonController = buttonController;

        this.blindTracker = new BlindTracker(table.stakes);

        this.setStatusRequests = new Map<number, SetStatusCommand>();
        this.standUpRequests = new Map<number, StandUpCommand>();
        this.chipsToAdd = new Map<number, number>();

        this.clients = new Map<string, IServerClient>();

    }

    getTableID(): number {

        return this.table.id;

    }

    addClient(client: IServerClient): void {

        if (client.isAlive) {

            this.clients.set(client.id, client);

            // Set this manager to listen to commands from this new client
            client.registerCommandHandler(this);

            this.log(`Connected client for userID ${client.userID}`);

            client.handleMessage(new ActionMessage(new TableConnectedAction(this.table.id)));
        }

    }

    removeClient(client: IServerClient): void {

        this.clients.delete(client.id);

    }


    public getSummary(): TableSummary {

        let players: string[] = this.table.seats.reduce((arr: string[], seat: Seat) => { if (seat.player != null) { arr.push(seat.player.name); } return arr; }, []);

        return new TableSummary(this.table.id, this.table.name, this.table.description, this.table.seats.length, players);

    }  // getSummary


    public registerMessageHandler(handler: MessageHandler): void {

        this.messageHandlers.set(handler.id, handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.messageHandlers.delete(handler.id);

    }


    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    private broadcastMessage(message: Message | MessagePair): void {

        for (let client of this.clients.values()) {

            if (!client.isAlive) {
                this.clients.delete(client.id);
                continue;
            }

            if (message instanceof MessagePair) {

                // There is both a public and private message; only the client
                // with the right userID gets the private message - everyone
                // else gets the public one

                if (client.userID === message.privateMessage.userID) {

                    // just send the private message to this client
                    client.handleMessage(message.privateMessage);

                }
                else if (message.publicMessage) {

                    // If there is a public message, then send it instead to this client
                    client.handleMessage(message.publicMessage);

                }

            }
            else {

                // It's a single message, but it is either designed for everyone (userID == null)
                // or for a specific user 

                if (message.userID == null || message.userID == client.userID) {

                    // this is either a public message, or it is marked for this client
                    client.handleMessage(message);

                }

            }

        }

    }   // broadcastMessage



    private queueAction(action: Action, userID?: number) {

        this.queueMessage(new ActionMessage(action, userID));

    }

    private queueMessage(message: Message | MessagePair): void {

        if (message instanceof ActionMessage) {

            // this.log(`Queueing ${message.action.constructor.name}`);

        }
        else if (message instanceof MessagePair) {

            let publicMessage: string = message.publicMessage && message.publicMessage instanceof ActionMessage ? message.publicMessage.action.constructor.name : '[No public message]';
            let privateMessage: string = message.privateMessage && message.privateMessage instanceof ActionMessage ? message.privateMessage.action.constructor.name : '[No private message]';

            // this.log(`Queueing public: ${publicMessage}, private: ${privateMessage} `);

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

        if (command instanceof StandUpCommand) {

            return await this.standUpCommand(command);

        }

        if (command instanceof SetStatusCommand) {

            return await this.setStatus(command);

        }

        if (command instanceof BetCommand) {

            return await this.bet(command);

        }

        if (command instanceof AnteCommand) {

            return await this.anteCommand(command);

        }

        if (command instanceof FoldCommand) {

            return await this.foldCommand(command);
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

        const table: Table = this.copier.copy(this.table);

        // If anyone has face-up cards that is NOT this player, then turn their cards over
        for (let seat of table.seats) {

            if (seat.hand) {

                seat.hand.cards = seat.hand.cards.map(card => {

                    if (card instanceof Card) {

                        // If this card is face up (or is mine), then keep it intact. Otherwise, it will 
                        // turn into a FacedownCard
                        if (card.isFaceUp || seat.player && seat.player.userID === userID) {

                            return card;

                        }

                    }

                    return new FacedownCard();

                });

            }

            if (!seat.player || seat.player.userID !== userID) {

                // if the player is gone, or it is not the player requesting the snapshot, then clear the folded hold cards.
                seat.muckedCards.length = 0;

            }


        }

        return table;

    }  // createTableSnapshot


    private log(message: string): void {

        console.log('\x1b[31m%s\x1b[0m', `TableController ${this.id}, Table ${this.table.id}: ${message}`);

    }



    private async seatPlayer(command: RequestSeatCommand): Promise<void> {

        if (!command.user) {

            this.log(`Missing user for seatPlayer`);
            return this.queueMessage(new Message(`Unknown User`, command.userID));

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

                seat.player = new Player(command.user.id, command.user.name);
                this.queueAction(new PlayerSeatedAction(this.table.id, seat.player, seatIndex));

                // Tell the lobby that the number of players has changed
                this.lobbyManager.notifyTableUpdated(this.table);

                return await this.checkStartHand();

            }

            return this.queueMessage(new Message(`${seat.getName()} is already taken`, command.userID));

        }

        return this.queueMessage(new Message(`Could not find seat ${seatIndex}`, command.userID));

    }


    private async standUpCommand(command: StandUpCommand): Promise<void> {

        if (!command.user) {

            this.log(`Missing user for standUp`);
            return this.queueMessage(new Message(`Unknown User`, command.userID));

        }

        let seat: Seat = this.findSeatByPlayer(command.userID);

        if (seat == null) {

            return this.queueMessage(new Message('You are not at the table', command.userID));

        }

        // if the player is not in action, then standing up takes effect immediately
        if (this.table.state.isHandInProgress() && seat.isInHand) {

            // remember that this player is going to stand up - this will be handled by rejectAnte/foldPlayer, or will get used later on
            this.standUpRequests.set(seat.index, command);

            if (this.table.state instanceof BlindsAndAntesState) {

                let fold: Fold | InvalidFold = betController.fold(this.table, seat, command.userID);

                if (fold instanceof Fold) {

                    return await this.rejectAnte(seat);

                }

            }


            else if (this.table.state instanceof BetState) {

                let fold: Fold | InvalidFold = betController.fold(this.table, seat, command.userID);

                if (fold instanceof Fold) {

                    return await this.foldPlayer(seat, fold);

                }

            }


        }
        else {

            this.processStandUpCommand(command);

        }

    }  // standUp


    private checkStandUp(seat: Seat): void {

        if (seat.player) {

            let standUpCommand: StandUpCommand = this.standUpRequests.get(seat.index);

            if (standUpCommand) {

                this.processStandUpCommand(standUpCommand);

                // remove it so that it is also not processed at the end of the hand
                this.standUpRequests.delete(seat.index);

            }

        }

    }  // checkStandUp


    private processStandUpCommand(command: StandUpCommand): void {

        let seat: Seat = this.findSeatByPlayer(command.userID);

        if (seat && seat.player) {

            // remove the player from the table

            if (seat.player.chips) {

                // return their chips to the cashier
                this.cashierManager.cashInChips(command.userID, seat.player.chips);

            }

            seat.player = null;

            this.queueAction(new SeatVacatedAction(this.table.id, seat.index));

            // Tell the lobby that the number of players has changed
            this.lobbyManager.notifyTableUpdated(this.table);

        }

    }  // processStandUpCommand


    private async setStatus(command: SetStatusCommand): Promise<void> {

        let seat: Seat = this.findSeatByPlayer(command.userID);

        if (seat) {

            // if the player is not in action, then sitting in/out takes effect immediately
            if (!this.table.state.isHandInProgress() || !seat.isInHand) {

                // Let the client know we received this request, even though we're processing it immediately
                this.queueAction(new SetStatusAckedAction(this.table.id, command.userID), command.userID);
                this.processSetStatusCommand(command, seat);

            }
            else {

                // Remember this command for between rounds
                this.setStatusRequests.set(seat.index, command);

                // Let the client know we received this request
                this.queueAction(new SetStatusAckedAction(this.table.id, command.userID), command.userID);


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




    public addChips(userID: number, amount: number): Message | ErrorMessage {

        let seat: Seat = this.findSeatByPlayer(userID);

        if (seat) {

            let player: Player = seat.player;

            if (!this.table.state.isHandInProgress() || !seat.isInHand) {

                // The player is not current involved in a hand, so we can add their chips immediately
                player.chips += amount;

                this.queueAction(new AddChipsAction(this.table.id, player.userID, amount));
                this.queueAction(new StackUpdateAction(this.table.id, player.userID, player.chips));
                this.checkStartHand();

                // successfully added to a player not in the hand
                return new Message('Success', userID);

            }

            // we can't add the chips right now, but they will be added before the next hand
            this.chipsToAdd.set(userID, amount);

            // TODO: create delayed AddChips action?
            this.queueMessage(new Message(`${player.name} has bought in for ${amount} on the next hand`, userID));

            this.checkStartHand();

            // succesully marked the chips to be added after this hand is complete
            return new Message('Success', userID);

        }

        return new ErrorMessage('User is not seated at the table', userID);

    }



    private async checkStartHand(): Promise<void> {

        if (!this.table.state.isHandInProgress() && this.isReadyForHand()) {

            this.log(`Starting new hand`);
            return await this.goToNextState();

        }

    }  // checkStartHand


    private clearBetTimeout(seatIndex: number): void {

        this.queueAction(new ClearTimerAction(this.table.id, seatIndex));
        clearTimeout(this.betTimerMap.get(seatIndex));
        this.betTimerMap.delete(seatIndex);

        // Remove the timer data from the seat
        this.table.seats[seatIndex].timer = null;

    }




    private async anteCommand(command: AnteCommand): Promise<void> {

        this.log(`Received AnteCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        let bettorSeat: Seat = this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);
        if (!bettorSeat) {

            return this.queueMessage(new Message('You are not at the table', command.userID));

        }

        let anteResult: InvalidBet | Bet[] = betController.validateBlindsAndAnte(this.table, bettorSeat, command.userID);

        if (anteResult instanceof InvalidBet) {

            // TODO: Send action indicating invalid bet so that the UI can reset itself
            return this.queueMessage(new Message(anteResult.message, command.userID));

        }
        else {

            this.clearBetTimeout(bettorSeat.index);

            // Give them credit for all the blinds they were supposed to pay 
            this.blindTracker.addPayments(this.table, bettorSeat.index, command.userID, this.table.betStatus.forcedBets);

            let hasBlind: boolean = false;

            for (let anteBlind of anteResult) {

                // When announcing the results use the actual bets so that if they put in less (or nothing) then it 
                // announces *that* amount rather than what was originally required
                this.queueAction(new BetAction(this.table.id, bettorSeat.index, anteBlind));

                if (anteBlind.betType == Bet.TYPE.BLIND) {
                    hasBlind = true;
                }

            }

            this.setBettingAction(bettorSeat.index, hasBlind ? Bet.ACTION_TEXT.BLIND : Bet.ACTION_TEXT.ANTE);
            this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
            this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

            await this.wait(this.TIME_ANTE);

            // if the player has not specified in or out, then ante-ing put them firmly in the "not-sitting-out" camp
            // We check this flag so that we're not spamming out SetStatusActions when the status hasn't changed
            if (bettorSeat.player.isSittingOut === null) {

                this.markSittingOut(bettorSeat, false);

            }

            return await this.checkForcedBets();

        }

    }  // ante


    private isSeatEligibleToBet(seat: Seat): boolean {

        return seat && seat.isInHand && seat.player && seat.player.chips > 0;

    }

    private isSeatEligibleToAnte(seat: Seat): boolean {

        return seat && seat.player && seat.isInHand && seat.player.chips > 0;

    }


    private async bet(command: BetCommand): Promise<void> {

        this.log(`Received ${command.constructor.name} from ${command.userID}, tableState: ${this.table.state.constructor.name}`);

        if (this.table.state instanceof BetState) {

            let bettorSeat: Seat =  this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);

            let betResult: InvalidBet | Bet = betController.validateBet(this.table, bettorSeat, command.userID, command.amount);

            if (betResult instanceof Bet) {

                this.clearBetTimeout(bettorSeat.index);

                this.setBettingAction(bettorSeat.index, betResult.getActionString());
                this.queueAction(new BetAction(this.table.id, bettorSeat.index, betResult));
                this.queueAction(new StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));

                // If this bet raised the action, then reset the list of who still needs to act behind this player
                if (betResult.raisesAction) {

                    // re-calculate the bettors remaining to act before updating the BetStatus
                    // Start with the player *after* this bettor
                    // Stop with the player *before* this bettor
                    // The bet tracker is smart enough to roll the indexes off either end
                    betController.calculateRemainingActors(this.table, bettorSeat.index + 1, bettorSeat.index - 1, this.isSeatEligibleToBet);

                }

                this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

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

        // We want each player to remember their own mucked cards, but we don't want anyone *else* to know what they were (unless they were all face-up)

        // Take away their cards - here on the server this will always be an array of Card
        let muckedCards: Array<Card | FacedownCard> = folderSeat.clearHand();

        folderSeat.muckedCards = muckedCards;

        let publicMuckedCards: Array<FacedownCard> = muckedCards.map(card => new FacedownCard());

        this.setBettingAction(folderSeat.index, Bet.ACTION_TEXT.FOLD);

        // This will tell watchers that the given seat is no longer in the hand

        // It's face-down, so the public action does not include the card info, whereas the private action does
        let publicFoldMessage = new ActionMessage(new FoldAction(this.table.id, folderSeat.index, fold, publicMuckedCards));

        if (folderSeat.player) {

            let privateFoldMessage = new ActionMessage(new FoldAction(this.table.id, folderSeat.index, fold, muckedCards), folderSeat.player.userID);
            this.queueMessage(new MessagePair(publicFoldMessage, privateFoldMessage));

        }
        else {

            this.queueMessage(publicFoldMessage);

        }

        this.checkStandUp(folderSeat);

        return await this.advanceBetTurn();

    }   // foldPlayer


    private async foldCommand(command: FoldCommand): Promise<void> {

        if (this.table.state instanceof BlindsAndAntesState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.isInHand && seat.player && seat.player.userID == command.userID);

            let fold: Fold | InvalidFold = betController.fold(this.table, folderSeat, command.userID);

            if (fold instanceof Fold) {

                return await this.rejectAnte(folderSeat);

            }

            return this.queueMessage(new Message(fold.message, command.userID));

        }


        if (this.table.state instanceof BetState) {

            let folderSeat: Seat = this.table.seats.find(seat => seat.isInHand && seat.player && seat.player.userID == command.userID);

            let fold: Fold | InvalidFold = betController.fold(this.table, folderSeat, command.userID);

            if (fold instanceof Fold) {

                return await this.foldPlayer(folderSeat, fold);

            }

            return this.queueMessage(new Message(fold.message, command.userID));

        }

        return this.queueMessage(new Message('It is not time to bet', command.userID));

    }  // foldCommand


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

        if (command.user) {

            return this.queueAction(new ChatAction(this.table.id, command.user.username, command.message));

        }

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



    private countPlayersInHand(): number {

        return this.table.seats.filter(s => s.isInHand).length;

    }  // countPlayersInHand


    private doBetweenHandsBusiness() {

        this.log('In doBetweenHandsBusiness');

        for (let seat of this.table.seats) {

            // If we're between hands, then none of the seats are in a hand, right?
            this.clearHand(seat);

            this.checkStandUp(seat);

            if (seat.player) {

                if (this.chipsToAdd.has(seat.player.userID)) {

                    let numChips: number = this.chipsToAdd.get(seat.player.userID);

                    if (numChips > 0) {

                        this.queueAction(new AddChipsAction(this.table.id, seat.player.userID, numChips));

                        // Add their chips "to-be-added" to their currents stack
                        seat.player.chips += numChips;


                        this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

                    }

                    this.chipsToAdd.delete(seat.player.userID);

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
        this.standUpRequests.clear();

    }  // doBetweenHandsBusiness


    private async changeTableState(state: TableState): Promise<void> {

        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);

        this.queueAction(new TableStateAction(this.table.id, state));

        if (state instanceof OpenState) {

            return this.resetOpenState();

        }


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

            return await this.checkForcedBets();

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


    private resetOpenState(): void {

        // Reset blinds, buttons, etc - when we start up again then all will be new
        betController.resetOpenState(this.table.betStatus);
        this.blindTracker.resetForOpenState(this.table);
        this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

    }

    private resetBetsForNewHand(): void {

        betController.resetHand(this.table.betStatus);

        // This will freeze the available and active players for this particular hand so that no-one can join after this point
        this.blindTracker.resetHand(this.table);

        this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

    }


    private async startHand(): Promise<void> {

        this.deck.shuffle();

        this.resetBetsForNewHand();

        for (let seat of this.table.seats) {

            // Remove any cards they might have
            seat.clearHand();

        }

        const numAvailableSeats: number = this.blindTracker.getNumAvailablePlayers();

        if (numAvailableSeats > 1) {

            return await this.goToNextState();

        }

        return await this.goToOpenState();

    }   // startHand


    private async goToOpenState(): Promise<void> {

        return await this.changeTableState(this.game.stateMachine.goToOpenState());

    }  // goToOpenState


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


    private async checkForcedBets(): Promise<void> {

        this.log('In checkForcedBets');

        if (!(this.table.state instanceof BlindsAndAntesState)) {

            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;

        }

        let forcedBetRequired: boolean = this.buttonController.calculateNextForcedBet(this.table, this.blindTracker);

        // Whether there is a forced bet or not we want to update everyone's version of the truth
        this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

        if (forcedBetRequired) {

            this.log(`There is a ForcedBet for seat ${this.table.betStatus.seatIndex}: ${this.table.betStatus.forcedBets.join(" ")}`);

            let anteSeat: Seat = this.table.seats[this.table.betStatus.seatIndex];

            if (!anteSeat.player || anteSeat.player.userID !== this.table.betStatus.actionOnUserID) {

                return this.rejectAnte(anteSeat);

            }

            let millisToAct: number = this.table.rules.timeToAnte * 1000;
            let timesUp: number = Date.now() + millisToAct;

            anteSeat.timer = new Timer(timesUp);

            // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending an Ante command
            this.betTimerMap.set(anteSeat.index, setTimeout(async () => {

                return this.rejectAnte(anteSeat);

            }, millisToAct));

            // Clear any previous action for the ante-er
            this.setBettingAction(anteSeat.index, null);

            // We found a forced bet, so ship it out and we're done
            return this.queueAction(new AnteTurnAction(this.table.id, timesUp));

        }

        this.blindTracker.saveBlindPayments();

        // The forced bets will have updated the button position, so let's send the clients the new button position
        this.queueAction(new MoveButtonAction(this.table.id, this.table.buttonIndex));
        await this.wait(this.TIME_SET_BUTTON);

        // completeBetting will automatically look for bets that need returning if we don't have enough players

        return await this.completeBetting();

    }   // checkForcedBets


    private async rejectAnte(anteSeat: Seat): Promise<void> {

        this.clearBetTimeout(anteSeat.index);

        this.log(`${anteSeat.getName()} did not ante - marking as sitting out`);

        // they didn't pay the ante, so they're OUT
        if (anteSeat.player) {

            this.blindTracker.removeActivePlayer(anteSeat.player.userID);
            this.markSittingOut(anteSeat, true);

        }

        this.checkStandUp(anteSeat);


        return await this.checkForcedBets();

    }   // rejectAnte


    private clearHand(seat: Seat): void {

        seat.clearHand();

        // This should only be called between hands, and not just for a regular fold, so we can clear out their mucked cards as well
        seat.muckedCards.length = 0;

        this.queueAction(new IsInHandAction(this.table.id, seat.index, false));

    }  // clearHand


    private markSittingOut(seat: Seat, isSittingOut: boolean): void {

        if (seat.player) {

            // Tell the world whether this player is sitting out
            seat.player.isSittingOut = isSittingOut;
            this.queueAction(new SetStatusAction(this.table.id, seat.player.userID, isSittingOut));

        }

    }  // markSittingOut



    private async makeYourBets(betState: BetState): Promise<void> {

        this.log('In makeYourBets');

        betController.increaseBettingRound(this.table.betStatus);
        this.calculateInitialBettingOrder(betState.firstToBet, this.isSeatEligibleToBet);

        return await this.validateBettorOrMoveOn();

    }   // makeYourBets


    private async validateBettorOrMoveOn(): Promise<void> {

        if (this.getSeatIndexesStillInHand().size < 2) {

            // someone probably folded when first to act - no point in going through the list

            // completeBetting will automatically look for bets that need returning if we don't have enough players
            return await this.completeBetting();

        }

        let remainingActor: RemainingActor = betController.getNextBettor(this.table.betStatus);

        if (remainingActor === undefined) {

            return await this.completeBetting();

        }

        // Make sure they haven't left the table or anything
        let seat: Seat = this.table.seats[remainingActor.seatIndex];

        if (!seat.isInHand || !seat.player || seat.player.userID != remainingActor.userID) {

            // go to the next seat
            return await this.validateBettorOrMoveOn();

        }

        await this.setBetTurn(remainingActor);

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


    private async completeBetting(): Promise<void> {

        this.log('In completeBetting');

        if (this.table.state instanceof BetState) {

            // It is no longer anyone's turn to act, so turn off the actor and broadcast this state to everyone
            this.table.betStatus.seatIndex = this.table.betStatus.actionOnUserID = null;
            this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

        }

        this.queueAction(new BettingCompleteAction(this.table.id));
        await this.wait(this.TIME_LAST_BET_MADE);


        if (this.table.state instanceof BlindsAndAntesState) {

            // Only gather antes, not the blinds!
            if (this.table.betStatus.hasAntes()) {

                this.log('Gather antes');
                this.queueAction(new GatherAntesAction(this.table.id));

                betController.gatherAntes(this.table.betStatus, this.getSeatIndexesStillInHand());

                // give it a minute before clearing out all the actions
                await this.wait(this.TIME_GATHERING_BETS);

                this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));
                this.queueAction(new GatherAntesCompleteAction(this.table.id));

            }
            else {
                this.log('No antes to gather');
            }

            let numPlayers: number = 0;

            for (let seat of this.table.seats) {

                seat.isInHand = this.blindTracker.isSeatActive(seat);
                this.queueAction(new IsInHandAction(this.table.id, seat.index, seat.isInHand));

                if (seat.isInHand) {
                    numPlayers++;
                }

            }

            if (numPlayers < 2) {

                // We don't have enough players, so go back to the open state
                this.log(`In BlindsAndAntesState in completeBetting and we don't have enough players - going to OpenState`);
                return this.goToOpenState();

            }

        }

        else if (this.table.state instanceof BetState) {

            if (this.table.betStatus.hasBets()) {

                // look for uncalled bets (or pieces of bets of bets that were not fully called)
                await this.returnBets(betController.checkBetsToReturn(this.table.betStatus));

                this.log('Gather bets');
                this.queueAction(new GatherBetsAction(this.table.id));

                betController.gatherBets(this.table.betStatus, this.getSeatIndexesStillInHand());

                // give it a minute before clearing out all the actions
                await this.wait(this.TIME_GATHERING_BETS);

                this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));
                this.queueAction(new GatherBetsCompleteAction(this.table.id));

            }
            else {
                this.log('No bets to gather');
            }

        }

        this.clearBettingActions();

        // See if we maybe want to do something special once players are all-in
        await this.checkAllIn();

        //      await this.wait(this.TIME_BETTING_COMPLETE);
        return await this.goToNextState();

    }  // completeBetting


    private clearBettingActions(): void {

        for (let seat of this.table.seats) {

            seat.action = null;

        }

        this.queueAction(new ClearBettingActionsAction(this.table.id));

    }


    private setBettingAction(seatIndex: number, action: string): void {

        this.table.seats[seatIndex].action = action;
        this.queueAction(new BettingActionAction(this.table.id, seatIndex, action));

    }




    private async checkAllIn(): Promise<void> {

        // If we have zero or one player with chips left, but multiple people in the pot, then time to flip 'em up
        if (betController.checkAllIn(this.table)) {

            // 5000 generally seems to match 50K better than 10K does....???  And 5K takes 1/10th as long as 50K
            this.calculateOdds(5000);

            // Flip all the cards face-up
            for (let seat of this.table.seats) {

                if (seat.hand && seat.hand.cards.filter(card => card instanceof FacedownCard || !card.isFaceUp).length) {

                    // They have at least one card face down, so flip 'em up
                    seat.hand.flipCards();
                    this.queueAction(new FlipCardsAction(this.table.id, seat.index, seat.hand));

                }

                this.queueAction(new ProbabilityAction(seat.index, null));

                this.queueAction(new ProbabilityAction(seat.index, seat.chanceToWin));

            }

            // We're going to pause, even if we didn't just flip cards - it gives everyone time to process the board running out.
            await this.wait(this.TIME_ALL_IN_FLIP_CARDS);

        }

    }

    private calculateOdds(numSimulations: number): void {

        const startTime = Date.now();

        let remainingStates: TableState[] = this.game.stateMachine.getRemainingDealStates();

        let seatWinnersMap: Map<number, number> = new Map<number, number>();

        // deal from a copy of the deck
        let deck: Deck = this.deck.clone();

        // Track the cards that get dealt so that we can just put them back in the deck before the next simulation rather than
        // creating it from scratch every time
        let usedCards: Card[] = [];

        const seatHands: { seatIndex: number, hand: Hand }[] = [];

        // Remember how many cards have been dealt to the players so that we can reset it after each round
        let numPlayerCards: number = 0;

        for (let seat of this.table.seats) {

            if (seat.hand) {

                // Create a copy of their hand as it is now
                // TODO: if the hole cards are all done then do this up front to save time & effort
                seatHands.push({ seatIndex: seat.index, hand: seat.hand.clone() });

                // Making the assumption that all player hands are the same length
                numPlayerCards = seat.hand.cards.length;

            }

        }

        const board: Board = this.table.board.clone();

        // Remember how many cards are already on the board so that we can reset it after each run
        const numBoardCards: number = board.cards.length;



        // Do a Monte Carlo simulation to see how many times each remaining player would win
        for (let t = 0; t < numSimulations; t++) {

            if (usedCards.length) {

                // put the dealt cards back in the deck
                deck.cards.push(...usedCards);
                usedCards.length = 0;

            }

            // shuffle the reconstituted deck
            deck.shuffleRemaining();

            // Reset the cards in each player's hand
            for (const seatHand of seatHands) {
                seatHand.hand.cards.length = numPlayerCards;
            }

            // Reset the board cards
            board.cards.length = numBoardCards;

            for (let dealState of remainingStates) {

                if (dealState instanceof DealState) {

                    // deal all the hands a card - we're not going to worry about what order they would be dealt in the real world - it's all random, right?
                    for (let seatHand of seatHands) {

                        const card = deck.deal();
                        usedCards.push(card);
                        seatHand.hand.deal(card);

                    }

                }
                else if (dealState instanceof DealBoardState) {

                    for (let b = 0; b < dealState.numCards; b++) {

                        const card = deck.deal();
                        usedCards.push(card);
                        board.deal(card);

                    }

                }

            }

            const winners: HandWinner[] = this.determineBestHands(seatHands, board);

            if (winners.length > 0) {

                const winner = winners[0];

                if (winners.length > 1) {

                    // only give the top hand a win if it is not tied with the second-best
                    if (winner.evaluation.compareTo(winners[1].evaluation) > 0) {

                        seatWinnersMap.set(winner.seatIndex, (seatWinnersMap.get(winner.seatIndex) || 0) + 1);

                    }

                }
                else {

                    // only one player, so give them the win
                    seatWinnersMap.set(winner.seatIndex, (seatWinnersMap.get(winner.seatIndex) || 0) + 1);

                }


/*
 * This version will count a tie as a win for all that tie for the best hand
                for (let winner of winners) {

                    if (winner.evaluation.compareTo(winningHand) >= 0) {

                        seatWinnersMap.set(winner.seatIndex, (seatWinnersMap.get(winner.seatIndex) || 0) + 1);

                    }
                    else {

                        // stop looking for winners
                        break;
                    }

                }
*/

            }

        }

        let mostWins: number = 0;

        for (let seat of this.table.seats) {

            mostWins = Math.max(mostWins, seatWinnersMap.get(seat.index) || 0);

            seat.chanceToWin = !seat.hand
                ? null
                : seatWinnersMap.has(seat.index) ? seatWinnersMap.get(seat.index) / numSimulations : 0;

        }

        const duration = Date.now() - startTime;

        this.log(`Took ${duration} ms to calculate ${numSimulations} simulations; the favorite won ${(100 * mostWins / numSimulations).toFixed(1)}% of the time`);

    }


    private async setBetTurn(actor: RemainingActor): Promise<void> {

        this.table.betStatus.seatIndex = actor.seatIndex;
        this.table.betStatus.actionOnUserID = actor.userID;

        let millisToAct: number = this.table.rules.timeToAct * 1000;

/*
        if (this.table.seats[seatIndexToAct].player.userID === 1) {
            millisToAct *= 5;
        }
*/
        let actorSeat = this.table.seats[actor.seatIndex];

        let timesUp: number = Date.now() + millisToAct;

        actorSeat.timer = new Timer(timesUp);

        // Clear any previous action for this bettor
        this.setBettingAction(actor.seatIndex, null);

        // tell everyone it's his turn
        this.queueAction(new BetTurnAction(this.table.id, this.table.betStatus, timesUp));

        // This is a countdown for the user to act, so we actually want to use a timer here because it can be interrupted by the user sending a command
        this.betTimerMap.set(actor.seatIndex, setTimeout(async () => {

            // try to check
            let check: InvalidBet | Bet = betController.validateBet(this.table, actorSeat, actor.userID, 0);

            if (check instanceof Bet) {

                this.setBettingAction(actorSeat.index, Bet.ACTION_TEXT.CHECK);
                this.queueAction(new BetAction(this.table.id, actorSeat.index, check));
                return await this.advanceBetTurn();

            }

            let fold: Fold = betController.fold(this.table, actorSeat, actor.userID);

            if (fold instanceof Fold) {

                return await this.foldPlayer(actorSeat, fold);

            }

            this.log(`TableController could not check or fold ${actorSeat.getSeatName()}`);

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

        betController.clearBettorsToAct(this.table.betStatus);

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
                    return betController.calculateRemainingActors(this.table, this.table.buttonIndex + 1, this.table.buttonIndex, isSeatEligible);
                }

            case BetState.AFTER_BIG_BLIND:
                {
                    let bigBlindIndex: number = this.blindTracker.bigBlindIndex;

                    if (bigBlindIndex === null) {

                        // There is no Big Blind, so start with the player after the button
                        // The button will be the last player to act
                        // The bet tracker is smart enough to roll the indexes off either end
                        return betController.calculateRemainingActors(this.table, this.table.buttonIndex + 1, this.table.buttonIndex, isSeatEligible);

                    }

                    // Start with the player *after* the big blind
                    // The big blind will be the last player to act and will get the option to raise
                    // The bet tracker is smart enough to roll the indexes off either end
                    return betController.calculateRemainingActors(this.table, bigBlindIndex + 1, bigBlindIndex, isSeatEligible);

                }

            case BetState.BEST_HAND:
                {
                    let handWinners: Array<HandWinner> = this.findWinners();

                    // Start with the player with the best hand
                    // Stop with the player *before* the current leader
                    // The bet tracker is smart enough to roll the indexes off either end
                    return betController.calculateRemainingActors(this.table, handWinners[0].seatIndex, handWinners[0].seatIndex - 1, isSeatEligible);
                }
        
        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }   // findFirstToBet


    private findWinners(): Array<HandWinner> {

        const hands = [] as { seatIndex: number, hand: Hand }[];

        for (const seat of this.table.seats) {

            if (seat.hand) {

                hands.push({ seatIndex: seat.index, hand: seat.hand });

            }

        }

        return this.determineBestHands(hands, this.table.board)


    }  // findWinners


    private determineBestHands(hands: { seatIndex: number, hand: Hand }[], board: Board): Array<HandWinner> {

        // Put their best hand on the list
        let handWinners: Array<HandWinner> = hands.map(seatHand => new HandWinner(this.game.handSelector.select(this.game.handEvaluator, seatHand.hand, board), seatHand.seatIndex));

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

        this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

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
            this.queueAction(new UpdateBetsAction(this.table.id, this.table.betStatus));

            await this.wait(this.TIME_WIN_POT);

        }  // while we have pots to work through


        // Update all the player chip counts at once
        for (let seat of this.table.seats) {

            if (seat.player) {

                this.queueAction(new StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));

            }

        }

        // clear all betting action
        this.resetBetsForNewHand();

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

            if (seat.chanceToWin != null) {

                seat.chanceToWin = null;
                this.queueAction(new ProbabilityAction(seat.index, null));

            }

        }

        this.table.board.reset();
        this.queueAction(new ClearBoardAction(this.table.id));

        this.resetBetsForNewHand();

        return await this.goToNextState();

    }   // completeHand


    private async goToNextState(): Promise<void> {

        let nextState: TableState = this.game.stateMachine.nextState();

        // this.log(`Changing to next state: ${(nextState == null ? 'null' : nextState.constructor.name)}`);

        await this.changeTableState(nextState);

     }


    public isPlayerInHand(userID: number): boolean {

        let seat: Seat = this.findSeatByPlayer(userID);

        return seat && seat.isInHand;

    }

    public getPlayerChips(userID: number): number {

        let seat: Seat = this.findSeatByPlayer(userID);

        if (seat) {

            return seat.player.chips;
        }

        return null;

    }


    public getLimits(): Limits {

        return this.table.limits;

    }


    public getStakes(): Stakes {

        return this.table.stakes;

    }


    public getChipFormatter(): IChipFormatter {

        return this.chipFormatter;

    }




}