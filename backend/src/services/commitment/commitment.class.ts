import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import { BigNumber, ethers } from "ethers";
import { solution, solutionIndex } from "../../utils/words";
import { buildPoseidon } from "circomlibjs";
import { asAsciiArray } from "../../utils/asAsciiArray";

export class Commitment extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: any, params?: Params) {
    const salt = (
      await this.app
        .service("salt")
        .create({ solutionIndex: solutionIndex }, {})
    ).salt;

    const asciiSolution = asAsciiArray(solution);
    const poseidon = await buildPoseidon();
    //Converting solution to a single number in the same way as the circuit does.
    let solutionAsNum = 0;
    for (let i = 0; i < asciiSolution.length; i++) {
      solutionAsNum += asciiSolution[i] * Math.pow(100, i);
    }
    const hashedSolution = BigNumber.from(
      poseidon.F.toObject(poseidon([solutionAsNum, salt]))
    );
    console.log("Commitment: " + hashedSolution);

    const hashedTxData = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [solutionIndex, hashedSolution]
    );
    const message = ethers.utils.solidityKeccak256(["bytes"], [hashedTxData]);
    const signature = await params?.wallet.signMessage(
      ethers.utils.arrayify(message)
    );

    const response = {
      solutionIndex: solutionIndex,
      hashedSolution: hashedSolution,
      signature: signature,
    };
    return Promise.resolve(response);
  }
}
