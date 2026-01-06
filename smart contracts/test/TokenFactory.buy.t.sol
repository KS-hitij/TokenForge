// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";

contract TokenFactoryBuyTest is Test{
    TokenFactory public tf;
    address tokenAddress;

    function setUp() public{
        tf = new TokenFactory();
        address creator = address(0x123);
        vm.deal(creator,1 ether);
        vm.prank(creator);
        tf.createMemeToken{value:1*10**15}("Kanu","KNU","wihwiueuwghuhg");
        address[] memory result = tf.getTokensAddress(0);
        tokenAddress = result[0];
    }

    function test_BuyMemeCoin() public{
        uint amount = tf.calculateBuyingCost(1 * 10**18,tokenAddress);
        address buyer = address(0x234);
        vm.deal(buyer,amount);
        vm.prank(buyer);
        tf.buyMemeToken{value:amount}(tokenAddress, 1* 10**18);
        TokenFactory.memeToken memory token = tf.getTokenDetails(tokenAddress);
        assertEq(token.ethReserve,6 ether + amount);
        assertEq(token.tokenReserve - 200000 * 10**18,799999 * 10**18);
    }

    function test_RevertIfBuyingMoreThanPresentCoins() public{
        uint amount = tf.calculateBuyingCost(1 * 10**18,tokenAddress);
        address buyer = address(0x234);
        vm.deal(buyer,amount + 10 ether);
        vm.prank(buyer);
        tf.buyMemeToken{value:amount}(tokenAddress, 1* 10**18);
        vm.expectRevert();
        vm.prank(buyer);
        tf.buyMemeToken{value:10 ether}(tokenAddress, 800000* 10**18);
    }

    function test_RevertIfLessEthSent() public{
        uint amount = tf.calculateBuyingCost(1 * 10**18,tokenAddress);
        address buyer = address(0x234);
        vm.deal(buyer,amount + 10 ether);
        vm.expectRevert();
        vm.prank(buyer);
        tf.buyMemeToken{value:amount - 1000}(tokenAddress, 1* 10**18);
    }

    function test_RefundEthWhenMoreSent() public{
        uint amount = tf.calculateBuyingCost(1 * 10**18,tokenAddress);
        address buyer = address(0x234);
        assertEq(buyer.balance,0);
        vm.deal(buyer,amount + 10 ether);
        vm.prank(buyer);
        tf.buyMemeToken{value:amount + 2 ether}(tokenAddress, 1* 10**18);
        assertEq(buyer.balance,10 ether);
    }

    function test_RevertIfTokenGraduates() public{
        address buyer = address(0x234);
        vm.deal(buyer,26 ether);
        vm.prank(buyer);
        tf.buyMemeToken{value:24 ether}(tokenAddress, 800000* 10**18);
        vm.expectRevert();
        tf.buyMemeToken{value:2 ether}(tokenAddress, 1* 10**18);
    }

    function test_RevertIfTokenNotListed() public{
        address buyer = address(0x234);
        vm.prank(buyer);
        vm.expectRevert();
        tf.buyMemeToken(address(0x283),1*10**18);
    }
}