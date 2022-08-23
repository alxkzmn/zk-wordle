import { Application } from "../declarations";
import clue from "./clue/clue.service";
import stats from "./stats/stats.service";
import salt from "./salt/salt.service";
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(clue);
  app.configure(stats);
  app.configure(salt);
}
