import app from "../../src/app";

describe("'GameRound' service", () => {
  it("registered the service", () => {
    const service = app.service("game-round");
    expect(service).toBeTruthy();
  });
});
