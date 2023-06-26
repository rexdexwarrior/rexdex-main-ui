import React from "react";
import { convertWeiToEther, converter } from "../../utils/convertToBN";

const ExistingPools = ({
  data,
  openModal,
  setSelectedLiquidity,
  addInExistingPair,
}) => {
  return (
    <div className="crypto poolList">
      <div className="box ">
        <h5 className="uniq">
          {data?.token0?.symbol}/{data?.token1?.symbol}
        </h5>

        <h5>
          {convertWeiToEther(data?.reserves?.reserve0,18)}/
          {convertWeiToEther(data?.reserves?.reserve1,18)}
        </h5>
      </div>
      <div className="box">
        <p className="uniq">Your Total Pool Token</p>
        <p>{(data?.userLiquidity / 10 ** 18)?.toFixed(2)}</p>
      </div>
      <div className="box">
        <p className="uniq">Pooled {data?.token0?.symbol}</p>
        <p>
          {isNaN(data?.token0?.pooledShare.toFixed(2))
            ? "0"
            : data?.token0?.pooledShare.toFixed(2)}
        </p>
      </div>
      <div className="box">
        <p className="uniq">Pooled {data?.token1?.symbol}</p>
        <p>
          {isNaN(data?.token1?.pooledShare.toFixed(2))
            ? "0"
            : data?.token1?.pooledShare.toFixed(2)}
        </p>
      </div>
      <div className="box">
        <p className="uniq">Your pool share</p>
        <p>
          {isNaN(data?.userShare.toFixed(2)) ? "0" : data?.userShare.toFixed(2)}%
        </p>
      </div>

      <div className="pool__more-btns btnBox">
        <button
          className="button bordered"
          onClick={() => {
            setSelectedLiquidity(data);
            addInExistingPair(data);
          }}
        >
          Add
        </button>
        {data?.userLiquidity > 0 && (
          <button
            className="button light"
            onClick={() => {
              setSelectedLiquidity(data);
              openModal("remove");
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ExistingPools;
