import Web3 from "web3";
import { ERC20Abi, PairV2Abi, RouterAbi } from "../../Contracts/abis";
import { RouterAddress, baseToken, rexToken } from "../../config";
import { converter } from "../convertToBN";
import { getBalance } from "./sharedHelpers";
import { getAllPairs, getPair } from "./PoolContractHelpers";
import BigNumber from "bignumber.js";

var currentPair = [];

const web3 = new Web3(window.ethereum);
export const initWeb3 = () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);

    const routerContract = new web3.eth.Contract(RouterAbi, RouterAddress);
    return routerContract;
  }
  return null;
};

// Helper function for token approval
export const approveTokens = async (account, fromToken, fromAmount) => {
  if (!web3 || !account || !fromAmount || !fromToken) return;
  const erc20Contract = new web3.eth.Contract(ERC20Abi, fromToken.address);
  const allowance = await erc20Contract.methods
    .allowance(account, RouterAddress)
    .call();
  if (+allowance <= +fromAmount) {
    await erc20Contract.methods
      .approve(RouterAddress, fromAmount)
      .send({ from: account });
  }
};

// Helper function for token swap
export const swapTokens = async (
  account,
  fromToken,
  toToken,
  fromAmount,
  toAmount
) => {
  try {
    const router = initWeb3();
    if (!router) return null;

    const minAmount = 0;

    if (fromToken.address.toLowerCase() === baseToken.toLowerCase()) {
      await router.methods
        .swapExactETHForTokens(
          minAmount,
          [fromToken.address, toToken.address],
          account,
          Math.floor(Date.now() / 1000) + 60 * 20
        )
        .send({
          from: account,
          value: fromAmount,
        });
    } else if (toToken.address.toLowerCase() === baseToken.toLowerCase()) {
      await router.methods
        .swapExactTokensForETH(
          fromAmount,
          minAmount,
          [fromToken.address, toToken.address],
          account,
          Math.floor(Date.now() / 1000) + 60 * 20
        )
        .send({
          from: account,
        });
    } else {
      await router.methods
        .swapExactTokensForTokens(
          fromAmount,
          minAmount,
          [fromToken.address, toToken.address],
          account,
          Math.floor(Date.now() / 1000) + 60 * 20
        )
        .send({
          from: account,
        });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const areEqual = (array1, array2) => {
  if (array1.length === array2.length) {
    return array1.every((element) => {
      if (array2.some((el) => el.toLowerCase() === element.toLowerCase())) {
        return true;
      }
      return false;
    });
  }

  return false;
};

export const calculateQuotation = async (fromToken, toToken, fromAmount) => {
  if (!fromAmount || !fromToken.address || !toToken.address) return null;
  const router = initWeb3();
  if (!router) return null;

  try {
    const pool = await getPair(fromToken.address, toToken.address);
    const pair = new web3.eth.Contract(PairV2Abi, pool.pairAddress);

    if (!pool?.exists) return null;
    // check reserved here
    const reserves = await pair.methods.getReserves().call();
    const reserve0 = reserves._reserve0;
    const reserve1 = reserves._reserve1;
    if (reserve0 === "0" || reserve1 === "0") {
      return { error: "Insufficient liquidity for this trade." };
    }
    if (fromToken.address === toToken.address) {
      return { error: "Select different coins." };
    }

    if (
      currentPair.length == 0 ||
      !areEqual(currentPair, [fromToken.address, toToken.address])
    ) {
      const [token0Address, token1Address] = await Promise.all([
        pair.methods.token0().call(),
        pair.methods.token1().call(),
      ]);
      currentPair = [token0Address, token1Address];
    }
    const reverse =
      currentPair[0].toLowerCase() === fromToken.address.toLowerCase()
        ? false
        : true;

    if (!!fromToken?.address || !!toToken?.address) {
      const inputAmount = converter(fromAmount, fromToken.decimals);
      let outputAmount = 0;
      if (inputAmount > 0) {
        const amountsOut = reverse
          ? await router.methods.getAmountsIn(inputAmount, currentPair).call()
          : await router.methods.getAmountsOut(inputAmount, currentPair).call();
        outputAmount =
          Number(amountsOut[reverse ? 0 : 1]) / 10 ** toToken.decimals;
        return outputAmount;
      } else return outputAmount;
    }
  } catch (error) {
    console.error(error);
    debugger;
    if (error.message.includes("underflow")) {
      return { error: "Not enough liquidity in pool." };
    }
    return { error: "Something went wrong." };
  }
};

export const getTokenBalances = async (token, account) => {
  try {
    const balance = await getBalance(ERC20Abi, token, account);
    return balance;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
