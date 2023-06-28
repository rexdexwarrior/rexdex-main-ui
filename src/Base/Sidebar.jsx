import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  bridgeIcon,
  facebookIcon,
  farmingIcon,
  instaIcon,
  nftIcon,
  poolIcon,
  referralIcon,
  stakingIcon,
  swapIcon,
  homeIcon,
  twitter,
  webIcon,
  airdropIcon,
} from "./SVG";

export default function Sidebar({ menu, closeFunc }) {
  const { pathname } = useLocation();
  return (
    <div className={"sidebar " + (menu ? "active" : "")} onClick={closeFunc}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <NavLink to="">
            <img src={process.env.PUBLIC_URL + "/images/logo.png"} alt="logo" />
          </NavLink>
        </div>
      </div>
      <div className="sidebar__inner">
        <div className="sidebar__inner-links">
          {/* <NavLink to="" className="sidebar__inner-link">
            <span> {homeIcon}</span> Home
          </NavLink> */}

          <NavLink
            to="https://swap.rexdex.finance"
            className="sidebar__inner-link"
          >
            <span> {swapIcon}</span> Swap
          </NavLink>

          <NavLink to="pool" className="sidebar__inner-link">
            <span>{poolIcon}</span> Pool
          </NavLink>

          <NavLink
            to="farming"
            className={`sidebar__inner-link ${
              pathname.includes("deposit-farming") && "active"
            }`}
          >
            <span>{farmingIcon}</span> Farming
          </NavLink>
          <NavLink to="airdrop" className="sidebar__inner-link">
            <span>{airdropIcon}</span> Airdrop
          </NavLink>

          <NavLink
            to="staking"
            className={`sidebar__inner-link ${
              pathname.includes("deposit-staking") && "active"
            }`}
          >
            <span>{stakingIcon}</span> Staking
          </NavLink>

          <NavLink to="referral" className="sidebar__inner-link">
            <span>{referralIcon}</span> Referral
          </NavLink>

          <NavLink to="nft" className="sidebar__inner-link">
            <span>{nftIcon}</span> SAS NFTs
          </NavLink>
          {/* <NavLink
            to="https://bridge.wanchain.org/"
            className="sidebar__inner-link"
            target="blank"
          >
            <span>{bridgeIcon}</span> Bridge
          </NavLink> */}
        </div>
        <div className="sidebar__inner-footer">
          <div className="sidebar__inner-socials column">
            <a
              href="https://info.rexdex.finance/"
              target="_blank"
              className="sidebar__inner-social customLink long"
            >
              ANALYTICS
            </a>

            <a
              href="https://swap.rexdex.finance/"
              target="_blank"
              className="sidebar__inner-social customLink long filled"
            >
              TRADE NOW
            </a>
          </div>

          <div className="sidebar__inner-socials">
            {/* <a href="facebook.com" className="sidebar__inner-social">
							{facebookIcon}
						</a> */}
            <a
              href="https://twitter.com/SyndicateSmall"
              className="sidebar__inner-social"
            >
              {twitter}
            </a>
            {/* <a href="facebook.com" className="sidebar__inner-social">
							{instaIcon}
						</a> */}
            <a
              href="https://smallarmssyndicate.com/"
              className="sidebar__inner-social"
            >
              {webIcon}
            </a>

            <a
              href="https://bridge.wanchain.org/"
              target="_blank"
              className="sidebar__inner-social customLink"
            >
              BRIDGE
            </a>
          </div>
          <p>Copyright @ 2023</p>
        </div>
      </div>
    </div>
  );
}
