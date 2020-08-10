import * as serialization from "./serializable";

export class Serializer {


    public serialize(o: any): string {

        let className = o.constructor.name;

        let so: any = {};

        for (let prop in o) {

            if (o.hasOwnProperty(prop)) {

                let propValue: any = o[prop];

                if (isSerializable(propValue)) {

                    so[prop] = this.serialize(propValue);
                }
                else if (o[prop] != null) {
                    so[prop] = JSON.stringify(propValue);

                }

            }
        }

        let msg = JSON.stringify([className, JSON.stringify(so)]);

        // console.log(`Serialization: ${msg}`);

        return msg;

    }   // serialize


    public deserialize(msg: string): any {

        let objArray: string[] = JSON.parse(msg) as [string, string];

        if (objArray && objArray.length == 2) {

            let serializableType = serialization[objArray[0]];

            if (serializableType != null) {

                let obj: any = Object.create(serializableType.prototype);

                let objKeyValues: any = this.deserialize(objArray[1]);

                for (let objProp in objKeyValues) {

                    let objValue = this.deserialize(objKeyValues[objProp]);
                    obj[objProp] = objValue;

                    // console.log(`Setting ${objArray[0]}.${objProp} to be (${typeof objValue}) ${objValue}`);


                }

                return obj;

            }
            else {

                console.log(`Type not deserializable: ${objArray[0]}`);

            }


        }

        return JSON.parse(msg);

    }


}

function isSerializable(obj: any): obj is serialization.Serializable {

    if (obj == null) {

        return false;

    }

    return (obj != null) && (<serialization.Serializable>obj).isSerializable === true;

}