export class Stack {
  stack: Uint16Array;
  sp: number;
  constructor() {
    this.stack = new Uint16Array(16);
    this.sp = 0;
  }

  reset = () => {
    this.sp = 0;
    this.stack = new Uint16Array(16);
  };

  push = (val: number) => {
    this.stack[this.sp] = val;
    this.sp += 1;
  };

  pop = (): number => {
    this.sp -= 1;
    return this.stack[this.sp];
  };
}
