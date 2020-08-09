export class Haggis22Serializer {

    serialize(o: any): string {

        return JSON.stringify(o);

    }

    deserialize(msg: string): any {

        return JSON.parse(msg);

    }

}