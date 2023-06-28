import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../../Base/Layout";
import { copyIcon, tick } from "../../Base/SVG";
import useMetaMask from "../../utils/useMetaMask";
import { GateInputComponent } from "../DepositFarming/GateInputComponent";
import {
  checkReferralQualification,
  getReferalData,
  stake,
  withdraw,
  approveNFTTransfer,
  approveToken,
} from "../../utils/helpers/ReferalHelper";
import { convertWeiToEther } from "../../utils/convertToBN";
import { toast } from "react-toastify";
import { baseUrl, sasAddress } from "../../config";
import useCustomToast from "../../utils/useToast";
export default function Referral() {
  const [referalData, setReferalData] = useState({});
  const [sasNft, setSasNft] = useState({
    nftImage: "",
    nftGateWay: "",
    link: "",
    id: "",
  });
  const [checkQualification, setCheckQualification] = useState(false);
  const [sasList, setSasList] = useState([]);
  const { account, isWanChain } = useMetaMask();
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [reload, setReload] = useState(0);
  const { showToast } = useCustomToast();

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(sasNft.link);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    let timeout;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 2000); // Reset after 2 seconds
    }
    return () => clearTimeout(timeout); // Clear timeout if the component is unmounted
  }, [copied]);

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
    const fetchData = async () => {
      if (!!account) {
        await fetchNftsData(account);

        const referalData = await getReferalData(account);
        setReferalData(referalData);
        console.log(referalData);

        const result = await checkReferralQualification(account);
        setCheckQualification(result?._qualification);
        if (result?._qualification) {
          const referralLink = generateLink();
          setSasNft({ ...sasNft, link: referralLink });
        }
      }
    };
    fetchData();
  }, [account, reload]);

  const updateSasNft = (data) => {
    setSasNft((prevValue) => ({ ...prevValue, ...data }));
  };

  const lazyDummy = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  useEffect(() => {
    lazyDummy();
  }, []);
  const onWidthdraw = async () => {
    try {
      await toast.promise(withdraw(account), {
        pending: "Widthrawing...",
        success: "Withdraw successfully!",
        error: "Withdraw failed!",
      });
      setCheckQualification(false);
      setReload((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      setReload((prev) => prev + 1);
    }
  };
  const onStake = async () => {
    try {
      if (referalData?.requiredRexTokens > referalData?.userRexToken) {
        return showToast("You don't have enough rex tokens.", "error");
      }
      if (!sasNft.id) {
        return showToast("Please select Sas Nft", "error");
      }
      await toast.promise(
        approveToken(referalData?.requiredRexTokens, account),
        {
          pending: "Approving rex token...",
          success: "Rex token successfully Approved!",
          error: "Approved failed!",
        }
      );

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
      await toast.promise(stake(sasNft.id, account), {
        pending: "Staking...",
        success: "Staked successfully!",
        error: "Staking failed!",
      });
      const referralLink = generateLink();
      setSasNft({ ...sasNft, link: referralLink });
      setCheckQualification(true);

      setReload((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      setReload((prev) => prev + 1);
    }
  };
  const generateLink = () => {
    let base64EncodedWalletAddress = btoa(account);
    return `${baseUrl}/?referrer=${base64EncodedWalletAddress}`;
  };

  console.log("referalData", referalData);

  return (
    <Layout>
      {isLoading ? (
        <div className="referral">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, x: -40 }}
          >
            Referral/Staking
          </motion.h2>
          <div className="referralItem">
            <h5 className="placeholder"></h5>
            {/* <div className="holdInput__outer">
              <h5 className="placeholder"></h5>
              <div className="holdInput placeholder"></div>
            </div> */}
            {/* <div className="holdInput__outer">
              <h5 className="placeholder"></h5>
              <div className="holdInput placeholder"></div>
            </div> */}
            <div className="referralInput__outer">
              <h5 className="placeholder"></h5>
              <div className="referralInput__row">
                <div className="referralInput placeholder"></div>
                <button type="button" className="button placeholder"></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="referral">
          <h2>Referral/Staking</h2>
          <div className="referralItem">
            <h5
              className="uniq"
              style={{ textAlign: "center", fontWeight: "normal" }}
            >
              Your referral link will earn{" "}
              <span style={{ fontSize: 24, fontWeight: "bold" }}>
                {convertWeiToEther(
                  referalData?.referrerRewardPercentage,
                  18,
                  false
                ) * 100}
                %
              </span>{" "}
              of your referral's farming earnings and give your referee a{" "}
              <span style={{ fontSize: 24, fontWeight: "bold" }}>
                {convertWeiToEther(
                  referalData?.refereeRewardPercentage,
                  18,
                  false
                ) * 100}
                %
              </span>{" "}
              boost on farming.
            </h5>
            {/* <div className="holdInput__outer">
              <h5>My Holdings</h5>
              <div className="holdInput">
                <img
                  src={process.env.PUBLIC_URL + "/images/icons/rexHead.png"}
                  alt="icon"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={sasNft.holding}
                  onChange={onChangeInput("holding")}
                />
                <span>$REX</span>
              </div>
            </div> */}

            <div className="crypto smallBox" style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 className="uniq" style={{ marginBottom: 5 }}>
                  Required Tokens{" "}
                </h5>
                <p>
                  {Number(
                    convertWeiToEther(referalData?.requiredRexTokens, 18)
                  ).toLocaleString()}{" "}
                  REX
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 className="uniq" style={{ marginBottom: 5 }}>
                  User Tokens
                </h5>
                <p>
                  {Number(
                    convertWeiToEther(referalData?.userRexToken, 18)
                  ).toLocaleString()}{" "}
                  REX
                </p>
              </div>
            </div>

            {!checkQualification && (
              <div>
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
            )}
            <div className="referralInput__outer">
              <h5>Referral link</h5>
              <div className="referralInput__row">
                <div className="referralInput">
                  <input
                    disabled
                    type="text"
                    placeholder="Stake to get your referral link"
                    value={sasNft.link}
                  />
                  {!!sasNft.link && (
                    <span onClick={handleCopyClick}>
                      {copied ? tick : copyIcon}
                    </span>
                  )}
                </div>
                {checkQualification ? (
                  <button
                    type="button"
                    className="button light"
                    disabled={!isWanChain}
                    onClick={onWidthdraw}
                  >
                    Withdraw
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button light"
                    onClick={onStake}
                    disabled={
                      !isWanChain ||
                      Number(
                        convertWeiToEther(referalData?.requiredRexTokens, 18)
                      ) >
                        Number(convertWeiToEther(referalData?.userRexToken, 18))
                    }
                  >
                    Stake
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
