import { sleep } from '../utils';
import { Debugger } from './Debugger';
import { fontset } from './fontset';
import { Keyboard } from './Keyboard';
import { Memory } from './Memory';
import { Stack } from './Stack';
import { Video } from './Video';

export interface IRegisters {
  pc: number; // program counter
  i: number; // index register
  v: Uint8Array; // general purpose register
  dt: number; // delay timer register
  st: number; // sound timer register
}

export interface ISnapshot {
  registers: IRegisters;
  stack: Uint16Array;
  sp: number;
  memory: Uint8Array;
  keys: boolean[];
  videoMemory: Uint8Array;
}

export class Chip8emu {
  private registers: IRegisters;
  private stack: Stack;
  private memory: Memory;
  private keyboard: Keyboard;
  private video: Video;
  private debugger: Debugger | undefined;
  isRunning: boolean;
  shouldRender: boolean;
  private onIteration?: (snap: ISnapshot) => void;

  constructor() {
    this.registers = {
      pc: 0,
      i: 0,
      v: new Uint8Array(16),
      dt: 0,
      st: 0,
    };
    this.stack = new Stack();
    this.memory = new Memory();
    this.keyboard = new Keyboard();
    this.video = new Video();
    this.isRunning = false;
    this.shouldRender = false;
  }

  attachDebugger = (debug: Debugger) => (this.debugger = debug);

  loadProgram = (buffer: ArrayBuffer) => this.memory.allocateProgram(buffer);

  start = (buffer: ArrayBuffer, onIteration?: (snap: ISnapshot) => void) => {
    this.onIteration = onIteration;
    this.initialize();
    this.memory.allocateProgram(buffer);
    this.loop();
  };

  stop = () => {
    this.isRunning = false;
    this.keyboard.removeListener();
  };

  getSnapshot = (): ISnapshot => ({
    registers: this.registers,
    stack: this.stack.stack,
    sp: this.stack.sp,
    memory: this.memory.bytes,
    keys: this.keyboard.keys,
    videoMemory: this.video.memory,
  });

  private initialize = () => {
    this.registers = {
      pc: 0x200,
      i: 0,
      v: new Uint8Array(16),
      dt: 0,
      st: 0,
    };
    this.keyboard.registerListener();
    this.stack.reset();
  };

  private loop = async () => {
    this.isRunning = true;

    while (this.isRunning) {
      await sleep(1000);
      const opcode = this.memory.getOpcode(this.registers.pc);
      console.log(`Executing opcode: ${opcode.toString(16)}`);
      this.executeOpcode(opcode);
      this.updateTimers();
      if (this.onIteration) {
        this.onIteration(this.getSnapshot());
      }

      if (this.debugger) {
        this.debugger.addSnapshot(this.getSnapshot());
      }
    }
  };

  private updateTimers = () => {
    if (this.registers.dt > 0) {
      this.registers.dt -= 1;
    }

    if (this.registers.st > 0) {
      if (this.registers.st == 1) {
        console.error('Sound not implemented yet.');
      }

      this.registers.st -= 1;
    }
  };

  private incrementPC = () => {
    this.registers.pc += 2;
  };

  private executeOpcode = (opcode: number) => {
    this.incrementPC();
    switch (opcode & 0xf000) {
      case 0x0000:
        if (opcode & 0x00ee) {
          // 00EE - RET => Return from a subroutine.
          console.log('00EE - RET => Return from a subroutine.');
          this.registers.pc = this.stack.pop();
        } else if (opcode & 0x00e0) {
          // 00E0 - CLS => Clear the display.
          console.log('00E0 - CLS => Clear the display.');
          this.video.clear();
          this.shouldRender = true;
        } else {
          // 0nnn - SYS addr => Jump to a machine code routine at nnn.
          console.log(
            '0nnn - SYS addr => Jump to a machine code routine at nnn.'
          );
          this.registers.pc = opcode & 0x0fff;
        }
        break;
      case 0x1000:
        // 1nnn - JP addr => Jump to location nnn.
        console.log('1nnn - JP addr => Jump to location nnn.');
        //this.stack.push(this.registers.pc);
        this.registers.pc = opcode & 0x0fff;
        break;
      case 0x2000:
        // 2nnn - CALL addr => Call subroutine at nnn.
        console.log('2nnn - CALL addr => Call subroutine at nnn.');
        this.stack.push(this.registers.pc);
        this.registers.pc = opcode & 0x0fff;
        break;
      case 0x3000:
        // 3xkk - SE Vx, byte => Skip next instruction if Vx = kk.
        console.log('3xkk - SE Vx, byte => Skip next instruction if Vx = kk.');
        if (this.registers.v[(opcode & 0x0f00) >> 8] == (opcode & 0x00ff)) {
          this.incrementPC();
        }
        break;
      case 0x4000:
        // 4xkk - SNE Vx, byte => Skip next instruction if Vx != kk.
        console.log(
          '4xkk - SNE Vx, byte => Skip next instruction if Vx != kk.'
        );
        if (this.registers.v[(opcode & 0x0f00) >> 8] != (opcode & 0x00ff)) {
          this.incrementPC();
        }
        break;
      case 0x5000:
        // 5xy0 - SE Vx, Vy => Skip next instruction if Vx = Vy.
        console.log('5xy0 - SE Vx, Vy => Skip next instruction if Vx = Vy.');
        if (
          this.registers.v[(opcode & 0x0f00) >> 8] ==
          this.registers.v[(opcode & 0x00f0) >> 4]
        ) {
          this.incrementPC();
        }
        break;
      case 0x6000:
        // 6xkk - LD Vx, byte => Set Vx = kk.
        console.log('6xkk - LD Vx, byte => Set Vx = kk.');
        this.registers.v[(opcode & 0x0f00) >> 8] = opcode & 0x00ff;
        break;
      case 0x7000:
        // 7xkk - ADD Vx, byte => Set Vx = Vx + kk.
        console.log('7xkk - ADD Vx, byte => Set Vx = Vx + kk.');
        var x = (opcode & 0x0f00) >> 8;
        var val = (opcode & 0x00ff) + this.registers.v[x];
        if (val > 255) {
          val -= 256;
        }
        this.registers.v[x] = val;
        break;
      case 0x8000:
        this.execute0x8000opcode(opcode);
        break;
      case 0x9000:
        // 9xy0 - SNE Vx, Vy => Skip next instruction if Vx != Vy.
        console.log('9xy0 - SNE Vx, Vy => Skip next instruction if Vx != Vy.');
        var x = (opcode & 0x0f00) >> 8;
        var y = (opcode & 0x00f0) >> 4;
        if (this.registers.v[x] != this.registers.v[y]) {
          this.incrementPC();
        }
        break;
      case 0xa000:
        // Annn - LD I, addr => Set I = nnn.
        console.log('Annn - LD I, addr => Set I = nnn.');
        this.registers.i = opcode & 0x0fff;
        break;
      case 0xb000:
        // Bnnn - JP V0, addr => Jump to location nnn + V0.
        console.log('Bnnn - JP V0, addr => Jump to location nnn + V0.');
        this.stack.push(this.registers.pc);
        this.registers.pc = (opcode & 0x0fff) + this.registers.v[0];
        break;
      case 0xc000:
        // Cxkk - RND Vx, byte => Set Vx = random byte AND kk.
        console.log('Cxkk - RND Vx, byte => Set Vx = random byte AND kk.');
        const rnd = Math.round(Math.random() * 255);
        this.registers.v[(opcode & 0x0f00) >> 8] = opcode & 0x00ff & rnd;
        break;
      case 0xd000:
        // Dxyn - DRW Vx, Vy, nibble => Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
        console.log(
          'Dxyn - DRW Vx, Vy, nibble => Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.'
        );
        const n = opcode & 0x000f;
        var vx = this.registers.v[(opcode & 0x0f00) >> 8];
        var vy = this.registers.v[(opcode & 0x00f0) >> 4];
        let pixelErased = false;
        for (let i = 0; i < n; i++) {
          const byte = this.memory.bytes[this.registers.i + i];
          pixelErased = this.video.drawLine(vx, vy, byte);
        }
        this.registers.v[0xf] = pixelErased ? 1 : 0;
        this.shouldRender = true;
        0x00e0;
        break;
      case 0xe000:
        var vx = this.registers.v[(opcode & 0x0f00) >> 8];
        var isKeyPressed = this.keyboard.isPressed(vx);
        if (opcode & 0x009e) {
          console.log(
            'Ex9E - SKP Vx => Skip next instruction if key with the value of Vx is pressed.'
          );
          // Ex9E - SKP Vx => Skip next instruction if key with the value of Vx is pressed.
          if (isKeyPressed) {
            this.incrementPC();
          }
        } else if (opcode & 0x00a1) {
          console.log(
            'ExA1 - SKNP Vx => Skip next instruction if key with the value of Vx is not pressed.'
          );
          // ExA1 - SKNP Vx => Skip next instruction if key with the value of Vx is not pressed.
          if (!isKeyPressed) {
            this.incrementPC();
          }
        }
        break;
      case 0xf000:
        this.execute0xF000opcode(opcode);
        break;
      default:
        throw Error(`Unknown opcode ${opcode.toString(16)}`);
    }
  };

  private execute0x8000opcode = (opcode: number) => {
    const x = (opcode & 0x0f00) >> 8;
    const y = (opcode & 0x00f0) >> 4;

    switch (opcode & 0x000f) {
      case 0x0000:
        // 8xy0 - LD Vx, Vy => Set Vx = Vy.
        console.log('8xy0 - LD Vx, Vy => Set Vx = Vy.');
        this.registers.v[x] = this.registers.v[y];
      case 0x0001:
        // 8xy1 - OR Vx, Vy => Set Vx = Vx OR Vy.
        console.log('8xy1 - OR Vx, Vy => Set Vx = Vx OR Vy.');
        this.registers.v[x] = this.registers.v[x] | this.registers.v[y];
        break;
      case 0x0002:
        // 8xy2 - AND Vx, Vy => Set Vx = Vx AND Vy.
        console.log('8xy2 - AND Vx, Vy => Set Vx = Vx AND Vy.');
        this.registers.v[x] = this.registers.v[x] & this.registers.v[y];
        break;
      case 0x0003:
        // 8xy3 - XOR Vx, Vy => Set Vx = Vx XOR Vy.
        console.log('8xy3 - XOR Vx, Vy => Set Vx = Vx XOR Vy.');
        this.registers.v[x] = this.registers.v[x] ^ this.registers.v[y];
        break;
      case 0x0004:
        // 8xy4 - ADD Vx, Vy => Set Vx = Vx + Vy, set VF = carry.
        console.log('8xy4 - ADD Vx, Vy => Set Vx = Vx + Vy, set VF = carry.');
        const sum = this.registers.v[x] + this.registers.v[y];
        this.registers.v[0xf] = sum > 0xff ? 1 : 0;
        this.registers.v[x] = sum >> 8;
        break;
      case 0x0005:
        // 8xy5 - SUB Vx, Vy => Set Vx = Vx - Vy, set VF = NOT borrow.
        console.log(
          '8xy5 - SUB Vx, Vy => Set Vx = Vx - Vy, set VF = NOT borrow.'
        );
        this.registers.v[0xf] =
          this.registers.v[y] > this.registers.v[x] ? 1 : 0;
        this.registers.v[x] = this.registers.v[x] - this.registers.v[y];
        break;
      case 0x0006:
        // 8xy6 - SHR Vx {, Vy} => Set Vx = Vx SHR 1.
        //console.log('8xy6 - SHR Vx {, Vy} => Set Vx = Vx SHR 1.');
        this.registers.v[0xf] = this.registers.v[x] & 0x1;
        this.registers.v[x] >>= 1;
        break;
      case 0x0007:
        // 8xy7 - SUBN Vx, Vy => Set Vx = Vy - Vx, set VF = NOT borrow.
        this.registers.v[0xf] =
          this.registers.v[x] > this.registers.v[y] ? 0 : 1;
        this.registers.v[x] = this.registers.v[y] - this.registers.v[x];
        break;
      case 0x000e:
        // 8xyE - SHL Vx {, Vy} => Set Vx = Vx SHL 1.
        this.registers.v[0xf] = this.registers.v[x] >> 7;
        this.registers.v[x] <<= 1;
        break;
      default:
        throw Error(`Unknown opcode ${opcode.toString(16)}`);
    }
  };

  private execute0xF000opcode = async (opcode: number) => {
    const x = (opcode & 0x0f00) >> 8;
    switch (opcode & 0x00ff) {
      case 0x0007:
        // Fx07 - LD Vx, DT => Set Vx = delay timer value.
        console.log('Fx07 - LD Vx, DT => Set Vx = delay timer value.');
        this.registers.v[x] = this.registers.dt;
        break;
      case 0x000a:
        // Fx0A - LD Vx, K => Wait for a key press, store the value of the key in Vx.
        console.log(
          'Fx0A - LD Vx, K => Wait for a key press, store the value of the key in Vx.'
        );
        const keyValue = await this.keyboard.waitForKeyDown();
        this.registers.v[x] = keyValue;
        break;
      case 0x0015:
        // Fx15 - LD DT, Vx => Set delay timer = Vx.
        console.log('Fx15 - LD DT, Vx => Set delay timer = Vx.');
        this.registers.dt = this.registers.v[x];
        break;
      case 0x0018:
        // Fx18 - LD ST, Vx => Set sound timer = Vx.
        console.log('Fx18 - LD ST, Vx => Set sound timer = Vx.');
        this.registers.st = this.registers.v[x];
        break;
      case 0x001e:
        // Fx1E - ADD I, Vx => Set I = I + Vx.
        console.log('Fx1E - ADD I, Vx => Set I = I + Vx.');
        this.registers.v[0xf] =
          this.registers.i + this.registers.v[x] > 0xfff ? 1 : 0;
        this.registers.i += this.registers.v[x];
        break;
      case 0x0029:
        // Fx29 - LD F, Vx => Set I = location of sprite for digit Vx.
        console.log(
          'Fx29 - LD F, Vx => Set I = location of sprite for digit Vx.'
        );
        this.registers.i = fontset[this.registers.v[x]];
        break;
      case 0x0033:
        // Fx33 - LD B, Vx => Store BCD representation of Vx in memory locations I, I+1, and I+2.
        console.log(
          'Fx33 - LD B, Vx => Store BCD representation of Vx in memory locations I, I+1, and I+2.'
        );
        this.memory.allocate(this.registers.i, this.registers.v[x] / 100);
        this.memory.allocate(
          this.registers.i + 1,
          (this.registers.v[x] / 10) % 10
        );
        this.memory.allocate(
          this.registers.i + 2,
          (this.registers.v[x] % 100) % 10
        );
        break;
      case 0x0055:
        // Fx55 - LD [I], Vx => Store registers V0 through Vx in memory starting at location I.
        console.log(
          'Fx55 - LD [I], Vx => Store registers V0 through Vx in memory starting at location I.'
        );
        for (let i = 0; i <= x; i++) {
          this.memory.allocate(this.registers.i + i, this.registers.v[i]);
        }
        break;
      case 0x0065:
        // Fx65 - LD Vx, [I] => Read registers V0 through Vx from memory starting at location I.
        console.log(
          'Fx65 - LD Vx, [I] => Read registers V0 through Vx from memory starting at location I.'
        );
        for (let i = 0; i <= x; i++) {
          this.registers.v[i] = this.memory.bytes[this.registers.i + i];
        }
        break;
      default:
        throw Error(`Unknown opcode ${opcode.toString(16)}`);
    }
  };
}
