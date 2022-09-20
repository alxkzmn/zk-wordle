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
  //The 0th is GuessVerifier, the 1st is StatsVerifier, and the encapsulating ZKWordle is the 2nd one
  const zkWordleContract = new ethers.Contract(
    process.env.NODE_ENV === "production"
      ? "0xa47b27728ef69dddc22acc706c2d1810adc72bad"
      : "0xa47b27728ef69dddc22acc706c2d1810adc72bad",
    contractAbi.abi,
    wallet
  );
  return async (context: HookContext): Promise<HookContext> => {
    context.params.zkWordleContract = zkWordleContract;
    context.params.wallet = wallet;

    return context;
  };
};
