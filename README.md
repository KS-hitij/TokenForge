# TokenForge

TokenForge is an Ethereum-based ERC20 token creation platform with automated pricing using a bonding curve and a graduation mechanism to Uniswap v4.

## Overview

TokenForge allows users to create meme tokens, buy and sell them using an on-chain constant product pricing model, and graduate successful tokens into a Uniswap v4 liquidity pool once a funding goal is reached.

All pricing, supply control, and graduation logic is handled fully on-chain.

## Core Concepts

### Token Creation
- Users can create a new ERC20 token by paying a fixed creation fee.
- Each token starts with a predefined initial supply and maximum supply.
- Token metadata is stored alongside the token configuration.

### Bonding Curve Pricing
- Tokens are priced using a constant product formula.
- Buying tokens increases the ETH reserve and decreases the token reserve.
- Selling tokens decreases the ETH reserve and increases the token reserve.
- Prices are calculated deterministically on-chain.

### Buying and Selling
- Users can buy tokens by sending ETH based on the calculated cost.
- Users can sell tokens back to the contract before graduation.
- All ETH transfers are handled directly by the contract.

### Graduation
- When a token reaches the funding goal, it becomes eligible for graduation.
- Only the token creator can trigger graduation.
- On graduation:
  - A Uniswap v4 pool is initialized against WETH.
  - Liquidity is added using the accumulated ETH and remaining token reserves.
  - Token ownership is renounced.
- After graduation, the token can no longer be bought or sold through the bonding curve.

### Fees
- A fixed fee is collected during token creation.
- Collected fees can be withdrawn by the contract owner.

## Smart Contract Architecture

- **TokenFactory**  
  Handles token creation, bonding curve pricing, buying, selling, fee collection, and graduation logic.

- **Token**  
  ERC20 token contract used for minting and supply control.

## Tech Stack

- Solidity ^0.8
- Foundry
- OpenZeppelin
- Uniswap v4 (core and periphery)
- Permit2

