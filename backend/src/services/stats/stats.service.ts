// Initializes the `stats` service on path `/stats`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Stats } from "./stats.class";
import hooks from "./stats.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    stats: Stats & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/stats", new Stats(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("stats");

  service.hooks(hooks(app));
}
