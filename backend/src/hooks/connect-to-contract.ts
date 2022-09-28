// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Application, Hook, HookContext } from "@feathersjs/feathers";
import { ethers } from "ethers";
import contractAbi from "../blockchain/ZKWordle.sol/ZKWordle.json";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (app: Application): Hook => {
  let wallet: ethers.Wallet;

  if (!app.get("accountPrivateKey")) {
    throw new Error("Private key cannot be empty");
  } else if (!app.get("chainId")) {
    throw new Error("chainId cannot be empty");
  } else {
    wallet = new ethers.Wallet(
      app.get("accountPrivateKey"),
      new ethers.providers.JsonRpcProvider(app.get("rpcUrl"))
    );
  }
  //TODO make compatible with local deployment
  const zkWordleContract = new ethers.Contract(
    process.env.NODE_ENV === "production"
      ? "0xD2936b30A608F63C925bF19f3da44EC8fA4C6170"
      : "0x610178da211fef7d417bc0e6fed39f05609ad788",
    contractAbi.abi,
    wallet
  );
  return async (context: HookContext): Promise<HookContext> => {
    context.params.zkWordleContract = zkWordleContract;
    context.params.wallet = wallet;

    return context;
  };
};
