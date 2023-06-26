import Web3 from "web3";

const web3 = new Web3(window.ethereum);

export const getBalance = async (Abi, tokenAddres, userAddress) => {
  try {
    const lpTokenContract = new web3.eth.Contract(Abi, tokenAddres);
    const balance =
      tokenAddres.toLowerCase() ===
      process.env.REACT_APP_BASE_TOKEN_ADDRESS.toLowerCase()
        ? await web3.eth.getBalance(userAddress)
        : await lpTokenContract.methods.balanceOf(userAddress).call();
    return balance;
  } catch (error) {
    console.log(error);
  }
};
