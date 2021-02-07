<template>

    <div class="betting-menu">

        <div class="bet-actions" v-if="ui.remainsToAnte()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Sit Out</div>
            </button>
            <button type="button" v-on:click.stop="ante">
                <div class="action">Ante</div>
                <div class="amount">
                    {{ ui.chipFormatter.format(ui.myCall.chipsAdded) }}
                </div>
            </button>
        </div>

        <div class="bet-actions" v-if="ui.remainsToAct()">

            <bet-button-component :action="'Fold'" :is-activated="isFoldActivated" @button-click="toggleFold"></bet-button-component>
            <bet-button-component :action="'Check'" :is-activated="checkValue" @click.stop="checkValue = !checkValue"></bet-button-component>
            <bet-button-component :action="'Bet'" :is-activated="raiseValue" @click.stop="raiseValue = !raiseValue" :amount="150" :chip-formatter="ui.chipFormatter"></bet-button-component>

        </div>

        <!--

            <div class="bet-actions" v-if="ui.isPendingCheckBetTime()">
                <label>
                    <input type="checkbox" value="true" :checked="pendingFold" @change="ui.setPendingFold($event.target.checked)" /> Fold
                </label>
                <label>
                    <input type="checkbox" value="true" :checked="pendingCheck" @change="ui.setPendingCheck($event.target.checked)" /> Check
                </label>
                <label>
                    <input type="checkbox" /> Bet {{ ui.chipFormatter.format(ui.myBet.totalBet) }}
                </label>
            </div>

            <div class="bet-actions" v-if="ui.isCheckBetTime()">
                <button type="button" v-on:click.stop="fold">
                    <div class="light"></div>
                    <div class="text">
                        <div class="action">Fold</div>
                    </div>
                </button>
                <button type="button" v-on:click.stop="check">
                    <div class="light"></div>
                    <div class="text">
                        <div class="action">Check</div>
                    </div>
                </button>
                <button v-if="isRaiseAllowed" type="button" v-on:click.stop="bet">
                    <div class="light"></div>
                    <div class="text">
                        <div class="action">
                            <span v-if="alreadyHasBets">Raise</span>
                            <span v-else>Bet</span>
                        </div>
                        <div class="amount">{{ ui.chipFormatter.format(ui.myBet.totalBet) }}</div>
                    </div>
                </button>
                <button v-if="!isRaiseAllowed" type="button" disabled>
                    <div class="light"></div>
                    <div class="text">
                        <div class="action">Bet</div>
                    </div>
                </button>
            </div>

            <div class="bet-actions" v-if="ui.isPendingCallRaiseTime()">
                <label>
                    <input type="checkbox" value="true" :checked="pendingFold" @change="ui.setPendingFold($event.target.checked)" /> Fold
                </label>
                <label>
                    <input type="checkbox" /> Call
                </label>
                <label>
                    <input type="checkbox" /> Raise to {{ ui.chipFormatter.format(ui.myBet.totalBet) }}
                </label>
            </div>

            <div class="bet-actions" v-if="ui.isCallRaiseTime()">
                <button type="button" v-on:click.stop="fold">
                    <div class="action">Fold</div>
                </button>
                <button type="button" v-on:click.stop="call">
                    <div class="action">Call</div>
                    <div class="amount">{{ ui.chipFormatter.format(ui.myCall.chipsAdded) }}</div>
                </button>
                <button v-if="isRaiseAllowed" type="button" v-on:click.stop="bet">
                    <div class="action">Raise</div>
                    <div class="amount">{{ ui.chipFormatter.format(ui.myBet.totalBet) }}</div>
                </button>
                <button v-if="!isRaiseAllowed" type="button" disabled>
                    <div class="action">Raise</div>
                </button>
            </div>
    -->

    </div>

</template>


<script lang="ts">
    
import './betting-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
import { Seat } from '../../../../casino/tables/seat';
import { AnteCommand } from '../../../../commands/table/betting/ante-command';
import { BetCommand } from '../../../../commands/table/betting/bet-command';
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
            foldValue: false,
            checkValue: false,
            raiseValue: false
        }

        return values;

    },
    computed: {

        isFoldAllowed: function () {

        },

        isFoldActivated: function (): Boolean {

            return this.ui.pendingBetCommand instanceof FoldCommand;

        },

        isRaiseAllowed: function () {

            let mySeat: Seat = this.ui.getMySeat();

            if (mySeat) {

                return this.ui.betController.calculateMinimumRaise(this.ui.table, mySeat) != null;

            }

            return false;

        },
        minimumRaise: function () {

            let mySeat: Seat = this.ui.getMySeat();

            if (mySeat) {

                return this.ui.betController.calculateMinimumRaise(this.ui.table, mySeat);

            }

            return 0;

        },
        alreadyHasBets: function () {

            return this.ui.table.betStatus.numRaises > 0;

        }

    },
    methods: {

        toggleFold: function (event): void {

            if (this.isFoldActivated) {

                return this.ui.clearBetCommand();

            }

            this.ui.setBetCommand(new FoldCommand(this.ui.table.id));

        },

        ante: function (event) {

            this.ui.sendCommand(new AnteCommand(this.ui.table.id));

        },

        check: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, 0));

        },

        call: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, this.ui.myCall.chipsAdded));

        },

        bet: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, this.ui.myBet.chipsAdded));

        },

        fold: function (event) {


        },

    }  // methods

});

export default TableMenuComponent;

</script>
