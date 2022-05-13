export const asAsciiArray = (word: string) => {
  let asciiGuess: number[] = []
  for (let i = 0; i < word.length; i++) {
    let code = word.charCodeAt(i)
    asciiGuess.push(code)
  }

  return asciiGuess
}
