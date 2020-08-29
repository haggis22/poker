"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableWatcher = void 0;
const player_seated_action_1 = require("../actions/table/players/player-seated-action");
const move_button_action_1 = require("../actions/table/game/move-button-action");
const dealt_card_1 = require("../hands/dealt-card");
const table_snapshot_action_1 = require("../actions/table/state/table-snapshot-action");
const hand_1 = require("../hands/hand");
const update_bets_action_1 = require("../actions/table/betting/update-bets-action");
const win_pot_action_1 = require("../actions/table/game/win-pot-action");
const stack_update_action_1 = require("../actions/table/players/stack-update-action");
const logger_1 = require("../logging/logger");
const table_action_1 = require("../actions/table/table-action");
const set_hand_action_1 = require("../actions/table/game/set-hand-action");
const add_chips_action_1 = require("../actions/table/players/add-chips-action");
const deal_card_action_1 = require("../actions/table/game/deal-card-action");
const bet_turn_action_1 = require("../actions/table/game/bet-turn-action");
const flip_cards_action_1 = require("../actions/table/game/flip-cards-action");
const ante_action_1 = require("../actions/table/betting/ante-action");
const bet_action_1 = require("../actions/table/betting/bet-action");
const fold_action_1 = require("../actions/table/betting/fold-action");
const bet_returned_action_1 = require("../actions/table/game/bet-returned-action");
const serializable_1 = require("../communication/serializable");
const set_game_action_1 = require("../actions/table/game/set-game-action");
const game_factory_1 = require("../games/game-factory");
const logger = new logger_1.Logger();
class TableWatcher {
    constructor(tableID) {
        this.tableID = tableID;
        this.table = null;
        this.commandHandlers = new Array();
        this.messageHandlers = new Array();
        this.messageQueue = new Array();
    }
    registerMessageHandler(handler) {
        this.messageHandlers.push(handler);
    } // registerMessageHandler
    unregisterMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter(o => o != handler);
    } // unregisterMessageHandler
    registerCommandHandler(handler) {
        this.commandHandlers.push(handler);
    } // registerCommandHandler
    unregisterCommandHandler(handler) {
        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);
    } // unregisterCommandHandler
    handleCommand(command) {
        // For now, just pass it through
        this.broadcastCommand(command);
    }
    handleMessage(message) {
        // For ActionMessages, we want to handle them ourselves first, so that it can update the model
        // from which the UI reads, and then we will pass them along
        let actionMessage = message;
        if (actionMessage && actionMessage.action instanceof table_action_1.TableAction) {
            if (actionMessage.action.tableID === this.tableID) {
                this.messageQueue.push(message);
                this.handleAction(actionMessage.action);
            }
        }
        else {
            // Won't update the model, so we can add it to the queue directly
            this.messageQueue.push(message);
        }
        this.pumpQueues();
    }
    pumpQueues() {
        while (this.messageQueue.length) {
            this.broadcastMessage(this.messageQueue.shift());
        }
    } // pumpQueues
    broadcastMessage(message) {
        for (let handler of this.messageHandlers) {
            handler.handleMessage(message);
        }
    } // broadcastMessage
    broadcastCommand(command) {
        for (let handler of this.commandHandlers) {
            handler.handleCommand(command);
        }
    } // broadcastCommand
    handleAction(action) {
        if (!action || action.tableID !== this.tableID) {
            // Not a TableAction, or not my table - I don't care
            return;
        }
        if (this.table == null) {
            if (action instanceof table_snapshot_action_1.TableSnapshotAction) {
                this.grabTableData(action);
            }
            // we don't have a table yet, so we can't do anything else
            return;
        }
        if (action instanceof set_game_action_1.SetGameAction) {
            return this.setGame(action);
        }
        if (action instanceof player_seated_action_1.PlayerSeatedAction) {
            // this.log(` yes - it is a PlayerSeatedAction`);
            return this.seatPlayer(action);
        }
        if (action instanceof add_chips_action_1.AddChipsAction) {
            // This is just a pass-through notification; only update the chip count on a StackUpdateAction
            return;
        }
        if (action instanceof stack_update_action_1.StackUpdateAction) {
            return this.updateStack(action);
        }
        if (action instanceof serializable_1.TableStateAction) {
            return this.changeTableState(action);
        }
        if (action instanceof ante_action_1.AnteAction) {
            // This is just a pass-through notification; only update the bets on an UpdateBetsAction
            return;
        }
        if (action instanceof update_bets_action_1.UpdateBetsAction) {
            return this.updateBets(action);
        }
        if (action instanceof move_button_action_1.MoveButtonAction) {
            return this.moveButton(action);
        }
        if (action instanceof set_hand_action_1.SetHandAction) {
            return this.setHand(action);
        }
        if (action instanceof deal_card_action_1.DealCardAction) {
            return this.dealCard(action);
        }
        if (action instanceof bet_turn_action_1.BetTurnAction) {
            return this.betTurn(action);
        }
        if (action instanceof bet_action_1.BetAction) {
            return this.bet(action);
        }
        if (action instanceof fold_action_1.FoldAction) {
            return this.fold(action);
        }
        if (action instanceof flip_cards_action_1.FlipCardsAction) {
            return this.flipCards(action);
        }
        if (action instanceof win_pot_action_1.WinPotAction) {
            return this.winPot(action);
        }
        if (action instanceof bet_returned_action_1.BetReturnedAction) {
            return this.returnBet(action);
        }
        this.log(`Heard ${action.constructor.name}`);
    }
    log(message) {
        // console.log('\x1b[32m%s\x1b[0m', `TableWatcher ${message}`);
    }
    grabTableData(action) {
        this.table = action.table;
    }
    setGame(action) {
        // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
        this.game = (new game_factory_1.GameFactory()).create(action.gameID);
    } // setGame
    seatPlayer(action) {
        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;
        if (seat) {
            seat.player = action.player;
            // this.log(` ${action.player.name} sat in ${seat.getSeatName()}`);
        }
    }
    updateStack(action) {
        let player = this.findPlayer(action.playerID);
        if (player) {
            player.chips = action.chips;
            //            logger.info(`${player.name} has ${this.chipFormatter.format(action.chips)}`);
        }
    } // updateStack
    changeTableState(action) {
        let state = action.state || new serializable_1.OpenState();
        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);
    } // changeTableState
    updateBets(action) {
        this.table.betTracker = action.betTracker;
    } // updateBets
    findSeat(seatIndex) {
        if (seatIndex >= 0 && seatIndex < this.table.seats.length) {
            return this.table.seats[seatIndex];
        }
        throw new Error(`Seat index out of range: ${seatIndex}`);
    } // findSeat
    findPlayer(userID) {
        return null;
    }
    moveButton(action) {
        this.table.buttonIndex = action.seatIndex;
    } // moveButton
    setHand(action) {
        let seat = this.findSeat(action.seatIndex);
        // If the seat has a hand, create a blank hand and copy the values over from the action
        seat.hand = action.hasHand ? new hand_1.Hand() : null;
    } // setHand
    dealCard(action) {
        let seat = this.findSeat(action.seatIndex);
        let dealtCard = new dealt_card_1.DealtCard(action.card, action.card != null);
        seat.hand.deal(dealtCard);
    } // dealCard
    betTurn(action) {
        this.table.betTracker = action.bets;
    } // betTurn
    bet(action) {
        // For now, we're not doing anything - we'll wait for the UpdateBetsAction
    } // bet
    flipCards(action) {
        let seat = this.findSeat(action.seatIndex);
        if (seat.hand) {
            seat.hand = action.hand;
        }
    } // flipCards
    fold(action) {
        // Nothing to do for this - the actual folding comes with the SetHandAction(null) action
    } // fold
    winPot(action) {
        // Nothing to do for this - it's mostly descriptive
    } // winPot
    returnBet(action) {
        // Nothing to do for this - it's mostly descriptive
    } // returnBet
}
exports.TableWatcher = TableWatcher;
