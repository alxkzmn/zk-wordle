# ZK-Wordle

Wordle game implemented using the Zero-Knowledge Proofs.

## Compile the circuit, generate the reference zKey and verifier smart contract

```
npm install
npm run compile
```

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

## Run the backend

```bash
cd backend
npm install
npm start
```

## Run the frontend

```bash
cd frontend
npm install
npm run start
```
