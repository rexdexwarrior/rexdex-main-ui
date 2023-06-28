import Web3 from "web3";
import { ERC20Abi, StakingAbi } from "../../Contracts/abis";
import { FarmingAddress, stakingAddress } from "../../config";

const web3 = new Web3(window.ethereum);

function initWeb3() {
  try {
    const stakingContract = new web3.eth.Contract(StakingAbi, stakingAddress);
    return stakingContract;
  } catch (error) {
    console.log(error);
  }
}

export async function approveToken(lpTokenAddress, amount, account) {
  try {
    const Erc20Contract = new web3.eth.Contract(ERC20Abi, lpTokenAddress);
    const allowance = await Erc20Contract.methods
      .allowance(account, stakingAddress)
      .call();

    // Check if the allowance is enough to deposit the amount
    if (+allowance <= +amount) {
      await Erc20Contract.methods
        .approve(stakingAddress, '0xf000000000000000000000000000000000000000')
        .send({ from: account });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPools(account) {

  let web3_2 = web3;
  if (!account) {
    web3_2 = new Web3(new Web3.providers.HttpProvider('https://gwan-ssl.wandevs.org:56891/'));
  }

  try {
    const contract = initWeb3();

    const poolCount = await contract.methods.poolLength().call();
    let poolData = [];

    for (let i = 0; i < poolCount; i++) {
      const poolInfo = await contract.methods.poolInfo(i).call();

      // Get user-specific staking information
      const userInfo = await contract.methods.userInfo(i, account ?? '0x0000000000000000000000000000000000000000').call();

      // Get ERC20 token details for the LP token and the reward token
      const lpTokenContract = new web3_2.eth.Contract(ERC20Abi, poolInfo.lpToken);
      const rewardTokenContract = new web3_2.eth.Contract(
        ERC20Abi,
        poolInfo.rewardToken
      );

      const lpTokenName = await lpTokenContract.methods.name().call();
      const lpTokenSymbol = await lpTokenContract.methods.symbol().call();
      const lpTokenDecimals = await lpTokenContract.methods.decimals().call();
      const lpTokenTotalSupply = await lpTokenContract.methods
        .totalSupply()
        .call();

      const rewardTokenName = await rewardTokenContract.methods.name().call();
      const rewardTokenSymbol = await rewardTokenContract.methods
        .symbol()
        .call();
      const rewardTokenDecimals = await rewardTokenContract.methods
        .decimals()
        .call();
      const rewardTokenTotalSupply = await rewardTokenContract.methods
        .totalSupply()
        .call();

      // Append the information to the poolData array
      poolData.push({
        ...poolInfo,
        poolId: i,
        userStaked: account ? userInfo.amount : 0,
        userRewardDebt: account ? userInfo.rewardDebt : 0,
        lpToken: {
          contractAddress: poolInfo.lpToken,
          name: lpTokenName,
          symbol: lpTokenSymbol,
          decimals: lpTokenDecimals,
          totalSupply: lpTokenTotalSupply,
        },
        rewardToken: {
          contractAddress: poolInfo.rewardToken,
          name: rewardTokenName,
          symbol: rewardTokenSymbol,
          decimals: rewardTokenDecimals,
          totalSupply: rewardTokenTotalSupply,
        },
      });
    }
    return poolData;
  } catch (error) {
    console.log(error);
  }
}

export const getPendingRewards = async (pid, account) => {
  try {
    const contract = initWeb3();

    const pendingReward = await contract.methods
      .pendingReward(pid, account)
      .call({ from: account });
    return pendingReward;
  } catch (error) {
    console.error("Error fetching pending rewards:", error);
  }
};
export async function deposit(poolId, amount, account) {
  try {
    const contract = initWeb3();

    // Send transaction to deposit tokens
    await contract.methods
      .deposit(poolId, amount)
      .send({ from: account });

  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function withdraw(poolId, amount, account) {
  try {
    const contract = initWeb3();

    await contract.methods
      .withdraw(poolId, amount)
      .send({ from: account });

  } catch (error) {
    console.log(error);
    throw error;
  }
}
