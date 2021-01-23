export interface ISocketWrapper {

    addEventListener(method: 'message', callback: (obj: any) => void);

    send(o: any): void;

}