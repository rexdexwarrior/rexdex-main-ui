import React, { useEffect, useState } from "react";
import SwapDetail from "./SwapDetail";
import SwapChart from "./SwapChart";
import { motion } from "framer-motion";

export default function Swap() {
  const [isLoading, setIsLoading] = useState(false);
  // const lazyDummy = () => {
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);
  // };
  // useEffect(() => {
  //   lazyDummy();
  // }, []);
  return (
    <div className="layout">
      <div className="auto__container">
        <div className="layout__inner">
          <div className="swap">
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              exit={{ opacity: 0, x: -40 }}
            >
              Swap
            </motion.h2>
            <div className="swap__row" style={{width:'100%', justifyContent:'center' }}>
              {/* <SwapChart isLoading={isLoading} /> */}
              <SwapDetail isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
