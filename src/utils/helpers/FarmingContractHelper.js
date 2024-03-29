// src/web3Helper.js

import Web3 from "web3";
import { ERC20Abi, ERC21Abi, FarmingAbi, PairV2Abi, ReferalAbi, boostingAbi } from "../../Contracts/abis";
import { FarmingAddress, boostingAddress, emptyAddress, referalAddress } from "../../config";
import { checkReferralQualification } from "./ReferalHelper";

const web3 = new Web3(window.ethereum);

export const initContractInstance = (myWeb3) => {
	try {
		const contractInstance = new myWeb3.eth.Contract(FarmingAbi, FarmingAddress);
		return contractInstance;
	} catch (error) {
		console.log(error);
	}
};


export async function approveToken(lpTokenAddress, amount, account) {
	try {
		const Erc20Contract = new web3.eth.Contract(ERC20Abi, lpTokenAddress);
		const allowance = await Erc20Contract.methods.allowance(account, FarmingAddress).call();

		// Check if the allowance is enough to deposit the amount
		if (+allowance <= +amount) {
			await Erc20Contract.methods.approve(FarmingAddress, '0xf000000000000000000000000000000000000000').send({ from: account });
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export const approveNFTTransfer = async (account, id, nftAddress) => {
	try {
		const nftContract = new web3.eth.Contract(ERC21Abi, nftAddress);
		const approvedAddress = await nftContract.methods.getApproved(id).call();
		if (approvedAddress.toLowerCase() !== boostingAddress.toLowerCase()) {
			await nftContract.methods.approve(boostingAddress, id).send({ from: account });
		}
	} catch (err) {
		console.error("Error approving NFT transfer:", err);
		throw err;
	}
};

export async function deposit(poolId, amount, sas, zoo, account, _referer = emptyAddress) {
	try {
		let ref = emptyAddress;
		if (_referer && _referer !== emptyAddress) {
			// check qualification
			const contractInstance = new web3.eth.Contract(ReferalAbi, referalAddress);

			const { _qualification } = await checkReferralQualification(_referer, contractInstance);

			if (_qualification) {
				ref = _referer;
			}
		}

		const contract = initContractInstance(web3);
		await contract.methods.depositWithNft(poolId, amount, sas, zoo, ref).send({ from: account });
	} catch (err) {
		console.error("Error depositing tokens:", err);
		throw err;
	}
}

export async function withdraw(poolId, amount, account) {
	try {
		const contract = initContractInstance(web3);
		await contract.methods.withdrawWithNft(poolId, amount).send({ from: account });
	} catch (err) {
		console.error("Error depositing tokens:", err);
		throw err;
	}
}

async function fetchTokenInfo(myWeb3, lpTokenAddress, poolContract) {
	const lpTokenContract = new myWeb3.eth.Contract(ERC20Abi, lpTokenAddress);

	const name = await lpTokenContract.methods.name().call();
	const symbol = await lpTokenContract.methods.symbol().call();
	const decimals = await lpTokenContract.methods.decimals().call();
	const totalSupply = await lpTokenContract.methods.totalSupply().call();
	const farmingBalance = await lpTokenContract.methods.balanceOf(poolContract._address).call();
	return {
		name,
		symbol,
		decimals,
		totalSupply,
		farmingBalance,
	};
}


export const getAllPools = async (account) => {
	let web3_2 = web3;
	if (!account) {
		web3_2 = new Web3(new Web3.providers.HttpProvider('https://gwan-ssl.wandevs.org:56891/'));
	}

	try {
		const contract = initContractInstance(web3_2);
		const startTime = await contract.methods.startTime().call({ from: account });
		const rewardPerSecond = await contract.methods.rewardPerSecond().call({ from: account });
		const totalAllocPoint = await contract.methods.totalAllocPoint().call({ from: account });

		const poolCount = await contract.methods.poolLength().call({ from: account });

		const poolDataPromises = Array.from({ length: poolCount }, async (_, i) => {
			const poolInfo = await contract.methods.poolInfo(i).call({ from: account });

			const pair = new web3_2.eth.Contract(PairV2Abi, poolInfo[0]);

			const [token0Address, token1Address] = await Promise.all([pair.methods.token0().call(), pair.methods.token1().call()]);

			const [token0, token1] = [new web3_2.eth.Contract(ERC20Abi, token0Address), new web3_2.eth.Contract(ERC20Abi, token1Address)];
			const [token0Symbol, token1Symbol] = await Promise.all([token0.methods.symbol().call(), token1.methods.symbol().call()]);

			return { poolId: i, ...poolInfo, token0Symbol, token1Symbol, token0Address, token1Address };
		});

		const poolDataArray = (await Promise.allSettled(poolDataPromises)).filter((p) => p.status === "fulfilled").map((p) => p.value);

		const tokenDataPromises = poolDataArray.map((poolData) =>
			fetchTokenInfo(web3_2, poolData.lpToken, contract).catch((err) => {
				console.error("Error fetching token data:", err);
			})
		);

		const [tokenDataArray] = await Promise.all([Promise.allSettled(tokenDataPromises)]);

		let userStakedInfoPromises = poolDataArray.map(async (_, index) => {
			try {
				const userInfo = await contract.methods.userInfo(index, account).call({ from: account });
				// get user's boosting
				const userBoosting = await getUserBoosting(account, index);
				return { ...userInfo, userBoosting };
			} catch (err) {
				console.error("Error fetching user staking information:", err);
			}
		});


		const [userStakedInfoArray] = await Promise.all([Promise.allSettled(userStakedInfoPromises)]);

		const mergedDataArray = poolDataArray.map((poolData, index) => {
			const poolRate = rewardPerSecond;
			return {
				// pool information
				poolId: poolData.poolId,
				accRewardPerShare: poolData.accRewardPerShare,
				allocPoint: poolData.allocPoint,
				totalAllocPoint: totalAllocPoint,
				Multiplier: poolData.allocPoint / 100,
				lastRewardTimestamp: poolData.lastRewardTimestamp,
				lpToken: poolData.lpToken,
				poolRate,
				...(tokenDataArray[index].status === "fulfilled" ? tokenDataArray[index].value : {}),
				userStaked: account ? userStakedInfoArray[index].status === "fulfilled" ? userStakedInfoArray[index].value.amount : null : 0,
				userBoosting: account ? userStakedInfoArray[index].status === "fulfilled" ? userStakedInfoArray[index].value.userBoosting.userBoosting : null : 0,
				userStakedSASId: account ? userStakedInfoArray[index].status === "fulfilled" ? userStakedInfoArray[index].value.userBoosting.userStakedSASId : null : 0,
				userStakedZooBoosterId: account ? userStakedInfoArray[index].status === "fulfilled" ? userStakedInfoArray[index].value.userBoosting.userStakedZooBoosterId : null : 0,
				rewardPerSecond,
				startTime,
				symbol0: poolData.token0Symbol,
				symbol1: poolData.token1Symbol,
				address0: poolData.token0Address,
				address1: poolData.token1Address,
			};
		});

		return mergedDataArray;
	} catch (err) {
		console.error("Error fetching pool data:", err);
	}
};

export const getPendingRewards = async (pid, account) => {
	try {
		const contract = initContractInstance(web3);

		const pendingReward = await contract.methods.pendingReward(pid, account).call({ from: account });

		return pendingReward;
	} catch (error) {
		console.error("Error fetching pending rewards:", error);
	}
};

export const getUserBoosting = async (account, index) => {
	if (!account) return;
	try {
		const boostingContract = new web3.eth.Contract(boostingAbi, boostingAddress);
		const userBoosting = await boostingContract.methods.getUserBoosting(account, index).call();
		//console.log('userBoosting',userBoosting);
		const userStakedNFTs = await boostingContract.methods.userInfo(account, index).call();
		//console.log('userStakedNFTs',userStakedNFTs);
		return {
			userBoosting,
			userStakedSASId: userStakedNFTs?.sasId ?? 0,
			userStakedZooBoosterId: userStakedNFTs?.zooboosterId ?? 0,
		};
	} catch (error) {
		console.error("Error fetching user boosting:", error);
	}
};

// Helper function to convert the returned boosting percentage from wei to ether

export const getZooBoosting = async (tokenId) => {
	try {
		debugger;
		const boostingContract = new web3.eth.Contract(boostingAbi, boostingAddress);

		const boosting = await boostingContract.methods.getZooBoosting(tokenId).call();

		// Convert the boosting percentage from wei to ether
		return boosting;
	} catch (err) {
		console.error("Error fetching ZooBoosting data:", err);
	}
};

export const getSasBoosting = async (tokenId) => {
	try {
		const boostingContract = new web3.eth.Contract(boostingAbi, boostingAddress);
		debugger;
		const boosting = await boostingContract.methods.getSasBoosting(tokenId).call();

		return boosting;
	} catch (err) {
		console.error("Error fetching SasBoosting data:", err);
	}
};

export const getComboBoost = async (tokenId) => {
	try {
		const boostingContract = new web3.eth.Contract(boostingAbi, boostingAddress);
		const boosting = await boostingContract.methods.getComboBoost(tokenId).call();

		return boosting;
	} catch (err) {
		console.error("Error fetching ComboBoost data:", err);
	}
};


// Get NFT info by tokenId //
export const getNFTInfo = async (tokenId, contractAddress) => {
	try {
		const erc721Contract = new web3.eth.Contract(ERC21Abi, contractAddress);
		const nftInfo = await erc721Contract.methods.tokenURI(tokenId).call();

		return nftInfo;
	}
	catch (err) {
		console.error("Error fetching NFT data:", err);
	}
}