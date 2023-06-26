import React, { useState } from "react";
import Input from "../../../Components/Controls/InputWithCoin";

function AddPair({
  tokenList,
  isConnected,
  connectWallet,
  handleAddPair,checkPairAndOpenModal
}) {
  const [payload, setPayload] = useState({
    tokenA: tokenList[0]?.address || "",
    tokenB: "",
    amountA: "",
    amountB: "",
  });


  const changeMedium = (key) => (item) => {
    setPayload((payload) => ({
      ...payload,
      [key]: item.address,
    }));


    const tokenA= key ==='tokenA'?item.address:payload.tokenA
    const tokenB=key ==='tokenB'?item.address:payload.tokenB

    if (tokenA && tokenB) {
      checkPairAndOpenModal(tokenA, tokenB,payload);
    }
  };

  const onChangeInput = (input) => (e) => {
    setPayload((payload) => ({ ...payload, [input]: e.target.value }));
  };

  return (
    <div className="addPairBox" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <div className="pair__inputs">
        <div style={{marginBottom:"30px",
       zIndex: '99999',
       position: 'relative',}}>
        <Input
        disabled={true}
          value={payload.amountA}
          onChangeInput={onChangeInput("amountA")}
          label="Token A"
          list={tokenList}
          changeMedium={changeMedium("tokenA")}
          selectedAddress={payload.tokenA}
        />
      </div>
        <div style={{marginBottom:"10px"}}>
        <Input
        disabled={true}
          value={payload.amountB}
          onChangeInput={onChangeInput("amountB")}
          label="Token B"
          list={tokenList}
          changeMedium={changeMedium("tokenB")}
          selectedAddress={payload.tokenB}
        />
      </div>
      </div>
      {!isConnected ? (
        <button onClick={connectWallet} className="button light ">
          Connect Wallet
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleAddPair(payload)}
          className="button light "
        >
          Add Pair
        </button>
      )}
    </div>
  );
}

export default AddPair;
