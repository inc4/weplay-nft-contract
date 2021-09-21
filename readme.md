# WePlay NFT Contract

NFT Smart contract for WePlay

## Prerequisites

- nodejs 14.x
- yarn

Make `.env` file with following content:

```
INFURA_KEY=<infura-key>
PRIVATEKEY=<private-key>

# for mint
CONTRACT_ADDRESS=<deployed-contract-address>
MINT_TO_ADDRESS=<mint-to-address>
```

Save your arweave key (json) as `./scripts/key.json`


Install dependencies:

```sh
$ yarn install
```

## Usage


### Compile contract

```sh
$ yarn build
```

### Test contract

```sh
$ yarn test
```

### Deploy contract

This will deploy contract to default network:

```sh
$ yarn deploy
```

All networks are specified in `hardhat.config.ts`. You can deploy to any network
with:

```sh
$ yarn deploy --network <network>
```


### Mint

For each token, create a folder in `./tokens/` and put `img.png` and `index.json` there  
For example `./tokens/example/img.png` `./tokens/example/index.json`

Then run `hardhat run ./scripts/mint.ts  --network <network>` to mint
