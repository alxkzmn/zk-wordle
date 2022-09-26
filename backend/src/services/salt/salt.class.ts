import { Paginated, Params } from "@feathersjs/feathers";
import { Service, MemoryServiceOptions } from "feathers-memory";
import { Application } from "../../declarations";

interface SaltRequest {
  solutionIndex: number;
}

interface SaltResponse {
  solutionIndex: number;
  salt: bigint;
}

export class Salt extends Service<SaltResponse> {
  private app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async get(id: number, params?: Params): Promise<SaltResponse> {
    console.log("Retrieving salt from DB");
    const dbSalt = (await this.app.service("salt-storage").find({
      query: {
        solutionIndex: id,
      },
    })) as Paginated<any>;
    const saltResponse = dbSalt ? dbSalt.data[0] : undefined;
    console.log("Retrieved salt:", saltResponse);
    return Promise.resolve(saltResponse);
  }

  async create(data: SaltRequest, params: Params): Promise<SaltResponse> {
    let saltResponse = await this.get(data.solutionIndex);
    if (!saltResponse) {
      const salt = Math.random() * 1e18;
      console.log(
        `Set new salt ${salt} for the solution index ${data.solutionIndex}`
      );
      saltResponse = {
        solutionIndex: data.solutionIndex,
        salt: BigInt(salt),
      };
      console.log("Writing salt to DB");
      this.app
        .service("salt-storage")
        ?.create(saltResponse)
        .then((message) => console.log("Created salt", message));
    } else {
      console.log(
        `Fetched salt ${saltResponse.salt} for the solution index ${data.solutionIndex} from DB`
      );
    }
    return Promise.resolve(saltResponse);
  }
}
