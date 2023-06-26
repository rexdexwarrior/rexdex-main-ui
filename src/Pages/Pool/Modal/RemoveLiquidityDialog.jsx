import React, { useState } from "react";

const RemoveLiquidityDialog = ({ onRemoveLiquidity, selectedLiquidity }) => {
  const [sliderAmount, setSliderAmount] = useState(50);

  const handleSliderChange = (event) => {
    setSliderAmount(event.target.value);
  };
  console.log(selectedLiquidity);
  return (
    <div>
      <div className="crypto removeLiquidityContainer">
        <h3>Remove Amount</h3>

        {/* Add slider here */}
        <div className="slider">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderAmount}
            onChange={handleSliderChange}
          />
          <div>
            <h2 className="amount">{sliderAmount}%</h2>
          </div>
        </div>

        <div className="sliderChoices">
          <div onClick={() => setSliderAmount(25)}>25%</div>
          <div onClick={() => setSliderAmount(50)}>50%</div>
          <div onClick={() => setSliderAmount(75)}>75%</div>
          <div onClick={() => setSliderAmount(100)}>MAX</div>
        </div>
      </div>

      <div className="crypto removeLiquidityBox2">
        <div className="box">
          <p>{selectedLiquidity?.token0?.symbol}</p>
          <div style={{ padding: "0px", lineHeight: "10px" }}>
            <p>{selectedLiquidity?.token0?.pooledShare}</p>
            <p style={{ color: "red" }}>
              -
              {(
                selectedLiquidity?.token0?.pooledShare *
                (sliderAmount / 100)
              ).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="box">
          <p>{selectedLiquidity?.token1?.symbol}</p>

          <div style={{ padding: "0px", lineHeight: "10px" }}>
            <p>{selectedLiquidity?.token1?.pooledShare}</p>
            <p style={{ color: "red" }}>
              -
              {(
                selectedLiquidity?.token1?.pooledShare *
                (sliderAmount / 100)
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="pool__more-btns" style={{ justifyContent: "center" }}>
        <button
          className="button light"
          onClick={() => {
            onRemoveLiquidity(
              sliderAmount,
              selectedLiquidity.token0.address,
              selectedLiquidity.token1.address,
              selectedLiquidity.userLiquidity,
              selectedLiquidity.pairAddress
              
            );
            
          }
           
          }
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default RemoveLiquidityDialog;
