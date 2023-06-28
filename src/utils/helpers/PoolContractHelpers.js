import {
  baseToken,
  FactoryAddress,
  rexToken,
  RouterAddress,
} from "../../config";
import {
  FactoryAbi,
  RouterAbi,
  ERC20Abi,
  PairV2Abi,
} from "../../Contracts/abis";
import Web3 from "web3";

const web3 = new Web3(window.ethereum);

export const approveTokens = async (account, tokenAddress, amount, spender) => {
  const tokenContract = new web3.eth.Contract(ERC20Abi, tokenAddress);

  // Get current allowance
  const currentAllowance = await tokenContract.methods
    .allowance(account, spender)
    .call();
  // Convert both the current allowance and the required amount to big numbers for comparison
  const currentAllowanceBN = web3.utils.toBN(currentAllowance);
  const amountBN = web3.utils.toBN(amount);

  // If the current allowance is less than the required amount, approve more
  if (currentAllowanceBN.lt(amountBN)) {
    const tx = await tokenContract.methods
      .approve(spender, '0xf000000000000000000000000000000000000000')
      .send({ from: account });
    return tx;
  } else {
    console.log("Token has already been approved.");
  }
};

// Create a new token pair
export const createPair = async (account, tokenA, tokenB) => {
  const factoryContract = new web3.eth.Contract(FactoryAbi, FactoryAddress);

  const tx = await factoryContract.methods
    .createPair(tokenA, tokenB)
    .send({ from: account });
  return tx;
};

export const addLiquidity = async (
  account,
  baseAmount,
  tokenAmount,
  fromToken,
  toToken,
  tokenAAmount,
  tokenBAmount
) => {
  try {
    const routerContract = new web3.eth.Contract(RouterAbi, RouterAddress);

    if (fromToken.toLowerCase() === baseToken.toLowerCase()) {
      debugger
      await routerContract.methods
        .addLiquidityETH(
          toToken,
          tokenAmount,
          0,
          0,
          account,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
        )
        .send({ from: account, value: baseAmount });
    } else if (toToken.toLowerCase() === baseToken.toLowerCase()) {
      debugger

      await routerContract.methods
        .addLiquidityETH(
          fromToken,
          tokenAmount,
          0,
          0,
          account,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
        )
        .send({ from: account, value: baseAmount });
    } else {
      debugger

      await routerContract.methods
        .addLiquidity(
          fromToken,
          toToken,
          tokenAAmount,
          tokenBAmount,
          0,
          0,
          account,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
        )
        .send({ from: account, value: baseAmount });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// check if pair created or not
export const getPair = async (tokenA, tokenB) => {
  try {
    const factoryContract = new web3.eth.Contract(FactoryAbi, FactoryAddress);
    const pairAddress = await factoryContract.methods
      .getPair(tokenA, tokenB)
      .call();

    if (pairAddress === "0x0000000000000000000000000000000000000000") {
      return { exists: false, pairAddress };
    } else {
      return { exists: true, pairAddress };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllPairs = async (account) => {
  let web3_2 = web3;
  if (!account) {
    web3_2 = new Web3(new Web3.providers.HttpProvider('https://gwan-ssl.wandevs.org:56891/'));
  }
  

  try {
    const factoryContract = new web3_2.eth.Contract(FactoryAbi, FactoryAddress);
    const pairsLength = await factoryContract.methods.allPairsLength().call();

    const fetchPairInfo = async (i) => {
      try {
        const pairAddress = await factoryContract.methods
          .allPairs(i)
          .call({ from: account });

        


        const pair = new web3_2.eth.Contract(PairV2Abi, pairAddress);

        const [token0Address, token1Address] = await Promise.all([
          pair.methods.token0().call(),
          pair.methods.token1().call(),
        ]);

       

        const [token0, token1] = [
          new web3_2.eth.Contract(ERC20Abi, token0Address),
          new web3_2.eth.Contract(ERC20Abi, token1Address),
        ];

        

        const [token0Symbol, token1Symbol, token0Decimals, token1Decimals] =
          await Promise.all([
            token0.methods.symbol().call(),
            token1.methods.symbol().call(),
            token0.methods.decimals().call(),
            token1.methods.decimals().call(),
          ]);
         
        let [reserves, totalSupply, userLiquidity] = await Promise.all([
          pair.methods.getReserves().call(),
          pair.methods.totalSupply().call(),
          pair.methods.balanceOf(account ?? '0x0000000000000000000000000000000000000000').call(),
        ]);

        let userShare = (userLiquidity / totalSupply) * 100;
        let poolToken0Share = (reserves[0] / 10 ** 18 / 100) * userShare;
        let poolToken1Share = (reserves[1] / 10 ** 18 / 100) * userShare;

        if (!account)
        {
          userLiquidity = 0; 
          userShare = 0;
          poolToken0Share = 0;
          poolToken1Share = 0;
        }

        return {
          pairAddress,
          token0: {
            address: token0Address,
            symbol: token0Symbol,
            decimals: token0Decimals,
            pooledShare: poolToken0Share,
          },
          token1: {
            address: token1Address,
            symbol: token1Symbol,
            decimals: token1Decimals,
            pooledShare: poolToken1Share,
          },
          reserves: {
            reserve0: reserves._reserve0,
            reserve1: reserves._reserve1,
          },
          totalSupply,
          userLiquidity,
          userShare,
        };
      } catch (error) {
        // Handle any errors here
        console.error(`Error fetching pair info for index ${i}:`, error);
        return null;
      }
    };

    const pairsInfoPromises = Array.from({ length: pairsLength }, (_, i) =>
      fetchPairInfo(i)
    );
    const pairsInfo = await Promise.all(pairsInfoPromises);
    return pairsInfo.filter(
      (pairInfo) =>
        pairInfo !== null &&
        pairInfo.pairAddress !== "0xF4b449090A693Ca12184aFfE3e2ADcC8d6F8F26d"
    );
  } catch (error) {
    console.log(error);
  }
};

export const removeLiquidity = async (
  tokenAAddress,
  tokenBAddress,
  userLiquidity,
  account
) => {
  try {
    const router = new web3.eth.Contract(RouterAbi, RouterAddress);

    const minTokenAAmount = 0;
    const minTokenBAmount = 0;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // Deadline 20 minutes from now
    userLiquidity = userLiquidity.toString();

    if (tokenAAddress.toLowerCase() === baseToken.toLowerCase()) {
      // Remove liquidity for base currency pair
      await router.methods
        .removeLiquidityETH(
          tokenBAddress,
          userLiquidity,
          minTokenBAmount,
          minTokenAAmount,
          account,
          deadline
        )
        .send({ from: account });
    } else if (tokenBAddress.toLowerCase() === baseToken.toLocaleLowerCase()) {
      // Remove liquidity for base currency pair
      await router.methods
        .removeLiquidityETH(
          tokenAAddress,
          userLiquidity,
          minTokenAAmount,
          minTokenBAmount,
          account,
          deadline
        )
        .send({ from: account });
    } else {
      // Remove liquidity for non-base currency pair
      await router.methods
        .removeLiquidity(
          tokenAAddress,
          tokenBAddress,
          userLiquidity,
          minTokenAAmount,
          minTokenBAmount,
          account,
          deadline
        )
        .send({ from: account });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
