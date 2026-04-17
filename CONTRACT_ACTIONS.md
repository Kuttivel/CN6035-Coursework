npm i# Marketplace Contract - Full Stack Web Actions Guide

## Contract Overview
The Marketplace is an upgradeable ERC20-based escrow platform where sellers create products and buyers purchase them with MNEE tokens. It includes dispute resolution, escrow management, and review systems.

---

## 📋 TABLE OF CONTENTS
1. [Admin Actions](#admin-actions)
2. [Seller Actions](#seller-actions)
3. [Buyer Actions](#buyer-actions)
4. [Arbitrator Actions](#arbitrator-actions)
5. [Read-Only Actions (Queries)](#read-only-actions-queries)
6. [Events](#events)

---

## 🔐 ADMIN ACTIONS
*Only contract owner can execute these*

### 1. Set Platform Fee
- **Function**: `setPlatformFee(uint96 newfeeBps)`
- **Parameters**: 
  - `newfeeBps`: Platform fee in basis points (200-500, representing 2%-5%)
- **Purpose**: Update the commission percentage the platform takes from completed sales
- **Web Integration**: Admin dashboard → Fee Management
- **Frontend Component**: Settings/Admin Panel
- **Validation**: Fee must be between 2% and 5%

### 2. Set Product Creation Fee
- **Function**: `setCreateProductFee(uint256 newFee)`
- **Parameters**:
  - `newFee`: New creation fee in wei (1e16 - 1000e18 range)
- **Purpose**: Modify the MNEE token amount required to create a product
- **Web Integration**: Admin dashboard → Fee Configuration
- **Frontend Component**: Settings/Admin Panel
- **Validation**: Fee between 0.01 and 1000 MNEE tokens

### 3. Set Fee Recipient Address
- **Function**: `setFeeRecipient(address recipient)`
- **Parameters**:
  - `recipient`: Wallet address to receive platform fees
- **Purpose**: Designate where platform commissions are sent
- **Web Integration**: Admin dashboard → Wallet Management
- **Frontend Component**: Settings/Recipient Configuration
- **Validation**: Valid non-zero address required

### 4. Set Arbitrator Address
- **Function**: `setArbitrator(address _arbitrator)`
- **Parameters**:
  - `_arbitrator`: Wallet address with dispute resolution authority
- **Purpose**: Assign the authority to resolve disputed transactions
- **Web Integration**: Admin dashboard → Role Management
- **Frontend Component**: Settings/Arbitrator Assignment
- **Validation**: Valid non-zero address required

### 5. Authorize Upgrade
- **Function**: `_authorizeUpgrade(address)`
- **Parameters**:
  - Address of new implementation contract
- **Purpose**: Allow contract upgrade (proxy pattern)
- **Web Integration**: Admin dashboard → Contract Management
- **Frontend Component**: Settings/Upgrade Panel
- **Note**: Internal function - called via proxy

---

## 🏪 SELLER ACTIONS
*Actions sellers perform to manage products and sales*

### 1. Create Product
- **Function**: `createProduct(uint96 price, string calldata uri)`
- **Parameters**:
  - `price`: Product price in MNEE tokens (as uint96)
  - `uri`: IPFS/metadata URL pointing to product details
- **Purpose**: List a new product on the marketplace
- **Cost**: Requires payment of `createProductFee` in MNEE tokens
- **Web Integration**: 
  - Seller Dashboard → New Product Form
  - Upload product details (name, description, images)
  - Store metadata on IPFS
  - Call contract function with metadata URI
- **Frontend Components**: 
  - Product creation form
  - IPFS uploader
  - Price input validation
- **Events Emitted**: `ProductCreated(productId, seller, uri)`
- **Returns**: Product ID (uint256)

### 2. Update Product Price
- **Function**: `setProductPrice(uint256 productId, uint96 price)`
- **Parameters**:
  - `productId`: ID of the product to update
  - `price`: New price in MNEE tokens
- **Purpose**: Change the price of an active product
- **Permissions**: Only the product seller can execute
- **Web Integration**: 
  - Seller Dashboard → Product Management
  - Product detail page → Edit Price button
- **Frontend Components**:
  - Price edit form
  - Product selector
  - Confirmation dialog
- **Validation**: Price must be greater than 0
- **Events Emitted**: `ProductPriceUpdated(productId, price)`

### 3. Update Product Status (Activate/Deactivate)
- **Function**: `setProductStatus(uint256 productId, bool active)`
- **Parameters**:
  - `productId`: ID of the product
  - `active`: true to activate, false to deactivate
- **Purpose**: Hide or show product from marketplace listings
- **Permissions**: Only the product seller can execute
- **Web Integration**:
  - Seller Dashboard → Product List
  - Toggle button to activate/deactivate products
  - Bulk status management
- **Frontend Components**:
  - Product status toggle switch
  - Bulk action toolbar
  - Status indicator (Active/Inactive badge)
- **Events Emitted**: `ProductStatusUpdated(productId, active)`

### 4. Confirm Delivery / Complete Sale
- **Function**: `confirmDelivery(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to confirm
- **Purpose**: Mark transaction as complete and release funds to seller
- **Permissions**: Transaction seller or contract owner
- **Web Integration**:
  - Seller Dashboard → Pending Orders
  - Order detail page → Confirm Delivery button
  - Order history
- **Frontend Components**:
  - Pending orders list
  - Order tracking page
  - Confirmation modal
- **Events Emitted**: `TransactionCompleted(txnId)`
- **Side Effects**: Platform fee deducted, remainder sent to seller

### 5. Cancel Transaction
- **Function**: `cancelTransaction(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to cancel
- **Purpose**: Refund buyer and reject the sale
- **Permissions**: Transaction seller or contract owner
- **Web Integration**:
  - Seller Dashboard → Pending Orders
  - Order detail page → Cancel Order button
- **Frontend Components**:
  - Cancellation reason form
  - Confirmation dialog
  - Cancellation notification
- **Conditions**: Transaction must be in Pending status
- **Events Emitted**: `TransactionRefunded(txnId)`
- **Side Effects**: Full amount returned to buyer

### 6. Open Dispute (Seller's Perspective)
- **Function**: `openDispute(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to dispute
- **Purpose**: Escalate a problem with a transaction to arbitrator
- **Permissions**: Transaction seller (or buyer)
- **Web Integration**:
  - Order detail page → Open Dispute button
  - Dispute ticket creation form
- **Frontend Components**:
  - Dispute form with reason/evidence upload
  - Dispute history tracking
  - Status notifications
- **Conditions**: Transaction must be in Pending status
- **Events Emitted**: `DisputeOpened(txnId)`

---

## 🛒 BUYER ACTIONS
*Actions buyers perform when purchasing and managing orders*

### 1. Buy Product
- **Function**: `buyProduct(uint256 productId, uint8 quantity, string calldata uri)`
- **Parameters**:
  - `productId`: ID of product to purchase
  - `quantity`: Number of units to buy
  - `uri`: Metadata URI for the transaction (delivery details, etc.)
- **Purpose**: Purchase a product and initiate escrow
- **Cost**: `product.price × quantity` in MNEE tokens
- **Requirements**: 
  - Product must be active
  - Buyer cannot be the seller
  - Sufficient token balance and allowance
- **Web Integration**:
  - Product detail page → Buy button
  - Quantity selector
  - Delivery address/details collection form
  - IPFS metadata upload for transaction details
  - Token approval flow
- **Frontend Components**:
  - Product page with purchase form
  - Quantity input with stock checking
  - Address/delivery details form
  - Token approval modal
  - Purchase confirmation screen
  - Transaction receipt
- **Validation**: 
  - Valid product ID
  - Positive quantity
  - Non-empty metadata URI
  - Sufficient balance and allowance
- **Events Emitted**: `ProductPurchased(productId, txnId, uri)`
- **Side Effects**: Tokens transferred to contract (escrow), purchase flag set

### 2. Confirm Delivery / Complete Purchase
- **Function**: `confirmDelivery(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to confirm
- **Purpose**: Confirm item received and release payment to seller
- **Permissions**: Transaction buyer or contract owner
- **Web Integration**:
  - Buyer Dashboard → My Purchases
  - Order detail page → Confirm Delivery button
- **Frontend Components**:
  - Order tracking page
  - Received confirmation dialog
  - Delivery proof upload (optional)
- **Conditions**: Transaction must be in Pending status
- **Events Emitted**: `TransactionCompleted(txnId)`
- **Side Effects**: Seller receives payout after platform fee deduction

### 3. Cancel Transaction (Request Refund)
- **Function**: `cancelTransaction(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to cancel
- **Purpose**: Request cancellation and refund from seller
- **Note**: Only seller can approve, but buyer can open dispute instead
- **Web Integration**:
  - Order detail page → Request Cancellation button
  - Cancellation reason form
- **Frontend Components**:
  - Cancellation request form
  - Reason/comment textarea
  - Request confirmation
- **Conditions**: Transaction must be in Pending status

### 4. Open Dispute
- **Function**: `openDispute(uint256 txnId)`
- **Parameters**:
  - `txnId`: Transaction ID to dispute
- **Purpose**: Escalate issue to arbitrator when seller won't respond
- **Permissions**: Transaction buyer (or seller)
- **Web Integration**:
  - Order detail page → Open Dispute button
  - Dispute ticket creation form
  - Evidence/document upload
- **Frontend Components**:
  - Dispute form with detailed issue description
  - File upload for evidence
  - Screenshot upload capability
  - Dispute history and status tracking
  - Communication thread with arbitrator
- **Conditions**: Transaction must be in Pending status
- **Events Emitted**: `DisputeOpened(txnId)`
- **Timeline**: Buyer can dispute if seller doesn't confirm delivery

### 5. Submit Review
- **Function**: `submitReview(uint256 productId, uint8 rating, string calldata comment)`
- **Parameters**:
  - `productId`: ID of purchased product
  - `rating`: Star rating (1-5)
  - `comment`: Review text (max 200 characters)
- **Purpose**: Rate and review a completed purchase
- **Permissions**: Only buyers who have purchased the product
- **Web Integration**:
  - Order detail page → Leave Review button
  - Product page → Review section
  - Buyer Dashboard → My Reviews
- **Frontend Components**:
  - Star rating selector
  - Comment textarea with character counter
  - Review submission form
  - Reviews display section on product page
  - Average rating badge
- **Validation**:
  - Must have purchased the product
  - Rating 1-5 stars
  - Comment max 200 characters
  - Can only review once per product
- **Events Emitted**: `ReviewSubmitted(productId, reviewer)`
- **Side Effects**: Rating and count updated for product average calculation

---

## ⚖️ ARBITRATOR ACTIONS
*Actions the assigned arbitrator performs to resolve disputes*

### 1. Resolve Dispute
- **Function**: `resolveDispute(uint256 txnId, bool buyerWins)`
- **Parameters**:
  - `txnId`: Transaction ID under dispute
  - `buyerWins`: true to refund buyer, false to pay seller
- **Purpose**: Make final decision on disputed transactions
- **Permissions**: Only the arbitrator address
- **Web Integration**:
  - Arbitrator Dashboard → Disputed Cases
  - Dispute detail page with full context
  - Evidence review area
  - Decision submission form
- **Frontend Components**:
  - Dispute case list with filters
  - Case detail page with:
    - Transaction details
    - Buyer and seller information
    - Evidence/documents from both parties
    - Communication history
  - Decision form (buyer wins/seller wins radio buttons)
  - Confirmation modal
  - Decision history
- **Conditions**: Transaction must be in Disputed status
- **Events Emitted**: `DisputeResolved(txnId, buyerWins)`, `TransactionRefunded(txnId)` or `TransactionCompleted(txnId)`
- **Side Effects**:
  - If buyer wins: Full amount refunded to buyer
  - If seller wins: Seller paid after platform fee deduction

---

## 👁️ READ-ONLY ACTIONS (QUERIES)
*Data retrieval functions for frontend display*

### 1. Get Average Rating
- **Function**: `getAverageRating(uint256 productId) → uint256`
- **Purpose**: Retrieve average star rating for a product
- **Returns**: Average rating × 100 (e.g., 450 = 4.5 stars)
- **Web Integration**:
  - Product detail page → Display average rating
  - Product listing → Show star badge
  - Search results → Filter by rating
- **Frontend Components**:
  - Star rating display
  - Rating count badge
  - Filter by rating slider

### 2. View Product Details
- **Function**: `products(uint256 productId) → (address seller, uint96 price, bool active, string metadataURI)`
- **Purpose**: Retrieve full product information
- **Web Integration**:
  - Product detail page
  - Product listing cards
  - Seller profile page
- **Frontend Components**:
  - Product detail view
  - Product card component
  - Metadata retrieval from IPFS

### 3. View Transaction Details
- **Function**: `transactions(uint256 txnId) → (address buyer, address seller, uint256 productId, uint8 quantity, uint256 amount, string metadataURI, TxStatus status)`
- **Purpose**: Retrieve transaction information and status
- **Web Integration**:
  - Order detail page
  - Order history
  - Transaction tracking
- **Frontend Components**:
  - Order detail view
  - Order history list
  - Status indicator badges
  - Payment breakdown display

### 4. Check Purchase History
- **Function**: `hasPurchased(uint256 productId, address user) → bool`
- **Purpose**: Check if user has purchased a product (eligibility for review)
- **Web Integration**:
  - Review submission button enable/disable logic
  - User purchase history
- **Frontend Components**:
  - Review eligibility check
  - "Write a Review" button visibility

### 5. View User Review
- **Function**: `reviews(uint256 productId, address reviewer) → (uint8 rating, string comment)`
- **Purpose**: Retrieve specific review by user
- **Web Integration**:
  - Product detail page → Reviews section
  - User profile → My Reviews
- **Frontend Components**:
  - Review display with rating and comment
  - User review history

### 6. Get Product Count
- **Function**: `productCount → uint256`
- **Purpose**: Total number of products in marketplace
- **Web Integration**:
  - Dashboard statistics
  - Pagination calculations
- **Frontend Components**:
  - Stats/metrics dashboard

### 7. Get Transaction Count
- **Function**: `transactionCount → uint256`
- **Purpose**: Total number of transactions
- **Web Integration**:
  - Dashboard statistics
  - Platform metrics
- **Frontend Components**:
  - Stats/metrics dashboard

### 8. View Contract Settings
- **Function**: 
  - `mneeToken → IERC20` (Token address)
  - `feeRecipient → address` (Fee wallet)
  - `arbitrator → address` (Arbitrator wallet)
  - `platformFeeBps → uint96` (Platform fee percentage)
  - `createProductFee → uint256` (Creation fee amount)
- **Purpose**: Get current contract configuration
- **Web Integration**:
  - Fee information display
  - Contract info page
  - Settings verification
- **Frontend Components**:
  - Settings display panel
  - Fee calculation helper

---

## 📡 EVENTS
*Blockchain events to listen for real-time updates*

### Product Events
- **ProductCreated**: Triggered when new product listed
  - Params: `productId`, `seller`, `uri`
  - Use: Update product listings in real-time

- **ProductPriceUpdated**: Triggered when price changes
  - Params: `productId`, `price`
  - Use: Notify watchers of price changes

- **ProductStatusUpdated**: Triggered when product activated/deactivated
  - Params: `productId`, `active`
  - Use: Update product availability status

### Transaction Events
- **ProductPurchased**: Triggered when purchase completed
  - Params: `productId`, `txnId`, `uri`
  - Use: Notify seller of new order, update buyer's orders

- **TransactionCompleted**: Triggered when transaction finalized
  - Params: `txnId`
  - Use: Mark order as complete, update seller balance

- **TransactionRefunded**: Triggered when refund issued
  - Params: `txnId`
  - Use: Notify buyer of refund, update status

### Dispute Events
- **DisputeOpened**: Triggered when dispute created
  - Params: `txnId`
  - Use: Alert arbitrator, update transaction status

- **DisputeResolved**: Triggered when dispute decided
  - Params: `txnId`, `buyerWon`
  - Use: Notify both parties, update transaction status

### Review Events
- **ReviewSubmitted**: Triggered when review posted
  - Params: `productId`, `reviewer`
  - Use: Update product ratings, notify seller

### Admin Events
- **PlatformFeeUpdated**: Triggered when platform fee changes
  - Params: `oldFeeBps`, `newfeeBps`
  - Use: Alert users of fee change

- **CreateProductFeeUpdated**: Triggered when creation fee changes
  - Params: `oldFee`, `newFee`
  - Use: Update product creation cost display

- **FeeRecipientUpdated**: Triggered when fee wallet changes
  - Params: `recipient`
  - Use: Update fee routing

- **ArbitratorUpdated**: Triggered when arbitrator changes
  - Params: `arbitrator`
  - Use: Update dispute resolution authority

---

## 🔄 USER FLOW DIAGRAMS

### Seller Flow
```
1. Create Account
   ↓
2. Create Product (pay creation fee)
   ↓
3. Product Listed (can update price/status)
   ↓
4. Buyer Purchases
   ↓
5. Wait for Delivery Confirmation
   ↓
6. Confirm Delivery → Get Payment (minus platform fee)
   OR Open Dispute if issues
```

### Buyer Flow
```
1. Create Account & Fund with MNEE
   ↓
2. Browse Products
   ↓
3. Purchase Product (choose quantity, pay)
   ↓
4. Receive Item
   ↓
5. Confirm Delivery → Transaction Complete
   OR Open Dispute if issues
   ↓
6. Submit Review (optional)
```

### Dispute Flow
```
Transaction Pending
   ↓
Either party opens dispute
   ↓
Transaction → Disputed Status
   ↓
Arbitrator Reviews Evidence
   ↓
Arbitrator Resolves (buyer wins or seller wins)
   ↓
If buyer wins: Full refund
If seller wins: Seller gets payment after fee
```

---

## 💰 FINANCIAL FLOWS

### Product Creation Fee
- Seller pays `createProductFee` in MNEE
- Goes directly to contract/feeRecipient
- One-time cost per product

### Purchase Flow
```
Buyer sends: price × quantity
├── Held in escrow until delivery confirmed
├── On completion:
│   ├── Platform fee (3% default) → feeRecipient
│   └── Remainder → Seller
└── On refund:
    └── Full amount → Buyer (in cancellation/dispute loss)
```

### Platform Fee
- Default: 3% (300 bps)
- Range: 2-5% (200-500 bps)
- Deducted only on successful sales
- Sent to `feeRecipient` address

---

## 🛡️ SECURITY FEATURES

1. **Reentrancy Protection**: `nonReentrant` guards on sensitive functions
2. **Proxy Pattern**: Upgradeable via UUPS (owner-authorized)
3. **Access Control**: Role-based permissions (owner, seller, buyer, arbitrator)
4. **Escrow Mechanism**: Funds held until delivery confirmed or dispute resolved
5. **Fee Validation**: Bounds checking (2-5% platform fee, min creation fee)
6. **One Review Per User**: Can't spam reviews

---

## 📝 IMPLEMENTATION CHECKLIST FOR FULL-STACK APP

### Backend (Node.js/Express)
- [ ] Web3 integration (ethers.js)
- [ ] IPFS client for metadata upload
- [ ] Event listener for blockchain updates
- [ ] Database for off-chain data (user profiles, etc.)
- [ ] API endpoints for contract functions
- [ ] Token approval management
- [ ] Email notifications (order updates, disputes)

### Frontend (React/Vue/Angular)
- [ ] Wallet connection (MetaMask, WalletConnect, etc.)
- [ ] Token approval flow
- [ ] Product creation form with IPFS upload
- [ ] Product listing/search/filter
- [ ] Checkout/purchase flow
- [ ] Review submission
- [ ] Dispute creation/tracking
- [ ] Dashboard
- [ ] Real-time event listeners

### Database Models
- [ ] Users (seller/buyer profiles)
- [ ] Products (with IPFS metadata)
- [ ] Transactions (with status tracking)
- [ ] Reviews (ratings/comments)
- [ ] Event logs (from blockchain)

---

## 🧪 TEST SCENARIOS

1. **Happy Path**: Seller → Create product → Buyer → Purchase → Confirm → Review
2. **Refund Path**: Purchase → Seller cancels → Buyer gets refund
3. **Dispute Path**: Purchase → Buyer disputes → Arbitrator rules → Resolution
4. **Admin Path**: Update fees → Update arbitrator → Verify settings
5. **Edge Cases**: 
   - Zero prices
   - Invalid addresses
   - Insufficient balance
   - Duplicate reviews
   - Inactive products

---

*Last Updated: 2026*
*Contract Version: Marketplace (UUPS Upgradeable)*
