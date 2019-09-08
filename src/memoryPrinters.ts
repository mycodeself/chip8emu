import { Memory } from './emu/Memory';
import { toHex } from './utils';

export const consolePrinter = (memory: Memory) => {
  const hexStr = toHex(memory.bytes.buffer);
  const bytesInt16 = hexStr.match(/.{1,4}/g) as RegExpMatchArray;
  let col = 0;
  let str = '';
  bytesInt16.forEach((val: string) => {
    col = col + 1;
    str += `${val} `;
    if (col === 8) {
      col = 0;
      str += '\n';
    }
  });

  console.log(str);
};
