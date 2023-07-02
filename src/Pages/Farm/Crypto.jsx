import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../../utils/convertToBN";
import BigNumber from "bignumber.js";
import useMetaMask from "../../utils/useMetaMask";
export default function Crypto(props) {
  const navigate = useNavigate();
  const { account, connectWallet } = useMetaMask();
  const [lpPrice, setLpPrice] = useState(0);
  const YEAR = useMemo(() => {
    let now = new Date().getTime() / 1000;
    let year = Math.floor((now - props?.startTime) / (365 * 86400));
    function ordinal_suffix_of(i) {
      var j = i % 10,
        k = i % 100;
      if (j == 1 && k != 11) {
        return i + "st";
      }
      if (j == 2 && k != 12) {
        return i + "nd";
      }
      if (j == 3 && k != 13) {
        return i + "rd";
      }
      return i + "th";
    }
    return ordinal_suffix_of(year + 1);
  });
  const YEARLY_RATE = useMemo(() => {
    let now = new Date().getTime() / 1000;
    let year = Math.floor((now - props?.startTime) / (365 * 86400));
    //console.log('year', props?.startTime)
    switch (year) {
      case 0:
        return 128;
      case 1:
        return 64;
      case 2:
        return 32;
      case 3:
        return 16;
      case 4:
        return 8;
      case 5:
        return 4;
      case 6:
        return 2;
      case 7:
        return 1;
      default:
        return 1;
    }
  });
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

  //console.log("Boosting", props);

  const getUserSharePercent = (props) => {
    if (props?.userStaked === "0") return 0;

    let sharePercent = BigNumber(
      convertWeiToEther(props?.userStaked, props?.decimals, false)
    )
      .div(
        BigNumber(convertWeiToEther(props?.totalSupply, props?.decimals, false))
      )
      .multipliedBy(100);

    return Number(sharePercent.toString()).toFixed(2);
  };

  const getUserRate = (props) => {
    if (props?.userStaked === "0") return 0;

    let shareRatio = BigNumber(
      convertWeiToEther(props?.userStaked, props?.decimals, false)
    ).div(
      BigNumber(convertWeiToEther(props?.totalSupply, props?.decimals, false))
    );
    let sharePerSec = BigNumber(
      convertWeiToEther(props?.poolRate?.toString(), props?.decimals, false)
    )
      .multipliedBy(
        BigNumber(props?.allocPoint).div(BigNumber(props?.totalAllocPoint))
      )
      .multipliedBy(YEARLY_RATE);

    //console.log('sharePerSec',sharePerSec.toString())

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

  const getLPPrice = (props) => {
    let PoolLP = props?.LPPriceList?.filter((item) => {
      return item?.id === props?.lpToken.toLowerCase();
    });
    return PoolLP[0].reserveUSD / PoolLP[0].totalSupply;
  };

  const getAPR = (props) => {
    //console.log('PoolLP',PoolLP[0])

    // REX PER YEAR //
    let rewardPerYear =
      convertWeiToEther(props?.poolRate?.toString(), props?.decimals, false) *
      (86400 * 365) *
      (Number(props?.allocPoint) / Number(props?.totalAllocPoint)) *
      YEARLY_RATE;

    // console.log(
    //   "rewardPerYear",
    //   rewardPerYear,
    //   Number(convertWeiToEther(props?.totalSupply, props?.decimals, false))
    // );

    // LP PRICE //
    let lpPrice = getLPPrice(props);
    //setLpPrice(lpPrice);

    // APR //
    let apr =
      ((rewardPerYear * props?.rexPrice) /
        (Number(convertWeiToEther(props?.totalSupply, props?.decimals, false)) *
          lpPrice)) *
      100;

    return apr.toFixed(2) + "%";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: 20 }}
      className="crypto"
      style={props?.userStaked > 0 ? { border: "3px dashed #04f9f4" } : {}}
    >
      <div className="crypto__row responsive_row">
        <div className="crypto__name">
          <h5 style={{ display: "flex", alignItems: "center" }}>
            <img
              className="icon"
              src={`http://assets.rexdex.finance/tokens/${props?.address0?.toLowerCase()}.png`}
            />
            {props?.symbol0} /{" "}
            <img
              className="icon"
              src={`http://assets.rexdex.finance/tokens/${props?.address1?.toLowerCase()}.png`}
            />
            {props?.symbol1} <span className="badge">{props?.Multiplier}x</span>
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
            <button onClick={() => connectWallet()} className="button depos">
              Connect Wallet
            </button>
          </>
        )}
      </div>
      <div className="crypto__row responsive_row">
        <p className="uniq">Total deposited in RexLP</p>
        <div className="crypto__more">
          <p>
            {Number(
              convertWeiToEther(
                props?.totalSupply?.toString(),
                props?.decimals,
                false
              )
            ).toLocaleString("en-US", { maximumSignificantDigits: 6 })}{" "}
            {props?.symbol}
          </p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Total deposited in USD</p>
        <div className="crypto__more">
          <p>
            $
            {(
              getLPPrice(props) *
              convertWeiToEther(
                props?.totalSupply?.toString(),
                props?.decimals,
                false
              )
            )?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">{YEAR} Year based Multiplier</p>
        <p>{YEARLY_RATE}x</p>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Pool Rate</p>
        <p>{`${Number(
          convertWeiToEther(props?.poolRate?.toString(), props?.decimals) *
            86400 *
            (Number(props?.allocPoint) / Number(props?.totalAllocPoint)) *
            YEARLY_RATE
        ).toLocaleString()} REX / Days `}</p>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq" style={{ fontWeight: "bold", fontSize: 18 }}>
          Average APR
        </p>
        <p style={{ fontWeight: "bold", fontSize: 18 }}>{getAPR(props)}</p>
      </div>

      {props.userStaked > 0 && (
        <>
          <hr />

          <div className="crypto__row">
            <p className="uniq">User Boosting Rate</p>
            <p>+{`${getBoostPercent(props?.userBoosting)}`}</p>
          </div>

          <div className="crypto__row">
            <p className="uniq">Your deposit</p>
            <div className="crypto__more">
              <p>
                {Number(
                  convertWeiToEther(
                    props?.userStaked?.toString(),
                    props?.decimals,
                    false
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
