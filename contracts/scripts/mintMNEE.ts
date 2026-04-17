import { network } from "hardhat";
import MockMNEE from "./data/MockMNEE.json";

const { ethers } = await network.connect();
const { abi } = MockMNEE;

const signers = await ethers.getSigners();

const Token = new ethers.Contract(process.env.MNEE_ADDRESS!, abi, signers[0]);

for await (const signer of signers) {
  console.log(signer.address);
  await Token.mint(
    signer.address,
    ethers.parseEther((Math.random() * 1000 - 100 + 100).toString())
  );
}
