import React, { useEffect, useState } from "react";
import Layout from "../../Base/Layout";
import { motion } from "framer-motion";
import PoolList from "./PoolList";
import useMetaMask from "../../utils/useMetaMask";
import { getPools } from "../../utils/helpers/stakingContractHelper";

export default function Farm() {
  const { account,isWanChain } = useMetaMask();

  const [staked, setStaked] = useState(false);
  const [active, setActive] = useState(false);
  const [poolList, setPoolList] = useState([]);

  useEffect(() => {
    if (!!account && isWanChain) {
      fetchAllPools(account);
    }
  }, [account,isWanChain]);

  useEffect(() => {
if (isWanChain) {
  const interval = setInterval(async () => {
    if (!!account) {
      fetchAllPools(account);
    }
  }, 5000); // 5 seconds

  return () => {
    clearInterval(interval);
  };
}
  }, [account,isWanChain]);

  const fetchAllPools = async (account) => {
    if (!!account) {
      const pooolList = await getPools(account);
      setPoolList(pooolList);
    }
  };
  const stakedChange = () => {
    setStaked(!staked);
  };
  const activeChange = () => {
    setActive(!active);
  };
  const [isLoading, setIsLoading] = useState(true);
  const lazyDummy = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  useEffect(() => {
    lazyDummy();
  }, []);
  return (
    <Layout>
      {isLoading ? (
        <div className="farm">
          <motion.h2
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            exit={{ opacity: 0, x: -40 }}
          >
            Staking
          </motion.h2>
          <div className="crypto">
            <h5 className="placeholder"></h5>
            <p className="placeholder"></p>
            <p>
              <a href="" className="placeholder"></a>
            </p>
          </div>
          {/* <div className="farmItem">
            <div className="farmItem__header">
              <h5 className="placeholder"></h5>
            </div>
            <div className="farmItem__body">
              <div className="farmItem__row">
                <p className="placeholder"></p>
                <p className="placeholder"></p>
              </div>
            </div>
          </div> */}
          {/* <div className="search__row">
            <h5 className="placeholder"></h5>
            <div className="search placeholder"></div>
          </div> */}
          <div className="radio__row">
            <div className="radio placeholder"></div>
            <div className="radio placeholder"></div>
          </div>
          <div className="crypto">
            <div className="crypto__row">
              <div className="crypto__name placeholder"></div>
              <button className="button placeholder"></button>
            </div>
            <div className="crypto__row">
              <p className="placeholder"></p>
              <div className="crypto__more placeholder"></div>
            </div>
            <div className="crypto__row ">
              <p className="placeholder"></p>
              <p className="placeholder"></p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, y: 20 }}
          className="farm"
        >
          <h2>Staking</h2>
          <div className="crypto">
            <h5 className="uniq">Stake your REX</h5>
            <p>Stake your REX to get staking rewards.</p>
            {/* <p>
              <a href="">read more about REX staking</a>
            </p> */}
          </div>
          {/* <div className="farmItem">
            <div className="farmItem__header">
              <h5 className="uniq">TVL: $484,474 (In Farming)</h5>
            </div>
            <div className="farmItem__body">
              <div className="farmItem__row">
                <p>My Deposit : $0</p>
                <p>My Rate : 0 REX / week</p>
              </div>
            </div>
          </div> */}
          <div className="search__row">
            <h5>Participating pools</h5>
            {/* <div className="search">
              <input type="text" placeholder="Search Token" />
              <button type="button">{search}</button>
            </div> */}
          </div>
          {/* <div className="radio__row">
            <div className="radio">
              <p>Show Only Staked</p>
              <div className="radio__btns">
                <div className="radio__btn">
                  <input
                    checked={staked ? true : false}
                    type="radio"
                    name="staked"
                    onChange={stakedChange}
                  />
                  <label htmlFor="">On</label>
                </div>
                <div className="radio__btn">
                  <input
                    type="radio"
                    onChange={stakedChange}
                    name="staked"
                    checked={staked ? false : true}
                  />
                  <label htmlFor="">Off</label>
                </div>
              </div>
            </div>
            <div className="radio">
              <p>Show Only Active</p>
              <div className="radio__btns">
                <div className="radio__btn">
                  <input
                    checked={active ? true : false}
                    type="radio"
                    name="active"
                    onChange={activeChange}
                  />
                  <label htmlFor="">On</label>
                </div>
                <div className="radio__btn">
                  <input
                    type="radio"
                    onChange={activeChange}
                    name="active"
                    checked={active ? false : true}
                  />
                  <label htmlFor="">Off</label>
                </div>
              </div>
            </div>
          </div> */}
          {/* {poolList.map((item, index) => {
            return <Crypto {...item} key={index} />;
          })} */}

          {poolList && poolList?.length ? poolList.map((item, index) => {
            return <PoolList {...item} key={index} isWanChain={isWanChain} />;
          }):null}
        </motion.div>
      )}
    </Layout>
  );
}
