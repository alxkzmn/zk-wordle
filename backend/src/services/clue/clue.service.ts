// Initializes the `clue` service on path `/clue`
import { ServiceAddons } from "@feathersjs/feathers";
import { ethers } from "ethers";
import { Application } from "../../declarations";
import { Clue } from "./clue.class";
import hooks from "./clue.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    clue: Clue & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };
  // Initialize our service with any options it requires
  app.use("/clue", new Clue(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("clue");

  service.hooks(hooks(app));
}
