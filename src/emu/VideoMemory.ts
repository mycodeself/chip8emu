export class VideoMemory {
  bytes: Uint8Array;
  constructor() {
    this.bytes = new Uint8Array(64 * 32);
  }

  clear = () => {
    this.bytes = new Uint8Array(64 * 32);
  };

  togglePixel(x: number, y: number): boolean {
    const idx = x + y * 64;
    const collision = !!this.bytes[idx];
    this.bytes[idx] ^= 1;
    return collision;
  }

  drawLine = (x: number, y: number, byte: number): boolean => {
    let pixelErased = false;

    for (let i = 0; i < 8; i++) {
      if ((byte & (0x80 >> i)) != 0) {
        const pos = x + i + y * 64;
        if (this.bytes[pos] == 1) {
          pixelErased = true;
          this.bytes[pos] ^= 1;
        }
      }
    }

    return pixelErased;
  };
}
