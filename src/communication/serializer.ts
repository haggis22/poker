import * as serialization from "./serializable";
import { ActionMessage } from "../messages/action-message";
import { Action } from "../actions/action";
import { PlayerSeatedAction } from "../actions/table/players/player-seated-action";

const serializedConstructorName: string = "__serializedClass";

export class Serializer {


    public serialize(o: any): string {

        let constructorName = o.constructor.name;

        let so: any = {};
        so[serializedConstructorName] = constructorName;

        for (let propKey of Object.keys(o)) {

            let propValue: any = o[propKey];

            if (propKey == 'action') {

                console.log(`It's an action, is it PlayerSeatedAction: ${propValue instanceof PlayerSeatedAction}, isSerializable: ${isSerializable(propValue)}`);

            }

            if (isSerializable(propValue)) {

                so[propKey] = this.serialize(propValue);
            }
            else if (o[propKey] != null) {
                so[propKey] = JSON.stringify(propValue);

            }

        }

        let msg = JSON.stringify(so);

        // console.log(`Serialization: ${msg}`);

        if (o instanceof ActionMessage) {

            console.log(`Serializing ${constructorName}, action is ${o.action.constructor.name}`);
            console.log(`Serialized object: ${msg}`);

        }
        else if (o instanceof PlayerSeatedAction) {

            console.log(`Serializing ${constructorName}`);
            console.log(`Serialized object: ${msg}`);

        }


        return msg;

    }   // serialize


    public deserialize(msg: string): any {

        let outerObj:any = JSON.parse(msg);

        if (outerObj.hasOwnProperty(serializedConstructorName)) {

            let serializableType = serialization[outerObj[serializedConstructorName]];

            if (serializableType != null) {

                let obj: any = Object.create(serializableType.prototype);

                for (let propKey of Object.keys(outerObj)) {

                    // Don't copy the property that specified the serialized class constructor - there's just no need
                    if (propKey != serializedConstructorName) {

                        obj[propKey] = this.deserialize(outerObj[propKey]);

                    }

                    // console.log(`Setting ${objArray[0]}.${objProp} to be (${typeof objValue}) ${objValue}`);

                }

                return obj;

            }
            else {

                console.log(`Type not deserializable: ${outerObj[serializedConstructorName]}`);

            }

        }

        // This was not an object with special serialization, so just parsing it from the JSON is fine
        return outerObj;

    }


}

function isSerializable(obj: any): boolean {

    if (obj == null) {

        return false;

    }

    // If the object appears in the export of the Serializable object, then we will be able to recreated it later, so let's use special serialization here
    return serialization[obj.constructor.name] != null;

}

function isDeserializable(obj: any): boolean {

    if (obj == null) {

        return false;

    }

    // If the object has a property that specifies its prototype, and that type is
    // listed in Serializable, then we can re-create it
    return obj.hasOwnProperty(serializedConstructorName) && serialization[obj[serializedConstructorName]];

}



