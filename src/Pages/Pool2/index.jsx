import React from "react";
import { UniswapURL } from "../../config";
const Pool2 = () => {
  //console.log(UniswapURL)
  return (
    <div className="nft-container">
      <iframe
        width="100%"
        style={{ height: "87vh", position: "absolute", zIndex: 1000, borderRadius: '10px' }}
        src={UniswapURL+'#/pool'}
        title="Swap Page"
      ></iframe>
    </div>
  );
};
export default Pool2;
