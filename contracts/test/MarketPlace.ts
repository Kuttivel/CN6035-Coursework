import { expect } from "chai";

import hre from "hardhat";
import type { Marketplace, MockMNEE } from "../types/ethers-contracts/index.js";

const { ethers, networkHelpers } = await hre.network.connect();
const { loadFixture } = networkHelpers;

type TestSigner = Awaited<ReturnType<typeof ethers.getSigners>>[number];

async function createProduct(
  Token: MockMNEE,
  marketplace: Marketplace,
  seller: TestSigner,
  price: number = 10,
  uri: string = "ipfs://product"
) {
  // Approve enough tokens for the product creation fee
  await Token.connect(seller).approve(
    marketplace.target,
    await marketplace.createProductFee()
  );

  await expect(
    marketplace
      .connect(seller)
      .createProduct(ethers.parseEther(price.toString()), uri)
  )
    .to.emit(marketplace, "ProductCreated")
    .withArgs(1, seller.address, uri);

  // Optionally return the productId if needed
  return 1;
}

describe("Marketplace (UUPS)", function () {
  async function deployFixture() {
    const [owner, seller, buyer, feeRecipient, arbitrator, other] =
      await ethers.getSigners();

    // Deploy mock Token
    const Token = await ethers.deployContract("MockMNEE");
    const TokenAddress = await Token.getAddress();

    // Mint Tokens to buyer
    await Token.mint(buyer.address, ethers.parseEther("1000"));
    await Token.mint(seller.address, ethers.parseEther("1000"));

    // Deploy Marketplace (UUPS)
    const marketplace = await ethers.deployContract("Marketplace");
    await marketplace.initialize(
      TokenAddress,
      feeRecipient.address,
      arbitrator.address
    );

    return {
      marketplace,
      Token,
      owner,
      seller,
      buyer,
      feeRecipient,
      arbitrator,
      other,
    };
  }

  /*//////////////////////////////////////////////////////////////
                              INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  it("initializes correctly", async () => {
    const { marketplace, feeRecipient, arbitrator } =
      await loadFixture(deployFixture);

    expect(await marketplace.platformFeeBps()).to.equal(300);
    expect(await marketplace.feeRecipient()).to.equal(feeRecipient.address);
    expect(await marketplace.arbitrator()).to.equal(arbitrator.address);
  });

  /*//////////////////////////////////////////////////////////////
                            ADMIN
  //////////////////////////////////////////////////////////////*/

  it("owner can update platform fee", async () => {
    const { marketplace } = await loadFixture(deployFixture);
    const oldFee = await marketplace.platformFeeBps();

    await expect(marketplace.setPlatformFee(400))
      .to.emit(marketplace, "PlatformFeeUpdated")
      .withArgs(oldFee, 400);

    expect(await marketplace.platformFeeBps()).to.equal(400);
  });

  it("Fee must be between 2% and 5%", async () => {
    const { marketplace } = await loadFixture(deployFixture);

    await expect(marketplace.setPlatformFee(100)).to.be.revertedWith(
      "Fee must be between 2% and 5%"
    );

    await expect(marketplace.setPlatformFee(600)).to.be.revertedWith(
      "Fee must be between 2% and 5%"
    );
  });

  it("non-owner cannot update platform fee", async () => {
    const { marketplace, buyer } = await loadFixture(deployFixture);

    await expect(marketplace.connect(buyer).setPlatformFee(400)).to.be.revert(
      ethers
    );
  });

  it("owner can update product creation fee", async () => {
    const { marketplace } = await loadFixture(deployFixture);
    const oldFee = await marketplace.createProductFee();
    const newFee = ethers.parseEther("20");

    await expect(marketplace.setCreateProductFee(newFee))
      .to.emit(marketplace, "CreateProductFeeUpdated")
      .withArgs(oldFee, newFee);

    expect(await marketplace.createProductFee()).to.equal(newFee);
  });

  it("owner can change arbitrator", async () => {
    const { marketplace, other } = await loadFixture(deployFixture);

    await expect(marketplace.setArbitrator(other.address))
      .to.emit(marketplace, "ArbitratorUpdated")
      .withArgs(other.address);

    expect(await marketplace.arbitrator()).to.equal(other.address);
  });

  it("non-owner cannot change arbitrator", async () => {
    const { marketplace, buyer, other } = await loadFixture(deployFixture);

    await expect(
      marketplace.connect(buyer).setArbitrator(other.address)
    ).to.be.revert(ethers);
  });

  /*//////////////////////////////////////////////////////////////
                            PRODUCTS
  //////////////////////////////////////////////////////////////*/

  it("seller can create a product", async () => {
    const { Token, marketplace, seller } = await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    const product = await marketplace.products(1);
    expect(product.price).to.equal(ethers.parseEther("10"));
    expect(product.active).to.equal(true);
  });

  it("price and uri bytes must be greater than zero", async () => {
    const { marketplace, seller } = await loadFixture(deployFixture);
    await expect(
      marketplace.connect(seller).createProduct(0, "ipfs://product")
    ).to.be.revertedWith("Price and URI bytes must be greater than zero");

    await expect(
      marketplace.connect(seller).createProduct(ethers.parseEther("10"), "")
    ).to.be.revertedWith("Price and URI bytes must be greater than zero");
  });

  it("seller can update product price", async () => {
    const { marketplace, seller, Token } = await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await expect(
      marketplace.connect(seller).setProductPrice(1, ethers.parseEther("15"))
    )
      .to.emit(marketplace, "ProductPriceUpdated")
      .withArgs(1, ethers.parseEther("15"));

    const product = await marketplace.products(1);
    expect(product.price).to.equal(ethers.parseEther("15"));
  });

  it("seller cannot update product price to zero", async () => {
    const { marketplace, seller, Token } = await loadFixture(deployFixture);
    await createProduct(Token, marketplace, seller);

    await expect(
      marketplace.connect(seller).setProductPrice(1, 0)
    ).to.be.revertedWith("Price must be greater than zero");
  });

  it("non-seller cannot update product price", async () => {
    const { marketplace, seller, buyer, Token } =
      await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await expect(
      marketplace.connect(buyer).setProductPrice(1, ethers.parseEther("15"))
    ).to.be.revertedWith("Not seller");
  });

  it("seller can update product status", async () => {
    const { marketplace, seller, Token } = await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await expect(marketplace.connect(seller).setProductStatus(1, false))
      .to.emit(marketplace, "ProductStatusUpdated")
      .withArgs(1, false);

    const product = await marketplace.products(1);
    expect(product.active).to.equal(false);
  });

  it("only seller can update product status", async () => {
    const { marketplace, seller, buyer, Token } =
      await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await expect(
      marketplace.connect(buyer).setProductStatus(1, false)
    ).to.be.revertedWith("Not seller");
  });

  /*//////////////////////////////////////////////////////////////
                          PURCHASE & ESCROW
  //////////////////////////////////////////////////////////////*/

  it("buyer can purchase product", async () => {
    const { marketplace, seller, buyer, Token } =
      await loadFixture(deployFixture);

    const quantity = 5;
    const uri = "ipfs://metadata";

    const balanceBefore = await Token.balanceOf(buyer.address);

    const pricePerItem = ethers.parseEther("10");
    const amount = pricePerItem * BigInt(quantity);

    await createProduct(Token, marketplace, seller);

    await Token.connect(buyer).approve(marketplace.target, amount);

    await expect(marketplace.connect(buyer).buyProduct(1, quantity, uri))
      .to.emit(marketplace, "ProductPurchased")
      .withArgs(1, 1, uri);

    const balanceAfter = await Token.balanceOf(buyer.address);

    expect(balanceAfter).to.equal(balanceBefore - amount);

    // Validate transaction struct
    const txn = await marketplace.transactions(1);

    expect(txn.buyer).to.equal(buyer.address);
    expect(txn.seller).to.equal(seller.address);
    expect(txn.productId).to.equal(1);
    expect(txn.quantity).to.equal(quantity);
    expect(txn.amount).to.equal(amount);
    expect(txn.metadataURI).to.equal(uri);
    expect(txn.status).to.equal(0); // TxStatus.Pending
  });

  /*//////////////////////////////////////////////////////////////
                        CONFIRM DELIVERY
  //////////////////////////////////////////////////////////////*/

  it("buyer can confirm delivery and seller gets paid", async () => {
    const { marketplace, seller, buyer, Token, feeRecipient } =
      await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await Token.connect(buyer).approve(
      marketplace.target,
      ethers.parseEther("10")
    );

    await marketplace.connect(buyer).buyProduct(1, 1, "ipfs://metadata");

    const sellerBalanceBefore = await Token.balanceOf(seller.address);

    await expect(marketplace.connect(buyer).confirmDelivery(1)).to.emit(
      marketplace,
      "TransactionCompleted"
    );

    const sellerBalanceAfter = await Token.balanceOf(seller.address);
    const fee = (ethers.parseEther("10") * 300n) / 10_000n;

    expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(
      ethers.parseEther("10") - fee
    );

    expect(await Token.balanceOf(feeRecipient.address)).to.equal(fee);
  });

  //   /*//////////////////////////////////////////////////////////////
  //                             REFUNDS
  //   //////////////////////////////////////////////////////////////*/

  it("seller can cancel transaction and refund buyer", async () => {
    const { marketplace, seller, buyer, Token } =
      await loadFixture(deployFixture);

    const quantity = 2;

    await createProduct(Token, marketplace, seller);

    await Token.connect(buyer).approve(
      marketplace.target,
      ethers.parseEther("10") * BigInt(quantity)
    );

    await marketplace.connect(buyer).buyProduct(1, quantity, "ipfs://metadata");

    const buyerBefore = await Token.balanceOf(buyer.address);

    await expect(marketplace.connect(seller).cancelTransaction(1)).to.emit(
      marketplace,
      "TransactionRefunded"
    );

    const buyerAfter = await Token.balanceOf(buyer.address);
    expect(buyerAfter - buyerBefore).to.equal(
      ethers.parseEther("10") * BigInt(quantity)
    );
  });

  //   /*//////////////////////////////////////////////////////////////
  //                             DISPUTES
  //   //////////////////////////////////////////////////////////////*/

  it("buyer can open dispute and arbitrator resolves in buyer favor", async () => {
    const { marketplace, seller, buyer, Token, arbitrator } =
      await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await Token.connect(buyer).approve(
      marketplace.target,
      ethers.parseEther("10")
    );

    await marketplace.connect(buyer).buyProduct(1, 1, "ipfs://metadata");
    await marketplace.connect(buyer).openDispute(1);

    await expect(marketplace.connect(arbitrator).resolveDispute(1, true))
      .to.emit(marketplace, "DisputeResolved")
      .withArgs(1, true);

    const txn = await marketplace.transactions(1);
    expect(txn.status).to.equal(3); // Refunded
  });

  //   /*//////////////////////////////////////////////////////////////
  //                             REVIEWS
  //   //////////////////////////////////////////////////////////////*/

  it("buyer can submit review after purchase", async () => {
    const { marketplace, seller, buyer, Token } =
      await loadFixture(deployFixture);

    await createProduct(Token, marketplace, seller);

    await Token.connect(buyer).approve(
      marketplace.target,
      ethers.parseEther("10")
    );

    await marketplace.connect(buyer).buyProduct(1, 1, "ipfs://metadata");
    await marketplace.connect(buyer).confirmDelivery(1);

    await expect(marketplace.connect(buyer).submitReview(1, 5, "Great product"))
      .to.emit(marketplace, "ReviewSubmitted")
      .withArgs(1, buyer.address);

    const avg = await marketplace.getAverageRating(1);
    expect(avg).to.equal(500); // scaled by 100
  });
});
