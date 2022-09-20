import { disallow } from "feathers-hooks-common";
import { Application, HooksObject } from "@feathersjs/feathers";

import connectToContract from "../../hooks/connect-to-contract";

export default (app: Application): Partial<HooksObject> => {
  return {
    before: {
      all: [],
      find: [disallow()],
      get: [disallow()],
      create: [connectToContract(app)],
      update: [disallow()],
      patch: [disallow()],
      remove: [disallow()],
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
