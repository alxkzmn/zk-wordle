pragma circom 2.0.3;
include "./guess/guess_single.circom";

template CheckGuess() {  
   signal input solution[5];
   signal input salt;
   signal input guess[5];
   signal input commitment;
   signal output clue[5];
   component check = SingleGuessCheck();
   check.salt <== salt;
   check.commitment <== commitment;
   for (var i = 0; i < 5; i++) {
      check.solution[i] <== solution[i];
      check.guess[i] <== guess[i];
   }
   //Constraining the output after all the inputs were assigned
   for (var i = 0; i < 5; i++) {
      clue[i] <== check.clue[i];
   }
}

component main{public [guess, commitment]} = CheckGuess();