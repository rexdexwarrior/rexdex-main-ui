import React, { useEffect, useState } from "react";
import Layout from "../../Base/Layout";
import { motion } from "framer-motion";
import Modal from "../../Components/Modal";
import AddPairDialog from "./Modal/AddPairDialog";
import AddLiquidityDialog from "./Modal/AddLiquidityDialog";
import useMetaMask from "../../utils/useMetaMask";
import {
  createPair,
  approveTokens,
  addLiquidity,
  getPair,
  getAllPairs,
  removeLiquidity,
} from "../../utils/helpers/PoolContractHelpers";
import { RouterAddress, UniswapURL, baseToken, callApiTimer, rexToken } from "../../config";
import useFetchTokenList from "../../utils/useFetchTokenList";
import { convertWeiToEther, converter } from "../../utils/convertToBN";
import { getTokenObject } from "../../utils/getToken";
import { toast } from "react-toastify";
import ExistingPools from "./ExistingPools.jsx";
import RemoveLiquidityDialog from "./Modal/RemoveLiquidityDialog";
import { getTokenBalances } from "../../utils/helpers/SwapContractHelper";
import BigNumber from "bignumber.js";
import { NavLink } from "react-router-dom";
const initiLiquidityPayload = {
  tokenA: "",
  tokenB: "",
  tokenAamount: "",
  tokenBamount: "",
  tokenABalance: 0,
  tokenBBalance: 0,
  tokenADecimal: 0,
  tokenBDecimal: 0,
};
export default function Pool() {
  const [isAddPairModalOpen, setIsAddPairModalOpen] = useState(false);
  const [isAddLiquidityModalOpen, setIsAddLiquidityModalOpen] = useState(false);
  const [issRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const { isConnected, account, connectWallet, isWanChain } = useMetaMask();
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState([]);
  const [selectedLiquidity, setSelectedLiquidity] = useState({});
  const fetchedTokens = useFetchTokenList();
  // liquidity Payload
  const [liquidityPayload, setLiquidityPayload] = useState(
    initiLiquidityPayload
  );
  console.log(liquidityPayload);
  const getAllLiquidityPools = async (v) => {
    const getAllPairsData = await getAllPairs(account);
    setPools(getAllPairsData);
    setIsLoading(false);
  };
  useEffect(() => {
    //if (!!account) {
      getAllLiquidityPools();
    //}
  }, [account, isWanChain]);

  useEffect(() => {
    if (isWanChain) {
      const interval = setInterval(async () => {
        if (!!account) {
          getAllLiquidityPools();
        }
      }, callApiTimer); // 15 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [isWanChain, account]);

  useEffect(() => {
    if (fetchedTokens.length) {
      const fetchTokenBalances = async () => {
        const tokenABalance = await getTokenBalances(
          fetchedTokens[0].address,
          account
        );

        setLiquidityPayload({
          ...liquidityPayload,
          tokenA: fetchedTokens[0]?.address?.toLowerCase(),
          tokenABalance: tokenABalance,
          tokenADecimal: fetchedTokens[0].decimals,
        });
        setTokenList(fetchedTokens);
      };
      fetchTokenBalances();
    }
  }, [fetchedTokens]);

  useEffect(() => {
    if (Object.keys(selectedLiquidity).length) {
      const fetchTokenBalances = async () => {
        const tokenABalance = await getTokenBalances(
          selectedLiquidity.token0.address,
          account
        );
        const tokenBBalance = await getTokenBalances(
          selectedLiquidity.token1.address,
          account
        );
        setLiquidityPayload({
          ...liquidityPayload,
          tokenABalance: tokenABalance,
          tokenBBalance: tokenBBalance,

          tokenADecimal: selectedLiquidity.token0.decimals,
          tokenBDecimal: selectedLiquidity.token1.decimals,
        });
      };
      fetchTokenBalances();
    }
  }, [selectedLiquidity]);

  const changeMedium = (key) => async (item) => {
    const balance = await getTokenBalances(item.address, account);
    const balanceKey = key == "tokenA" ? "tokenABalance" : "tokenBBalance";

    let tokenADecimal = null;
    let tokenBDecimal = null;

    let newTokenA = liquidityPayload.tokenA;
    let newTokenB = null;

    if (key == "tokenA") {
      newTokenA = item.address?.toLowerCase();
    }
    if (key == "tokenB") {
      newTokenB = item.address?.toLowerCase();
    }
    if (
      !!liquidityPayload.tokenA &&
      key == "tokenB" &&
      !!item.address?.toLowerCase()
    ) {
      const findExistingPool = findExistingPoolFromPools(
        liquidityPayload.tokenA,
        item?.address
      );

      if (findExistingPool) {
        if (
          findExistingPool.token0.address?.toLowerCase() ==
            liquidityPayload.tokenA?.toLowerCase() &&
          findExistingPool.token1.address?.toLowerCase() ==
            item.address?.toLowerCase()
        ) {
          newTokenA = findExistingPool.token0.address?.toLowerCase();
          newTokenB = findExistingPool.token1.address?.toLowerCase();

          tokenADecimal = findExistingPool.token0.decimals;
          tokenBDecimal = findExistingPool.token1.decimals;
        } else {
          newTokenA = findExistingPool.token0.address?.toLowerCase();
          newTokenB = findExistingPool.token1.address?.toLowerCase();

          tokenADecimal = findExistingPool.token0.decimals;
          tokenBDecimal = findExistingPool.token1.decimals;
        }
        setSelectedLiquidity(findExistingPool);
      }
    }
    const newPayload = {};
    if (!!newTokenA) {
      newPayload.tokenA = newTokenA?.toLowerCase();
      const tokenAObject = getTokenObject(tokenList, newTokenA);

      newPayload.tokenADecimal = tokenAObject.decimals;
    }
    if (!!newTokenB) {
      newPayload.tokenB = newTokenB?.toLowerCase();
      const tokenBObject = getTokenObject(tokenList, newTokenB);

      newPayload.tokenBDecimal = tokenBObject.decimals;
    }
    setLiquidityPayload((payload) => ({
      ...payload,
      ...newPayload,
      [balanceKey]: balance,
    }));
  };

  const openModal = async (name) => {
    if (name === "liquidity") {
      setIsRemoveModalOpen(false);
      setIsAddPairModalOpen(false);

      // yahan calculate krn a

      const tokenABalance = await getTokenBalances(
        liquidityPayload.tokenA,
        account
      );
      const tokenA = getTokenObject(tokenList, liquidityPayload.tokenA);

      setLiquidityPayload({
        ...liquidityPayload,
        tokenABalance: tokenABalance,
        tokenADecimal: tokenA.decimals,
      });
      setIsAddLiquidityModalOpen(true);
    } else if (name === "pair") {
      setIsRemoveModalOpen(false);
      setIsAddLiquidityModalOpen(false);
      setIsAddPairModalOpen(true);
    } else if (name === "remove") {
      setIsAddLiquidityModalOpen(false);
      setIsAddPairModalOpen(false);
      setIsRemoveModalOpen(true);
    }
  };

  const closeModal = (name) => {
    if (name === "liquidity") {
      setIsAddLiquidityModalOpen(false);
    } else if (name === "pair") {
      setIsAddPairModalOpen(false);
    } else if (name === "remove") {
      setIsRemoveModalOpen(false);
    }
  };

  const handleAddLiquidity = async (payload) => {
    try {
      const fromToken = getTokenObject(tokenList, payload.tokenA);
      const toToken = getTokenObject(tokenList, payload.tokenB);

      const tokenAamount = converter(payload.tokenAamount, fromToken.decimals);
      const tokenBamount = converter(payload.tokenBamount, toToken.decimals);

      let baseAmount = 0;
      let tokenAmount = 0;

      // Approve the tokens for the Router contract
      if (payload.tokenA?.toLowerCase() !== baseToken?.toLowerCase()) {
        await toast.promise(
          approveTokens(account, payload.tokenA, tokenAamount, RouterAddress),
          {
            pending: `Approving ${fromToken.symbol} token...`,
            success: `${fromToken.symbol} Token approved!`,
            error: `${fromToken.symbol} approval failed!`,
          }
        );
      }
      if (payload.tokenB?.toLowerCase() !== baseToken?.toLowerCase()) {
        await toast.promise(
          approveTokens(account, payload.tokenB, tokenBamount, RouterAddress),
          {
            pending: `Approving ${toToken.symbol} token...`,
            success: `${toToken.symbol} Token approved!`,
            error: `${toToken.symbol} approval failed!`,
          }
        );
      }

      if (fromToken.address?.toLowerCase() == baseToken?.toLowerCase()) {
        baseAmount = tokenAamount;
        tokenAmount = tokenBamount;
      } else if (toToken.address?.toLowerCase() == baseToken?.toLowerCase()) {
        baseAmount = tokenBamount;
        tokenAmount = tokenAamount;
      }
      // Add liquidity
      await toast.promise(
        addLiquidity(
          account,
          baseAmount,
          tokenAmount,
          payload.tokenA,
          payload.tokenB,
          tokenAamount,
          tokenBamount
        ),
        {
          pending: "Adding liquidity...",
          success: "Liquidity added!",
          error: "Error adding liquidity!",
        }
      );
      onAddLiquidityModalClose();
      getAllLiquidityPools();
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  };

  const findExistingPoolFromPools = (tokenA, tokenB) => {
    if (tokenA?.toLowerCase() === tokenB?.toLowerCase(0)) return null;
    const findPool = pools.find((pool) => {
      if (
        (pool.token0.address?.toLowerCase() == tokenA?.toLowerCase() ||
          pool.token1.address?.toLowerCase() == tokenA?.toLowerCase()) &&
        (pool.token0.address?.toLowerCase() == tokenB?.toLowerCase() ||
          pool.token1.address?.toLowerCase() == tokenB?.toLowerCase())
      ) {
        return pool;
      }
    });
    if (findPool && Object.keys(findPool).values) {
      return findPool;
    }
    return null;
  };
  const handleAddPair = async (payload) => {
    try {
      // Create the pair
      await toast.promise(createPair(account, payload.tokenA, payload.tokenB), {
        pending: "Creating Pair...",
        success: "Pair created.",
        error: "Pair creation failed!",
      });
      closeModal("pair");
      getAllLiquidityPools();
    } catch (error) {
      console.error("Error creating pair:", error);
    }
  };

  // Add this function inside the Pool component
  const checkPairAndOpenModal = async (tokenA, tokenB, payload) => {
    try {
      const pairDetails = await getPair(tokenA, tokenB);
      const newLiquidityPayload = {
        tokenA: tokenA,
        tokenB: tokenB,
        tokenAamount: payload.amountA,
        tokenBamount: payload.amountB,
      };
      if (pairDetails.exists) {
        const findExistingPool = findExistingPoolFromPools(tokenA, tokenB);
        let newTokenA = null;
        let newTokenB = null;

        if (findExistingPool) {
          if (
            findExistingPool.token0.address?.toLowerCase() ==
            tokenA?.toLowerCase()
          ) {
            newTokenA = findExistingPool.token0.address?.toLowerCase();
            newTokenB = findExistingPool.token1.address?.toLowerCase();
          } else {
            newTokenA = findExistingPool.token0.address?.toLowerCase();
            newTokenB = findExistingPool.token1.address?.toLowerCase();
          }
          setSelectedLiquidity({
            ...findExistingPool,
          });
        }
        newLiquidityPayload.tokenA = newTokenA?.toLowerCase();
        newLiquidityPayload.tokenB = newTokenB?.toLowerCase();

        setLiquidityPayload(newLiquidityPayload);

        openModal("liquidity");
      } else {
        // If the pair does not exist, create the pair and open the Add Liquidity modal
        // temp by jaffar
        // await handleAddPair({ tokenA, tokenB });
        // newLiquidityPayload(newLiquidityPayload);
        // openModal("liquidity");
      }
    } catch (error) {
      console.error("Error checking pair:", error);
    }
  };

  const addInExistingPair = (data) => {
    const newLiquidityPayload = {
      tokenA: data.token0.address?.toLowerCase(),
      tokenB: data.token1.address?.toLowerCase(),
      tokenAamount: 0,
      tokenBamount: 0,
    };

    setLiquidityPayload(newLiquidityPayload);
    openModal("liquidity");
  };
  const onRemoveLiquidity = async (
    sliderAmount,
    tokenA,
    tokenB,
    userLiquidity,
    pairAddress
  ) => {
    try {
      //const amountToRemove = converter(((userLiquidity * sliderAmount) / 100),18);

      const amountToRemove = BigNumber(userLiquidity)
        .multipliedBy(sliderAmount / 100)
        .toFixed(0);
      await toast.promise(
        approveTokens(
          account,
          pairAddress,
          amountToRemove.toString(),
          RouterAddress
        ),
        {
          pending: `Approving LP Token...`,
          success: `LP Token approved!`,
          error: `LP Token approval failed!`,
        }
      );

      await toast.promise(
        removeLiquidity(tokenA, tokenB, amountToRemove, account),
        {
          pending: "Removing liquidity...",
          success: "Liquidity removed sucessfully.",
          error: "Failed to remove liquidity!",
        }
      );
      getAllLiquidityPools();

      setSelectedLiquidity({});
      closeModal("remove");
    } catch (error) {
      console.log(error);
    }
  };
  const onAddLiquidityModalClose = () => {
    closeModal("liquidity");
    setSelectedLiquidity({});
    setLiquidityPayload({
      ...initiLiquidityPayload,
      tokenA: tokenList[0].address?.toLowerCase(),
    });
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="pool">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, x: -40 }}
          >
            Pool
          </motion.h2>
          <div className="poolItem">
            <h3 className="placeholder"></h3>
            <p className="placeholder"></p>
            <p>
              <a href="" className="placeholder"></a>
            </p>
          </div>
          <div className="pool__footer">
            <p className="placeholder"></p>
            <p>
              <a className="placeholder" href=""></a>
            </p>
          </div>
          <div className="pool__more placeholder"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, y: 20 }}
          className="pool"
        >
          <h2>Pool</h2>
          <div className="poolItem">
            <h3 className="uniq">Liquidity provider rewards</h3>
            <p>
              Liquidity providers earn a 0.3% fee on all trades proportional to
              their share of the pool. Fees are added to the pool, accrue in
              real time and can be claimed by withdrawing your liquidity.
            </p>
            {/* <p>
              <a href="#">Read more about providing liquidity</a>
            </p> */}
          </div>

          <div className="pool__footer">
            {!isConnected && (
              <p className="big">Connect to a wallet to view your liquidity.</p>
            )}
            {/* <p>
              Don't see a pool you joined?{" "}
              <a className="uniq" href="">
                Import it.
              </a>
            </p> */}
          </div>

          <div className="pool__more">
            <h4 className="uniq">Your liquidity</h4>
            <div className="pool__more-btns">
              {/* <button
                disabled={!isWanChain}
                className="button bordered"
                onClick={() => openModal("pair")}
              >
                Create a pair
              </button> */}
              <NavLink target="_blank" to={`${UniswapURL}#/create/${rexToken}`} className="button bordered">
                Create a pair
              </NavLink>

              <NavLink target="_blank" to={`${UniswapURL}#/add/${rexToken}`} className="button light">
                Add Liquidity
              </NavLink>

              {/* <button
                disabled={!isWanChain}
                className="button light"
                onClick={() => openModal("liquidity")}
              >
                Add Liquidity
              </button> */}
            </div>
          </div>

          <div className="poolList">
            {pools && pools?.length
              ? pools.map((pool, i) => (
                  <span key={i}>
                    <ExistingPools
                      addInExistingPair={addInExistingPair}
                      data={pool}
                      openModal={openModal}
                      setSelectedLiquidity={setSelectedLiquidity}
                    />
                  </span>
                ))
              : null}
          </div>
        </motion.div>
      )}

      <Modal
        isOpen={isAddLiquidityModalOpen}
        onClose={onAddLiquidityModalClose}
        title="Add Liquidity"
      >
        <AddLiquidityDialog
          changeMedium={changeMedium}
          payload={liquidityPayload}
          setPayload={setLiquidityPayload}
          tokenList={tokenList}
          isConnected={isConnected}
          connectWallet={connectWallet}
          handleAddLiquidity={handleAddLiquidity}
          selectedLiquidity={selectedLiquidity}
        />
      </Modal>
      <Modal
        isOpen={isAddPairModalOpen}
        onClose={() => closeModal("pair")}
        title="Add Pair"
      >
        <AddPairDialog
          tokenList={tokenList}
          isConnected={isConnected}
          connectWallet={connectWallet}
          handleAddPair={handleAddPair}
          checkPairAndOpenModal={checkPairAndOpenModal}
        />
      </Modal>

      <Modal
        isOpen={issRemoveModalOpen}
        onClose={() => {
          setSelectedLiquidity({});
          closeModal("remove");
        }}
        title="Remove Liquidity"
      >
        <RemoveLiquidityDialog
          onRemoveLiquidity={onRemoveLiquidity}
          selectedLiquidity={selectedLiquidity}
        />
      </Modal>
    </Layout>
  );
}
