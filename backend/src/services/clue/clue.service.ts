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
  const privateKey =
    process.env.NODE_ENV !== "production"
      ? //Hardhat Account 0 private key - for testing only, never use in production!
        "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      : process.env.MINTER_PRIVATE_KEY ?? "";
  if (privateKey === undefined)
    throw new Error("Please provide minter private key");

  const rpcUrl =
    process.env.NODE_ENV === "production"
      ? process.env.ETH_RPC_URL
      : "http://localhost:8545";

  const blockchainOptions = {
    provider: new ethers.providers.JsonRpcProvider(rpcUrl),
    minterPrivateKey: privateKey,
    chainId: process.env.NODE_ENV === "production" ? "1" : "31337", // Either local Hardhat node or mainnet
  };

  const options = {
    paginate: app.get("paginate"),
    blockchainOptions: blockchainOptions,
  };
  // Initialize our service with any options it requires
  app.use("/clue", new Clue(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("clue");

  service.hooks(hooks);
}
