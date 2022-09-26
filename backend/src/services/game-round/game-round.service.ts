// Initializes the `GameRound` service on path `/game-round`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { GameRound } from "./game-round.class";
import hooks from "./game-round.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "game-round": GameRound & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/game-round", new GameRound(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("game-round");

  service.hooks(hooks);
}
