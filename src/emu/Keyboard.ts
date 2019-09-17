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

  registerListener() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  removeListener() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    const keyCode = event.keyCode;
    const key = defaultKeyMapping.findIndex(val => val.keyCode === keyCode);

    if (key === -1) {
      console.error(`Key code not found in mapping ${keyCode}`);
      return;
    }

    this.keys[key] = false;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    this.push(event.keyCode);
  };

  private push(keyCode: number) {
    const key = defaultKeyMapping.findIndex(val => val.keyCode === keyCode);
    if (key === -1) {
      console.error(`Key code not found in mapping ${keyCode}`);
      return;
    }

    this.keys[key] = true;
  }
}
