export const toHex = (buffer: ArrayBuffer) => {
  let res = '';
  const h = '0123456789ABCDEF';
  new Uint8Array(buffer).forEach(v => (res += h[v >> 4] + h[v & 15]));

  return res;
};

export const sleep = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
