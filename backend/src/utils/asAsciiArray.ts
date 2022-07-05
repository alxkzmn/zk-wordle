export const asAsciiArray = (word: string) => {
  let wordAsAscii: number[] = []
  for (let i = 0; i < word.length; i++) {
    let code = word.charCodeAt(i)
    wordAsAscii.push(code)
  }

  return wordAsAscii
}
