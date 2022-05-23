pragma circom 2.0.3;
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";

template ZKWordle () {  

   signal input word[5];
   signal input guess[5];
   signal input greens[5];
   signal input yellows[5];

   component exact[5];

   for (var i=0; i<5; i++) {
     exact[i] = IsEqual();
   }

   for (var i=0; i<5; i++) {
      exact[i].in[0] <-- guess[i];
      exact[i].in[1] <-- word[i];
      // Constraint exact matches
      greens[i] === exact[i].out;
   }

   component nonExact[5][5];
   var k = 0;
   var j = 0;
   var nonExactMatches[5] = [0,0,0,0,0];
   component nonExactEq[5];
   for (j=0; j<5; j++) {
      for (k=0; k<5; k++) {
         if (j!=k && guess[j]==word[k]){
           nonExactMatches[j] = 1;
           //End the loop
           k=5;
         }
      }
      nonExactEq[j] = IsEqual();
      nonExactEq[j].in[0] <-- 1;
      nonExactEq[j].in[1] <-- nonExactMatches[j];
      // Constraint non-exact matches
      yellows[j] === nonExactEq[j].out;
   }
   
}

component main{public [guess]} = ZKWordle();