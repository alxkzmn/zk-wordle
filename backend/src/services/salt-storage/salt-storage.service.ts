// Initializes the `SaltStorage` service on path `/salt-storage`
import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../declarations";
import { SaltStorage } from "./salt-storage.class";
import createModel from "../../models/salt-storage.model";
import hooks from "./salt-storage.hooks";

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    "salt-storage": SaltStorage & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const saltModel = createModel(app);
  const options = {
    Model: saltModel,
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/salt-storage", new SaltStorage(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("salt-storage");

  service.hooks(hooks);
}
