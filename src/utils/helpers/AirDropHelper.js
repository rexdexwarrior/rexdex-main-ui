import Web3 from "web3";
import { airDropAbi } from "../../Contracts/abis";
import { airDropProxyAddress } from "../../config";

const web3 = new Web3(window.ethereum);

export function initializeContract() {
  const contract = new web3.eth.Contract(airDropAbi, airDropProxyAddress);
  return contract;
}
export const getPendingReward = async (nftId) => {
  try {
    const contract = initializeContract();
    const result = await contract.methods.pendingReward(nftId).call();
    return result;
  } catch (error) {
    console.log(error);
  }
};
// pendingReward
export const claimTokens = async (account, nftId) => {
  try {
    const contract = initializeContract();

    await contract.methods.claim(nftId).send({ from: account });
    // Tokens claimed successfully
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const batchClaim = async (account, nftIds) => {
  try {
    const contract =initializeContract();

    const res = await contract.methods
      .batchClaim(nftIds)
      .send({ from: account });
    console.log("bc", res);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
