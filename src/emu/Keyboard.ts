import { keyValues } from './keyValues';
import { defaultKeyMapping } from './defaultKeyMapping';
import { sleep } from '../utils';

export class Keyboard {
  keys: boolean[];
  constructor() {
    this.keys = new Array(16);
  }

  clear = () => {
    this.keys = new Array(16);
  };

  push = (keyCode: number) => {
    const key = defaultKeyMapping.findIndex(val => val.keyCode === keyCode);
    if (key === -1) {
      console.error(`Key code not found in mapping ${keyCode}`);
      return;
    }

    this.keys[key] = true;
  };

  isPressed = (key: number) => this.keys[key];

  waitForKeyDown = async (): Promise<number> => {
    let isKeyPressed = false;
    let keyCode: number;
    const handler = (event: KeyboardEvent) => {
      keyCode = event.keyCode;
      isKeyPressed = true;
    };
    document.addEventListener('keypress', handler);
    while (!isKeyPressed) {
      await sleep(100);
    }
    document.removeEventListener('keypress', handler);
    const key = defaultKeyMapping.findIndex(val => val.keyCode === keyCode);
    return keyValues[key];
  };

  registerListener = () =>
    document.addEventListener('keypress', this.handleKeyDown);

  removeListener = () =>
    document.removeEventListener('keypress', this.handleKeyDown);

  private handleKeyDown = (event: KeyboardEvent) => {
    this.push(event.keyCode);
  };
}
