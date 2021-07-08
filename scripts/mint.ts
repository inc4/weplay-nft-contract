import { ethers } from "hardhat";
import { promises as fs } from "fs";
import Arweave from "arweave";
import * as key from "./key.json"; // arweave wallet
import Transaction from "arweave/node/lib/transaction";

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

  const mintPromises = [];
  const dirs = await fs.readdir(tokensDir);

  for (const dir of dirs) {
    const url = await uploadToken(tokensDir + dir + "/");
    console.log(dir, " => ", url);
    mintPromises.push(token.mint(mintTo, url));
  }

  await Promise.all(mintPromises);
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
  "0x6a8441e991d45efd94c65ed8f200e6fcf94eeee4",
  "0x153190c9A6fAF497273b9a27eD0fF2fc5E4a7B9a",
  "../tokens/"
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
