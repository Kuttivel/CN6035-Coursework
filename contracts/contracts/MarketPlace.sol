// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Marketplace is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    // / @notice ERC20 token used for payments (MNEE)
    IERC20 public mneeToken;

    address public feeRecipient;
    address public arbitrator;

    uint96 public platformFeeBps; // 300 = 3%
    uint256 public createProductFee;

    uint256 public productCount;
    uint256 public transactionCount;

    enum TxStatus {
        Pending,
        Disputed,
        Completed,
        Refunded
    }

    struct Product {
        address seller;
        uint96 price;
        bool active;
        string metadataURI;
    }

    struct Transaction {
        address buyer;
        address seller;
        uint256 productId;
        uint8 quantity;
        uint256 amount;
        string metadataURI;
        TxStatus status;
    }

    struct Review {
        uint8 rating;
        string comment;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public hasPurchased;
    mapping(uint256 => mapping(address => Review)) public reviews;
    mapping(uint256 => uint256) public totalRatings;
    mapping(uint256 => uint256) public ratingCount;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event ProductCreated(uint256 indexed productId, address indexed seller, string uri);
    event ProductPurchased(uint256 indexed productId, uint256 indexed txnId, string uri);
    event ProductStatusUpdated(uint256 indexed productId, bool active);
    event ProductPriceUpdated(uint256 indexed productId, uint96 price);

    // event Debug(string message, uint256 value);

    event TransactionCompleted(uint256 indexed txnId);
    event TransactionRefunded(uint256 indexed txnId);
    event DisputeOpened(uint256 indexed txnId);
    event DisputeResolved(uint256 indexed txnId, bool buyerWon);

    event ReviewSubmitted(uint256 indexed productId, address indexed reviewer);
    event PlatformFeeUpdated(uint96 oldFeeBps, uint96 newfeeBps);
    event CreateProductFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address recipient);
    event ArbitratorUpdated(address arbitrator);

    /*//////////////////////////////////////////////////////////////
                            INITIALIZER
    //////////////////////////////////////////////////////////////*/

    function initialize(
        address token,
        address _feeRecipient,
        address _arbitrator
    ) public initializer {
        require(
            token != address(0) &&
                _feeRecipient != address(0) &&
                _arbitrator != address(0),
            "Invalid address"
        );

        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        mneeToken = IERC20(token);
        feeRecipient = _feeRecipient;
        arbitrator = _arbitrator;
        platformFeeBps = 300;
        createProductFee = 10e18;
    }

    /*//////////////////////////////////////////////////////////////
                        UPGRADE AUTHORIZATION
    //////////////////////////////////////////////////////////////*/

    function _authorizeUpgrade(address) internal override onlyOwner {}

    /*//////////////////////////////////////////////////////////////
                                ADMIN
    //////////////////////////////////////////////////////////////*/

    function setPlatformFee(uint96 newfeeBps) external onlyOwner {
        require(
            newfeeBps >= 200 && newfeeBps <= 500,
            "Fee must be between 2% and 5%"
        );
        
        uint96 oldFeeBps = platformFeeBps;
        platformFeeBps = newfeeBps;
        emit PlatformFeeUpdated(oldFeeBps, newfeeBps);
    }

    function setCreateProductFee(uint256 newFee) external onlyOwner {
        require(newFee >= 1e16, "Fee too low");
        require(newFee <= 1_000e18, "Fee too high");

        uint256 oldFee = createProductFee;
        require(newFee != oldFee, "Same fee");

        createProductFee = newFee;

        emit CreateProductFeeUpdated(oldFee, newFee);
    }

    function setFeeRecipient(address recipient) external onlyOwner {
        require(recipient != address(0));
        feeRecipient = recipient;
        emit FeeRecipientUpdated(recipient);
    }

    function setArbitrator(address _arbitrator) external onlyOwner {
        require(_arbitrator != address(0));
        arbitrator = _arbitrator;
        emit ArbitratorUpdated(_arbitrator);
    }

    /*//////////////////////////////////////////////////////////////
                            PRODUCTS
    //////////////////////////////////////////////////////////////*/

    function createProduct(
        uint96 price,
        string calldata uri
    ) external returns (uint256) {
        require(
            price > 0 && bytes(uri).length > 0,
            "Price and URI bytes must be greater than zero"
        );
        require(
            mneeToken.transferFrom(msg.sender, address(this), createProductFee),
            "MNEE fee transfer failed"
        );

        unchecked {
            productCount++;
        }

        products[productCount] = Product({
            seller: msg.sender,
            price: price,
            active: true,
            metadataURI: uri
        });

        emit ProductCreated(productCount, msg.sender, uri);
        return productCount;
    }

    function setProductPrice(uint256 productId, uint96 price) external {
        Product storage p = products[productId];
        require(p.seller == msg.sender, "Not seller");
        require(price > 0, "Price must be greater than zero");
        p.price = price;
        emit ProductPriceUpdated(productId, price);
    }

    function setProductStatus(uint256 productId, bool active) external {
        Product storage p = products[productId];
        require(p.seller == msg.sender, "Not seller");
        p.active = active;
        emit ProductStatusUpdated(productId, active);
    }

    /*//////////////////////////////////////////////////////////////
                        PURCHASE / ESCROW
    //////////////////////////////////////////////////////////////*/

    function buyProduct(
        uint256 productId,
        uint8 quantity,
        string calldata uri
    ) external nonReentrant {
        require(productId > 0 && productId <= productCount, "Invalid product ID");
        Product storage p = products[productId];
        require(p.active, "Product inactive");
        require(p.seller != msg.sender, "Seller cannot buy");
        require(quantity > 0, "Invalid quantity");
        require(bytes(uri).length > 0, "Invalid URI");

        uint256 totalAmount = uint256(p.price) * uint256(quantity);
        require(mneeToken.balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        require(mneeToken.allowance(msg.sender, address(this)) >= totalAmount, "Insufficient allowance");
        require(mneeToken.transferFrom(msg.sender, address(this), totalAmount), "Payment failed");

        unchecked {
            transactionCount++;
        }

        transactions[transactionCount] = Transaction({
            buyer: msg.sender,
            seller: p.seller,
            productId: productId,
            quantity: quantity,
            amount: totalAmount,
            metadataURI: uri,
            status: TxStatus.Pending
        });

        hasPurchased[productId][msg.sender] = true;

        emit ProductPurchased(productId, transactionCount, uri);
    }

    function confirmDelivery(uint256 txnId) external nonReentrant {
        Transaction storage t = transactions[txnId];

        require(
            t.status == TxStatus.Pending &&
                (msg.sender == t.buyer || msg.sender == owner()),
            "Unauthorized"
        );

        _paySeller(txnId);
    }

    function cancelTransaction(uint256 txnId) external nonReentrant {
        Transaction storage t = transactions[txnId];

        require(
            t.status == TxStatus.Pending &&
                (msg.sender == t.seller || msg.sender == owner()),
            "Unauthorized"
        );

        mneeToken.transfer(t.buyer, t.amount);
        t.status = TxStatus.Refunded;

        emit TransactionRefunded(txnId);
    }

    /*//////////////////////////////////////////////////////////////
                            DISPUTES
    //////////////////////////////////////////////////////////////*/

    function openDispute(uint256 txnId) external {
        Transaction storage t = transactions[txnId];

        require(
            t.status == TxStatus.Pending &&
                (msg.sender == t.buyer || msg.sender == t.seller),
            "Cannot dispute"
        );

        t.status = TxStatus.Disputed;
        emit DisputeOpened(txnId);
    }

    function resolveDispute(
        uint256 txnId,
        bool buyerWins
    ) external nonReentrant {
        require(msg.sender == arbitrator, "Not arbitrator");

        Transaction storage t = transactions[txnId];
        require(t.status == TxStatus.Disputed, "Not disputed");

        if (buyerWins) {
            mneeToken.transfer(t.buyer, t.amount);
            t.status = TxStatus.Refunded;
            emit TransactionRefunded(txnId);
        } else {
            _paySeller(txnId);
        }

        emit DisputeResolved(txnId, buyerWins);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL PAYOUT
    //////////////////////////////////////////////////////////////*/

    function _paySeller(uint256 txnId) internal {
        Transaction storage t = transactions[txnId];

        uint256 fee = (uint256(t.amount) * platformFeeBps) / 10_000;
        uint256 payout = uint256(t.amount) - fee;

        if (fee > 0) {
            mneeToken.transfer(feeRecipient, fee);
        }

        mneeToken.transfer(t.seller, payout);

        t.status = TxStatus.Completed;
        emit TransactionCompleted(txnId);
    }

    /*//////////////////////////////////////////////////////////////
                            REVIEWS
    //////////////////////////////////////////////////////////////*/

    function submitReview(
        uint256 productId,
        uint8 rating,
        string calldata comment
    ) external {
        require(
            hasPurchased[productId][msg.sender] &&
                rating > 0 &&
                rating <= 5 &&
                reviews[productId][msg.sender].rating == 0 &&
                bytes(comment).length <= 200,
            "Invalid review"
        );

        reviews[productId][msg.sender] = Review(rating, comment);
        totalRatings[productId] += rating;
        ratingCount[productId]++;

        emit ReviewSubmitted(productId, msg.sender);
    }

    function getAverageRating(
        uint256 productId
    ) external view returns (uint256) {
        uint256 count = ratingCount[productId];
        if (count == 0) return 0;
        return (totalRatings[productId] * 100) / count;
    }
}
