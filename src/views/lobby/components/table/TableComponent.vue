<template>

    <tr>
        <td>{{ table.id }}</td>
        <td class="name"><router-link :to="{ name: 'Table' , params: {tableID: table.id}}" target="_blank">{{ table.name }}</router-link></td>
        <td class="description">{{ table.description }}</td>
        <td class="players">{{ table.numPlayers }}/{{ table.numSeats }}</td>
    </tr>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { TableSummary } from '@/app/casino/tables/table-summary';


    const TableComponent = defineComponent({

        props: {

            table: {
                type: TableSummary,
                required: true
            },

        },
        setup() {

        },
        components: {
        }

    });

    export default TableComponent;

</script>

<style scoped lang="scss">

    .name,
    .description
    {
        text-align: left;
    }

    .players
    {
        text-align: center;
    }

</style>
