import React from 'react';
import { ISnapshot, Chip8emu } from '../emu/Chip8emu';
import { RomLoader } from './components/RomLoader';
import { Registers } from './components/Registers';
import { Memory } from './components/Memory';
import { VideoMemory } from './components/VideoMemory';

export interface IAppState {
  snapshot: ISnapshot | undefined;
  isRunning: boolean;
  file: File | undefined;
}

class App extends React.Component<{}, IAppState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  state: IAppState = {
    snapshot: undefined,
    isRunning: false,
    file: undefined,
  };
  private emu: Chip8emu = new Chip8emu();

  start = (file: File, buffer: ArrayBuffer) => {
    this.setState({ file: file, isRunning: true });
    this.emu.start(buffer, (snap: ISnapshot) => {
      this.setState({ snapshot: snap });
    });

    this.clearCanvas();
    this.drawCanvas();
  };

  stop = () => {
    this.emu.stop();
    this.setState({
      isRunning: false,
      file: undefined,
    });

    this.clearCanvas();
  };

  clearCanvas = () => {
    const canvas =
      this.canvasRef.current && this.canvasRef.current.getContext('2d');
    if (!canvas) {
      return;
    }
    canvas.clearRect(0, 0, 64, 32);
  };

  drawCanvas = () => {
    const canvas = this.canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    ctx.rect(0, 0, 64, 32);
    ctx.fillStyle = '#000000';
    ctx.fill();
  };

  render() {
    const { snapshot, isRunning, file } = this.state;
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', padding: '1.5em' }}
      >
        <h1>Chip8 emulator</h1>
        {isRunning && <h3>Running ROM {file!.name}</h3>}
        <div>
          <RomLoader
            isRunning={isRunning}
            onLoad={this.start}
            onStop={this.stop}
          />
        </div>
        {snapshot && (
          <div style={{ width: '50%' }}>
            <Registers {...snapshot.registers} />
            <Memory memory={snapshot.memory} />
            <VideoMemory memory={snapshot.videoMemory} />
          </div>
        )}
        <canvas ref={this.canvasRef} width="64px" height="32px" />
      </div>
    );
  }
}

export default App;
