import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { arrowBottom, wallet } from "../../../Base/SVG";
import useMetaMask from "../../../utils/useMetaMask";
import Input from "../../../Components/Controls/InputWithCoin";
import useFetchTokenList from "../../../utils/useFetchTokenList";
import useToast from "../../../utils/useToast";
import { convertWeiToEther, converter } from "../../../utils/convertToBN";
import {
  approveTokens,
  calculateQuotation,
  getTokenBalances,
  swapTokens,
} from "../../../utils/helpers/SwapContractHelper";
import { getTokenObject } from "../../../utils/getToken";
import { baseToken } from "../../../config";
import { callApiTimer } from "../../../config";
import Web3 from "web3";
import { getPair } from "../../../utils/helpers/PoolContractHelpers";

export default function SwapDetail({ isLoading }) {
  const { showToast } = useToast();

  const [payload, setPayload] = useState({
    fromAmount: "",
    fromCoin: "",
    toAmount: "",
    toCoin: "",
    fromCoinBalance: "0",
    toCoinBalance: "0",
    fromCoinSymbol: "0",
    toCoinSymbol: "0",
    fromCoinDecimal: "0",
    toCoinDecimal: "0",
  });

  const [tokenList, setTokenList] = useState([]);
  const { isConnected, account, connectWallet, isWanChain } = useMetaMask();
  const fetchedTokens = useFetchTokenList();
  const web3 = new Web3(window.ethereum);
  useEffect(() => {
    if (isWanChain && account) {
      const interval = setInterval(async () => {
        if (payload.fromCoin && payload.toCoin) {
          const fromToken = getTokenObject(tokenList, payload.fromCoin);
          const toToken = getTokenObject(tokenList, payload.toCoin);
          // const ether = web3.utils.fromWei(bal.toString(), "ether");
          const fromCoinBalance = await getTokenBalances(
            fromToken.address,
            account
          );

          const toCoinBalance = await getTokenBalances(
            toToken.address,
            account
          );
          setPayload((payload) => ({
            ...payload,
            fromCoinBalance,
            toCoinBalance,
            toCoinSymbol: toToken.symbol,
            fromCoinSymbol: fromToken.symbol,
            toCoinDecimal: toToken.decimals,
            fromCoinDecimal: fromToken.decimals,
          }));
        }
      }, 5000); //5 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [payload, isWanChain, account]);

  useEffect(() => {
    if (isWanChain) {
      const interval = setInterval(async () => {
        if (
          payload.fromAmount &&
          payload.toAmount &&
          payload.fromCoin &&
          payload.toCoin
        ) {
          const fromToken = getTokenObject(tokenList, payload.fromCoin);
          const toToken = getTokenObject(tokenList, payload.toCoin);
          let newAmount = await getQuote(
            payload.fromAmount,
            fromToken,
            toToken
          );
          console.log({newAmount});
          newAmount = newAmount ? newAmount : payload.toAmount;
          setPayload((payload) => ({ ...payload, toAmount: newAmount }));
        }
      }, callApiTimer); // 15 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [
    payload.fromAmount,
    payload.toAmount,
    payload.fromCoin,
    payload.toCoin,
    tokenList,
    isWanChain,
  ]);

  useEffect(() => {
    if (fetchedTokens.length) {
      setTokenList(fetchedTokens);
      const fetchTokenBalances = async () => {
        let fromCoinBalance = 0;
        let toCoinBalance = 0;
        if (!!account) {
          fromCoinBalance = await getTokenBalances(
            fetchedTokens[0].address,
            account
          );
          toCoinBalance = await getTokenBalances(
            fetchedTokens[1].address,
            account
          );
        }
        setPayload((payload) => ({
          ...payload,
          fromCoin: fetchedTokens[0].address,
          fromCoinBalance: fromCoinBalance,
          toCoinBalance: toCoinBalance,
          toCoin: fetchedTokens[1]?.address || "",

          fromCoinSymbol: fetchedTokens[0].symbol,
          toCoinSymbol: fetchedTokens[1].symbol,
          toCoinDecimal: fetchedTokens[0].decimals,
          fromCoinDecimal: fetchedTokens[1].decimals,
        }));
      };
      fetchTokenBalances();
    }
  }, [fetchedTokens]);

  const handleSwapTokens = async () => {
    try {
      const { exists } = await getPair(payload.fromCoin, payload.toCoin);

      if (payload.toCoin === payload.fromCoin) {
        showToast("Select different coins.", "error");
        return;
      }
      if (!exists) {
        showToast("Please create pair first.", "error");
        return;
      }
      if (!payload.fromCoin || !payload.toCoin || !payload.fromAmount) return;

      const fromToken = getTokenObject(tokenList, payload.fromCoin);
      const toToken = getTokenObject(tokenList, payload.toCoin);
      const fromAmount = converter(payload.fromAmount, fromToken.decimals);
      const toAmount = converter(payload.toAmount, fromToken.decimals);

      if (fromToken.address.toLowerCase() !== baseToken.toLowerCase()) {
        await toast.promise(approveTokens(account, fromToken, fromAmount), {
          pending: `Approving ${fromToken.symbol} token...`,
          success: `${fromToken.symbol} Token approved!`,
          error: `${fromToken.symbol} approval failed!`,
        });
      }
      await toast.promise(
        swapTokens(account, fromToken, toToken, fromAmount, toAmount),
        {
          pending: "Initiating Swap...",
          success: "Swap completed!",
          error: "Swap failed!",
        }
      );

      setPayload({ ...payload, fromAmount: "", toAmount: "" });
    } catch (error) {
      console.log(error);
    }
  };

  const getQuote = async (value, fromToken, toToken) => {
    if (!!value && isWanChain) {
      const newAmount = await calculateQuotation(fromToken, toToken, value);
      if (newAmount == null) return;
      if (newAmount.error) {
        showToast(newAmount.error, "error");
        return;
      }
      return newAmount;
    }
  };

  const onChangeInput = (input) => async (e) => {
    const value =
     ( typeof e == "number" ||  typeof e == "string" ? e : e.target.value).toString();

    setPayload((payload) => ({ ...payload, [input]: value }));
    const fromToken = getTokenObject(tokenList, payload.fromCoin);
    const toToken = getTokenObject(tokenList, payload.toCoin);
    if (input === "fromAmount") {
      const newAmount = await getQuote(value, fromToken, toToken);
      if (newAmount) {
        setPayload((payload) => ({ ...payload, toAmount: newAmount }));
      }
    }

    if (input === "toAmount") {
      const newAmount = await getQuote(value, toToken, fromToken);
      if (newAmount) {
        setPayload((payload) => ({ ...payload, fromAmount: newAmount }));
      }
    }
  };

  const changeMedium = (key) => async (item) => {
    if (key === "fromCoin") {
      const fromCoinBalance = await getTokenBalances(item.address, account);
      const fromToken = getTokenObject(tokenList, item.address);
      const toToken = getTokenObject(tokenList, payload.toCoin);
      let newAmount = await getQuote(payload.toAmount, toToken, fromToken);
      newAmount = newAmount ? newAmount : payload.fromAmount;
      setPayload((payload) => ({
        ...payload,
        [key]: item.address,
        fromCoinBalance: fromCoinBalance,
        fromCoinSymbol: fromToken.symbol,
        fromCoinDecimal: fromToken.decimals,
        fromAmount: newAmount,
      }));
    }
    if (key === "toCoin") {
      const fromToken = getTokenObject(tokenList, payload.fromCoin);
      const toToken = getTokenObject(tokenList, item.address);
      const toCoinBalance = await getTokenBalances(item.address, account);
      let newAmount = await getQuote(payload.fromAmount, fromToken, toToken);
      newAmount = newAmount ? newAmount : payload.toAmount;
      setPayload((payload) => ({
        ...payload,
        [key]: item.address,
        toCoinBalance: toCoinBalance,
        toCoinSymbol: toToken.symbol,
        toCoinDecimal: toToken.decimals,
        toAmount: newAmount,
      }));
    }
  };

  const onSwapInputsFields = async () => {
    const fromToken = getTokenObject(tokenList, payload.fromCoin);
    const toToken = getTokenObject(tokenList, payload.toCoin);

    const newAmount = await getQuote(payload.toAmount, toToken, fromToken);
    setPayload((payload) => ({
      fromAmount: payload.toAmount,
      fromCoin: payload.toCoin,
      toAmount: newAmount ? newAmount : payload.fromAmount,
      toCoin: payload.fromCoin,
      fromCoinBalance: payload.toCoinBalance,
      toCoinBalance: payload.fromCoinBalance,
      fromCoinSymbol: toToken.symbol,
      toCoinSymbol: fromToken.symbol,
      fromCoinDecimal: toToken.decimals,
      toCoinDecimal: fromToken.decimals,
    }));
  };

  return (
    <>
      {isLoading ? (
        <div className="swapBox">
          <div className="swap__inputs">
            <div className="input__outer placeholder"></div>
            <div className="swap__inputs-arrow placeholder"></div>
            <div className="input__outer placeholder"></div>
            <div className="button placeholder"></div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, y: 20 }}
          className="swapBox"
        >
          <div className="swap__inputs">
            <>
              <Input
                value={payload.fromAmount}
                onChangeInput={onChangeInput("fromAmount")}
                label="Input"
                list={tokenList}
                changeMedium={changeMedium("fromCoin")}
                selectedAddress={payload.fromCoin}
              />
              <p
                style={{
                  display: "flex",
                  justifyContent: "end",
                  cursor: "pointer",
                }}
                onClick={() =>
                  onChangeInput("fromAmount")(
                    convertWeiToEther(payload.fromCoinBalance, payload.fromCoinDecimal,false).toString()
                  )
                }
              >
                Balance: {convertWeiToEther(payload.fromCoinBalance, payload.fromCoinDecimal)}
              </p>
            </>

            <div className="swap__inputs-arrow" onClick={onSwapInputsFields}>
              {arrowBottom}
            </div>
            <>
              <Input
                value={payload.toAmount}
                onChangeInput={onChangeInput("toAmount")}
                label="Input"
                list={tokenList}
                changeMedium={changeMedium("toCoin")}
                selectedAddress={payload.toCoin}
              />
              <p
                style={{
                  display: "flex",
                  justifyContent: "end",
                  cursor: "pointer",
                }}
                onClick={() =>
                  onChangeInput("toAmount")(
                    convertWeiToEther(payload.toCoinBalance, payload.toCoinDecimal,false).toString()
                  )
                }
              >
                Balance: {convertWeiToEther(payload.toCoinBalance, payload.toCoinDecimal)}
              </p>
            </>
          </div>

          {!isConnected ? (
            <button onClick={connectWallet} className="button light ">
              Connect Wallet
            </button>
          ) : (
            <button
              disabled={!isWanChain}
              type="button"
              onClick={handleSwapTokens}
              className="button light "
            >
              Swap
            </button>
          )}
        </motion.div>
      )}
    </>
  );
}
