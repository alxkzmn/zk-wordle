import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";
import { solution, solutionIndex } from "../../utils/words";
import { Params } from "@feathersjs/feathers";
import { BigNumber } from "ethers";
import { asAsciiArray } from "../../utils/asAsciiArray";
import { groth16 } from "snarkjs";

const CIRCUIT_WASM_PATH = "src/zk/check_stats.wasm";
const CIRCUIT_ZKEY_PATH = "src/zk/check_stats_final.zkey";

interface Guesses {
  guesses: number[][];
}

export class Stats extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: Guesses, params?: Params) {
    const { guesses } = data;
    console.log("Received guess:", guesses);
    console.log("Solution:", solution);
    console.log("Solution index:", solutionIndex);

    //Poseidon hash is a BigInt
    let solutionCommitment = BigNumber.from(
      await params?.zkWordleContract?.solutionCommitment(solutionIndex)
    );
    let asciiSolution = asAsciiArray(solution);
    //If the mapping in a smart contract returns zero, it means that either the day has changed and the solution index is different,
    //or the game hasn't yet started
    if (solutionCommitment.isZero()) {
      throw new Error(
        "Solution commitment not found, impossible to verify stats"
      );
    } else {
      console.log("Solution commitment found: ", solutionCommitment.toString());
    }

    let salt = (await this.app.service("salt").get(solutionIndex, {})).salt;

    const args = {
      solution: asciiSolution,
      salt: salt,
      guesses: guesses,
      hash: solutionCommitment.toString(),
    };
    console.log("Args:", args);
    let proof = await groth16.fullProve(
      args,
      CIRCUIT_WASM_PATH,
      CIRCUIT_ZKEY_PATH
    );
    console.log(`Stats proof generated`);
    console.log(proof);

    return super.create(proof, params);
  }
}
