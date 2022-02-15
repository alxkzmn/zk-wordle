pragma circom 2.0.3;
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";

template ZKWordle () {  

   signal input word0;
   signal input word1;
   signal input word2;
   signal input word3;
   signal input word4;
   signal input guess0;
   signal input guess1;
   signal input guess2;
   signal input guess3;
   signal input guess4;
   signal input greens[5];
   signal input yellows[5];

   component exact[5];

   for (var i=0; i<5; i++) {
     exact[i] = IsEqual();
   }

   var guess[5] = [guess0, guess1, guess2, guess3, guess4];
   var word[5] = [word0, word1, word2, word3, word4];

   for (var i=0; i<5; i++) {
      exact[i].in[0] <== guess[i];
      exact[i].in[1] <== word[i];
      // Constraint exact matches
      greens[i] === exact[i].out;
   }
}

component main{public [guess0,guess1,guess2,guess3,guess4]} = ZKWordle();