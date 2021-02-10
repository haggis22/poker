<template>

    <div class="betting-menu">

        <div class="bet-actions" v-if="ui.remainsToAnte()">

            <div class="buttons">

                <bet-button-component :action="'Sit Out'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component :action="'Ante'"
                                      :is-activated="isAnteActivated"
                                      :amount="ui.myCall.chipsAdded"
                                      :chip-formatter="ui.chipFormatter"
                                      @button-click="toggleAnte"></bet-button-component>

            </div>

        </div>

        <div class="bet-actions" v-if="ui.remainsToAct()">

            <div class="buttons">

                <bet-button-component v-if="isFoldAllowed"
                                      :action="'Fold'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component v-if="isCheckAllowed"
                                      :action="'Check'"
                                      :is-activated="isCheckActivated"
                                      @button-click="toggleCheck"></bet-button-component>

                <bet-button-component v-if="isCallAllowed"
                                      :action="'Call'"
                                      :is-activated="isCallActivated"
                                      :amount="ui.myCall.chipsAdded"
                                      :chip-formatter="ui.chipFormatter"
                                      @button-click="toggleCall"></bet-button-component>

                <bet-button-component v-if="isLimitRaiseAllowed"
                                      :action="betDescription"
                                      :is-activated="isRaiseActivated"
                                      :amount="ui.myMinRaise.totalBet"
                                      :chip-formatter="ui.chipFormatter"
                                      @button-click="toggleLimitRaise"></bet-button-component>

            </div><!-- buttons -->

            <div v-if="raiseDialogReady" class="raise-dialog">
                <div>
                    <span class="min-raise">{{ ui.chipFormatter.format(minRaise) }}</span>
                    <input type="range" v-model="raiseChips" :min="minRaise" :max="maxRaise" :step="step" />
                    <span class="max-raise">{{ ui.chipFormatter.format(maxRaise) }}</span>
                </div>
                <div class="buy-amount">{{ ui.chipFormatter.format(raiseChips) }}</div>
                <div>
                    <button type="button" class="raise" @click.stop="raise">Raise</button>
                    <button type="button" class="cancel" @click.stop="cancelRaise">Cancel</button>
                </div>
            </div>

        </div>

    </div>

</template>


<script lang="ts">
    
import './betting-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
import { AnteCommand } from '../../../../commands/table/betting/ante-command';
import { CheckCommand } from '../../../../commands/table/betting/check-command';
import { CallCommand } from '../../../../commands/table/betting/call-command';
import { RaiseCommand } from '../../../../commands/table/betting/raise-command';
import { FoldCommand } from '../../../../commands/table/betting/fold-command';
import BetButtonComponent from '../bet-button/BetButtonComponent.vue';

const TableMenuComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        }

    },
    components: {

        'bet-button-component': BetButtonComponent

    },
    data() {

        let values =
        {
            raiseChips: 1000,
            step: 25,
            showRaise: false
        };

        return values;

    },
    computed: {

        isFoldAllowed: function () {

            return true;

        },

        isFoldActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof FoldCommand;

        },

        isAnteActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof AnteCommand;

        },

        isCheckAllowed: function () {

            return this.ui.myCall && this.ui.myCall.chipsAdded === 0;

        },

        isCheckActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof CheckCommand;

        },

        isCallAllowed: function () {

            return this.ui.myCall && this.ui.myCall.chipsAdded > 0;

        },

        isCallActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof CallCommand;
            
        },

        isLimitRaiseAllowed: function () {

            return this.ui.myMinRaise && this.ui.myMaxRaise && this.ui.myMinRaise.chipsAdded == this.ui.myMaxRaise.chipsAdded;

        },

        isRaiseActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof RaiseCommand;

        },

        betDescription: function () {

            return this.ui.table.betStatus.numRaises > 0 ? 'Raise To' : 'Bet';

        },

        raiseDialogReady: function () {

            return this.showRaise;

        },

        minRaise: function (): number {

            return this.ui.myMinRaise ? this.ui.myMinRaise.totalBet : 0;

        },

        maxRaise: function (): number {

            return this.ui.myMaxRaise ? this.ui.myMaxRaise.totalBet : 0;

        }


    },
    methods: {

        toggleFold: function (event): void {

            if (this.isFoldActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new FoldCommand(this.ui.table.id));

        },

        toggleAnte: function (event): void {

            if (this.isAnteActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new AnteCommand(this.ui.table.id));

        },

        toggleCheck: function (event): void {

            if (this.isCheckActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new CheckCommand(this.ui.table.id));

        },

        toggleCall: function (event): void {

            if (this.isCallActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new CallCommand(this.ui.table.id, this.ui.myCall.chipsAdded));

        },

        toggleLimitRaise: function (event): void {

            if (this.isRaiseActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new RaiseCommand(this.ui.table.id, this.ui.myMinRaise.chipsAdded));

        }

    }  // methods

});

export default TableMenuComponent;

</script>
