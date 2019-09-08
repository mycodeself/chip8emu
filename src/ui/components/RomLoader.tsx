import React from 'react';

interface IRomLoaderProps {
  isRunning: boolean;
  onLoad: (file: File, buffer: ArrayBuffer) => void;
  onStop: () => void;
}

export class RomLoader extends React.Component<IRomLoaderProps> {
  fileInput = React.createRef<HTMLInputElement>();
  fileReader = new FileReader();

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (this.props.isRunning) {
      this.props.onStop();
      return;
    }

    if (this.fileInput) {
      const file = this.fileInput.current!.files![0];
      this.fileReader.onload = (e: any) => {
        if (this.fileReader.result) {
          this.props.onLoad(file, this.fileReader.result as ArrayBuffer);
        }
      };

      this.fileReader.readAsArrayBuffer(file);
    }
  };

  render() {
    const { isRunning } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          ref={this.fileInput}
          type="file"
          placeholder="Load a rom"
          required={!isRunning}
        />
        <button type="submit">{isRunning ? 'STOP' : 'START'}</button>
      </form>
    );
  }
}
