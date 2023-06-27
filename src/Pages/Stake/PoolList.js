import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../../utils/convertToBN";
import { timestampToHumanReadable } from "../../utils/date";

export default function PoolList(props) {
  const navigate = useNavigate();

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
          <h5 className="uniq">Stake {props?.lpToken?.name}</h5>
        </div>
        <button
		disabled={!props.isWanChain}
          onClick={() => navigate(`/deposit-staking`, { state: { props } })}
          className="button depos"
        >
          {props?.userStaked > 0 ? "Deposit / Withdraw" : " Deposit"}
        </button>
      </div>

      <div className="crypto__row">
        <p className="uniq">Reward Token</p>
        <div className="crypto__more">
          <p>{props?.rewardToken?.name}</p>
        </div>
      </div>

      <div className="crypto__row">
        <p className="uniq">Total Pool Deposits</p>
        <div className="crypto__more">
          <p>{Number(convertWeiToEther(props?.currentSupply.toString(), 18)).toLocaleString()}</p>
          <p>{props?.lpToken?.symbol}</p>
        </div>
      </div>

      <div className="crypto__row">
        <p className="uniq">Bonus Start</p>
        <div className="crypto__more">
          <p>{timestampToHumanReadable(props?.bonusStartTimestamp)}</p>
        </div>
      </div>

      <div className="crypto__row">
        <p className="uniq">Bonus End</p>
        <div className="crypto__more">
          <p>{timestampToHumanReadable(props?.bonusEndTimestamp)}</p>
        </div>
      </div>
    </motion.div>
  );
}
