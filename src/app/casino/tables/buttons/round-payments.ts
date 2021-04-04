// This will track payments made in a given round by player userID. This will
// be used to determine who has most recently paid all the blinds and thus
// should have the button
export class RoundPayments {

    public payments: Map<number, Set<number>>;


    constructor() {

        this.payments = new Map<number, Set<number>>();

    }


    public addPayment(userID: number, blindIndex: number) {

        if (!this.payments.has(userID)) {
            this.payments.set(userID, new Set<number>());
        }

        this.payments.get(userID).add(blindIndex);

    }


}