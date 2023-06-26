import React from "react";
import { UniswapURL } from "../../config";
const Swap2 = () => {
  //console.log(UniswapURL)
  return (
    <div className="nft-container">
      <iframe
        width="100%"
        style={{ height: "87vh", position: "absolute", zIndex: 1000, borderRadius: '10px' }}
        src={UniswapURL+'#/swap'}
        title="Swap Page"
      ></iframe>
    </div>
  );
};
export default Swap2;
