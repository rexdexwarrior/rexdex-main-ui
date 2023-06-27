import React from "react";
import { convertWeiToEther, converter } from "../../utils/convertToBN";
import { UniswapURL } from "../../config";
import { NavLink } from "react-router-dom";

const ExistingPools = ({
  data,
  openModal,
  setSelectedLiquidity,
  addInExistingPair,
}) => {
  return (
    <div className="crypto poolList">
      <div
        className="box "
        style={data?.userLiquidity <= 0 ? { opacity: 0.4 } : {}}
      >
        <h5 className="uniq">
          {data?.token0?.symbol}/{data?.token1?.symbol}
        </h5>

        <h5>
          {Number(convertWeiToEther(data?.reserves?.reserve0, 18)) > 0
            ? Number(
                convertWeiToEther(data?.reserves?.reserve0, 18)
              ).toLocaleString()
            : "-"}
          /
          {Number(convertWeiToEther(data?.reserves?.reserve1, 18)) > 0
            ? Number(
                convertWeiToEther(data?.reserves?.reserve1, 18)
              ).toLocaleString()
            : "-"}
        </h5>
      </div>

      {data?.userLiquidity > 0 && (
        <>
          <div className="box">
            <p className="uniq">Your Total Pool Token</p>
            <p>{(data?.userLiquidity / 10 ** 18)?.toFixed(2)}</p>
          </div>
          <div className="box">
            <p className="uniq">Your Pooled {data?.token0?.symbol}</p>
            <p>
              {isNaN(data?.token0?.pooledShare.toFixed(2))
                ? "0"
                : data?.token0?.pooledShare.toFixed(2)}
            </p>
          </div>
          <div className="box">
            <p className="uniq">Your Pooled {data?.token1?.symbol}</p>
            <p>
              {isNaN(data?.token1?.pooledShare.toFixed(2))
                ? "0"
                : data?.token1?.pooledShare.toFixed(2)}
            </p>
          </div>
          <div className="box">
            <p className="uniq">Your pool share</p>
            <p>
              {isNaN(data?.userShare.toFixed(2))
                ? "0"
                : data?.userShare.toFixed(2)}
              %
            </p>
          </div>
        </>
      )}

      <div className="pool__more-btns btnBox">
        {/* <button
          className="button bordered"
          onClick={() => {
            setSelectedLiquidity(data);
            addInExistingPair(data);
          }}
        >
          Add
        </button> */}

        <NavLink
          target="_blank"
          to={`${UniswapURL}#/add/${data?.token0?.address}/${data?.token1?.address}`}
          className="button bordered"
        >
          Add
        </NavLink>
        {data?.userLiquidity > 0 && (
          <NavLink
            target="_blank"
            to={`${UniswapURL}#/remove/${data?.token0?.address}/${data?.token1?.address}`}
            className="button light"
          >
            Remove
          </NavLink>
          // <button
          //   className="button light"
          //   onClick={() => {
          //     setSelectedLiquidity(data);
          //     openModal("remove");
          //   }}
          // >
          //   Remove
          // </button>
        )}
      </div>
    </div>
  );
};

export default ExistingPools;
