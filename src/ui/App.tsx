import React from 'react';
import { ISnapshot, Chip8emu } from '../emu/Chip8emu';
import { RomLoader } from './components/RomLoader';
import { Registers } from './components/Registers';
import { Memory } from './components/Memory';
import { VideoMemory } from './components/VideoMemory';
import { Display } from './Display';
import { IWorkerMessage } from '../serviceWorker';

export interface IAppState {
  snapshot: ISnapshot | undefined;
  isRunning: boolean;
  file: File | undefined;
}

class App extends React.Component<{}, IAppState> {
  state: IAppState = {
    snapshot: undefined,
    isRunning: false,
    file: undefined,
  };
  private emu: Chip8emu = new Chip8emu();

  start = (file: File, buffer: ArrayBuffer) => {
    this.setState({ isRunning: true, file });
    this.emu.start(buffer, (snap: ISnapshot) => {
      this.setState({ snapshot: snap });
    });
  };

  stop = () => {
    this.emu.stop();
    this.setState({
      isRunning: false,
      file: undefined,
    });
  };

  render() {
    const { snapshot, isRunning, file } = this.state;
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Chip8 emulator</h1>
        {isRunning && <h3>{`Running ${file!.name} ROM`}</h3>}
        {isRunning && snapshot && <Display memory={snapshot.videoMemory} />}
        <div
          style={{ display: 'flex', flexDirection: 'column', padding: '1.5em' }}
        >
          <div>
            <RomLoader
              isRunning={isRunning}
              onLoad={this.start}
              onStop={this.stop}
            />
          </div>
          {isRunning && snapshot && (
            <div style={{ width: '50%' }}>
              <Registers {...snapshot.registers} />
              <Memory memory={snapshot.memory} />
              <VideoMemory memory={snapshot.videoMemory} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
