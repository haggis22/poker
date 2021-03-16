<template>
    <div v-if="seat" :class="seatClasses">
        <div class="name">
            <div>Player null? {{ player == null }}</div>
            <div>Seat {{ seat.player?.name }}</div>
            <span>P: {{ player?.name }}</span>
        </div>
        <div class="avatar">
            <div class="action-container">
                <timer-component v-if="getTimer" :timer="getTimer"></timer-component>
                <div class="action" v-if="getAction">{{ getAction }}</div>
            </div>
        </div>
        <div :class="chipsClasses">
            <span v-if="seat.player">
                <span v-if="seat.isAllIn()">[ ALL IN ]</span>
                <span v-else>{{ ui.chipFormatter.format(seat.player?.chips) }}</span>
            </span>
        </div>
        <div class="cards">
            <div v-if="!player && !ui.getMySeat()">
                <button type="button"   
                        class="sit"
                        v-on:click.stop="sit">
                    Sit
                </button>
            </div>
            <div v-if="player && player.isSittingOut" class="sitting-out">
                [ Sitting Out ]
            </div>
            <hand-component v-if="seat.hand"
                            :cards="seat.hand.cards"
                            :ui="ui"
                            :dealer-position="dealerPosition"></hand-component>

            <folding-component v-if="ui.muckedCards.has(seat.index)"
                                :cards="ui.muckedCards.get(seat.index)"
                                :ui="ui"
                                :dealer-position="dealerPosition"></folding-component>

            <ghost-hand-component v-if="ui.muckedCards.has(seat.index) && ui.mySeatIndex == seat.index"
                                :cards="ui.muckedCards.get(seat.index)"
                                :ui="ui"
                                :dealer-position="dealerPosition"></ghost-hand-component>

        </div>
    </div>
</template>


<script lang="ts">


    import './seat.scss';

    import { defineComponent, ref, computed, reactive, watch } from 'vue';

    import { Table } from '@/app/casino/tables/table';
    import { Seat } from '@/app/casino/tables/seat';
    import { BetStatus} from '@/app/casino/tables/betting/bet-status';
    import { RequestSeatCommand } from '@/app/commands/table/request-seat-command';

    import HandComponent from '../hand/HandComponent.vue';
    import FoldingComponent from '../folding/FoldingComponent.vue';
    import TimerComponent from '../timer/TimerComponent.vue';
    import GhostHandComponent from '../ghost-hand/GhostHandComponent.vue';
    import { TableUI } from '../../table-ui';

    import { tableState } from "@/store/table-state";
    import { Player } from '@/app/players/player';
    import { Timer } from '@/app/timers/timer';

    const SeatComponent = defineComponent({


        props: {
            seatIndex: {
                type: Number,
                required: true
            },
            betStatus: {
                type: BetStatus,
                required: true
            },
            ui: {
                type: TableUI,
                required: true
            }
        },
        setup(props) {

            const seatIndex: number = props.seatIndex;

            const dealerPosition = props.ui.dealerPositions.get(seatIndex);

            const table = computed((): Table => tableState.getTable.value);

            const seat = computed((): Seat => { return table.value?.seats[seatIndex]; });

            const player = computed(() => { return table.value?.seats[seatIndex].player; });

            const chips = computed((): number => player.value?.chips);


            const seatClasses = computed((): string[] => {

                let classes = ['seat', `seat-${seatIndex}`];

                if (props.ui.isActionOn(seatIndex)) {

                    classes.push('action-on');

                }

                if (player.value?.isSittingOut) {
                    classes.push('sitting-out');
                }

                if (props.ui.isShowdownRequired) {

                    classes.push('showdown');

                }

                if (seat.value.isAllIn()) {

                    classes.push('all-in');

                }

                return classes;

            });

            const getAction = computed((): string => {

                return tableState.getActions.value.get(seatIndex);

            });

            const getTimer = computed((): Timer => {

                return tableState.getTimers.value.get(seatIndex);

            });

            const chipsClasses = computed((): string[] => {

                let classes = ['chips'];

                if (seat.value.isInHand && player && player.value.chips === 0) {

                    classes.push('all-in');

                }

                return classes;

            });

            const sit = () => {

                props.ui.sendCommand(new RequestSeatCommand(table.value.id, seatIndex));

            };


            return {

                table,
                seat,
                player,
                chips,
                dealerPosition,
                seatClasses,
                chipsClasses,
                getAction,
                getTimer,

                // methods
                sit
            };

        },
        components: {
            HandComponent,
            FoldingComponent,
            GhostHandComponent,
            TimerComponent
        }

    });

export default SeatComponent;

</script>
