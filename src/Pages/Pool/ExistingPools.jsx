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

  //)
  return (
    <div className="crypto poolList" style={data?.userLiquidity > 0 ? { border: '5px dashed #04f9f4' } : {}}>
      <div
        className="box "
        
      >
        <h5 className="uniq">
          <img className="icon" src={`http://assets.rexdex.finance/tokens/${data?.token0?.address?.toLowerCase()}.png`}/>{data?.token0?.symbol} / <img  className="icon" src={`http://assets.rexdex.finance/tokens/${data?.token1?.address?.toLowerCase()}.png`}/>{data?.token1?.symbol}
        </h5>

        <h5>
          {Number(convertWeiToEther(data?.reserves?.reserve0, data?.token0?.decimals)) > 0
            ? Number(
                convertWeiToEther(data?.reserves?.reserve0, data?.token0?.decimals)
              ).toLocaleString()
            : "-"}
          /
          {Number(convertWeiToEther(data?.reserves?.reserve1, data?.token1?.decimals)) > 0
            ? Number(
                convertWeiToEther(data?.reserves?.reserve1, data?.token1?.decimals)
              ).toLocaleString()
            : "-"}
        </h5>
      </div>

      {data?.userLiquidity > 0 && (
        <>
          <div className="box">
            <p className="uniq">Your Total Pool Token</p>
            <p>{(data?.userLiquidity / 10 ** 18)}</p>
          </div>
          <div className="box">
            <p className="uniq">Your Pooled {data?.token0?.symbol}</p>
            <p>
              {isNaN(data?.token0?.pooledShare)
                ? "0"
                : data?.token0?.pooledShare}
            </p>
          </div>
          <div className="box">
            <p className="uniq">Your Pooled {data?.token1?.symbol}</p>
            <p>
              {isNaN(data?.token1?.pooledShare)
                ? "0"
                : data?.token1?.pooledShare}
            </p>
          </div>
          <div className="box">
            <p className="uniq">Your pool share</p>
            <p>
              {isNaN(data?.userShare)
                ? "0"
                : data?.userShare}
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
