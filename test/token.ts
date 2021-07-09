import { ethers } from "hardhat";
import type { Contract, Signer } from "ethers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const adminRole =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const minterRole = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("MINTER_ROLE")
);

describe("Token", () => {
  let accounts: Signer[];
  let owner = "";
  let account1 = "";
  let account2 = "";
  let proxyAddress = "";
  const uri = "https://host/path";
  let token: Contract;

  before(async () => {
    accounts = await ethers.getSigners();
    owner = await accounts[0].getAddress();
    account1 = await accounts[1].getAddress();
    account2 = await accounts[2].getAddress();

    const proxyFactory = await ethers.getContractFactory(
      "contracts/Proxy.sol:ProxyRegistry"
    );
    const proxy = await proxyFactory.deploy();
    proxyAddress = proxy.address;

    const tokenFactory = await ethers.getContractFactory("Token");
    token = await tokenFactory.deploy(proxyAddress);

    await token.mint(account1, uri + "1");
    await token.mint(account2, uri + "2");
    await token.mint(account2, uri + "3");
  });

  it("should be minted", async () => {
    expect(await token.ownerOf(1)).to.equal(account1);
    expect(await token.ownerOf(2)).to.equal(account2);
    expect(await token.ownerOf(3)).to.equal(account2);
    expect(await token.balanceOf(account1)).to.equal(1);
    expect(await token.balanceOf(account2)).to.equal(2);
  });

  it("should have proper uri", async () => {
    expect(await token.tokenURI(1)).to.equal(uri + "1");
  });

  it("should deny to mint from wrong address", async () => {
    await token.connect(accounts[0]).mint(account1, uri).should.not.to.be
      .rejected;
    await token.connect(accounts[1]).mint(account1, uri).should.be.rejected;
  });

  it("should grant minter role", async () => {
    expect(await token.hasRole(minterRole, owner)).to.be.true;
    expect(await token.hasRole(minterRole, account1)).to.be.false;
    await token.grantRole(minterRole, account1);
    expect(await token.hasRole(minterRole, owner)).to.be.true;
    expect(await token.hasRole(minterRole, account1)).to.be.true;
    await token.revokeRole(minterRole, account1);
    expect(await token.hasRole(minterRole, account1)).to.be.false;
  });

  it("should grant admin role", async () => {
    await token.grantRole(adminRole, account1);
    await token.revokeRole(adminRole, owner);
    expect(await token.hasRole(adminRole, owner)).to.be.false;
    expect(await token.hasRole(adminRole, account1)).to.be.true;
    expect(await token.hasRole(minterRole, owner)).to.be.true;
    await token.connect(accounts[1]).grantRole(adminRole, owner);
    await token.revokeRole(adminRole, account1);
  });

  it("should not allow minter to grant roles", async () => {
    await token.grantRole(minterRole, account1);
    await token.connect(accounts[1]).grantRole(adminRole, account2).should.be
      .rejected;
    await token.connect(accounts[1]).grantRole(minterRole, account2).should.be
      .rejected;
    await token.revokeRole(minterRole, account1);
  });

  it("should use minter role", async () => {
    await token.grantRole(minterRole, account2);
    await token.revokeRole(minterRole, owner);
    await token.mint(account1, uri).should.be.rejected;
    await token.connect(accounts[2]).mint(account1, uri).should.not.to.be
      .rejected;
  });

  it("should approve proxy address to transfer token", async () => {
    // TODO
    await token.connect(accounts[0]).transferFrom(account1, account2, 1);
    expect(await token.ownerOf(1)).to.equal(account2);
  });
});
