"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableManager = void 0;
const table_1 = require("./table");
const request_seat_command_1 = require("../../commands/table/request-seat-command");
const player_1 = require("../../players/player");
const add_chips_command_1 = require("../../commands/table/add-chips-command");
const start_hand_state_1 = require("./states/start-hand-state");
const player_seated_action_1 = require("../../actions/table/players/player-seated-action");
const move_button_action_1 = require("../../actions/table/game/move-button-action");
const deal_state_1 = require("./states/deal-state");
const dealt_card_1 = require("../../hands/dealt-card");
const hand_1 = require("../../hands/hand");
const bet_state_1 = require("./states/betting/bet-state");
const showdown_state_1 = require("./states/showdown-state");
const hand_complete_state_1 = require("./states/hand-complete-state");
const hand_winner_1 = require("../../games/hand-winner");
const table_snapshot_action_1 = require("../../actions/table/state/table-snapshot-action");
const update_bets_action_1 = require("../../actions/table/betting/update-bets-action");
const win_pot_action_1 = require("../../actions/table/game/win-pot-action");
const stack_update_action_1 = require("../../actions/table/players/stack-update-action");
const bet_command_1 = require("../../commands/table/bet-command");
const bet_1 = require("./betting/bet");
const fold_command_1 = require("../../commands/table/fold-command");
const logger_1 = require("../../logging/logger");
const table_snapshot_command_1 = require("../../commands/table/table-snapshot-command");
const message_1 = require("../../messages/message");
const action_message_1 = require("../../messages/action-message");
const add_chips_action_1 = require("../../actions/table/players/add-chips-action");
const bet_action_1 = require("../../actions/table/betting/bet-action");
const set_hand_action_1 = require("../../actions/table/game/set-hand-action");
const fold_action_1 = require("../../actions/table/betting/fold-action");
const ante_action_1 = require("../../actions/table/betting/ante-action");
const deal_card_action_1 = require("../../actions/table/game/deal-card-action");
const bet_turn_action_1 = require("../../actions/table/game/bet-turn-action");
const bet_returned_action_1 = require("../../actions/table/game/bet-returned-action");
const flip_cards_action_1 = require("../../actions/table/game/flip-cards-action");
const table_state_action_1 = require("../../actions/table/state/table-state-action");
const message_pair_1 = require("../../messages/message-pair");
const deep_copier_1 = require("../../communication/deep-copier");
const serializable_1 = require("../../communication/serializable");
const set_game_action_1 = require("../../actions/table/game/set-game-action");
const player_active_action_1 = require("../../actions/table/players/player-active-action");
const logger = new logger_1.Logger();
class TableManager {
    constructor(tableID, table, deck) {
        this.ALL_ACCESS = -1;
        this.tableID = tableID;
        this.table = table;
        this.deck = deck;
        this.copier = new deep_copier_1.DeepCopier();
        this.messageQueue = new Array();
        this.messageHandlers = new Array();
        this.numTimers = this.numTimersElapsed = this.numTimersKilled = 0;
    }
    snapshot(obj) {
        return this.copier.copy(obj);
    }
    registerMessageHandler(handler) {
        this.messageHandlers.push(handler);
    } // registerMessageHandler
    unregisterMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter(o => o != handler);
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
    queueAction(action, userID) {
        this.queueMessage(new action_message_1.ActionMessage(action, userID));
    }
    queueMessage(message) {
        if (message instanceof action_message_1.ActionMessage) {
            this.log(`Queueing ${message.action.constructor.name}`);
            if (message.action instanceof bet_turn_action_1.BetTurnAction) {
                // this.log(`Queueing ${message.action.constructor.name} for ${message.action.bets.seatIndex}`);
            }
        }
        else if (message instanceof message_pair_1.MessagePair) {
            let publicMessage = message.publicMessage && message.publicMessage instanceof action_message_1.ActionMessage ? message.publicMessage.action.constructor.name : '[No public message]';
            let privateMessage = message.privateMessage && message.privateMessage instanceof action_message_1.ActionMessage ? message.privateMessage.action.constructor.name : '[No private message]';
            this.log(`Queueing public: ${publicMessage}, private: ${privateMessage} `);
        }
        this.messageQueue.push(message);
        this.pumpQueues();
    }
    handleCommand(command) {
        this.log(`received ${command.constructor.name}`);
        this.processCommand(command);
        this.pumpQueues();
    } // handleCommand
    processCommand(command) {
        if (command instanceof request_seat_command_1.RequestSeatCommand) {
            return this.seatPlayer(command);
        }
        if (command instanceof add_chips_command_1.AddChipsCommand) {
            return this.addChips(command);
        }
        if (command instanceof bet_command_1.BetCommand) {
            return this.bet(command);
        }
        if (command instanceof fold_command_1.FoldCommand) {
            return this.fold(command);
        }
        if (command instanceof table_snapshot_command_1.TableSnapshotCommand) {
            return this.tableSnapshot(command);
        }
        throw new Error("Method not implemented.");
    }
    setGame(game) {
        this.game = game;
        this.queueAction(new set_game_action_1.SetGameAction(this.table.id, game.id));
    }
    createTableSnapshot(userID) {
        let table = new table_1.Table(this.table.id, this.table.stakes, this.table.rules);
        table.betTracker = this.table.betTracker;
        table.buttonIndex = this.table.buttonIndex;
        table.board = this.table.board;
        for (let s = 0; s < this.table.seats.length; s++) {
            table.seats[s].player = this.table.seats[s].player;
            let hand = null;
            if (this.table.seats[s].hand != null) {
                hand = new hand_1.Hand();
                for (let card of this.table.seats[s].hand.cards) {
                    if (card.isFaceUp) {
                        hand.cards.push(card);
                    }
                    else if (this.table.seats[s].player.userID == userID) {
                        hand.cards.push(card);
                    }
                    else {
                        // they get a card with no value, face-down
                        hand.cards.push(new dealt_card_1.DealtCard(null, false));
                    }
                }
            } // if the seat has a hand
            table.seats[s].hand = hand;
        }
        return table;
    } // createTableSnapshot
    log(message) {
        // console.log('\x1b[31m%s\x1b[0m', `TableManager ${message}`);
    }
    seatPlayer(command) {
        let seatIndex = command.seatIndex;
        if (seatIndex === null) {
            for (let s = 0; s < this.table.seats.length; s++) {
                if (this.table.seats[s].player == null) {
                    seatIndex = s;
                    break;
                }
            } // for each seat
        } // no seat specified
        if (seatIndex === null) {
            return this.queueMessage(new message_1.Message('No seats available', command.user.id));
        }
        let seat = seatIndex < this.table.seats.length ? this.table.seats[seatIndex] : null;
        if (seat) {
            if (seat.player == null) {
                seat.player = new player_1.Player(command.user.id, command.user.name);
                this.queueAction(new player_seated_action_1.PlayerSeatedAction(this.table.id, seat.player, seatIndex));
                this.checkStartHand();
                return;
            }
            return this.queueMessage(new message_1.Message(`${seat.getName()} is already taken`, command.user.id));
        }
        return this.queueMessage(new message_1.Message(`Could not find seat ${seatIndex}`, command.user.id));
    }
    findPlayer(userID) {
        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;
    } // findPlayer
    addChips(command) {
        if (command.amount <= 0) {
            // Nothing to do here. Either a waste of time or someone trying to get sneaky
            return;
        }
        let player = this.findPlayer(command.userID);
        if (!player) {
            return this.queueMessage(new message_1.Message('Player is not sitting at table', command.userID));
        }
        if (this.table.state.isHandInProgress()) {
            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;
            // TODO: create delayed AddChips action
            this.queueMessage(new message_1.Message(`${player.name} has bought in for ${command.amount} on the next hand`, command.userID));
            return;
        }
        player.chips += command.amount;
        this.queueAction(new add_chips_action_1.AddChipsAction(this.table.id, player.userID, command.amount));
        this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, player.userID, player.chips));
    }
    checkStartHand() {
        if (!this.table.state.isHandInProgress() && this.isReadyForNextHand()) {
            this.log(`Starting new hand`);
            return this.goToNextState();
        }
    } // checkStartHand
    bet(command) {
        this.log(`Received BetCommand from ${command.userID}, tableState: ${this.table.state.constructor.name}`);
        if (this.table.state instanceof bet_state_1.BetState) {
            let bettorSeat = this.table.seats.find(seat => seat.player && seat.player.userID == command.userID);
            let oldActionInitiator = this.table.betTracker.seatIndexInitiatingAction;
            let bet = this.table.betTracker.addBet(bettorSeat, command.amount, this.table.stakes.minRaise);
            if (bet.isValid) {
                clearTimeout(this.betTimer);
                this.numTimersKilled++;
                this.logTimers();
                this.queueAction(new bet_action_1.BetAction(this.table.id, bettorSeat.index, bet));
                this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, bettorSeat.player.userID, bettorSeat.player.chips));
                this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
                if (bet.betType == bet_1.Bet.RAISE) {
                    let newActionInitiator = this.table.betTracker.seatIndexInitiatingAction;
                    this.log(`**************************************** RAISE: oldActionInitiator = ${oldActionInitiator}, newActionInitiator = ${newActionInitiator}`);
                }
                return this.advanceBetTurn();
            }
            else {
                // TODO: Send action indicating invalid bet so that the UI can reset itself
                return this.queueMessage(new message_1.Message(bet.message, command.userID));
            }
        }
        // TODO: Send action indicating invalid bet so that the UI can reset itself
        return this.queueMessage(new message_1.Message('It is not time to bet', command.userID));
    } // bet
    foldPlayer(folderSeat, fold) {
        clearTimeout(this.betTimer);
        this.numTimersKilled++;
        this.logTimers();
        // Take away their cards
        folderSeat.hand = null;
        // This will tell watchers that the given seat is no longer in the hand
        this.queueAction(new set_hand_action_1.SetHandAction(this.table.id, folderSeat.index, false));
        this.queueAction(new fold_action_1.FoldAction(this.table.id, folderSeat.index, fold));
        this.advanceBetTurn();
    } // foldPlayer
    fold(command) {
        if (this.table.state instanceof bet_state_1.BetState) {
            let folderSeat = this.table.seats.find(seat => seat.hand && seat.player && seat.player.userID == command.userID);
            let fold = this.table.betTracker.fold(folderSeat);
            if (fold.isValid) {
                return this.foldPlayer(folderSeat, fold);
            }
            return this.queueMessage(new message_1.Message(fold.message, command.userID));
        }
        return this.queueMessage(new message_1.Message('It is not time to bet', command.userID));
    } // fold
    tableSnapshot(command) {
        // Create a snapshot of the table situation, from the given player's perspective
        let table = this.createTableSnapshot(command.userID);
        let tableAction = new table_snapshot_action_1.TableSnapshotAction(table.id, table);
        this.log('Generating private snapshot message');
        this.queueMessage(new action_message_1.ActionMessage(tableAction, command.userID));
        // Tell the user which game we are playing at this table
        this.queueMessage(new action_message_1.ActionMessage(new set_game_action_1.SetGameAction(table.id, this.game.id), command.userID));
    }
    isReadyForNextHand() {
        return this.table.seats.filter(seat => seat.player && seat.player.isActive && seat.player.chips > 0).length > 1;
    }
    isReadyForThisHand() {
        return this.table.seats.filter(seat => seat.player && seat.player.isActive).length > 1;
    }
    countPlayersInHand() {
        return this.table.seats.filter(s => s.hand).length;
    } // countPlayersInHand
    doBetweenHandsBusiness() {
        for (let seat of this.table.seats) {
            if (seat.player) {
                if (seat.player.chipsToAdd) {
                    this.queueAction(new add_chips_action_1.AddChipsAction(this.table.id, seat.player.userID, seat.player.chipsToAdd));
                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    seat.player.chipsToAdd = 0;
                    this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));
                } // they have chips waiting to add
                if (seat.player.chips == 0) {
                    seat.player.isActive = false;
                    // Tell the world this player is sitting out
                    this.queueAction(new player_active_action_1.PlayerActiveAction(this.table.id, seat.player.userID, seat.index, false));
                }
            }
        }
    } // doBetweenHandsBusiness
    changeTableState(state) {
        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);
        this.queueAction(new table_state_action_1.TableStateAction(this.table.id, state));
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
        if (state instanceof start_hand_state_1.StartHandState) {
            return this.startHand();
        }
        if (state instanceof deal_state_1.DealState) {
            return this.dealRound(state);
        }
        if (state instanceof bet_state_1.BetState) {
            return this.makeYourBets(state);
        }
        if (state instanceof showdown_state_1.ShowdownState) {
            return this.showdown(state);
        }
        if (state instanceof hand_complete_state_1.HandCompleteState) {
            return this.completeHand(state);
        }
    }
    startHand() {
        this.deck.shuffle();
        this.table.betTracker.reset();
        this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
        for (let seat of this.table.seats) {
            // Start off without a hand for the seat...
            seat.hand = null;
            if (seat.player && seat.player.isActive) {
                // assume they're in, at least until they fail to pay the ante.
                // The table won't take the ante bet if they're not marked as in already.
                // They need to have a blank hand for the table to accept the ante as a bet
                seat.hand = new hand_1.Hand();
                if (this.table.stakes.ante > 0) {
                    // this.log(`There is an ante, and ${seat.getName()} is playing`);
                    // set the betting to the ante's seat or it will not be accepted
                    this.table.betTracker.seatIndex = seat.index;
                    // the minimum amoutn will be the ante - this doesn't respect the minimums for a regular betting round.
                    let ante = this.table.betTracker.addBet(seat, this.table.stakes.ante, this.table.stakes.ante);
                    // this.log(`ante result: ${ante}`);
                    if (ante.isValid) {
                        this.queueAction(new ante_action_1.AnteAction(this.table.id, seat.index, ante));
                        this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));
                        this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
                    } // valid ante
                    else {
                        // this.log(`${seat.getName()} had an invalid ante: ${ante.message} and is being marked as inactive`);
                        // they didn't pay the ante, so take away their (blank) cards
                        seat.hand = null;
                        seat.player.isActive = false;
                        // Tell the world this player is sitting out
                        this.queueAction(new player_active_action_1.PlayerActiveAction(this.table.id, seat.player.userID, seat.index, false));
                    }
                } // if there is an ante
            }
            else {
                // this.log(`${seat.getName()} is sitting out`);
                seat.hand = null;
            }
            // This will tell watchers whether or not the given seat is in the hand
            this.queueAction(new set_hand_action_1.SetHandAction(this.table.id, seat.index, seat.hand != null));
        } // for each seat
        this.table.betTracker.gatherBets();
        this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
        this.checkBetsToReturn();
        if (!this.isReadyForThisHand()) {
            // We don't have enough players, so go back to the open state
            return this.changeTableState(this.game.stateMachine.goToOpenState());
        }
        this.setButton();
        this.goToNextState();
    } // startHand
    setButton() {
        this.table.buttonIndex = this.findNextSeatWithAHand(this.table.buttonIndex == null ? 0 : this.table.buttonIndex + 1);
        this.queueAction(new move_button_action_1.MoveButtonAction(this.table.id, this.table.buttonIndex));
    }
    findNextSeatWithAHand(seatIndex) {
        let nextPosition = seatIndex;
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
    } // findNextOccupiedSeatIndex
    dealRound(dealState) {
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
            let dealtCard = new dealt_card_1.DealtCard(card, dealState.isFaceUp);
            this.table.seats[seatIndex].hand.deal(dealtCard);
            if (dealtCard.isFaceUp) {
                // It's face-up, so there is only a public action
                this.queueAction(new deal_card_action_1.DealCardAction(this.table.id, seatIndex, card));
            }
            else {
                // It's face-down, so the public action does not include the card info, whereas the private action does
                let publicMessage = new action_message_1.ActionMessage(new deal_card_action_1.DealCardAction(this.table.id, seatIndex, null));
                let privateMessage = new action_message_1.ActionMessage(new deal_card_action_1.DealCardAction(this.table.id, seatIndex, card), userID);
                this.queueMessage(new message_pair_1.MessagePair(publicMessage, privateMessage));
            }
        } // for each seatIndex in seatsNeedingCards
        this.goToNextState();
    } // dealRound
    makeYourBets(betState) {
        this.log('In makeYourBets');
        this.table.betTracker.clearBets();
        let firstSeatIndexWithAction = this.findFirstToBet(betState.firstToBet);
        if (firstSeatIndexWithAction == null) {
            this.log('No betting action this round');
            return this.goToNextState();
        }
        this.validateBettorOrMoveOn(firstSeatIndexWithAction);
    } // makeYourBets
    validateBettorOrMoveOn(bettorSeatIndex) {
        let done = false;
        while (!done) {
            if (bettorSeatIndex == this.table.betTracker.seatIndexInitiatingAction) {
                this.log('Betting complete');
                this.table.betTracker.gatherBets();
                this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
                this.checkBetsToReturn();
                return this.goToNextState();
            }
            if (this.table.seats[bettorSeatIndex].player && this.table.seats[bettorSeatIndex].player.chips > 0) {
                done = true;
            }
            else {
                // Otherwise, keep moving the marker
                bettorSeatIndex = this.findNextSeatWithAHand(bettorSeatIndex + 1);
            }
        } // while !done
        this.setBetTurn(bettorSeatIndex);
    } // validateBettorOrMoveOn
    logTimers() {
        // this.log(`numTimers: ${this.numTimers}, numTimersElapsed: ${this.numTimersElapsed}, numTimersKilled: ${this.numTimersKilled}`);
    }
    setBetTurn(seatIndexToAct) {
        this.table.betTracker.seatIndex = seatIndexToAct;
        this.table.betTracker.timeToAct = this.table.rules.timeToAct;
        this.numTimers++;
        this.logTimers();
        this.betTimer = setTimeout(() => {
            this.numTimersElapsed++;
            this.logTimers();
            let checkerSeat = this.table.seats[this.table.betTracker.seatIndex];
            // try to check
            let check = this.table.betTracker.addBet(checkerSeat, 0, this.table.stakes.minRaise);
            if (check.isValid) {
                this.queueAction(new bet_action_1.BetAction(this.table.id, checkerSeat.index, check));
                return this.advanceBetTurn();
            }
            let fold = this.table.betTracker.fold(checkerSeat);
            if (fold.isValid) {
                return this.foldPlayer(checkerSeat, fold);
            }
            throw new Error(`TableManager could not check or fold ${checkerSeat.getSeatName()}`);
        }, this.table.rules.timeToAct * 1000);
        this.queueAction(new bet_turn_action_1.BetTurnAction(this.table.id, this.snapshot(this.table.betTracker)));
    } // setBetTurn
    advanceBetTurn() {
        // this.log('In advanceBetTurn');
        if (!(this.table.state instanceof bet_state_1.BetState)) {
            let error = new Error('Should not be here');
            this.log(error.stack);
            throw error;
        }
        this.validateBettorOrMoveOn(this.findNextSeatWithAHand(this.table.betTracker.seatIndex + 1));
    } // advanceBetTurn
    findFirstToBet(firstBetRule) {
        // First count how many players CAN act this round - if only 1 (or 0) then there's nothing to do
        // This is not the same as blowing through rounds because we're down to just one player because everyone else folded.
        // In this case, at least one person must be all-in, so we're going to keep dealing cards, but we don't need to bet.
        if (this.table.seats.filter(s => s.hand && s.player && s.player.chips).length < 2) {
            // we don't have 2 players with money, so dump out
            return null;
        }
        switch (firstBetRule) {
            case bet_state_1.BetState.FIRST_POSITION:
                {
                    return this.findNextSeatWithAHand(this.table.buttonIndex + 1);
                }
            case bet_state_1.BetState.BEST_HAND:
                {
                    let handWinners = this.findWinners();
                    return handWinners[0].seatIndex;
                }
        }
        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);
    } // findFirstToBet
    findWinners() {
        let handWinners = new Array();
        for (let seat of this.table.seats) {
            if (seat.hand) {
                // Put their best hand on the list
                handWinners.push(new hand_winner_1.HandWinner(this.game.handSelector.select(this.game.handEvaluator, seat.hand, this.table.board), seat.index, 0));
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
    checkBetsToReturn() {
        this.table.betTracker.gatherBets();
        let potIndexesToKill = new Set();
        for (let pot of this.table.betTracker.pots) {
            if (pot.getNumPlayers() === 1) {
                // Convert the set (of 1 element) to an array, and take its first element
                let seat = this.table.seats[pot.getSeatsInPot()[0]];
                if (seat) {
                    potIndexesToKill.add(pot.index);
                    this.queueAction(new bet_returned_action_1.BetReturnedAction(this.table.id, seat.index, pot.amount));
                    if (seat.player) {
                        seat.player.chips += pot.amount;
                        this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, seat.player.userID, seat.player.chips));
                    } // if player is not null
                } // if seat
            } // if pot only has 1 bettor in it
        }
        if (potIndexesToKill.size > 0) {
            this.table.betTracker.killPots(potIndexesToKill);
            this.queueAction(new update_bets_action_1.UpdateBetsAction(this.table.id, this.snapshot(this.table.betTracker)));
        }
    } // checkBetsToReturn
    showdown(showdownState) {
        let isShowdownRequired = this.countPlayersInHand() > 1;
        if (isShowdownRequired) {
            // Flip all the cards face-up
            for (let seat of this.table.seats) {
                if (seat.hand) {
                    seat.hand.flipCards();
                    this.queueAction(new flip_cards_action_1.FlipCardsAction(this.table.id, seat.index, seat.hand));
                }
            }
        }
        // We have to find the winners and evaluate hands AFTER we have flipped the cards face-up
        let winners = this.findWinners();
        if (isShowdownRequired) {
            this.declareHands(winners);
        }
        for (let winner of winners) {
            this.log(`TableManager: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }
        for (let pot of this.table.betTracker.pots) {
            let potWinningHand = null;
            let potWinnerSeatIndexes = new Set();
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
            let equalShare = Math.floor(pot.amount / potWinnerSeatIndexes.size);
            let remainder = pot.amount - (potWinnerSeatIndexes.size * equalShare);
            for (let seatIndex of potWinnerSeatIndexes) {
                let winnerHand = winners.find(hw => hw.seatIndex == seatIndex);
                if (winnerHand) {
                    let player = this.table.seats[seatIndex].player;
                    if (player) {
                        let winnerEvaluation = isShowdownRequired ? winnerHand.evaluation : null;
                        this.queueAction(new win_pot_action_1.WinPotAction(this.table.id, seatIndex, pot.index, winnerEvaluation, equalShare + remainder));
                        player.chips += (equalShare + remainder);
                        this.queueAction(new stack_update_action_1.StackUpdateAction(this.table.id, player.userID, player.chips));
                        remainder = 0;
                    }
                }
            }
        } // for each Pot
        this.goToNextState();
    } // showdown
    declareHands(winners) {
        let declaredSet = new Set();
        let handIndex = this.findNextSeatWithAHand(this.table.buttonIndex + 1);
        while (!declaredSet.has(handIndex)) {
            let handWinner = winners.find(w => w.seatIndex == handIndex);
            if (handWinner) {
                this.queueAction(new serializable_1.DeclareHandAction(this.table.id, handIndex, handWinner.evaluation));
            }
            // Mark it as seen for when we come back around
            declaredSet.add(handIndex);
            handIndex = this.findNextSeatWithAHand(handIndex + 1);
        }
    }
    completeHand(completeState) {
        // We're done with this hand - go to the next one
        // This will preserve the `this` reference in the call
        setTimeout(() => {
            this.goToNextState();
        }, 2000);
    } // completeHand
    goToNextState() {
        let nextState = this.game.stateMachine.nextState();
        // this.log(`Changing to next state: ${(nextState == null ? 'null' : nextState.constructor.name)}`);
        this.changeTableState(nextState);
    }
}
exports.TableManager = TableManager;
