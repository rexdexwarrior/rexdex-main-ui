import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../utils/convertToBN";
import BigNumber from "bignumber.js";
import useMetaMask from "../utils/useMetaMask";
export default function Crypto(props) {
  const navigate = useNavigate();
  const { account, connectWallet } = useMetaMask();
  const YEARLY_RATE = 128;
  const getBoostPercent = (boosting, showPercent = true) => {
    if (boosting > 0) {
      boosting = boosting / 1e12;
      boosting -= 1;
      boosting *= 100;
      boosting = boosting.toFixed(2).toString() + (showPercent ? "%" : 0);
      return boosting;
    }
    return boosting;
  };

  console.log("Boosting", props?.userBoosting);

  const getUserSharePercent = (props) => {
    if (props?.userStaked === "0") return 0;

    let sharePercent = BigNumber(
      convertWeiToEther(props?.userStaked, props?.decimals)
    ).div(
      BigNumber(
        convertWeiToEther(props?.totalSupply, props?.decimals)
      ).multipliedBy(100)
    );

    return Number(sharePercent.toString()).toFixed(2);
  };

  const getUserRate = (props) => {
    if (props?.userStaked === "0") return 0;

    let shareRatio = BigNumber(
      convertWeiToEther(props?.userStaked, props?.decimals)
    ).div(BigNumber(convertWeiToEther(props?.totalSupply, props?.decimals)));
    let sharePerSec = BigNumber(
      convertWeiToEther(props?.poolRate?.toString(), props?.decimals, false)
    ).multipliedBy(BigNumber(props?.allocPoint).div(BigNumber(props?.totalAllocPoint))).multipliedBy(YEARLY_RATE);


    console.log('sharePerSec',sharePerSec.toString())

    let boostShareAmountPerSec = sharePerSec.multipliedBy(
      BigNumber(getBoostPercent(props?.userBoosting, false)).div(100)
    );

    let boostShareAmount = shareRatio
      .multipliedBy(boostShareAmountPerSec)
      .multipliedBy(86400);

    let myRealSharePerDay = shareRatio
      .multipliedBy(sharePerSec)
      .multipliedBy(86400)
      .plus(boostShareAmount);

    //console.log('shareRatio',Number(myRealSharePerDay.toString()).toFixed(6))
    return Number(myRealSharePerDay.toString()).toFixed(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: 20 }}
      className="crypto"
      style={props?.userStaked > 0 ? { border: '5px dashed #04f9f4' } : {}}
    >
      <div className="crypto__row" >
        <div
          className="crypto__name"
          
        >
          <h5 style={{ display: "flex", alignItems: "center" }}>
            {
              console.log('props', props)
            }
          <img className="icon" src={`http://assets.rexdex.finance/tokens/${props?.address0?.toLowerCase()}.png`}/>{props?.symbol0} / <img className="icon" src={`http://assets.rexdex.finance/tokens/${props?.address1?.toLowerCase()}.png`}/>{props?.symbol1}{" "}
            <span className="badge">{props?.Multiplier}x</span>
          </h5>
        </div>
        {account ? (
          <>
            <button
              onClick={() => navigate(`/deposit-farming`, { state: { props } })}
              className="button depos"
            >
              {props.userStaked > 0 ? "Deposit / Withdraw" : "Deposit"}
            </button>
          </>
        ) : (
          <>
           <button
              onClick={() => connectWallet()}
              className="button depos"
            >
              Connect Wallet
            </button>
          </>
        )}
      </div>
      <div
        className="crypto__row"
       
      >
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
      <div
        className="crypto__row"
        
      >
        <p className="uniq">Pool Rate</p>
        <p>{`${Number(
          convertWeiToEther(props?.poolRate?.toString(), props?.decimals) *
            86400 * (Number(props?.allocPoint) / Number(props?.totalAllocPoint)) * YEARLY_RATE
        ).toLocaleString()} REX / Days `}</p>
      </div>

      {props.userStaked > 0 && (
        <>
          <hr />

          <div className="crypto__row">
            <p className="uniq">User Boosting Rate</p>
            <p>{`${getBoostPercent(props?.userBoosting)}`}</p>
          </div>

          <div className="crypto__row">
            <p className="uniq">Your deposited</p>
            <div className="crypto__more">
              <p>
                {Number(
                  convertWeiToEther(
                    props?.userStaked?.toString(),
                    props?.decimals
                  )
                ).toLocaleString()}{" "}
                {props?.symbol} ({getUserSharePercent(props)}%)
              </p>
            </div>
          </div>
          <div className="crypto__row">
            <p className="uniq">Estimated REX reward</p>
            <div className="crypto__more">
              <p>{getUserRate(props)} REX / Day</p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
