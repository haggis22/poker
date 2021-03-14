<template>
    <div v-if="seat != null" :class="seatClasses">
        <div class="name">
            <span>{{ seat.player?.name }}
            </span>
        </div>
        <div class="avatar">
            <div class="action-container">
                <timer-component v-if="getTimer" :timer="getTimer"></timer-component>
                <div class="action" v-if="getAction">
                    {{ getAction }}
                </div>
            </div>
        </div>
        <div :class="chipsClasses">

            <span v-if="seat.player != null">
                <span v-if="seat.isAllIn()">[ ALL IN ]</span>
                <span v-else>{{ ui.chipFormatter.format(seat.player.chips) }}</span>
            </span>
        </div>
        <div class="cards">
            <div v-if="!seat.player && !ui.getMySeat()">
                <button type="button"   
                        class="sit"
                        v-on:click.stop="sit">
                    Sit
                </button>
            </div>
            <div v-if="seat.player && seat.player.isSittingOut" class="sitting-out">
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
    import { UIPosition } from '@/app/ui/ui-position';
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

            const table: Table = tableState.getTable.value;
            const seats = ref(table.seats);

            const dealerPosition = ref(props.ui.dealerPositions.get(seatIndex));

            const person = ref({ name: 'Danny', age: 49 });
            const family = ref({ dad: person });

            const seatClasses = computed((): string[] => {

                let classes = ['seat', `seat-${seatIndex}`];

                if (props.ui.isActionOn(seatIndex)) {

                    classes.push('action-on');

                }

                if (seats.value[seatIndex].player?.isSittingOut) {
                    classes.push('sitting-out');
                }

                if (props.ui.isShowdownRequired) {

                    classes.push('showdown');

                }

                if (seats.value[seatIndex].isAllIn()) {

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

            const chipsClasses = () => {

                let classes = ['chips'];

                if (seats.value[seatIndex].isInHand && seats.value[seatIndex].player?.chips === 0) {

                    classes.push('all-in');

                }

                return classes;

            };

            return {
                table: tableState.getTable,
                seats: seats,
                dealerPosition,
                seatClasses,
                chipsClasses,
                person,
                family,
                getAction,
                getTimer
            };

        },
        data() {

            let values = {
            };

            return values;

        },
        components: {
            HandComponent,
            FoldingComponent,
            GhostHandComponent,
            TimerComponent
        },
        computed: {

            seat: function (): Seat {

                return this.seats[this.seatIndex];

            },

            chips: function (): number {

                return this.seat.player?.chips;

            }

        },
        /*
        computed: {

            hasTimer: function (): boolean {

                // the value of this seat's index in the seatTimer object map will be `null` if there is
                // not a currently-active Timer object
                return this.ui && this.ui.seatTimer && this.ui.seatTimer.get(this.seatIndex) != null;

            },

            seatClasses: function (): Array<string> {

                let classes = ['seat', `seat-${this.seatIndex}`];

                if (this.ui.isActionOn(this.seatIndex)) {

                    classes.push('action-on');

                }

                if (this.seat.player && this.seat.player.isSittingOut) {
                    classes.push('sitting-out');
                }

                if (this.ui.isShowdownRequired) {

                    classes.push('showdown');

                }

                if (this.seat.isAllIn()) {

                    classes.push('all-in');

                }

                return classes;

            },
            chipsClasses: function () {

                let classes = ['chips'];

                if (this.seat && this.seat.isInHand && this.seat.player && this.seat.player.chips === 0) {

                    classes.push('all-in');

                }

                return classes;

            }
        },
            */

        methods: {

            sit: function () {

                if (this.ui && this.seats[this.seatIndex]) {

                    this.ui.sendCommand(new RequestSeatCommand(this.table.id, this.seatIndex));

                }

                this.family.dad.name = 'Alexander';

            }

        }


    });

export default SeatComponent;

</script>
