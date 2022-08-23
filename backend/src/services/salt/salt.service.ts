// Initializes the `salt` service on path `/salt`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Salt } from "./salt.class";
import hooks from "./salt.hooks";
// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    salt: Salt & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/salt", new Salt(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("salt");

  service.hooks(hooks);
}
