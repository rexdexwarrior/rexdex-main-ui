import Web3 from "web3";
import BigNumber from "bignumber.js";
let web3 = new Web3();

export const converter = (amount, decimal) => {
	try {
		return web3.utils.toBN(BigNumber(amount).multipliedBy(1e18).toString(16));
	} catch (error) {
		console.log(error);
	}
};
export const convertWeiToEther = (wei, decimals = 18, toFixed = true) => {
	//alert(wei)
	if (!toFixed) {
		return new BigNumber(wei?.toString()).dividedBy(10 ** decimals)?.toString();
	} else return new BigNumber(wei?.toString()).dividedBy(10 ** decimals)?.toFixed(5);
};
