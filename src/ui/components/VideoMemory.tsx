import React from 'react';
import { numberToHex, toHex } from '../../utils';
import styled from '@emotion/styled';

interface IMemoryProps {
  memory: Uint8Array;
}

const Wrapper = styled.div`
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 450px;
`;

const TextareaStyled = styled.textarea`
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
  overflow: scroll;
  resize: none;
`;

export const VideoMemory: React.FC<IMemoryProps> = ({ memory }) => {
  let memoryMap = '';

  memory.forEach((byte: number, index: number) => {
    if (index % 64 === 0)
      memoryMap += `\n 0x${index.toString(16).padStart(3, '0')}: `;
    memoryMap += `${numberToHex(byte)} `;
  });

  return (
    <Wrapper>
      Video Memory
      <TextareaStyled wrap="off" value={memoryMap} readOnly rows={14} />
    </Wrapper>
  );
};
