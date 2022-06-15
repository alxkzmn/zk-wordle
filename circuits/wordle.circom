pragma circom 2.0.3;
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/gates.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";

template ZKWordle () {  
   //"Word of the day", private input
   signal input solution[5];
   //Current guess (public input)
   signal input guess[5];
   //Clue output (typically represented using colored squares ⬜🟩⬜🟨🟨)
   //"0" - the letter is absent (gray), "1" - the letter matches correctly (green)
   //"2" - the letter is present in solution but is located at a different position (yellow)
   signal output clue[5];

   signal correct[5];
   component eq[5];
   for (var i=0; i<5; i++) {
      eq[i] = IsEqual();
      eq[i].in[0] <== guess[i];
      eq[i].in[1] <== solution[i];
      correct[i] <== eq[i].out;
   }

   var i=0;
   var j=0;
   //Unfortunately, Circom (as of v2.0.3) does not allow dynamic component declaration inside loops.
   //It leads to the following error: error[T2011]: Signal or component declaration outside initial scope.
   //It means that we have to declare how many instances of a component we would like to have in advance.
   component match[5][5];
   component alreadyPresent[5][5];
   component wasOrIsTaken[5][5];
   component matchAndNotCorrect[5][5];
   component matchAndNotTaken[5][5];
   component andNotYetPresent[5][5];
   component present[5][5];
   signal solutionCharsTaken[5][5];
   for (i=0; i<5; i++) { // guess index
      for (j=0; j<5; j++) { // solution index
         //True if the i-th guess letter is the same as j-th solution letter.
         match[i][j] = IsEqual();
         match[i][j].in[0] <== guess[i];
         match[i][j].in[1] <== solution[j];
         //True if guess letter has a match but it didn't match with
         //solution letter exactly in this (i-th) position.
         //Let's call it an "elsewhere match".
         matchAndNotCorrect[i][j] = AndNotB();
         matchAndNotCorrect[i][j].a <== match[i][j].out;
         matchAndNotCorrect[i][j].b <== correct[i];
         //True if there is an elsewhere match but the matching letter of the solution hasn't been taken
         //Let's call it a vacant elsewhere match.
         matchAndNotTaken[i][j] = AndNotB();
         matchAndNotTaken[i][j].a <== matchAndNotCorrect[i][j].out;
         if (i==0){
            matchAndNotTaken[i][j].b <== correct[j];
         } else {
            matchAndNotTaken[i][j].b <== solutionCharsTaken[i-1][j];
         }
         
         //True if there has been at least one vacant elsewhere match with any previous solution letter
         alreadyPresent[i][j] = OR();
         if (j==0){
           alreadyPresent[i][j].a <== 0;
         } else {
           alreadyPresent[i][j].a <== alreadyPresent[i][j-1].out;
         }        
         alreadyPresent[i][j].b <== matchAndNotTaken[i][j].out;
         
         //Marking "present" only once (only for the first occurence).
         //True if it is a vacant match but it hasn't happened for any previous solution letter
         andNotYetPresent[i][j] = AndNotB();
         andNotYetPresent[i][j].a <== matchAndNotTaken[i][j].out;
         if (j==0){
            andNotYetPresent[i][j].b <== 0;   
         } else {
            andNotYetPresent[i][j].b <== alreadyPresent[i][j-1].out;
         }         

         //"Flattening" the 2d array by carrying the previous "presents" over to the top layer 
         present[i][j] = OR();
         if (j==0){
           present[i][j].a <== 0;
         } else {
           present[i][j].a <== present[i][j-1].out;
         }        
         present[i][j].b <== andNotYetPresent[i][j].out;

         //Merging the previously taken solution letters with the newly taken ones 
         wasOrIsTaken[i][j] = OR();
         wasOrIsTaken[i][j].a <== andNotYetPresent[i][j].out;
         if (i==0){
            wasOrIsTaken[i][j].b <== correct[j];
         } else {
            wasOrIsTaken[i][j].b <== solutionCharsTaken[i-1][j];
         }
         solutionCharsTaken[i][j] <== wasOrIsTaken[i][j].out;
      }
      //"0" if the letter is absent, "1" if it's an exact match 
      //and "2" if it's present elsewhere in the solution.
      clue[i] <== correct[i] + present[i][4].out * 2;
   }
}

//Convenience component that inverts the "b" input 
//and performs && of the result with the "a" input
template AndNotB(){
   signal input a;
   signal input b;
   signal output out;

   component not = NOT();
   not.in <== b;

   component and = AND();
   and.a <== a;
   and.b <== not.out;
   out <== and.out;
}

component main{public [guess]} = ZKWordle();

/* INPUT = {
    "solution":   [100,101,100,101,103],
    "guess":      [101,100,105,101,101]
} */