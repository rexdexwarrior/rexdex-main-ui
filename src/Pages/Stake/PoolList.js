import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../../utils/convertToBN";
import { timestampToHumanReadable } from "../../utils/date";
import BigNumber from "bignumber.js";
import useMetaMask from "../../utils/useMetaMask";

export default function PoolList(props) {
  const navigate = useNavigate();
  //console.log('props', props)
  const { account, connectWallet } = useMetaMask();

  const getUserSharePercent = (props) => {
    if (props?.userStaked === "0") return 0;

    let sharePercent = BigNumber(
      convertWeiToEther(props?.userStaked, props?.rewardToken?.decimals)
    ).div(BigNumber(convertWeiToEther(props?.currentSupply, props?.rewardToken?.decimals)).multipliedBy(100));


    return Number(sharePercent.toString()).toFixed(2);
  }

  const getUserRate = (props) => {
    if (props?.userStaked === "0") return 0;

    let shareRatio = BigNumber(
      convertWeiToEther(props?.userStaked, props?.rewardToken?.decimals)
    ).div(BigNumber(convertWeiToEther(props?.currentSupply, props?.rewardToken?.decimals)));
    let sharePerSec = BigNumber(
      convertWeiToEther(props?.rewardPerSecond?.toString(), props?.rewardToken?.decimals, false)
    )

    let myRealSharePerDay = shareRatio
      .multipliedBy(sharePerSec)
      .multipliedBy(86400);

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
      style={props?.userStaked > 0 ? { border: '3px dashed #04f9f4' } : {}}
    >
      <div className="crypto__row responsive_row">
        <div className="crypto__name">
          <h5 className="uniq">Stake {props?.lpToken?.name}</h5>
        </div>
        {
          account ? <button
            disabled={!props.isWanChain}
            onClick={() => navigate(`/deposit-staking`, { state: { props } })}
            className="button depos"
          >
            {props?.userStaked > 0 ? "Deposit / Withdraw" : " Deposit"}
          </button>
            :
            <>
              <button
                disabled={!props.isWanChain}
                onClick={() => connectWallet()}
                className="button depos"
              >
                Connect Wallet
              </button>
            </>
        }

      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Reward Token</p>
        <div className="crypto__more">
          <p>{props?.rewardToken?.name}</p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Total Pool Deposits</p>
        <div className="crypto__more">
          <p>{Number(convertWeiToEther(props?.currentSupply.toString(), props?.rewardToken?.decimals)).toLocaleString()}</p>
          <p>{props?.lpToken?.symbol}</p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Pool Rate</p>
        <div className="crypto__more">
          <p>{`${Number(
            convertWeiToEther(props?.rewardPerSecond?.toString(), props?.rewardToken?.decimals) * 86400
          ).toLocaleString()} ${props?.rewardToken?.symbol} / Days`}</p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Bonus Start</p>
        <div className="crypto__more">
          <p>{timestampToHumanReadable(props?.bonusStartTimestamp)}</p>
        </div>
      </div>

      <div className="crypto__row responsive_row">
        <p className="uniq">Bonus End</p>
        <div className="crypto__more">
          <p>{timestampToHumanReadable(props?.bonusEndTimestamp)}</p>
        </div>
      </div>


      {props?.userStaked > 0 && <>
        <hr />
        <div className="crypto__row responsive_row">
          <p className="uniq">Your deposit</p>
          <div className="crypto__more">
            <p>
              {Number(
                convertWeiToEther(
                  props?.userStaked?.toString(),
                  props?.rewardToken?.decimals
                )
              ).toLocaleString()} {props?.rewardToken?.symbol} ({getUserSharePercent(props)}%)
            </p>
          </div>
        </div>
        <div className="crypto__row responsive_row">
          <p className="uniq">Estimated {props?.rewardToken?.symbol} reward</p>
          <div className="crypto__more">
            <p>{getUserRate(props)} {props?.rewardToken?.symbol} / Day</p>
          </div>
        </div>
      </>
      }
    </motion.div>
  );
}
