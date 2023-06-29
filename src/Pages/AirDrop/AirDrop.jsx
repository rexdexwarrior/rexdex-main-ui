import React, { useEffect, useState } from "react";
import Layout from "../../Base/Layout";
import { motion } from "framer-motion";
import {
  batchClaim,
  claimTokens,
  getPendingReward,
} from "../../utils/helpers/AirDropHelper";
import useMetaMask from "../../utils/useMetaMask";
import { GateInputComponent } from "../DepositFarming/GateInputComponent";
import { convertWeiToEther, converter } from "../../utils/convertToBN";
import { toast } from "react-toastify";

export default function AirDrop() {
  const [sasNft, setSasNft] = useState({
    nftImage: "",
    nftGateWay: "",
    link: "",
    id: "",
  });
  const [pendingReward, setPendingReward] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { account, isWanChain, connectWallet } = useMetaMask();
  const [sasList, setSasList] = useState([]);

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
      setSasNft({
        ...sasNft,
        nftImage: newData.SAS[0].image,
        nftGateWay: newData.SAS[0].gateWay,
        id: newData.SAS[0].id,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!!account) {
      fetchNftsData(account);
    }
  }, [account]);

  useEffect(() => {
    if (sasNft.id) {
      fetchPendingReward();
    }
  }, [sasNft.id]);

  const lazyDummy = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  useEffect(() => {
    lazyDummy();
  }, []);

  const fetchPendingReward = async () => {
    const pendingReward = await getPendingReward(sasNft.id);
    setPendingReward(pendingReward);
    console.log(pendingReward);
  };

  useEffect(() => {
    if (sasNft.id && isWanChain) {
      const interval = setInterval(async () => {
        fetchPendingReward();
      }, 5000); //5 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [sasNft.id, isWanChain]);

  const updateSasNft = (data) => {
    setSasNft((prevValue) => ({ ...prevValue, ...data }));
  };

  const batchClaimBtn = async () => {
    try {
      if (isWanChain) {
        await toast.promise(
          batchClaim(
            account,
            sasList.map((x) => x.id)
          ),
          {
            pending: "Claiming rewards...",
            success: "Claimed successfully!",
            error: "Batch claimed failed!",
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const claimReward = async () => {
    try {
      if (isWanChain) {
        await toast.promise(claimTokens(account, sasNft.id), {
          pending: "Claiming rewards...",
          success: "Claimed successfully!",
          error: "Claimed failed!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="air">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, x: -40 }}
          >
            Air Drop
          </motion.h2>

          <div className="airItem">
            <div className="airItem__header ">
              <h5 className="placeholder"></h5>
            </div>
            <div className="airItem__body ">
              <p className="placeholder"></p>
            </div>
          </div>
          <p className="placeholder"></p>
          <div className="air__btn">
            <button className="button placeholder"></button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, y: 20 }}
          className="air"
        >
          <h2>Air Drop</h2>
          <div className="airItem" style={!account ? { opacity: 0.5 } : {}} disabled={true}>
            <div className="airItem__header">
              <h5 className="uniq">Select Nft to claim rewards</h5>
            </div>
            <div className="airItem__body">
              <div>
                <h5 className="uniq">Sas Nft</h5>

                <GateInputComponent
                  placeholder="Select Sas Nft"
                  initialValue={sasNft.nftGateWay}
                  nftName="SAS"
                  onValueChange={(value) => {
                    updateSasNft({
                      nftImage: value.image,
                      nftGateWay: value.gateWay,
                      id: value.id,
                    });
                  }}
                  list={sasList}
                  optionClickHandler={(item) => {
                    updateSasNft({
                      nftImage: item.image,
                      nftGateWay: item.gateWay,
                      id: item.id,
                    });
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <h5 className="uniq">Pending Rewards</h5>
                <p>{convertWeiToEther(pendingReward, 18)} REX</p>
              </div>
            </div>
          </div>
          <p className="big">
            40% tokens will be claimed immediately and 60% will accumulate over
            time. 60% will be released daily over a 12-month vesting period.
          </p>
          {account ? (
            <div className="air__btn">
              <button
                style={{ marginRight: "4px" }}
                className="button light"
                onClick={claimReward}
                disabled={pendingReward <= 0}
              >
                Claim now
              </button>

              <button
                className="button light"
                onClick={batchClaimBtn}
                disabled={pendingReward <= 0}
              >
                Batch claim
              </button>
            </div>
          ) : (
            <div className="air__btn">
              <button
                style={{ marginRight: "4px" }}
                className="button light"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </motion.div>
      )}
    </Layout>
  );
}
