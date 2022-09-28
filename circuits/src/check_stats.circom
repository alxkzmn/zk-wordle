pragma circom 2.0.3;
include "./guess/guess_single.circom";

template CheckWordleStats() {
   signal input guesses[6][5];
   //"Word of the day", private input
   signal input solution[5];
   signal input salt;
   //Solution commitment
   signal input commitment;
   signal output clues[6][5];

   component checkGuess[6];
   for (var i = 0; i < 6; i++) {
      checkGuess[i] = SingleGuessCheck();
      checkGuess[i].salt <== salt;
      checkGuess[i].commitment <== commitment;
      for (var j = 0; j < 5; j++) {
         checkGuess[i].solution[j] <== solution[j];
         checkGuess[i].guess[j] <== guesses[i][j];
      }
      //Constraining the output after all the inputs were assigned
      for (var j = 0; j < 5; j++) {
         clues[i][j] <== checkGuess[i].clue[j];
      }
   }
}

component main{public [commitment]} = CheckWordleStats();