import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import { groth16 } from "snarkjs";
import { solution, solutionIndex } from "../../utils/words";
import { asAsciiArray } from "../../utils/asAsciiArray";
import { BigNumber } from "ethers";

const CIRCUIT_WASM_PATH = "src/zk/check_guess.wasm";
const CIRCUIT_ZKEY_PATH = "src/zk/check_guess_final.zkey";

interface Guess {
  guess: number[];
}

export class Clue extends Service {
  private app: Application;
  private salt: number | undefined;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: Guess, params?: Params) {
    const { guess } = data;
    console.log("Received guess:", guess);
    console.log("Solution:", solution);
    console.log("Solution index:", solutionIndex);

    //Poseidon hash is a BigInt
    const solutionCommitment = BigNumber.from(
      await params?.zkWordleContract?.solutionCommitment(solutionIndex)
    );
    const asciiSolution = asAsciiArray(solution);
    //If the mapping in a smart contract returns zero, it means that either the day has changed and the solution index is different,
    //or the game hasn't yet started
    if (solutionCommitment.isZero()) {
      throw new Error(
        "Solution commitment not found, impossible to verify clue"
      );
    } else {
      console.log("Solution commitment found: ", solutionCommitment.toString());
      this.salt = (await this.app.service("salt").get(solutionIndex, {})).salt;
    }

    const args = {
      solution: asciiSolution,
      salt: this.salt,
      guess: guess,
      hash: solutionCommitment.toString(),
    };
    console.log("Args:", args);
    const proof = await groth16.fullProve(
      args,
      CIRCUIT_WASM_PATH,
      CIRCUIT_ZKEY_PATH
    );
    console.log("Proof generated");
    console.log(proof);

    return super.create(proof, params);
  }
}
