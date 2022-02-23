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

   component nonExact[5][5];
   component sums[5];
   component gt[5];
   var k = 0;
   var j = 0;
   for (j=0; j<5; j++) {
      sums[j] = FiveSum();
      for (k=0; k<5; k++) {
         nonExact[j][k] = IsEqual();
         nonExact[j][k].in[0] <== guess[j];
         nonExact[j][k].in[1] <== word[k];
         if (j==k){
            sums[j].in[k] <== 0;
         } else {
            sums[j].in[k] <== nonExact[j][k].out ;
         }
      }
      gt[j] = GreaterThan(3);
      gt[j].in[0] <== sums[j].out;
      gt[j].in[1] <== 1;
      // Constraint non-exact matches
      yellows[j] === gt[j].out;
   }
   
}

template FiveSum() {
   signal input in[5];
   signal output out;

   out <== in[0]+in[1]+in[2]+in[3]+in[4];
}

component main{public [guess0,guess1,guess2,guess3,guess4]} = ZKWordle();