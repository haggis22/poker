﻿import * as serialization from "./serializable";

const serializedConstructorName: string = "__serializedClass";

const MAP_ENTRIES: string = '__mapEntries:';


export class Serializer {

    private log(msg: string): void {

        console.log('\x1b[37m\x1b[41m%s\x1b[0m', msg);

    }


    public serialize(o: any): string {

        if (o === null) {

            return JSON.stringify(o);

        }

        // if it's a primitive type, then just JSONify it
        if (isPrimitive(o)) {
            return JSON.stringify(o);
        }

        if (Array.isArray(o)) {

            return JSON.stringify(o.map(arrayItem => this.serialize(arrayItem)));

        }


        let so: any = {};

        if (isSerializable(o)) {

            so[serializedConstructorName] = o.constructor.name;

        }
        else if (o instanceof Map) {

            so[serializedConstructorName] = 'Map';

            so[MAP_ENTRIES] = Array.from(o.entries()).map(entry => [this.serialize(entry[0]), this.serialize(entry[1])]);

            // We can let it drop through since a Map has no properties

        }
        else {
            // this.log(`WARN: Cannot serialize ${o.constructor.name}`);
        }

        for (let propKey of Object.keys(o)) {

            if (o[propKey] != null && !isSerializable(o[propKey]) && typeof o[propKey] === 'object' && !Array.isArray(o[propKey]) && (o[propKey].constructor.name !== 'Object'))
            {
                this.log(`WARN: ${o.constructor.name}.${propKey} is being serialized as a plain object - it is actually ${o[propKey].constructor.name}`);
            }

            so[propKey] = this.serialize(o[propKey]);

        }

        let msg = JSON.stringify(so);

        // this.log(`Serialized object: ${msg}`);

        return msg;

    }   // serialize


    public deserialize(msg: string): any {

        let outerObj: any = null;

        try {

            outerObj = JSON.parse(msg);

        }
        catch (error) {
            this.log(`Could not parse JSON from ${msg}`);
            throw error;
        }

        if (outerObj == null || isPrimitive(outerObj)) {
            return outerObj;
        }

        if (Array.isArray(outerObj)) {

            // Each item in the array was serialized independently, so we need to deserialize it from its string
            return outerObj.map(arrayItem => this.deserialize(arrayItem));

        }

        let prototype: any = null;

        if (outerObj.hasOwnProperty(serializedConstructorName)) {

            let serializableType: any = (serialization as any)[outerObj[serializedConstructorName]];

            if (serializableType != null) {

                prototype = serializableType.prototype;

            }
            else if (outerObj[serializedConstructorName] == 'Map') {

                throw new Error('Map is currently not deserializable');

            }
            else {

                throw new Error(`Type not deserializable: ${outerObj[serializedConstructorName]}`);

            }

        }
        else {

            prototype = outerObj;

        }

        let obj: any = Object.create(prototype);

        for (let propKey of Object.keys(outerObj)) {

            // Don't copy the property that specified the serialized class constructor, if it's there - there's just no need
            if (propKey != serializedConstructorName) {

                obj[propKey] = this.deserialize(outerObj[propKey]);

            }

            // this.log(`Setting ${objArray[0]}.${objProp} to be (${typeof objValue}) ${objValue}`);

        }

        return obj;

    }


}

function isSerializable(obj: any): boolean {

    if (obj == null) {

        return false;

    }

    // If the object appears in the export of the Serializable object, then we will be able to recreate it later, so let's use special serialization here
    return (serialization as any)[obj.constructor.name] != null;

}

function isDeserializable(obj: any): boolean {

    if (obj == null) {

        return false;

    }

    // If the object has a property that specifies its prototype, and that type is
    // listed in Serializable, then we can re-create it
    return obj.hasOwnProperty(serializedConstructorName) && (serialization as any)[obj[serializedConstructorName]];

}


function isPrimitive(obj: any) {

    switch (typeof obj) {

        case 'undefined':
        case 'boolean':
        case 'number':
        case 'bigint':
        case 'string':
            return true;

    }

    return false;

}   // isPrimitive



