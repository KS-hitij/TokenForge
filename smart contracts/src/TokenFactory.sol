// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {Token} from "./Token.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolInitializer_v4} from "@uniswap/v4-periphery/src/interfaces/IPoolInitializer_v4.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is ReentrancyGuard, Ownable{
    struct memeToken{
        string name;
        string symbol;
        string metaDataURI;
        address tokenAddress;
        address creatorAddress;
        uint tokenReserve;
        uint ethReserve;
        bool hasGraduated;
    }
    uint feeCollected;
    uint constant DECIMALS = 10 ** 18;
    uint constant MAX_SUPPLY= 1000000 * DECIMALS;
    uint constant INITIAL_SUPPLY = 20 * MAX_SUPPLY/100;
    uint constant TOKEN_CREATION_FEE = 1 ether/1000;
    uint constant FUNDING_GOAL = 24 ether;
    uint constant K=6000000 * 10**36;
    uint24 constant FEE = 3000;
    int24 constant TICK_SPACING = 60;
    address constant PERMIT2 = 	0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address payable constant POSITION_MANAGER = payable(0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4);
    address constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;

    mapping(address => memeToken) addressToMemeToken;
    address[] memeTokenAddressArray;

    event TokenCreated(address indexed tokenAddress);
    event TokenBought(address indexed tokenAddress, uint amount);
    event TokenSold(address indexed tokenAddress,uint amount);
    event TokenGraduated(address indexed tokenAddress);


    error INVALID_TOKEN_FEE();
    error TOKEN_NOT_LISTED();
    error TOKEN_GRAUDATED();
    error INCORRECT_ETH_AMOUNT(uint sent, uint required);
    error INSUFFICIENT_TOKENS();
    error OFFSET_TOO_HIGH();
    error NOT_CREATOR();

    constructor() Ownable(msg.sender) {
        feeCollected = 0;
    }

    function collectFees() external onlyOwner{
        uint amount = feeCollected;
        feeCollected = 0;
        (bool ok,) = payable(msg.sender).call{value:amount}("");
        require(ok,"Transaction Failed");
    }

    function calculateBuyingCost(uint purchaseQty,address listedTokenAddress) public view returns(uint){
        if(purchaseQty == 0){
            return 0;
        }
        memeToken memory listedToken = addressToMemeToken[listedTokenAddress];
        if(purchaseQty>listedToken.tokenReserve - INITIAL_SUPPLY){
            revert INSUFFICIENT_TOKENS();
        }
        uint newTokenReserve = listedToken.tokenReserve - purchaseQty;
        uint newEthReserve = K/newTokenReserve;
        uint cost = newEthReserve - listedToken.ethReserve;
        return cost;
    }

    function calculateSellingPrice(uint sellQty,address listedTokenAddress) public view returns(uint){
        if(sellQty == 0){
            return 0;
        }
        memeToken memory listedToken = addressToMemeToken[listedTokenAddress];
        uint newTokenReserve = listedToken.tokenReserve + sellQty;
        uint newEthReserve = K/newTokenReserve;
        uint price = listedToken.ethReserve - newEthReserve;
        return price;
    }

    function createMemeToken(string memory _name,string memory _symbol,string memory _tokenMetaData) external payable{
        if(msg.value!= TOKEN_CREATION_FEE){
            revert INVALID_TOKEN_FEE();
        }
        feeCollected += TOKEN_CREATION_FEE;
        Token memeTokenContract = new Token(_name,_symbol,INITIAL_SUPPLY);
        address memeTokenAddress = address(memeTokenContract);
        addressToMemeToken[memeTokenAddress] = memeToken(_name,_symbol,_tokenMetaData,memeTokenAddress,msg.sender,MAX_SUPPLY,6*10**18,false);
        memeTokenAddressArray.push(memeTokenAddress);
        emit TokenCreated(memeTokenAddress);
    }

    function buyMemeToken(address _address,uint purchaseQty) external payable{
        if(addressToMemeToken[_address].tokenAddress == address(0)){
            revert TOKEN_NOT_LISTED();
        }
        memeToken storage listedToken = addressToMemeToken[_address];
        if(listedToken.hasGraduated == true){
            revert TOKEN_GRAUDATED();
        }
        Token tokenContract = Token(listedToken.tokenAddress);
        uint totalSupply = tokenContract.totalSupply();
        if(purchaseQty > MAX_SUPPLY - totalSupply ){
            revert INSUFFICIENT_TOKENS();
        }
        uint cost = calculateBuyingCost(purchaseQty,_address);
        if(msg.value < cost){
            revert INCORRECT_ETH_AMOUNT(msg.value,cost);
        }
        listedToken.ethReserve+= cost;
        listedToken.tokenReserve-= purchaseQty;
        tokenContract.mint(purchaseQty,msg.sender);

        //in case user sends more than required
        uint refund = msg.value - cost;
        if(refund>0){
            uint amt = refund;
            refund = 0;
            (bool ok,) = payable(msg.sender).call{value:amt}("Transaction Failed");
            require(ok);
        }
        emit TokenBought(listedToken.tokenAddress,purchaseQty);

        if(listedToken.ethReserve - 6 ether >= FUNDING_GOAL){
            listedToken.hasGraduated = true;
        }
    }

    function graduate(address _listedTokenAddress) external {
        memeToken storage listedToken = addressToMemeToken[_listedTokenAddress];
        require(listedToken.hasGraduated == true,"Token not graduated yet");
        if(msg.sender != listedToken.creatorAddress){
            revert NOT_CREATOR(); 
        }
        address tokenAddress = listedToken.tokenAddress;
        uint256 ethAmount = listedToken.ethReserve - 6 ether;
        uint tokenAmount = listedToken.tokenReserve;
        address currency0;
        address currency1;
        if (uint160(tokenAddress) < uint160(WETH)) {
            currency0 = tokenAddress;
            currency1 = WETH;
        } else {
            currency0 = WETH;
            currency1 = tokenAddress;
        }
        PoolKey memory pool = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: FEE, 
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(0))
        });
        uint160 startingPrice = calculateStartingPrice(ethAmount,listedToken.tokenReserve);
        bytes[] memory params = new bytes[](2);

        params[0] = abi.encodeWithSelector(
            IPoolInitializer_v4.initializePool.selector,
            pool,
            startingPrice
        );
        bytes memory actions = abi.encodePacked(
            uint8(Actions.MINT_POSITION),
            uint8(Actions.SETTLE_PAIR)
        );
        bytes[] memory mintParams = new bytes[](2);
        mintParams[0] = abi.encode(
            pool,
            int24(-120),
            int24(120),
            uint128(tokenAmount),
            tokenAmount,
            ethAmount,
            address(0),
            ""
        );
        mintParams[1] = abi.encode(Currency.wrap(currency0), Currency.wrap(currency1));
            uint256 deadline = block.timestamp + 3600;
        params[1] = abi.encodeWithSelector(
            PositionManager.modifyLiquidities.selector,
            abi.encode(actions, mintParams),
            deadline
        );
        IERC20(tokenAddress).approve(PERMIT2, type(uint256).max);
        IAllowanceTransfer(PERMIT2).approve(
            tokenAddress,
            POSITION_MANAGER,
            type(uint160).max,
            uint48(block.timestamp + 3600)
        );
        PositionManager(POSITION_MANAGER).multicall{value: ethAmount}(params);

        Token(tokenAddress).renounceOwnership();
        emit TokenGraduated(listedToken.tokenAddress);
    }

    function sellMemeToken(address _address,uint sellQty)external nonReentrant{
        if(addressToMemeToken[_address].tokenAddress == address(0)){
            revert TOKEN_NOT_LISTED();
        }
        memeToken storage listedToken = addressToMemeToken[_address];
        if(listedToken.hasGraduated == true){
            revert TOKEN_GRAUDATED();
        }
        Token tokenContract = Token(listedToken.tokenAddress);
        uint balance = tokenContract.balanceOf(msg.sender);
        if(balance < sellQty){
            revert INSUFFICIENT_TOKENS();
        }
        uint price = calculateSellingPrice(sellQty,_address);
        listedToken.ethReserve -= price;
        listedToken.tokenReserve += sellQty;
        tokenContract.transferFrom(msg.sender,address(this),sellQty);
        (bool ok,) = payable(msg.sender).call{value:price}("");
        require(ok,"Transaction Failed");
        emit TokenSold(listedToken.tokenAddress,sellQty);
    }
    
    function getTokenDetails(address _address) public view returns (memeToken memory){
        if(addressToMemeToken[_address].tokenAddress == address(0)){
            revert TOKEN_NOT_LISTED();
        }
        return addressToMemeToken[_address];
    }

    function getTokensAddress(uint offset) public view returns(address[] memory){
        address[] memory result = new address[](10);
        if(offset >= memeTokenAddressArray.length){
            revert OFFSET_TOO_HIGH();
        }
        for(uint i = 0; i<10 && i+offset<memeTokenAddressArray.length;i++){
            result[i] = memeTokenAddressArray[i+offset];
        }
        return result;
    }

    function calculateStartingPrice (uint ethAmount, uint tokenReserve) internal pure returns(uint160){
        uint256 ratio = (ethAmount * 1e18) / tokenReserve;
        uint256 z = (ratio + 1) / 2;
        uint256 y = ratio;
        while (z < y) {
            y = z;
            z = (ratio / z + z) / 2;
        }
        uint160 startingPrice = uint160((y * (2 ** 96)) / 1e9);
        return startingPrice;
    }
}