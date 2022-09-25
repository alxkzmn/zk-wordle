export const asAsciiArray = (word: string) => {
  const wordAsAscii: number[] = [];
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    wordAsAscii.push(code);
  }

  return wordAsAscii;
};
