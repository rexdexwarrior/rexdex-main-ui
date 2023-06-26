import { ERC20Abi, ERC21Abi, ReferalAbi } from "../../Contracts/abis";
import { referalAddress, rexToken } from "../../config";

const Web3 = require("web3");
const web3 = new Web3(window.ethereum); // using MetaMask's provider

export const initContractInstance = () => {
  try {
    const contractInstance = new web3.eth.Contract(ReferalAbi, referalAddress);
    return contractInstance;
  } catch (error) {
    console.log(error);
  }
};

export const approveNFTTransfer = async (account, id, nftAddress) => {
  try {
    const nftContract = new web3.eth.Contract(ERC21Abi, nftAddress);
    const approvedAddress = await nftContract.methods.getApproved(id).call();
    if (approvedAddress.toLowerCase() !== referalAddress.toLowerCase()) {
      await nftContract.methods
        .approve(referalAddress, id)
        .send({ from: account });
    }
  } catch (err) {
    console.error("Error approving NFT transfer:", err);
    throw err;
  }
};

export async function approveToken(requiredRexTokenAmount, account) {
  try {
    const Erc20Contract = new web3.eth.Contract(ERC20Abi, rexToken);
    const allowance = await Erc20Contract.methods
      .allowance(account, referalAddress)
      .call();

    if (+allowance <= +requiredRexTokenAmount) {
      await Erc20Contract.methods
        .approve(referalAddress, requiredRexTokenAmount)
        .send({ from: account });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const stake = async (nftId, account) => {
  try {
    const referralContract = initContractInstance();
    const result = await referralContract.methods
      .stake(nftId)
      .send({ from: account });
    return result;
  } catch (error) {
    throw error;
  }
};

export const withdraw = async (account) => {
  try {
    const referralContract = initContractInstance();
    const result = await referralContract.methods
      .withdraw()
      .send({ from: account });
    return result;
  } catch (error) {
    throw error;
  }
};
//run for withdrwa
export const checkReferralQualification = async (
  account,
  referralContract = initContractInstance()
) => {
  try {
    const result = await referralContract.methods
      .checkReferralQualification(account)
      .call();

    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getStakedRexTokens = async (account) => {
  try {
    const referralContract = initContractInstance();
    const result = await referralContract.methods
      .userStakedRexTokens(account)
      .call();

    return result;
  } catch (error) {
    throw error;
  }
};
export const getReferalData = async (account) => {
  try {
    const erc20Contract = new web3.eth.Contract(ERC20Abi, rexToken);
    const userRexToken = await erc20Contract.methods.balanceOf(account).call();
    const referralContract = initContractInstance();

    const referrerRewardPercentage = await referralContract.methods
      .referrerRewardPercentage()
      .call();

    const refereeRewardPercentage = await referralContract.methods
      .refereeRewardPercentage()
      .call();

    const requiredRexTokens = await referralContract.methods
      .requiredRexTokens()
      .call();

    return {
      userRexToken,
      referrerRewardPercentage,
      refereeRewardPercentage,
      requiredRexTokens,
    };
  } catch (error) {
    console.log(error);
  }
};
