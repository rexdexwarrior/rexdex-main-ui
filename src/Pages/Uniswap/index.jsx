import React from "react";
import { useEffect, useState } from "react";
import { UniswapURL } from "../../config";
const Uniswap = (props) => {
  const [iframeUrl, setIframeUrl] = useState(null);

  const loadIframe = async (unipage) => {
    setIframeUrl(UniswapURL + "#/" + unipage);
  };

  useEffect(() => {
    loadIframe(props.unipage);
  }, [props.unipage]);
  return (
    <div className="nft-container">
      <iframe
        id="uniswap-iframe"
        width="100%"
        style={{
          height: "87vh",
          position: "absolute",
          zIndex: 1000,
          borderRadius: "10px",
        }}
        src={iframeUrl}
        title={`${
          props.unipage?.charAt(0).toUpperCase() + props.unipage?.slice(1)
        } Page`}
      ></iframe>
    </div>
  );
};
export default Uniswap;
