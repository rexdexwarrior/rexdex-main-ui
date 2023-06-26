import React, { useState } from "react";
import Input from "../../../Components/Controls/InputWithCoin";
import { convertWeiToEther } from "../../../utils/convertToBN";
import Web3 from "web3";
function AddLiquidity({
  tokenList,
  isConnected,
  connectWallet,
  handleAddLiquidity,
  setPayload,
  payload,
  selectedLiquidity,
  changeMedium,
}) {
  const web3 = new Web3(window.ethereum);
  const onChangeInput = (input) => (e) => {
    let value =
      typeof e == "number" || typeof e == "string" ? e : e.target.value;

    if (selectedLiquidity?.token0?.address) {
      if (
        isNaN(selectedLiquidity?.token0?.pooledShare) ||
        isNaN(selectedLiquidity?.token1?.pooledShare)
      ) {
        setPayload((payload) => ({ ...payload, [input]: value }));
        return;
      }

      if (input === "tokenAamount") {
        const newValueForTokenB =
          (value * selectedLiquidity.reserves.reserve1) /
          selectedLiquidity.reserves.reserve0;

        setPayload((payload) => ({
          ...payload,
          tokenAamount: value,
          tokenBamount: newValueForTokenB,
        }));
      } else if (input === "tokenBamount") {
        const newValueForTokenA =
          (value * selectedLiquidity.reserves.reserve0) /
          selectedLiquidity.reserves.reserve1;
        setPayload((payload) => ({
          ...payload,
          tokenBamount: value,
          tokenAamount: newValueForTokenA,
        }));
      }
    } else {
      setPayload((payload) => ({ ...payload, [input]: value }));
    }
  };

  return (
    <div
      className="addLiquidityBox"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div className="liquidity__inputs">
        <div
          style={{
            marginBottom: "30px",
            zIndex: "99999",
            position: "relative",
          }}
        >
          <Input
            isDisabledSelectBox={
              Object.keys(selectedLiquidity).length == 0 ? false : true
            }
            value={payload.tokenAamount}
            onChangeInput={onChangeInput("tokenAamount")}
            label="Token A"
            list={tokenList}
            changeMedium={changeMedium("tokenA")}
            selectedAddress={payload.tokenA}
          />
          <p
            style={{
              display: "flex",
              justifyContent: "end",
              cursor: "pointer",
            }}
            onClick={() =>
              onChangeInput("tokenAamount")(
                convertWeiToEther(
                  payload.tokenABalance,
                  payload.tokenADecimal,
                  false
                )
              )
            }
          >
            Balance:{" "}
            {`${
              convertWeiToEther(payload.tokenABalance, payload.tokenADecimal) ??
              0
            }`}
          </p>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Input
            isDisabledSelectBox={
              Object.keys(selectedLiquidity).length == 0 ? false : true
            }
            value={payload.tokenBamount}
            onChangeInput={onChangeInput("tokenBamount")}
            label="Token B"
            list={tokenList}
            changeMedium={changeMedium("tokenB")}
            selectedAddress={payload.tokenB}
          />
          <p
            style={{
              display: "flex",
              justifyContent: "end",
              cursor: "pointer",
            }}
            onClick={() =>
              onChangeInput("tokenBamount")(
                convertWeiToEther(
                  payload.tokenBBalance,
                  payload.tokenBDecimal,
                  false
                )
              )
            }
          >
            Balance:{" "}
            {`${
              convertWeiToEther(payload.tokenBBalance, payload.tokenBDecimal) ??
              0
            }`}
          </p>
        </div>
      </div>
      {!isConnected ? (
        <button onClick={connectWallet} className="button light ">
          Connect Wallet
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleAddLiquidity(payload)}
          className="button light "
        >
          Add Liquidity
        </button>
      )}
    </div>
  );
}

export default AddLiquidity;
