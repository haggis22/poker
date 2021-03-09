export interface IChipFormatter {


    /**
     * Formats the chips as appropriate - could be as money, or tournament chips, or whatever.
     * @param chips
     */
    format(chips: number): string;

}