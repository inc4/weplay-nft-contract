import { ethers } from "hardhat";
import { promises as fs } from "fs";
import Arweave from "arweave";
import * as key from "./key.json"; // arweave wallet
import Transaction from "arweave/node/lib/transaction";
import * as path from "path";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
});

async function main(
  contractAddress: string,
  mintTo: string,
  tokensDir: string
) {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.attach(contractAddress);

  for (const tokenName of await fs.readdir(tokensDir)) {
    if (!(await input(tokenName))) continue;

    const url = await uploadToken(path.join(tokensDir, tokenName, "/"));
    console.log(tokenName, " => ", url);
    await token.mint(mintTo, url);
  }
}

async function uploadToken(path: string) {
  const txImg = await arweave.createTransaction(
    {
      data: await fs.readFile(path + "img.png"),
    },
    key
  );
  await arweave.transactions.sign(txImg, key);

  const indexJson = JSON.parse(await fs.readFile(path + "index.json", "utf-8"));
  indexJson.image_url = txUrl(txImg);

  const txJson = await arweave.createTransaction(
    {
      data: JSON.stringify(indexJson),
    },
    key
  );
  txJson.addTag("Content-Type", "application/json");
  await arweave.transactions.sign(txJson, key);

  const price = (await txPrice(txImg)) + (await txPrice(txJson));
  console.log("Price: ", price);

  const resImg = await arweave.transactions.post(txImg);
  const resJson = await arweave.transactions.post(txJson);
  console.assert(resImg.status == 200);
  console.assert(resJson.status == 200);

  return txUrl(txJson);
}

const txUrl = (tx: Transaction) => "https://arweave.net/" + tx.id;
const txPrice = async (tx: Transaction) =>
  +arweave.ar.winstonToAr(await arweave.transactions.getPrice(tx.data.length));

main(
  // @ts-ignore
  process.env.CONTRACT_ADDRESS,
  process.env.MINT_TO_ADDRESS,
  "tokens"
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const input = (tokenName: string) => {
  while (true) {
    const r = prompt(
      `Minting token '${tokenName}'. \t y - mint, n - skip, CTRL+C - cancel `
    );
    if (r == "y" || r == "Y") return true;
    if (r == "n" || r == "N") return false;
  }
};

const prompt = require("prompt-sync")({ sigint: true });
