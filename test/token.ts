import { ethers } from 'hardhat';
import { expect } from 'chai';
import type { Contract } from 'ethers';

describe('Token', function () {
  let owner = '';
  let account1 = '';
  let account2 = '';
  const uri = 'https://host/path';
  let token: Contract;

  before(async () => {
    const accounts = await ethers.getSigners();
    owner = await accounts[0].getAddress();
    account1 = await accounts[1].getAddress();
    account2 = await accounts[2].getAddress();

    const tokenFactory = await ethers.getContractFactory('Token');
    token = await tokenFactory.deploy();
    await token.deployed();

    await token.mint(account1, uri + '1');
    await token.mint(account2, uri + '2');
    await token.mint(account2, uri + '3');
  });

  it('should be minted', async function () {
    expect(await token.ownerOf(1)).to.equal(account1);
    expect(await token.ownerOf(2)).to.equal(account2);
    expect(await token.ownerOf(3)).to.equal(account2);
    expect(await token.balanceOf(account1)).to.equal(1);
    expect(await token.balanceOf(account2)).to.equal(2);
  });

  it('should have proper uri', async () => {
    expect(await token.tokenURI(1)).to.equal(uri + '1');
  });
});
