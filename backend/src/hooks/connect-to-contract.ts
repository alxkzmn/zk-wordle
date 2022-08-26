// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Application, Hook, HookContext } from "@feathersjs/feathers";
import { ethers } from "ethers";
import latestTestnetDeployment from "../blockchain_cache/ZKWordle.s.sol/31337/run-latest.json";
import contractAbi from "../blockchain_cache/ZKWordle.sol/ZKWordle.json";

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
  const contractDeploymenTransaction = latestTestnetDeployment.transactions[2];
  const zkWordleContract = new ethers.Contract(
    contractDeploymenTransaction.contractAddress,
    contractAbi.abi,
    wallet
  );
  return async (context: HookContext): Promise<HookContext> => {
    context.params.zkWordleContract = zkWordleContract;

    return context;
  };
};
