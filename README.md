# ZK-Wordle

Wordle game implemented using the Zero-Knowledge Proofs. This project is my first exploration of zero-knowledge proofs. Check out [this series of articles](https://alexkuzmin.io/posts/zk-wordle-1/) to learn the story behind it.

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

Rename `blockchain/.env.example` to `blockchain/.env` and paste the private key of an Ethereum account you intend to use as a deployer.

Deploy the contract in another terminal:

```bash
forge script script/ZKWordle.s.sol --ffi --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 -vvv --broadcast
```

This is an Anvil test account's private key - don't use it in production, everyone else knows it!
If you are deploying on a public chain, don't forget to verify the contract on Etherscan for others' convenience:

```bash
forge script script/ZKWordle.s.sol --ffi --rpc-url <YOUR RPC URL (e.g., Infura)> --private-key <YOUR ETHEREUM PRIVATE KEY> -vvv --broadcast --etherscan-api-key <YOUR ETHERSCAN API KEY> --verify
```

## Run the backend

1. Rename `backend/.env.example` to `backend/.env` and paste the private key of an Ethereum account you intend to use as a signer in the backend.
2. Run

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
