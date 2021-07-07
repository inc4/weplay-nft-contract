import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const proxyRegistryAddress = getProxyRegistryAddress(network.name); // OpenSea proxy registry addresses

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(proxyRegistryAddress);

  console.log("Token address:", token.address);
}

function getProxyRegistryAddress(network: string) {
  return network === "rinkeby"
    ? "0xf57b2c51ded3a29e6891aba85459d600256cf317" // rinkeby
    : "0xa5409ec958c83c3f309868babaca7c86dcb077c1"; // mainnet
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
