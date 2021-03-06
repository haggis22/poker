import { Serializer } from "./serializer";

export class DeepCopier {

    private serializer: Serializer;

    constructor() {

        this.serializer = new Serializer();

    }


    public copy(obj: any): any {

        return this.serializer.deserialize(this.serializer.serialize(obj));

    }

}