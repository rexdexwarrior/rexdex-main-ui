import React from "react";

const Nft = () => {
  return (
    <div className="nft-container">
      <iframe
        width="100%"
        style={{ height: "87vh", position: "absolute", zIndex: 1000 }}
        src="https://openzoo.io/collection/0xc2b3af0a56387d4ef095a80a174f493e9a0438a5?theme=dark"
        title="OpenZoo - Small Arms Syndicate"
      ></iframe>
    </div>
  );
};
export default Nft;
