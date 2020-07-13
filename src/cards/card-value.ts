export class CardValue
{

    public value: number;
    public symbol: string;
    public text: string;
    public plural: string;

    constructor(value: number, symbol: string, text: string, plural: string)
    {
        this.value = value;
        this.symbol = symbol;
        this.text = text;
        this.plural = plural;
    }

    public static readonly VALUES =
        [
            new CardValue(2, '2', 'deuce', 'deuces'),
            new CardValue(3, '3', 'three', 'threes'),
            new CardValue(4, '4', 'four', 'fours'),
            new CardValue(5, '5', 'five', 'fives'),
            new CardValue(6, '6', 'six', 'sixes'),
            new CardValue(7, '7', 'seven', 'sevens'),
            new CardValue(8, '8', 'eight', 'eights'),
            new CardValue(9, '9', 'nine', 'nines'),
            new CardValue(10, '10', 'ten', 'tens'),
            new CardValue(11, 'J', 'jack', 'jacks'),
            new CardValue(12, 'Q', 'queen', 'queens'),
            new CardValue(13, 'K', 'king', 'kings'),
            new CardValue(14, 'A', 'ace', 'aces'),
        ]


    public static lookup(value: number) : CardValue {
        return CardValue.VALUES.find(val => val.value == value);
    }

};