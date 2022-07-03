import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import { groth16 } from "snarkjs";

const CIRCUIT_WASM_PATH = "src/zk/wordle.wasm";
const CIRCUIT_ZKEY_PATH = "src/zk/wordle_final.zkey";

interface Guess {
  guess: number[];
}

export interface SnarkJSProof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
}

export interface SnarkJSProofAndSignals {
  proof: SnarkJSProof;
  publicSignals: number[];
}

export class Clue extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }

  async create(data: Guess, params?: Params) {
    const { guess } = data;
    console.log("Received guess:", guess);

    let proof = (await groth16.fullProve(
      {
        solution: [0, 1, 2, 3, 4],
        guess: guess,
      },
      CIRCUIT_WASM_PATH,
      CIRCUIT_ZKEY_PATH
    )) as SnarkJSProofAndSignals;
    console.log(`Proof generated`);
    console.log(proof);

    let newData = {
      proof: proof.publicSignals.slice(0, 5),
      hash: proof.publicSignals[5],
    };
    return super.create(newData, params);
  }
}
