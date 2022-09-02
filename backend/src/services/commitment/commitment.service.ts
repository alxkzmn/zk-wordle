// Initializes the `commitment` service on path `/commitment`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { Commitment } from "./commitment.class";
import hooks from "./commitment.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    commitment: Commitment & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/commitment", new Commitment(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("commitment");

  service.hooks(hooks(app));
}
