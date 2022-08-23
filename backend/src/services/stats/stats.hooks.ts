import { Application } from "@feathersjs/express";
import { HooksObject } from "@feathersjs/feathers";

import connectToContract from "../../hooks/connect-to-contract";

export default (app: Application): Partial<HooksObject> => {
  return {
    before: {
      all: [],
      find: [],
      get: [],
      create: [connectToContract(app)],
      update: [],
      patch: [],
      remove: [],
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  };
};
