export class CardSuit
{
    public value: number;
    public symbol: string;
    public text: string;

    constructor(value: number, symbol: string, text: string) {
        this.value = value;
        this.symbol = symbol;
        this.text = text;
    }

    public static readonly VALUES =
        [
            new CardSuit(1, '\u2663', 'club'),
            new CardSuit(2, '\u2666', 'diamond'),
            new CardSuit(3, '\u2665', 'heart'),
            new CardSuit(4, '\u2660', 'spade')
        ];

}