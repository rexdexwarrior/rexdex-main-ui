import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../../Base/Layout";
import {
  approveToken,
  getPendingRewards,
  deposit,
  withdraw,
} from "../../utils/helpers/stakingContractHelper";
import { useLocation, useNavigate } from "react-router-dom";
import useMetaMask from "../../utils/useMetaMask";
import { toast } from "react-toastify";
import { convertWeiToEther, converter } from "../../utils/convertToBN";
import { getTokenBalances } from "../../utils/helpers/SwapContractHelper";
import Web3 from "web3";

export default function DepositStaking() {
  const {
    props: { lpToken, decimals, userStaked, poolId, symbol, currentSupply },
  } = useLocation().state;
  const navigate = useNavigate();
  const web3 = new Web3(window.ethereum);

  const { account } = useMetaMask();
  const [isLoading, setIsLoading] = useState(true);
  const [stakingAmount, setStakingAmount] = useState(0);
  const [withdrawAmout, setWithdrawAmout] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (account) {
      const fetchRewards = async () => {
        try {
          const reward = await getPendingRewards(poolId, account);
          setPendingReward(reward);
          let bal = await getTokenBalances(lpToken.contractAddress, account);
          setBalance(bal);
        } catch (error) {
          console.error("Error fetching pending rewards:", error);
        }
      };
      fetchRewards();

      const intervalId = setInterval(fetchRewards, 5000);
      return () => clearInterval(intervalId);
    }
  }, [account, poolId]);

  console.log(pendingReward);

  const lazyDummy = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  useEffect(() => {
    lazyDummy();
  }, []);

  const onDeposit = async () => {
    try {
      const amount = converter(stakingAmount, lpToken?.decimals);

      await toast.promise(
        approveToken(lpToken?.contractAddress, amount, account),
        {
          pending: "Approving token...",
          success: "Token approved!",
          error: "Token approval failed!",
        }
      );

      await toast.promise(deposit(poolId, amount, account), {
        pending: "Depositing...",
        success: "Deposit successfully!",
        error: "Deposit failed!",
      });
      navigate(`/staking`);
    } catch (error) {
      console.log(error);
    }
  };

  const onHarvest = async () => {
    try {
      const amount = converter(0, lpToken?.decimals);
      await toast.promise(withdraw(poolId, amount, account), {
        pending: "Harvesting...",
        success: "Harvesting successfully!",
        error: "Harvesting failed!",
      });
      // navigate(`/staking`);
    } catch (error) {
      console.log(error);
    }
  };
  const onWithdaw = async () => {
    try {
      const amount = converter(withdrawAmout, lpToken?.decimals);
      await toast.promise(withdraw(poolId, amount, account), {
        pending: "Withdrawing...",
        success: "Withdraw successfully!",
        error: "Withdraw failed!",
      });
      navigate(`/staking`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout>
      {isLoading ? (
        <div className="deposit">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, x: -40 }}
          >
            Deposit
          </motion.h2>
          <div className="depositItem">
            <h5 className="placeholder"></h5>
            <div className="holdInput__outer">
              <h5 className="placeholder"></h5>
              <div className="holdInput placeholder"></div>
            </div>
            <div className="holdInput__outer">
              <h5 className="placeholder"></h5>
              <div className="holdInput placeholder"></div>
            </div>
            <div className="depositButton">
              <div className="button placeholder"></div>
            </div>

            <div className="depositInput__outer">
              <h5 className="placeholder"></h5>
              <div className="depositInput__row">
                <div className="depositInput placeholder"></div>
                <button type="button" className="button placeholder"></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="deposit">
          <h2>Deposit</h2>
          <div className="depositItem">
            <h5 className="uniq">
              <div className="box">
                <div className="crypto smallBox">
                  {userStaked > 0 ? (
                    <>
                      <h5>Your Deposits</h5>
                      <p>{`${convertWeiToEther(
                        userStaked,
                        lpToken.decimals,
                        false
                      )} ${lpToken.symbol}`}</p>
                    </>
                  ) : (
                    <>
                      <h5>Total Pool Deposits</h5>
                      <p>{`${Number(
                        convertWeiToEther(currentSupply, lpToken.decimals)
                      ).toLocaleString()} ${lpToken?.symbol}`}</p>
                    </>
                  )}
                </div>
                <div className="crypto smallBox">
                  <h5>Pending Rewards</h5>
                  <p>{`${convertWeiToEther(
                    pendingReward,
                    lpToken.decimals,
                    false
                  )} REX`}</p>

                  <button
                    type="button"
                    className="button light"
                    style={{ height: 40, width: "100%" }}
                    onClick={onHarvest}
                  >
                    Harvest
                  </button>
                </div>
              </div>
            </h5>
            <div className="holdInput__outer">
              <h5>Your Deposit</h5>
              <div className="holdInput">
                <img
                  src={process.env.PUBLIC_URL + "/images/icons/rexHead.png"}
                  alt="icon"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                />
                <span>${lpToken.symbol}</span>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    cursor: "pointer",
                    marginTop: 5,
                  }}
                  onClick={() =>
                    setStakingAmount(
                      convertWeiToEther(balance, lpToken.decimals, false)
                    )
                  }
                >
                  Balance: {convertWeiToEther(balance, lpToken.decimals, false)}{" "}
                  REX
                </p>
              </div>
            </div>

            <div className="depositButton">
              <button
                type="button"
                className="button light"
                onClick={onDeposit}
              >
                Deposit Now
              </button>
            </div>
            {userStaked > 0 && (
              <div className="depositInput__outer">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h5>Withdraw {symbol}</h5>
                </div>
                <div className="depositInput__row">
                  <div className="depositInput">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmout}
                      onChange={(e) => setWithdrawAmout(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="button light"
                    onClick={onWithdaw}
                  >
                    Withdraw
                  </button>
                </div>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "start",
                    cursor: "pointer",
                    marginTop: 5,
                  }}
                  onClick={() =>
                    setWithdrawAmout(
                      convertWeiToEther(userStaked, lpToken.decimals, false)
                    )
                  }
                >
                  Balance:{" "}
                  {convertWeiToEther(userStaked, lpToken.decimals, false)} REX
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
