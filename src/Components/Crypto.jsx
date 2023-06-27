import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../utils/convertToBN";

export default function Crypto(props) {
  const navigate = useNavigate();

  const getBoostPercent = (boosting) => {
    if (boosting === '1000000000000') return '0%';
    if (boosting > 0) {
      boosting = boosting / 10e12;
      boosting = boosting > 1 ? (boosting - 1) * 100 : boosting * 100;
      boosting = boosting.toFixed(2).toString() + "%";
      return boosting
    }
    return boosting;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: 20 }}
      className="crypto"
    >
      <div className="crypto__row">
        <div className="crypto__name">
          <h5 style={{ display: "flex", alignItems: "center" }}>
            {props?.symbol0} / {props?.symbol1}{" "}
            <span className="badge">{props?.Multiplier}x</span>
          </h5>
        </div>
        <button
          onClick={() => navigate(`/deposit-farming`, { state: { props } })}
          className="button depos"
        >
          {props.userStaked > 0 ? "Deposit / Withdraw" : " Deposit"}
        </button>
      </div>
      <div className="crypto__row">
        <p className="uniq">Total deposited</p>
        <div className="crypto__more">
          <p>
            {Number(
              convertWeiToEther(props?.totalSupply?.toString(), props?.decimals)
            ).toLocaleString()}
          </p>
          <p>{props?.symbol}</p>
        </div>
      </div>
      <div className="crypto__row">
        <p className="uniq">Pool rate</p>
        <p>{`${Number(
          convertWeiToEther(props?.poolRate?.toString(), props?.decimals)
        ).toString()} REX / Second `}</p>
      </div>
      
      <hr/>

      {props?.userBoosting ? (
        <div className="crypto__row">
          <p className="uniq">User Boosting</p>
          <p>{`${getBoostPercent(props?.userBoosting)}`}</p>
        </div>
      ) : null}
      
      <div className="crypto__row">
        <p className="uniq">Your deposited</p>
        <div className="crypto__more">
          <p>
            {Number(
              convertWeiToEther(props?.userStaked?.toString(), props?.decimals)
            ).toLocaleString()}
          </p>
          <p>{props?.symbol}</p>
        </div>
      </div>
    </motion.div>
  );
}
