import React, { useEffect, useState } from "react";
import { set, wallet } from "./SVG";
import useMetaMask from "../utils/useMetaMask";
import { formatAddress } from "../utils/addressShortened";
import { getTokenBalances } from "../utils/helpers/SwapContractHelper";
import { rexToken } from "../config";
import { convertWeiToEther } from "../utils/convertToBN";
import { NavLink } from "react-router-dom";
export default function Header({ menu, setMenu, rexPrice }) {
  const { isConnected, account, connectWallet, isWanChain } = useMetaMask();
  const [rexBalance, setRexBalance] = useState("0.00");

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getTokenBalances(rexToken, account);
      setRexBalance(balance);
    };

    if (isWanChain && account) {
      fetchBalance(); // Fetch balance immediately on page load

      const interval = setInterval(fetchBalance, 5000); // Fetch balance every 5 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [isWanChain, account]); // Added isWanChain and account as dependencies

  return (
    <div className="header">
      <div className="header__logo">
       
        <NavLink to="">
          <img src={process.env.PUBLIC_URL + "/images/logo.png"} alt="logo" />
        </NavLink>
      </div>
      <div className="header__inner">
        {/* <button className="button sett">{set}</button> */}
        <button type="button" className="button bordered">
          <img
            src={process.env.PUBLIC_URL + "/images/icons/rexHead.png"}
            alt="rexHead"
          />
          REX {Number(convertWeiToEther(rexBalance, 18)).toLocaleString()} | ${rexPrice?.toFixed(5)}
        </button>

        {!isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            className="button light"
          >
            {wallet}
            <span> Connect wallet</span>
          </button>
        ) : (
          <span className="button light"> {formatAddress(account)}</span>
        )}

        <div
          className="burger"
          onClick={() => {
            setMenu(!menu);
          }}
        >
          <span></span>
        </div>
      </div>
    </div>
  );
}
