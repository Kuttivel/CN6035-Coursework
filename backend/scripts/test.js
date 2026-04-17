import { MNEEContractConfig } from "../contract/mnee";
import { MarketplaceContractConfig } from "../contract/marketPlace";
import { ethers } from "ethers";

const buyer = signers[5]
const Token = new ethers.Contract(
  ...MNEEContractConfig,
  buyer
);
const MarketPlace = new ethers.Contract(
  ...MarketplaceContractConfig,
  buyer
);

console.log(buyer)

await Token.approve(
  MarketPlace.target,
  ethers.parseEther("10")
);
