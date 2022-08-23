import { Params } from "@feathersjs/feathers";
import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";

interface SaltRequest {
  solutionIndex: number;
}

interface SaltResponse {
  solutionIndex: number;
  salt: number;
}

export class Salt extends Service<SaltResponse> {
  private saltByRound = new Map<number, number>();
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }

  async get(id: number, params: Params): Promise<SaltResponse> {
    return Promise.resolve({
      solutionIndex: id,
      salt: this.saltByRound.get(id) ?? 0,
    });
  }
  async create(data: SaltRequest, params: Params): Promise<SaltResponse> {
    const salt = Math.random() * 1e18;
    this.saltByRound.set(data.solutionIndex, salt);
    return Promise.resolve({
      solutionIndex: data.solutionIndex,
      salt: salt,
    });
  }
}
