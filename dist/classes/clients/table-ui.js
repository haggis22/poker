"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableUI = void 0;
const action_message_1 = require("../messages/action-message");
const table_snapshot_action_1 = require("../actions/table/state/table-snapshot-action");
const player_seated_action_1 = require("../actions/table/players/player-seated-action");
const logger_1 = require("../logging/logger");
const table_connected_action_1 = require("../actions/table/state/table-connected-action");
const table_snapshot_command_1 = require("../commands/table/table-snapshot-command");
const request_seat_command_1 = require("../commands/table/request-seat-command");
const add_chips_command_1 = require("../commands/table/add-chips-command");
const serializable_1 = require("../communication/serializable");
const set_game_action_1 = require("../actions/table/game/set-game-action");
const game_factory_1 = require("../games/game-factory");
const MILLISECONDS_TO_THINK = 250;
const logger = new logger_1.Logger();
class TableUI {
    constructor(user, chipFormatter) {
        this.user = user;
        this.chipFormatter = chipFormatter;
        this.commandHandlers = new Array();
        this.table = null;
    }
    handleMessage(message) {
        if (message.text) {
            this.log(message.text);
        }
        if (!(message instanceof action_message_1.ActionMessage)) {
            // Not an ActionMessage, so nothing further to do
            return;
        }
        let action = message.action;
        if (action instanceof table_connected_action_1.TableConnectedAction) {
            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new table_snapshot_command_1.TableSnapshotCommand(action.tableID, this.user.id));
            return;
        }
        if (this.table == null) {
            if (action instanceof table_snapshot_action_1.TableSnapshotAction) {
                this.table = action.table;
                // request a seat at the table - the null parameter means any seat will do
                this.broadcastCommand(new request_seat_command_1.RequestSeatCommand(this.table.id, this.user, null));
                return;
            }
            // we don't have a table yet, so we can't do anything else
            return;
        }
        if (action instanceof set_game_action_1.SetGameAction) {
            return this.setGame(action);
        }
        if (action instanceof player_seated_action_1.PlayerSeatedAction) {
            return this.seatPlayer(action);
        }
        if (action instanceof serializable_1.AddChipsAction) {
            return this.addChips(action);
        }
        if (action instanceof serializable_1.StackUpdateAction) {
            return this.updateStack(action);
        }
        if (action instanceof serializable_1.TableStateAction) {
            return this.changeTableState();
        }
        if (action instanceof serializable_1.AnteAction) {
            return this.ante(action);
        }
        if (action instanceof serializable_1.UpdateBetsAction) {
            return this.updateBets(action);
        }
        if (action instanceof serializable_1.MoveButtonAction) {
            return this.moveButton(action);
        }
        if (action instanceof serializable_1.SetHandAction) {
            return;
        }
        if (action instanceof serializable_1.DealCardAction) {
            return this.dealCard(action);
        }
        if (action instanceof serializable_1.BetTurnAction) {
            return this.betTurn(action);
        }
        if (action instanceof serializable_1.BetAction) {
            return this.bet(action);
        }
        if (action instanceof serializable_1.FoldAction) {
            return this.fold(action);
        }
        if (action instanceof serializable_1.FlipCardsAction) {
            return this.flipCards(action);
        }
        if (action instanceof serializable_1.DeclareHandAction) {
            return this.declareHand(action);
        }
        if (action instanceof serializable_1.WinPotAction) {
            return this.winPot(action);
        }
        if (action instanceof serializable_1.BetReturnedAction) {
            return this.returnBet(action);
        }
        this.log(`Heard ${action.constructor.name}`);
    }
    registerCommandHandler(handler) {
        this.commandHandlers.push(handler);
    }
    unregisterCommandHandler(handler) {
        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);
    }
    broadcastCommand(command) {
        this.log(`Sent ${command.constructor.name}`);
        if (command instanceof serializable_1.BetCommand) {
            this.log(`  ${command.toString()}`);
        }
        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }
    }
    calculateBuyIn() {
        switch (this.user.name) {
            case 'Danny':
                return 700;
            case 'Mark':
                return 500;
            case 'Paul':
                return 600;
            case 'Joe':
                return 400;
        }
        return 0;
    }
    setGame(action) {
        if (!this.game || this.game.id != action.gameID) {
            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            this.game = (new game_factory_1.GameFactory()).create(action.gameID);
            this.log(`The game is ${this.game.getName()}`);
        }
    } // setGame
    seatPlayer(action) {
        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;
        if (seat) {
            this.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);
            if (seat.player.userID === this.user.id) {
                let chips = Math.min(this.user.chips, this.calculateBuyIn());
                // this.log(`I have a seat, so I am requesting ${this.chipFormatter.format(chips)} in chips`);
                this.broadcastCommand(new add_chips_command_1.AddChipsCommand(this.table.id, this.user.id, chips));
            }
        }
    } // seatPlayer
    findSeat(seatIndex) {
        if (seatIndex >= 0 && seatIndex < this.table.seats.length) {
            return this.table.seats[seatIndex];
        }
        throw new Error(`Seat index out of range: ${seatIndex}`);
    } // findSeat
    findPlayer(userID) {
        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;
    } // findPlayer
    addChips(action) {
        let player = this.findPlayer(action.userID);
        if (player) {
            this.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips`);
        }
    } // addChips
    updateStack(action) {
        let player = this.findPlayer(action.playerID);
        if (player) {
            player.chips = action.chips;
            this.log(`${player.name} now has ${this.chipFormatter.format(action.chips)}`);
        }
    } // updateStack
    log(message) {
        // For now, only log from Danny's POV
        if (this.user.id === 2) {
            console.log(`UI: ${message}`);
        }
        /*
                if (message == 'You cannot bet less than the current bet') {
        
                    for (let x: number = 0; x < 20; x++) {
        
                        console.log(`${this.user.name} UI: ${message}`);
        
                    }
        
                }
        
                console.log(`${this.user.name} UI: ${message}`);
        */
    }
    changeTableState() {
        let state = this.table.state;
        if (state instanceof serializable_1.StartHandState) {
            return this.startHand();
        }
    } // changeTableState
    startHand() {
        for (let seat of this.table.seats) {
            if (seat.player) {
                this.log(`${seat.getSeatName()}: ${seat.player.name}: ${this.chipFormatter.format(seat.player.chips)}${seat.player.isActive ? '' : ' [sitting out]'}`);
            }
        }
    } // startHand
    ante(action) {
        let seat = this.table.seats[action.seatIndex];
        if (seat) {
            let message = `${seat.getName()} antes ${this.chipFormatter.format(action.ante.chipsAdded)}`;
            if (action.ante.isAllIn) {
                message += ' and is all-in';
            }
            this.log(message);
        }
        else {
            throw new Error(`Ante: Seat index out of range: ${action.seatIndex}`);
        }
    } // ante
    updateBets(action) {
        for (let pot of this.table.betTracker.pots) {
            let potDesc = `${pot.getName()}: ${this.chipFormatter.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => this.table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        }
        let betsString = Object.keys(this.table.betTracker.bets).map(seatIndex => `${this.table.seats[seatIndex].getName()}: ${this.chipFormatter.format(this.table.betTracker.bets[seatIndex])}`).join(", ");
        if (betsString.length) {
            this.log(`  Bets: ${betsString}`);
        }
    } // updateBets
    moveButton(action) {
        let seat = this.findSeat(this.table.buttonIndex);
        this.log(`${seat.getName()} now has the button`);
    } // moveButton
    dealCard(action) {
        let seat = this.findSeat(action.seatIndex);
        let isFaceUp = action.card != null;
        if (isFaceUp) {
            this.log(`${seat.getName()} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);
        }
        else {
            this.log(`${seat.getName()} is dealt a card`);
        }
    } // dealCard
    betTurn(action) {
        let tracker = this.table.betTracker;
        let seat = this.findSeat(this.table.betTracker.seatIndex);
        this.log(`It is ${seat.getName()}'s turn to act`);
        if (seat.hand && seat.player) {
            if (seat.player.userID === this.user.id) {
                if (tracker.currentBet > 0) {
                    setTimeout(() => {
                        let rnd = Math.random();
                        if (rnd >= 0.8) {
                            // This represents a raise 
                            let betAmount = Math.min(tracker.currentBet + this.table.stakes.minRaise, seat.player.chips + tracker.getCurrentBet(seat.index));
                            this.log(`tracker.currentBet = ${tracker.currentBet}, stakes.minRaise = ${this.table.stakes.minRaise}, playerChips = ${seat.player.chips}, playerCurrentBet = ${tracker.getCurrentBet(seat.index)}`);
                            let betCommand = new serializable_1.BetCommand(this.table.id, seat.player.userID, betAmount);
                            this.broadcastCommand(betCommand);
                            return;
                        }
                        else if (rnd >= 0.02) {
                            // This represents a call (possibly all-in)
                            let betAmount = Math.min(tracker.currentBet, tracker.getCurrentBet(seat.index) + seat.player.chips);
                            let betCommand = new serializable_1.BetCommand(this.table.id, seat.player.userID, betAmount);
                            this.broadcastCommand(betCommand);
                            return;
                        }
                        else {
                            // We're folding!
                            let foldCommand = new serializable_1.FoldCommand(this.table.id, seat.player.userID);
                            this.broadcastCommand(foldCommand);
                            return;
                        }
                    }, MILLISECONDS_TO_THINK);
                    return;
                }
                else {
                    setTimeout(() => {
                        // This represents a bet out (or a check, if the player has no chips)
                        let desiredBet = (Math.random() > 0.40) ? this.table.stakes.minRaise : 0;
                        let betAmount = Math.min(desiredBet, seat.player.chips);
                        let betCommand = new serializable_1.BetCommand(this.table.id, seat.player.userID, betAmount);
                        this.broadcastCommand(betCommand);
                    }, MILLISECONDS_TO_THINK);
                    return;
                }
            } // if it's my turn
        } // seat has a player
        else {
            this.log(`${seat.getName()} is MIA`);
            return;
        }
    } // betTurn
    bet(action) {
        let seat = this.findSeat(action.seatIndex);
        let message = 'Unknown message';
        switch (action.bet.betType) {
            case serializable_1.Bet.CHECK:
                message = `${seat.getName()} checks`;
                break;
            case serializable_1.Bet.OPEN:
                message = `${seat.getName()} bets ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;
            case serializable_1.Bet.CALL:
                message = `${seat.getName()} calls ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;
            case serializable_1.Bet.RAISE:
                message = `${seat.getName()} raises to ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;
            case serializable_1.Bet.DEAD_RAISE:
                message = `${seat.getName()} puts in a dead raise to ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;
        } // switch
        if (action.bet.isAllIn) {
            message += ' and is all-in';
        }
        this.log(message);
    } // bet
    fold(action) {
        let seat = this.findSeat(action.seatIndex);
        this.log(`${seat.getName()} folds`);
    } // fold
    flipCards(action) {
        let seat = this.findSeat(action.seatIndex);
        if (seat.hand && seat.hand.cards && seat.hand.cards.length) {
            this.log(`${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`);
        }
    } // flipCards
    declareHand(action) {
        let seat = this.findSeat(action.seatIndex);
        this.log(`${seat.getName()} has ${this.game.handDescriber.describe(action.handEvaluation)}`);
    } // declareHand
    winPot(action) {
        let seat = this.findSeat(action.seatIndex);
        let potDescription = action.potIndex > 0 ? `side pot #${action.potIndex}` : `the main pot`;
        let handDescription = action.handEvaluation ? ` with ${this.game.handDescriber.describe(action.handEvaluation)}` : '';
        if (seat.player) {
            this.log(`${seat.getName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription}${handDescription}`);
        }
        else {
            this.log(`${seat.getSeatName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription}${handDescription}`);
        }
    } // winPot
    returnBet(action) {
        let seat = this.findSeat(action.seatIndex);
        if (seat.player) {
            this.log(`${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`);
        }
        else {
            this.log(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
    } // returnBet
}
exports.TableUI = TableUI;
