import { MessageHandler } from "../../app/messages/message-handler";
import { CommandBroadcaster } from "../../app/commands/command-broadcaster";
import { UserSummary } from "../../app/players/user-summary";
import { CommandHandler } from "../../app/commands/command-handler";
import { Message } from "../../app/messages/message";
import { ActionMessage } from "../../app/messages/action-message";
import { Command } from "../../app/commands/command";
import { Table } from "../../app/casino/tables/table";
import { TableSnapshotAction } from "../../app/actions/table/state/table-snapshot-action";
import { Action } from "../../app/actions/action";
import { PlayerSeatedAction } from "../../app/actions/table/players/player-seated-action";
import { SeatVacatedAction } from "../../app/actions/table/players/seat-vacated-action";
import { Logger } from "../../app/logging/logger";
import { TableConnectedAction } from "../../app/actions/table/state/table-connected-action";
import { AuthenticateCommand } from "../../app/commands/security/authenticate-command";
import { TableSnapshotCommand } from "../../app/commands/table/table-snapshot-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, GatherBetsAction, GatherAntesAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, AnteTurnAction, BetCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, BettingCompleteAction, Card, AnteCommand, IsInHandAction, DealBoardAction, JoinTableCommand, LoginCommand, BetState, BlindsAndAntesState, GatherBetsCompleteAction, GatherAntesCompleteAction, SetStatusCommand, PotCardsUsedAction, ShowdownAction, FacedownCard, ChatAction, AuthenticatedAction, CheckBalanceCommand, TableAction, RaiseCommand, CallCommand, ClearBoardAction, ClearHandAction } from "../../app/communication/serializable";
import { SetGameAction } from "../../app/actions/table/game/set-game-action";
import { SetStatusAction } from "@/app/actions/table/players/set-status-action";
import { SetStatusAckedAction } from "@/app/actions/table/players/set-status-acked-action";
import { GameFactory } from "../../app/games/game-factory";
import { WonPot } from "../../app/casino/tables/betting/won-pot";
import { HandCompleteAction } from "../../app/actions/table/game/hand-complete-action";
import { Timer } from "../../app/timers/timer";
import { CurrentBalanceAction } from "../../app/actions/cashier/current-balance-action";
import { UIPosition } from "../../app/ui/ui-position";


import { userState } from "@/store/user-state";
import { tableState } from "@/store/table-state";


const logger: Logger = new Logger();

export class TableUI implements MessageHandler, CommandBroadcaster {

    private readonly TIME_PENDING_ACTION: number = 300;

    private commandHandlers: CommandHandler[];




    constructor() {

        this.commandHandlers = new Array<CommandHandler>();
            
        // We need to set these values (even to null) so that they are reactive.
        // If we leave them `undefined` then Vue does not define a setter for it

        this.clearLocalBets();

        this.setUpPositions();

    }

    private setUpPositions() {


        const dealerPositions = new Map<number, UIPosition>();
        dealerPositions.set(0, new UIPosition(-60, 390));
        dealerPositions.set(1, new UIPosition(250, 590));
        dealerPositions.set(2, new UIPosition(560, 390));
        dealerPositions.set(3, new UIPosition(560, -270));
        dealerPositions.set(4, new UIPosition(250, -410));
        dealerPositions.set(5, new UIPosition(-50, -250));

        tableState.setDealerPositions(dealerPositions);

        const playerPositions = new Map<number, UIPosition>();
        playerPositions.set(0, new UIPosition(180, -125));
        playerPositions.set(1, new UIPosition(25, -185));
        playerPositions.set(2, new UIPosition(-125, -105));
        playerPositions.set(3, new UIPosition(-125, 195));
        playerPositions.set(4, new UIPosition(25, 200));
        playerPositions.set(5, new UIPosition(163, 185));

        tableState.setPlayerPositions(playerPositions);

    }


    handleMessage(message: Message): void {

        if (message.text) {

            this.log(message.text);

        }

        if (!(message instanceof ActionMessage)) {

            // Not an ActionMessage, so nothing further to do
            return;

        }

        let action: Action = message.action;

        if (action instanceof AuthenticatedAction) {

            return this.authenticatedAction(action);

        }

        if (action instanceof TableConnectedAction) {

            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new TableSnapshotCommand(tableState.getTableID.value))
            return;

        }

        if (action instanceof TableSnapshotAction) {

            return this.tableSnapshotAction(action);

        }

        if (action instanceof CurrentBalanceAction) {

            return this.currentBalanceAction(action);

        }


        if (action instanceof TableAction && this.getTable() == null) {

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof SetGameAction) {

            return this.setGameAction(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.playerSeatedAction(action);

        }

        if (action instanceof SeatVacatedAction) {

            return this.seatVacatedAction(action);

        }

        if (action instanceof SetStatusAction) {

            return this.setStatusAction(action);

        }

        if (action instanceof SetStatusAckedAction) {

            return this.setStatusAckedAction(action);

        }

        if (action instanceof AddChipsAction) {

            return this.addChipsAction(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.stackUpdateAction(action);
        }

        if (action instanceof TableStateAction) {

            return this.tableStateAction(action);

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBetsAction(action);

        }

        if (action instanceof GatherBetsAction) {

            return this.gatherBetsAction(action);

        }

        if (action instanceof GatherBetsCompleteAction) {

            return this.gatherBetsCompleteAction(action);

        }

        if (action instanceof GatherAntesAction) {

            return this.gatherAntesAction(action);

        }

        if (action instanceof GatherAntesCompleteAction) {

            return this.gatherAntesCompleteAction(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButtonAction(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCardAction(action);
        }

        if (action instanceof DealBoardAction) {

            return this.dealBoardAction(action);
        }

        if (action instanceof ClearBoardAction) {

            return this.clearBoardAction(action);

        }

        if (action instanceof HandCompleteAction) {

            return this.handCompleteAction(action);

        }

        if (action instanceof BetTurnAction) {

            return this.betTurnAction(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurnAction(action);

        }

        if (action instanceof IsInHandAction) {

            return this.isInHandAction(action);

        }


        if (action instanceof BetAction) {

            return this.betAction(action);

        }

        if (action instanceof FoldAction) {

            return this.foldAction(action);

        }

        if (action instanceof ClearHandAction) {

            return this.clearHandAction(action);

        }

        if (action instanceof FlipCardsAction) {

            return this.flipCardsAction(action);

        }

        if (action instanceof DeclareHandAction) {

            return this.declareHandAction(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPotActionAction(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.betReturnedAction(action);
        }

        if (action instanceof BettingCompleteAction) {

            return this.bettingCompleteAction(action);

        }

        if (action instanceof ShowdownAction) {

            return this.showdownAction(action);

        }

        if (action instanceof PotCardsUsedAction) {

            return this.potCardsUsedAction(action);

        }

        if (action instanceof ChatAction) {

            return this.chatAction(action);

        }


        this.log(`Heard ${action.constructor.name}`);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    // Used by components to send commands on the UI's behalf
    // TODO: refactor this so that they send the command to the 
    public sendCommand(command: Command): void {

        return this.broadcastCommand(command);

    }


    private broadcastCommand(command: Command): void {

        this.log(`Sent ${command.constructor.name}`);

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    private getUser(): UserSummary {

        return userState.getUser.value;

    }

    private getTable(): Table {

        return tableState.getTable.value;

    }

    private getGame() {

        return tableState.getGame.value;

    }



    private getMySeat(): Seat {

        if (tableState.getMySeatIndex.value != null) {

            return this.getTable().seats[tableState.getMySeatIndex.value];

        }

        return null;
    }


    public checkBalance(): void {

        tableState.setCurrentBalance(null);
        this.sendCommand(new CheckBalanceCommand());

    }   // checkBalance


    private currentBalanceAction(action: CurrentBalanceAction): void {

        tableState.setCurrentBalance(action.balance);

    }  // currentBalanceAction


    private tableSnapshotAction(action: TableSnapshotAction): void {

        this.log(`Heard TableSnapshotAction for ${action.table.id}`);
        tableState.setTable(action.table);

        // See if I'm alreading sitting at the table
        let mySeat: Seat = action.table.seats.find(seat => seat.player && seat.player.userID === this.getUser().id);

        tableState.setMySeatIndex(mySeat ? mySeat.index : null);

    }  // tableSnapshotAction


    private setGameAction(action: SetGameAction): void {

        let game = this.getGame();

        if (!game || game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            let newGame = (new GameFactory()).create(action.gameID);
            tableState.setGame(newGame);
            this.log(`The game is ${newGame.getName()}`);

        }


    }   // setGamebe


    public authenticate(): void {

        this.broadcastCommand(new AuthenticateCommand());

    }   // authenticate


    public authenticatedAction(action: AuthenticatedAction): void {

        let tableID: number = tableState.getTableID.value;

        this.log(`Heard AuthenticatedAction for ${action.user.username}, sending JoinTableCommand for ${tableID}`);
        userState.setUser(action.user);

        this.broadcastCommand(new JoinTableCommand(tableID));

    }   // authenticated



    public isInHand(): boolean {

        return this.getMySeat()?.isInHand;

    }

    private playerSeatedAction(action: PlayerSeatedAction): void {

        const result = tableState.setPlayer(action.seatIndex, action.player);

        if (result) {

            let message = `${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`;
            tableState.addMessage(message);
            this.log(message);

            if (action.player.userID === this.getUser().id) {
                tableState.setMySeatIndex(action.seatIndex);
            }

        }

    }  // seatPlayer


    private seatVacatedAction(action: SeatVacatedAction): void {

        const result = tableState.setPlayer(action.seatIndex, /* player */ null);

        if (result) {

            if (action.seatIndex === tableState.getMySeatIndex.value) {
                tableState.setMySeatIndex(null);
            }

            let seat: Seat = this.getTable().seats[action.seatIndex];

            let message = `${seat.getSeatName()} is now open`;
            tableState.addMessage(message);

            this.log(message);
            this.log(`Players: [ ${this.getTable().seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

        }

    }  // seatVacated



    private setStatusAction(action: SetStatusAction): void {

        tableState.setPlayerStatus(action.userID, action.isSittingOut);

    }  // setStatusAction


    private setStatusAckedAction(action: SetStatusAckedAction): void {

        // turn off their pending request
        tableState.setHasPendingStatusRequest(false);

    }  // setStatusAckedAction



    private findSeat(seatIndex: number): Seat {

        if (seatIndex >= 0 && seatIndex < this.getTable().seats.length) {
            return this.getTable().seats[seatIndex];
        }

        throw new Error(`Seat index out of range: ${seatIndex}`);

    }  // findSeat
     
    private findPlayer(userID: number): Player {

        let seat = this.getTable().seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer


    private addChipsAction(action: AddChipsAction): void {

        let player: Player = this.findPlayer(action.userID);

        if (player) {

            this.log(`${player.name} adds ${tableState.getChipFormatter.value.format(action.amount)} in chips`);

        }

    }   // addChips



    private stackUpdateAction(action: StackUpdateAction): void {

        tableState.setPlayerChips(action.playerID, action.chips);

    }  // updateStack


    private log(message: string): void {

        console.log(message);

    }


    private clearLocalBets(): void {

        tableState.clearRequiredBetValues();
        tableState.clearPendingBetCommands();

    }


    private tableStateAction(action: TableStateAction): void {

        tableState.setTableState(action.state);

        this.clearLocalBets();

        if (action.state instanceof StartHandState) {

            return this.startHand();

        }

        if (action.state instanceof BetState) {

            return this.betState();

        }

        if (action.state instanceof BlindsAndAntesState) {

            return this.anteState();

        }

    }  // changeTableState



    private startHand(): void {

        for (let seat of this.getTable().seats) {

            if (seat.player) {

                this.log(`${seat.getSeatName()}: ${seat.player.name}: ${tableState.getChipFormatter.value.format(seat.player.chips)}${seat.player.isSittingOut ? ' [sitting out]' : ''}`);

            }

        }

    }   // startHand


    private betState(): void {

        let seat: Seat = this.getMySeat();

        if (seat) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            let myCall: Bet = tableState.getBetController.value.calculateCall(this.getTable(), seat);

            tableState.setMyCall(myCall);
            tableState.setMyMinRaise(tableState.getBetController.value.calculateMinimumRaise(this.getTable(), seat, myCall));
            tableState.setMyMaxRaise(tableState.getBetController.value.calculateMaximumRaise(this.getTable(), seat, myCall));

        }
        else {

            tableState.clearRequiredBetValues();

        }

    }  // betState


    private anteState(): void {

        let seat: Seat = this.getMySeat();

        tableState.clearRequiredBetValues();

        if (seat && seat.isInHand) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            tableState.setMyCall(tableState.getBetController.value.calculateCall(this.getTable(), seat));

            // no betting, only calling, with antes, so nothing to do for myMinRaise or myMaxRaise

            // If I am marked as "not sitting out" then ready my blinds & ante bet
            if (seat.player.isSittingOut === false) {

                this.setBetCommand(new AnteCommand(this.getTable()!.id));

            }  

        }

    }  // anteState



    private updateBetsAction(action: UpdateBetsAction): void {

        tableState.setBetStatus(action.betStatus);

        let table: Table = this.getTable();

        this.log(`Seats To Act: [ ${action.betStatus.seatIndexesRemainToAct.join(" ")} ]`);
        this.log(`Table Seats To Act: [ ${table.betStatus.seatIndexesRemainToAct.join(" ")} ]`);

        let pendingBetNumRaises: number = tableState.getPendingBetNumRaises.value;

        if (tableState.getPendingBetCommand.value) {

            if (pendingBetNumRaises == null || action.betStatus.numRaises > pendingBetNumRaises) {

                // TODO: Maybe leave in place if it is Call Any, or a raise more than what the action took it to
                tableState.clearPendingBetCommands();

            }

        }

        for (let pot of table.betStatus.pots) {
        
            let potDesc = `${pot.getName()}: ${tableState.getChipFormatter.value.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        
        }

        let betsString = Object.keys(table.betStatus.bets)
            .map(seatIndexString => {
                const seatIndex = parseInt(seatIndexString, 10);
                return `${table.seats[seatIndex].getName()}: ${tableState.getChipFormatter.value.format(table.betStatus.bets[seatIndex].totalBet)}`
            }).join(", ");
        if (betsString.length) {
            this.log(`  Bets: ${betsString}`);
        }
        
    }  // updateBets



    private moveButtonAction(action: MoveButtonAction): void {

        tableState.setButtonIndex(action.seatIndex);

        let seat = this.findSeat(action.seatIndex);

        let message: string = `${seat.getName()} now has the button`;
        tableState.addMessage(message);
        this.log(message);

    }   // moveButton


    private dealCardAction(action: DealCardAction): void {

        tableState.dealCard(action.seatIndex, action.card);

        let seat = this.findSeat(action.seatIndex);

        let message: string = null;

        if (action.card instanceof Card) {

            message = `${seat.getName()} is dealt ${this.describeCard(action.card)}`;

        }
        else {

            message = `${seat.getName()} is dealt a card, face-down`;

        }

        tableState.addMessage(message);
        this.log(message);

    }   // dealCard


    private describeCard(card: Card) {

        return `${card.value.symbol}${card.suit.symbol}`;
    }

    private dealBoardAction(action: DealBoardAction): void {

        tableState.dealBoard(action.cards);

        let message: string = `The board is dealt ${ action.cards.map(card => this.describeCard(card)).join(" ") }`;

        tableState.addMessage(message);
        this.log(message);

    }   // dealBoardAction


    private clearBoardAction(action: ClearBoardAction): void {

        tableState.clearBoard();

    }

    
    private handCompleteAction(action: HandCompleteAction): void {

        // If we have pots, then we can't have any WonPots - clear 'em
        tableState.clearWonPots();

        // showdown is no longer required - clear the flags that were highlighting cards
        tableState.setShowdownRequired(false);

        tableState.clearUsedCards();
        tableState.clearMuckedCards();
        tableState.setWinningHand(null);

    }  // handComplete


    private isInHandAction(action: IsInHandAction): void {

        tableState.setIsInHand(action.seatIndex, action.isInHand);

    }  // isInHandAction


    private betTurnAction(action: BetTurnAction): void {

        tableState.setBetStatus(action.betStatus);

        // Remove any previous action for the current "to-act" player
        // Map.delete is safe to use, even if the key does not already exist
        tableState.clearAction(action.betStatus.seatIndex);

        let seat = this.findSeat(action.betStatus.seatIndex);
        this.log(`It is ${seat.getName()}'s turn to act`);

        tableState.clearTimers();

        let mySeat: Seat = this.getMySeat();

        let table: Table = tableState.getTable.value;

        let myCall: Bet = tableState.getBetController.value.calculateCall(table, mySeat);
        let myMinRaise: Bet = tableState.getBetController.value.calculateMinimumRaise(table, mySeat, myCall);
        let myMaxRaise: Bet = tableState.getBetController.value.calculateMaximumRaise(table, mySeat, myCall);

        tableState.setMyCall(myCall);

        // Calculate the min and max raises allowed here
        tableState.setMyMinRaise(myMinRaise);
        tableState.setMyMaxRaise(myMaxRaise);

        let pendingBetCommand: BetCommand | FoldCommand = tableState.getPendingBetCommand.value;

        if (pendingBetCommand instanceof CallCommand) {

            if (myCall == null) {

                tableState.clearPendingBetCommands();

            }

        }

        // if they have already specified a bet then make sure it is still within this range
        else if (pendingBetCommand instanceof RaiseCommand) {

            if (myMinRaise == null) {

                // they are not eligible to bet/raise, so clear their action
                tableState.clearPendingBetCommands();

            }

            // they are set to bet less than the allowed amount, so clear their action
            else if (pendingBetCommand.amount < myMinRaise.chipsAdded) {

                tableState.clearPendingBetCommands();

            }

            // they are set to bet more than the allowed amount, so clear their action
            else if (myMaxRaise && pendingBetCommand.amount > myMaxRaise.chipsAdded) {

                tableState.clearPendingBetCommands();

            }

        }

        if (action.timesUp > Date.now()) {

            if (action.betStatus.seatIndex === tableState.getMySeatIndex.value) {

                // if we had a betting action readied, then send it now
                if (this.checkPendingBetCommand()) {

                    return;

                }

            }

            let timer: Timer = new Timer(action.timesUp);
            tableState.startTimer(seat.index, timer);

        }


    }  // betTurnAction


    private anteTurnAction(action: AnteTurnAction): void {

        const table: Table = this.getTable();

        let anteSeatIndex: number = table.betStatus.forcedBets.seatIndex;

        // Remove any previous action for the current "to-act" player
        tableState.clearAction(anteSeatIndex);

        let anteSeat: Seat = this.findSeat(anteSeatIndex);
        this.log(`It is ${anteSeat.getName()}'s turn to ante`);

        tableState.clearTimers();
        tableState.clearRequiredBetValues();

        if (anteSeat) {

            if (action.timesUp > Date.now()) {

                if (anteSeatIndex == tableState.getMySeatIndex.value) {

                    tableState.setMyCall(tableState.getBetController.value.calculateCall(table, anteSeat));

                    // if we had a betting action readied, then send it now
                    if (this.checkPendingBetCommand()) {

                        return;

                    }

                }

                let timer: Timer = new Timer(action.timesUp);
                tableState.startTimer(anteSeat.index, timer);
                this.log(`Setting ante turn timer for seat ${anteSeat.index} to ${action.timesUp}`);

            }

        }
        else {

            this.log(`In anteTurnAction, could not find seat for index ${anteSeatIndex}`);

        }

    }  // anteTurnAction



    private betAction(action: BetAction): void {

        let seat = this.findSeat(action.seatIndex);

        tableState.clearTimer(action.seatIndex);

        if (action.seatIndex == tableState.getMySeatIndex.value) {

            // I have made a bet, so clear out my planned betting amounts, or they can be used the next time
            this.clearLocalBets();

        }


        let message = 'Unknown message';

        if (action.bet.betType == Bet.TYPE.ANTE) {

            message = `${seat.getName()} antes ${tableState.getChipFormatter.value.format(action.bet.totalBet)}`;
            tableState.setAction(seat.index, 'ANTE');

        }
        else if (action.bet.betType == Bet.TYPE.BLIND) {

            message = `${seat.getName()} blinds ${tableState.getChipFormatter.value.format(action.bet.totalBet)}`;
            tableState.setAction(seat.index, 'BLIND');

        }
        else if (action.bet.betType == Bet.TYPE.REGULAR) {

            switch (action.bet.actionType) {

                case Bet.ACTION.CHECK:
                    message = `${seat.getName()} checks`;
                    tableState.setAction(seat.index, 'CHECK');
                    break;

                case Bet.ACTION.OPEN:
                    message = `${seat.getName()} bets ${tableState.getChipFormatter.value.format(action.bet.totalBet)}`;
                    tableState.setAction(seat.index, 'BET');
                    break;

                case Bet.ACTION.CALL:
                    message = `${seat.getName()} calls ${tableState.getChipFormatter.value.format(action.bet.totalBet)}`;
                    tableState.setAction(seat.index, 'CALL');
                    break;

                case Bet.ACTION.RAISE:
                    message = `${seat.getName()} raises to ${tableState.getChipFormatter.value.format(action.bet.totalBet)}`;
                    tableState.setAction(seat.index, 'RAISE');
                    break;

            }  // switch

        }

        tableState.addMessage(message);
        this.log(message);

    }  // betAction


    private foldAction(action: FoldAction): void {

        tableState.clearTimer(action.seatIndex);

        tableState.clearHand(action.seatIndex);

        tableState.setMuckedCards(action.seatIndex, action.cards);

        let seat = this.findSeat(action.seatIndex);

        let message: string = `${seat.getName()} folds`;

        tableState.addMessage(message);
        this.log(message);

        tableState.setAction(seat.index, 'FOLD');

    }  // fold


    private clearHandAction(action: ClearHandAction): void {

        tableState.clearHand(action.seatIndex);

    }



    private flipCardsAction(action: FlipCardsAction): void {

        tableState.setHand(action.seatIndex, action.hand);

        let seat = this.findSeat(action.seatIndex);

        if (seat.hand?.cards?.length) {

            let message: string = `${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`;
            tableState.addMessage(message);
            this.log(message);

        }

    }  // flipCardsAction


    private declareHandAction(action: DeclareHandAction): void {

        let seat = this.findSeat(action.seatIndex);
        const game = this.getGame();

        let message: string = `${seat.getName()} has ${game?.handDescriber.describe(action.handEvaluation)}`;

        tableState.addMessage(message);
        this.log(message);

    }  // declareHand


    private winPotActionAction(action: WinPotAction): void {

        let pot: WonPot = action.pot;

        tableState.addWonPot(pot);

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.index > 0 ? `side pot #${pot.index}` : `the main pot`;

        let handDescription = ' before showdown';

        // this.winningHand is responsible for showing the winning hand in a banner
        // If there is no showdown then just leave it as `null`

        const game = this.getGame();

        if (pot.handEvaluation) {

            let winningHand = game?.handDescriber.describe(pot.handEvaluation);
            tableState.setWinningHand(winningHand);
            handDescription = ` with ${winningHand}`;

        }
        else {
            tableState.setWinningHand(null);
        }

        let message: string = seat.player
            ? `${seat.getName()} wins ${tableState.getChipFormatter.value.format(pot.amount)} from ${potDescription}${handDescription}`
            : `${seat.getSeatName()} wins ${tableState.getChipFormatter.value.format(pot.amount)} from ${potDescription}${handDescription}`;

        tableState.addMessage(message);
        this.log(message);
        
    }  // winPot


    private betReturnedAction(action: BetReturnedAction): void {

        let seat = this.findSeat(action.seatIndex);
        
        if (seat.player) {

            let message: string = `${tableState.getChipFormatter.value.format(action.amount)} is returned to ${seat.getName()}`;
            tableState.addMessage(message);
            this.log(message);
        
        }
        else {
            this.log(`Need to return ${tableState.getChipFormatter.value.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
        
    }  // returnBet


    private bettingCompleteAction(action: BettingCompleteAction): void {

        this.clearLocalBets();

    }  // bettingComplete


    private showdownAction(action: ShowdownAction): void {

        tableState.setShowdownRequired(action.isShowdownRequired);

    }  // showdown


    private potCardsUsedAction(action: PotCardsUsedAction): void {

        tableState.setUsedCards(action.cards);

    }  // potCardsUsedAction


    private gatherBetsAction(action: GatherBetsAction): void {

        tableState.setGatheringBets(true);

    }  // gatherBets

    private gatherBetsCompleteAction(action: GatherBetsCompleteAction): void {

        tableState.setGatheringBets(false);
        tableState.clearActions();

    }  // gatherBetsComplete


    private gatherAntesAction(action: GatherAntesAction): void {

        tableState.setGatheringAntes(true);

    }  // gatherAntes

    private gatherAntesCompleteAction(action: GatherAntesCompleteAction): void {

        tableState.setGatheringAntes(false);
        tableState.clearActions();

    }  // gatherBetsComplete



    private chatAction(action: ChatAction): void {

        const message = `${action.username}: ${action.message}`;
        tableState.addMessage(message);

        this.log(`${action.username}: ${action.message}`);

    }  // chat


    public setBetCommand(betCommand: BetCommand | FoldCommand) {

        tableState.setPendingBetCommand(betCommand);

        // Remember the level of action when this bet was set - if it goes up then we don't want to keep doing this action
        tableState.setPendingBetNumRaises(tableState.getBetStatus.value.numRaises);

        setTimeout(() => { this.checkPendingBetCommand(); }, 50);

    }


    private checkPendingBetCommand(): boolean {

        const table: Table = this.getTable();

        let pendingBetCommand = tableState.getPendingBetCommand.value;

        if (pendingBetCommand && tableState.getMySeatIndex.value != null) {

            if (table?.state instanceof BlindsAndAntesState) {

                if (table?.betStatus?.forcedBets?.seatIndex == tableState.getMySeatIndex.value) {

                    tableState.clearPendingBetCommands();

                    if (pendingBetCommand instanceof AnteCommand) {

                        this.broadcastCommand(pendingBetCommand);
                        return true;

                    }

                }

            }  // Blinds 'n Ante

            // TODO: Validate first against local BetController and only send if valid?
            else if (this.getTable().state instanceof BetState) {

                if (table.betStatus && table.betStatus.seatIndex == tableState.getMySeatIndex.value) {

                    tableState.clearPendingBetCommands();

                    this.broadcastCommand(pendingBetCommand);
                    return true;

                }

            }  // BetState

        }

        return false;

    }   // checkPendingBetCommand


    public isActionOn(seatIndex: number): boolean {

        const table: Table = this.getTable();

        if (table && table.betStatus) {

            if (table.state instanceof BlindsAndAntesState) {

                return table.betStatus.forcedBets && table.betStatus.forcedBets.seatIndex == seatIndex;

            }

            else if (table.state instanceof BetState) {

                return table.betStatus.seatIndex == seatIndex;

            }

        }

        return false;

    }  // isActionOn

}

export const tableUI = new TableUI();
