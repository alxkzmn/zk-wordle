# ZK-Wordle

Wordle game implemented using the Zero-Knowledge Proofs.

## Compile the circuit, generate the reference zKey and verifier smart contract

```
npm install
npm run compile
```
You will be asked to provide random entropy text during the circuits compilation.

## Get local chain up and deploy the contract

Start the local chain:

```bash
cd blockchain
anvil
```

Deploy the contract in another terminal:

```bash
forge script script/ZKWordle.s.sol --ffi --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 -vvv --broadcast
```

This is an Anvil test account's private key - don't use it in production, everyone else knows it!
If you are deploying on a public chain, don't forget to verify the contract on Etherscan for other's convenience:
```bash
forge script script/ZKWordle.s.sol --ffi --rpc-url <YOUR RPC URL (e.g., Infura)> --private-key <YOUR ETHEREUM PRIVATE KEY> -vvv --broadcast --etherscan-api-key <YOUR ETHERSCAN API KEY> --verify
```

## Run the backend

```bash
cd backend
npm install
npm run start-dev
```

## Run the frontend

1. Rename `frontend/.env.example` to `frontend/.env`
2. Run
```bash
cd frontend
npm install
npm run start
```
