import Web3 from "web3";
import BigNumber from "bignumber.js";
let web3 = new Web3();

export const converter = (amount, decimal) => {
	try {
		return web3.utils.toBN(BigNumber(amount).multipliedBy(BigNumber(10).pow(decimal)));
	} catch (error) {
		console.log(error);
	}
};
export const convertWeiToEther = (wei, decimals = 18, toFixed = true) => {
	if (!toFixed) {
		return wei / 10 ** decimals;
	} else return (wei / 10 ** decimals).toFixed(2);
};
