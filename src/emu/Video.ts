export class Video {
  memory: Uint8Array;
  constructor() {
    this.memory = new Uint8Array(64 * 32);
  }

  clear = () => {
    this.memory = new Uint8Array(64 * 32);
  };

  drawLine = (x: number, y: number, byte: number): boolean => {
    let pixelErased = false;

    for (let i = 0; i < 8; i++) {
      if ((byte & (0x80 >> i)) != 0) {
        const pos = x + i + y * 64;
        if (this.memory[pos] == 1) {
          pixelErased = true;
          this.memory[pos] ^= 1;
        }
      }
    }

    return pixelErased;
  };
}
