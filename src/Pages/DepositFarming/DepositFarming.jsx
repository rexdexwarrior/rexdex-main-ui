import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../../Base/Layout";
import { GateInputComponent } from "./GateInputComponent";
import {
  deposit,
  approveToken,
  withdraw,
  approveNFTTransfer,
  getPendingRewards,
  getSasBoosting,
  getZooBoosting,
  getNFTInfo,
} from "../../utils/helpers/FarmingContractHelper";
import { useLocation, useNavigate } from "react-router-dom";
import useMetaMask from "../../utils/useMetaMask";
import { toast } from "react-toastify";
import { convertWeiToEther, converter } from "../../utils/convertToBN";
import { sasAddress, zooAddress } from "../../config";
import { getTokenBalances } from "../../utils/helpers/SwapContractHelper";
import Web3 from "web3";

export default function DepositFarming() {
  const web3 = new Web3(window.ethereum);

  const {
    props: {
      lpToken,
      decimals,
      userStaked,
      userStakedSASId,
      userStakedZooBoosterId,
      poolId,
      totalSupply,
      symbol,
    },
  } = useLocation().state;
  const navigate = useNavigate();
  const { account } = useMetaMask();
  const [isLoading, setIsLoading] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState(0);
  const [withdrawAmout, setWithdrawAmout] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [balance, setBalance] = useState(0);

  const [sasNft, setSasNft] = useState({
    nftImage: "",
    nftGateWay: "",
    id: "",
    boosting: "",
  });
  const [zooNft, setZooNft] = useState({
    nftImage: "",
    nftGateWay: "",
    id: "",
    boosting: "",
  });

  const [sasList, setSasList] = useState([]);
  const [zooList, setZooList] = useState([]);

  const [stakedSASNft, setStakedSASNft] = useState({
    nftImage: "",
    nftGateWay: "",
    id: "",
    boosting: "",
  });
  const [stakedZOONft, setStakedZOONft] = useState({
    nftImage: "",
    nftGateWay: "",
    id: "",
    boosting: "",
  });

  // Set staked SAS and ZOO Default //
  useEffect(() => {
    //alert(userStakedSASId)
    if (userStaked > 0 && Number(userStakedSASId) > 0) {
      // SET SAS //
      getNFTInfo(userStakedSASId, sasAddress).then(async (res) => {
        //console.log('my SAS', res);
        let response = await fetch(res);
        let mySasJson = await response.json();
        //console.log("mySasJson", mySasJson);

        let boosting = await getSasBoosting(userStakedSASId);

        //console.log("zoo boosting", boosting);

        if (boosting > 0) {
          boosting = boosting / 1e12;
          boosting -= 1;
          boosting *= 100;
          boosting = boosting.toFixed(2).toString() + "%";
        }

        setStakedSASNft({
          nftImage: mySasJson.image,
          nftGateWay: mySasJson.name,
          id: userStakedSASId,
          boosting: boosting,
        });
      });
    }

    if (userStaked > 0 && Number(userStakedZooBoosterId) > 0) {
      // SET ZOO //
      getNFTInfo(userStakedZooBoosterId, zooAddress).then(async (res) => {
        //console.log('my ZOO', res);
        let response = await fetch(res);
        let myZooJson = await response.json();
        //console.log("myZOOToken", mySasJson);

        let boosting = await getZooBoosting(userStakedZooBoosterId);

        //console.log("zoo boosting", boosting);

        if (boosting > 0) {
          boosting = boosting / 1e12;
          boosting -= 1;
          boosting *= 100;
          boosting = boosting.toFixed(2).toString() + "%";
        }

        setStakedZOONft({
          nftImage: myZooJson.image,
          nftGateWay: myZooJson.name,
          id: userStakedSASId,
          boosting: boosting,
        });
      });
    }
  }, [userStaked, userStakedSASId, userStakedZooBoosterId]);

  useEffect(() => {
    if (account) {
      const fetchRewards = async () => {
        try {
          const reward = await getPendingRewards(poolId, account);
          setPendingReward(reward);

          let bal = await getTokenBalances(lpToken, account);

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

  const updateSasNft = async (data) => {
    let boosting = await getSasBoosting(data?.id);
    if (boosting > 0) {
      boosting = boosting / 1e12;
      boosting -= 1;
      boosting *= 100;
      boosting = boosting.toFixed(2).toString() + "%";
    }
    setSasNft((prevValue) => ({ ...prevValue, boosting, ...data }));
  };

  const updateZooNft = async (data) => {
    let boosting = await getZooBoosting(data?.id);

    console.log("zoo boosting", boosting);

    if (boosting > 0) {
      boosting = boosting / 1e12;
      boosting -= 1;
      boosting *= 100;
      boosting = boosting.toFixed(2).toString() + "%";
    }
    setZooNft((prevValue) => ({ ...prevValue, boosting, ...data }));
  };

  const lazyDummy = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  useEffect(() => {
    lazyDummy();
  }, []);

  const fetchNftsData = async (acc) => {
    try {
      const response = await fetch(
        `https://nfts.rexdex.finance/api/sas/${acc}`
      );
      const data = await response.json();
      const fetchPromises = [];
      const keys = ["SAS", "ZOO"];

      for (const key of keys) {
        for (const nft of data[key]) {
          fetchPromises.push(fetch(nft.uri));
        }
      }
      const uriResponses = await Promise.all(fetchPromises);
      const uriDataPromises = uriResponses.map((response) => response.json());
      const uriDatas = await Promise.all(uriDataPromises);
      let index = 0;
      const newData = {};
      for (const key of keys) {
        newData[key] = data[key].map((nft) => {
          const uriData = uriDatas[index++];
          return {
            id: nft.tokenId,
            image:
              uriData.image + "?img-quality=60&img-format=auto&img-width=100",
            gateWay: uriData.name,
          };
        });
      }

      newData.SAS.sort((a, b) => (a.id > b.id ? 1 : -1));

      setSasList(newData.SAS);
      setZooList(newData.ZOO);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!!account) {
      fetchNftsData(account);
    }
  }, [account]);

  const onDeposit = async () => {
    try {
      const amount = converter(liquidityAmount, decimals);

      await toast.promise(approveToken(lpToken, amount, account), {
        pending: "Approving token...",
        success: "Token approved!",
        error: "Token approval failed!",
      });
      if (!!sasNft.id) {
        await toast.promise(
          approveNFTTransfer(account, sasNft.id, sasAddress),
          {
            pending: "Approving sas nft...",
            success: "Successfully approved!",
            error: "Approved failed!",
          }
        );
      }
      if (!!zooNft.id) {
        await toast.promise(
          approveNFTTransfer(account, zooNft.id, zooAddress),
          {
            pending: "Approving zoo nft...",
            success: "Successfully approved!",
            error: "Approved failed!",
          }
        );
      }
      const sasToken = sasNft.id ? sasNft.id : "0";
      const zooToken = zooNft.id ? zooNft.id : "0";
      const referrerAddress = localStorage.getItem("referrerAddress");
      await toast.promise(
        deposit(poolId, amount, sasToken, zooToken, account, referrerAddress),
        {
          pending: "Depositing...",
          success: "Deposit successfully!",
          error: "Deposit failed!",
        }
      );
      navigate(`/farming`);
    } catch (error) {
      console.log(error);
    }
  };

  const onHarvest = async () => {
    try {
      const amount = converter(0, decimals);
      /*       await toast.promise(approveToken(lpToken, amount, account), {
        pending: "Approving token...",
        success: "Token approved!",
        error: "Token approval failed!",
      }); */

      await toast.promise(withdraw(poolId, amount, account), {
        pending: "Harvesting...",
        success: "Harvesting successfully!",
        error: "Harvesting failed!",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onWithdaw = async () => {
    try {
      const amount = converter(withdrawAmout, decimals);
      /*       await toast.promise(approveToken(lpToken, amount, account), {
        pending: "Approving token...",
        success: "Token approved!",
        error: "Token approval failed!",
      }); */

      await toast.promise(withdraw(poolId, amount, account), {
        pending: "Withdrawing...",
        success: "Withdraw successfully!",
        error: "Withdraw failed!",
      });

      navigate(`/farming`);
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
                      <h5>Your Deposit</h5>
                      <p>{`${convertWeiToEther(
                        userStaked,
                        decimals,
                        false
                      )} ${symbol}`}</p>
                      <p></p>
                    </>
                  ) : (
                    <>
                      <h5>Total deposits</h5>
                      <p>{`${Number(
                        convertWeiToEther(totalSupply, decimals, false)
                      ).toLocaleString()} ${symbol}`}</p>
                    </>
                  )}
                </div>
                <div className="crypto smallBox">
                  <h5>Pending Rewards</h5>
                  <p>{`${convertWeiToEther(
                    pendingReward?.toString(),
                    decimals
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
              <h5>Your Liquidity Deposit</h5>
              <div className="holdInput">
                <img
                  src={process.env.PUBLIC_URL + "/images/icons/rexHead.png"}
                  alt="icon"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={liquidityAmount}
                  onChange={(e) => setLiquidityAmount(e.target.value)}
                />
                <span>RexLP</span>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    cursor: "pointer",
                    marginTop: 5,
                  }}
                  onClick={() =>
                    setLiquidityAmount(
                      convertWeiToEther(balance, decimals, false)
                    )
                  }
                >
                  Balance: {convertWeiToEther(balance, decimals, false)} RexLP [
                  <a style={{ color: "#04f9f4" }}>MAX</a>]
                </p>
              </div>
            </div>
            <div>
              <span
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h5>SAS - NFT</h5>
                {sasNft.boosting ? (
                  <p>{`SAS Boosting: ${sasNft.boosting}`}</p>
                ) : null}

                {stakedSASNft.boosting ? (
                  <p>{`SAS Boosting: ${stakedSASNft.boosting}`}</p>
                ) : null}
              </span>
              <GateInputComponent
                placeholder="Select SAS Nft"
                initialValue={stakedSASNft?.nftGateWay ?? sasNft.nftGateWay}
                defaultImage={stakedSASNft?.nftImage ?? sasNft.nftImage}
                nftName="SAS"
                onValueChange={(value) => {
                  setStakedSASNft({});
                  updateSasNft({
                    nftImage: value.image,
                    nftGateWay: value.gateWay,
                    id: value.id,
                  });
                }}
                list={sasList}
                optionClickHandler={(item) => {
                  setStakedSASNft({});
                  updateSasNft({
                    nftImage: item.image,
                    nftGateWay: item.gateWay,
                    id: item.id,
                  });
                }}
              />
            </div>

            <div>
              <span
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h5>ZOO Boosters - NFT</h5>
                {zooNft.boosting ? (
                  <p>{`Zoo Boosting: ${zooNft.boosting}`}</p>
                ) : null}

                {stakedZOONft.boosting ? (
                  <p>{`Zoo Boosting: ${stakedZOONft.boosting}`}</p>
                ) : null}
              </span>

              <GateInputComponent
                placeholder="Select Zoo Nft"
                initialValue={stakedZOONft?.nftGateWay ?? zooNft.nftGateWay}
                defaultImage={stakedZOONft?.nftImage ?? zooNft.nftImage}
                nftName="ZOO"
                onValueChange={(value) => {
                  setStakedZOONft({});
                  updateZooNft({
                    nftImage: value.image,
                    id: value.id,
                    nftGateWay: value.gateWay,
                  });
                }}
                list={zooList}
                optionClickHandler={(item) => {
                  setStakedZOONft({});
                  updateZooNft({
                    nftImage: item.image,
                    id: item.id,
                    nftGateWay: item.gateWay,
                  });
                }}
              />
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
                      convertWeiToEther(userStaked, decimals, false)
                    )
                  }
                >
                  Balance: {convertWeiToEther(userStaked, decimals, false)}{" "}
                  RexLP [<a style={{ color: "#04f9f4" }}>MAX</a>]
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
