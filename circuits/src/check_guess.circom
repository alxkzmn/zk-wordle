pragma circom 2.0.3;
include "./guess/guess_single.circom";

template CheckGuess() {  
   signal input solution[5];
   signal input salt;
   signal input guess[5];
   signal input hash;
   signal output clue[5];
   component check = SingleGuessCheck();
   check.salt <== salt;
   check.hash <== hash;
   for (var i = 0; i < 5; i++) {
      check.solution[i] <== solution[i];
      check.guess[i] <== guess[i];
   }
   //Constraining the output after all the inputs were assigned
   for (var i = 0; i < 5; i++) {
      clue[i] <== check.clue[i];
   }
}

component main{public [guess, hash]} = CheckGuess();

//For ZK-REPL (https://zkrepl.dev/)
/* INPUT = {
     "solution": [ 83, 84, 69, 69, 76 ],
  "salt": 362986289847779600,
  "guess": [ 83, 84, 65, 82, 84 ],
  "hash": "15057754752634756475908235894514270422456734783907164695964318985994495471810"
} */