import React, { memo } from 'react';
import { VideoMemory } from '../emu/VideoMemory';

interface IDisplayProps {
  memory: Uint8Array;
}

export class Display extends React.Component<IDisplayProps> {
  readonly scale = 10;
  readonly width = 64;
  readonly height = 32;
  private canvasRef = React.createRef<HTMLCanvasElement>();

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
  }

  clearCanvas() {
    const ctx = this.getCanvasContext();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width * this.scale, this.height * this.scale);
  }

  draw() {
    const { memory } = this.props;

    this.clearCanvas();

    if (!memory) {
      return;
    }

    for (let h = 0; h < this.height; h++) {
      for (let w = 0; w < this.width; w++) {
        if (memory[h * 64 + w] === 1) {
          this.drawPixel(w, h);
        }
      }
    }
  }

  drawPixel(x: number, y: number) {
    const ctx = this.getCanvasContext();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
  }

  getCanvasContext(): CanvasRenderingContext2D {
    const ctx =
      this.canvasRef.current && this.canvasRef.current.getContext('2d');

    if (!ctx) {
      throw new Error('No canvas context found.');
    }

    return ctx;
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={{ border: '1px solid #d3d3d3' }}
        width={this.width * this.scale}
        height={this.height * this.scale}
      >
        Canvas not supported by your browser
      </canvas>
    );
  }
}
