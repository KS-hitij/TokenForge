// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenFactoryTest is Test{
    TokenFactory public tf;
    address constant account = address(0x2342);
    address tokenAddress;

    function setUp() public{
        tf = new TokenFactory();
        address creator = address(0x123);
        vm.deal(creator,1 ether/1000);
        vm.prank(creator);
        tf.createMemeToken{value:1*10**15}("Kanu","KNU","wihwiueuwghuhg");
        address[] memory result = tf.getTokensAddress(0);
        tokenAddress = result[0];
        uint amount = tf.calculateBuyingCost(1*10**18,tokenAddress);
        vm.deal(account,amount);
        vm.prank(account);
        tf.buyMemeToken{value:amount}(tokenAddress,1*10**18);
    }

    function test_SellMemeToken() public{
        uint amount = tf.calculateSellingPrice(1*10**18,tokenAddress);
        vm.prank(account);
        IERC20(tokenAddress).approve(address(tf),1*10**18);
        vm.prank(account);
        tf.sellMemeToken(tokenAddress,1*10**18);
        TokenFactory.memeToken memory token = tf.getTokenDetails(tokenAddress);
        assertEq(token.ethReserve,6 ether);
        assertEq(token.tokenReserve,1000000*10**18);
        assertEq(address(account).balance,amount);
    }
    
    function test_RevertIfTokenNotListed() public{
        vm.prank(account);
        vm.expectRevert();
        tf.sellMemeToken(address(0x283),1*10**18);
    }

    function test_RevertIfGraduated() public{
        vm.deal(account,24 ether);
        TokenFactory.memeToken memory token = tf.getTokenDetails(tokenAddress);
        uint amt = token.tokenReserve - 200000 *10**18;
        vm.prank(account);
        tf.buyMemeToken{value:24 ether}(tokenAddress,amt);
        vm.prank(account);
        IERC20(tokenAddress).approve(address(tf),1*10**18);
        vm.prank(account);
        vm.expectRevert();
        tf.sellMemeToken(tokenAddress,1*10**18);
    }

    function test_RevertIfSellingMoreThanHeldTokens() public{
        vm.prank(account);
        IERC20(tokenAddress).approve(address(tf),1*10**18);
        vm.prank(account);
        vm.expectRevert();
        tf.sellMemeToken(tokenAddress,4*10**18);
    }
}