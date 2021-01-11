import { ChipStack } from "./chip-stack";
import { Chip } from "./chip";

export class ChipStacker {

    private readonly DENOMINATIONS: Array<Chip> =
        [
            new Chip(50000, 'pink'),
            new Chip(10000, 'black'),
            new Chip(2500, 'green'),
            new Chip(500, 'yellow'),
            new Chip(100, 'blue'),
            new Chip(50, 'red'),
            new Chip(25, 'white')
        ];


    public colorUp(amount: number): ChipStack[] {

        let stacks: ChipStack[] = new Array<ChipStack>();

        for (let chip of this.DENOMINATIONS) {

            if (amount >= chip.value) {

                let numChips: number = Math.floor(amount / chip.value);

                stacks.push(new ChipStack(chip, numChips));

                amount = amount % chip.value;


            }

        }

        return stacks;

    }


}