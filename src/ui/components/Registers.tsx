import React from 'react';
import { IRegisters } from '../../emu/Chip8emu';

interface IRegistersProps extends IRegisters {}

export const Registers: React.FC<IRegistersProps> = ({ pc, i, v, dt, st }) => (
  <div>
    <p>pc: {`${pc} | 0x${pc.toString(16)}`}</p>
    <p>i: {`${i} | 0x${i.toString(16)}`}</p>
    <p>dt: {`${dt} | 0x${dt.toString(16)}`}</p>
    <p>st: {`${st} | 0x${st.toString(16)}`}</p>
  </div>
);
