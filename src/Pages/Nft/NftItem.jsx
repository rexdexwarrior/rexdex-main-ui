import React from "react";
import { heart, verified } from "../../Base/SVG";

export default function NftItem(props) {
  return (
    <div className="nftItem">
      <div className="nftItem__header">
        <div className="nftItem__header-name">
          <img src={process.env.PUBLIC_URL + props.icon} alt="icon" />
          <h5>{props.name}</h5>
        </div>
        <div className="nftItem__header-like">
          {heart} {props.likes}
        </div>
      </div>
      <div className="nftItem__image">
        <img src={process.env.PUBLIC_URL + props.image} alt="nft" />
      </div>
      <div className="nftItem__content">
        <div className="nftItem__content-title">
          <h6>Small Arms Syndicate</h6> {props.verified && verified}
        </div>
        <h5>{props.id}</h5>
      </div>
    </div>
  );
}
