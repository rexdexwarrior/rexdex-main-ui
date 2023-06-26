import React, { useEffect, useState } from "react";
import Layout from "../../Base/Layout";
import { motion } from "framer-motion";
import { time } from "../../Base/SVG";
import Token from "./Token";
import Nft from "./Nft";
import History from "./History";

export default function Bridge() {
  const [tab, setTab] = useState("nft");
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
        <div className="bridge--placeholder placeholder"></div>
      ) : (
        <div className="bridge">
          <div className="bridge__header">
            <button
              type="button"
              onClick={() => setTab("token")}
              className={
                "bridge__header-btn " + (tab === "token" ? "active" : "")
              }
            >
              {time} Token Crosschain
            </button>
            <button
              type="button"
              onClick={() => setTab("nft")}
              className={
                "bridge__header-btn " + (tab === "nft" ? "active" : "")
              }
            >
              {time} NFT Crosschain
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={
                "bridge__header-btn " + (tab === "history" ? "active" : "")
              }
            >
              {time} History
            </button>
          </div>
          <div className="bridge__body">
            {tab === "token" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
                className="bridge__body-inner"
              >
                <Token />
              </motion.div>
            )}

            {tab === "nft" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
                className="bridge__body-inner"
              >
                <Nft />
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
                className="bridge__body-inner"
              >
                <History />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
