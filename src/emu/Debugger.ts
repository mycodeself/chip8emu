import { ISnapshot } from './Chip8emu';

export class Debugger {
  callStack: any[];
  snapshots: ISnapshot[];
  constructor() {
    this.callStack = [];
    this.snapshots = [];
  }

  addSnapshot = (snapshot: ISnapshot) => {
    this.snapshots.push(snapshot);
  };
}
