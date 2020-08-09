export class Serializer {


    public serialize(o: any): string {

        return JSON.stringify(o);

    }

    public deserialize(msg: string): any {

        return JSON.parse(msg);

    }


}