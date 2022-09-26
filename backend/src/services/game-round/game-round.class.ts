import { Params } from "@feathersjs/feathers";
import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";
import { tomorrow, solutionIndex } from "../../utils/words";

export class GameRound extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }

  async find(params?: Params): Promise<any> {
    return Promise.resolve({
      solutionIndex: solutionIndex,
      tomorrow: tomorrow,
    });
  }
}
