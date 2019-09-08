import { fontset } from './fontset';

/**
 Memory Map:
+---------------+= 0xFFF (4095) End of Chip-8 RAM
|               |
|               |
|               |
|               |
|               |
| 0x200 to 0xFFF|
|     Chip-8    |
| Program / Data|
|     Space     |
|               |
|               |
|               |
+- - - - - - - -+= 0x600 (1536) Start of ETI 660 Chip-8 programs
|               |
|               |
|               |
+---------------+= 0x200 (512) Start of most Chip-8 programs
| 0x000 to 0x1FF|
| Reserved for  |
|  interpreter  |
+---------------+= 0x000 (0) Start of Chip-8 RAM
 */
export class Memory {
  bytes: Uint8Array;
  constructor() {
    this.bytes = new Uint8Array(4096);
    this.initialize();
  }

  private initialize = () => {
    fontset.forEach((val, index) => {
      this.bytes[index] = val;
    });
  };

  allocateProgram = (buffer: ArrayBuffer) => {
    new Uint8Array(buffer).forEach((val, index) => {
      this.bytes[index + 512] = val;
    });
  };

  allocate = (position: number, value: number) => {
    this.bytes[position] = value;
  };

  getOpcode = (pc: number) => (this.bytes[pc] << 8) | this.bytes[pc + 1];
}
