export interface IInstruction {
  asm: string;
  opcode: number;
  description: string;
}

interface IInstructionSet {
  [key: number]: IInstruction;
}

export const instructionSet: IInstructionSet = {
  0x00e0: {
    asm: 'CLS',
    opcode: 0x00e0,
    description: 'Clear the display.',
  },
  0x00ee: {
    asm: 'RET',
    opcode: 0x00ee,
    description: 'Return from a subroutine.',
  },
};
