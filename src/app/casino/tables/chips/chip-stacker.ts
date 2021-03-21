import { ChipStack } from "./chip-stack";
import { Chip } from "./chip";

const DENOMINATIONS: Array<Chip> =
    [
        new Chip(50000, 'pink', 'white'),
        new Chip(10000, 'black', 'white'),
        new Chip(2500, 'green', 'white'),
        new Chip(500, 'yellow', 'white'),
        new Chip(100, 'blue', 'white'),
        new Chip(50, 'darkred', 'white'),
        new Chip(25, 'white', 'black')
    ];


export function stackChips(amount: number): ChipStack[] {

    let stacks: ChipStack[] = new Array<ChipStack>();

    for (let chip of DENOMINATIONS) {

        if (amount >= chip.value) {

            let numChips: number = Math.floor(amount / chip.value);

            stacks.push(new ChipStack(chip, numChips));

            amount = amount % chip.value;


        }

    }

    return stacks;

}

