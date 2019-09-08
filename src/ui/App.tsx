import React from 'react';
import { ISnapshot, Chip8emu } from '../emu/Chip8emu';
import { RomLoader } from './components/RomLoader';
import { Registers } from './components/Registers';

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

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (this.state.isRunning) {
      this.stop();
      return;
    }
  };

  start = (file: File, buffer: ArrayBuffer) => {
    this.setState({ file: file, isRunning: true });
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
        {snapshot && <Registers {...snapshot.registers} />}
      </div>
    );
  }
}

export default App;
