export interface ISocketWrapper {

    addEventListener(method: 'message', callback: (obj: any) => void): void;

    send(o: any): void;

}