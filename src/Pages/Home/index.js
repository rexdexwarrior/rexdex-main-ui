import React from "react";
import { useEffect, useState } from "react";
import { UniswapURL, rexToken, stakingAddress } from "../../config";
import Layout from "../../Base/Layout";
import Web3 from "web3";
import { convertWeiToEther } from "../../utils/convertToBN";
import { NavLink } from "react-router-dom";

const Home = (props) => {
  const [rexStaked, setRexStaked] = useState(0);
  const [wanPrice, setWanPrice] = useState(0);
  const [rexPrice, setRexPrice] = useState(0);
  const [rexLiq, setRexLiq] = useState(0);


  function convertToInternationalCurrencySystem(labelValue, dollar = false) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

      ? <b>{(Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2)}<a>B{dollar && '$'}</a></b>
      // Six Zeroes for Millions 
      : Math.abs(Number(labelValue)) >= 1.0e+6

        ? <b>{(Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2)}<a>M{dollar && '$'}</a></b>
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

          ? <b>{(Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2)}<a>K{dollar && '$'}</a></b>

          : Math.abs(Number(labelValue));

  }

  const getREXLiq = async () => {
    const query = `
    query getLiq{
      tokens (where: {id: "0x01a2947d9e6f58572028fa9fc6a2511646345841"})
        {
          id
          name,
          totalLiquidity
        }
      }
    `;

    const response = await fetch('https://thegraph.one/subgraphs/name/rexdex/rexdex-subgraph', {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ query: query })
    });
    const data = await response.json();
    console.log('REX Liquidity on DEX', data.data.tokens[0].totalLiquidity);
    setRexLiq(Number(data.data.tokens[0].totalLiquidity));
    
  }

  const getREXInfo = async () => {
    // The minimum ABI to get ERC20 Token balance
    let minABI = [
      // balanceOf
      {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
      },
      // decimals
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
      }
    ];
    // Get Staked of REX
    const web3 = new Web3(new Web3.providers.HttpProvider('https://gwan-ssl.wandevs.org:56891/'));
    let contract = new web3.eth.Contract(minABI, rexToken);
    var balance = await contract.methods.balanceOf(stakingAddress).call();
    console.log('REX Staked', convertWeiToEther(balance, 18));
    setRexStaked(convertWeiToEther(balance, 18));
  }

  const getREXPrice = async () => {
    //let body = '{"query":"{\n  pairs(where: {id: \"0x32d875f56ac97ef584cee0be8ee71cfcb248a35b\"}) {\n    id\n    reserveUSD\n    token0 {\n      id\n      name\n    }\n    token1 {\n      id\n      name\n    }\n    token0Price\n    token1Price\n  }\n}","variables":null,"extensions":{"headers":null}}';

    const query = `
query getPair{
  pairs(where: {id: "0x32d875f56ac97ef584cee0be8ee71cfcb248a35b"}) {
    id
    reserveUSD
    token0 {
      id
      name
    }
    token1 {
      id
      name
    }
    token0Price
    token1Price
  }
  }
`;

    const response = await fetch('https://thegraph.one/subgraphs/name/rexdex/rexdex-subgraph', {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ query: query })
    });
    const data = await response.json();
    console.log('1 REX to WAN', data.data.pairs[0].token1Price);
    setRexPrice(data.data.pairs[0].token1Price);
  };

  const getWANPrice = async () => {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=wanchain&vs_currencies=usd')
    const data = await response.json();
    console.log('Wan Price', data.wanchain.usd);
    setWanPrice(data.wanchain.usd);
  }

  useEffect(() => {
    getREXInfo();
    getREXLiq();
    getWANPrice();
    getREXPrice();
  }, []);

  return (
    <>
      <div className="home-bg"><img src="/images/homebg.svg" /></div>
      <Layout>
        <a className="home-amm-dex" href="https://swap.rexdex.finance">WANCHAIN AMM DEX</a>
        <div className="home-title">
          <h1>REXDEX</h1>
          <h2>ECOSYSTEM</h2>
        </div>
        <div className="home-info">
          <div className="home-info-item staked">
            <img src="/favicon.png" />
            <div>
              <span>Staked REX</span>
              <span>{convertToInternationalCurrencySystem(Number(rexLiq)+Number(rexStaked))}</span>
            </div>
          </div>
          <div className="home-info-item grey">
            <img src="/images/dollar.svg" />
            <div>
              <span>TVL</span>
              <span>{convertToInternationalCurrencySystem((Number(rexLiq)+Number(rexStaked))*wanPrice*rexPrice, true)}</span>
            </div>
          </div>
        </div>

        <div className="home-gallery">
          <div className="home-gallery-item">

            <img src="/images/home/tradingdual.png" />
            <img src="/images/home/trading.png" />

            <NavLink to="http://swap.rexdex.finance" className="home-gallery-item-link">Trading</NavLink>

            <p>
              REXDEX trading revolutionizes the crypto market by enabling automated and decentralized transactions with unparalleled efficiency.
            </p>
          </div>

          <div className="home-gallery-item">

            <img src="/images/home/liquiditydual.png" />
            <img src="/images/home/liquidity.png" />

            <NavLink to="pool" className="home-gallery-item-link">Liquidity</NavLink>

            <p>
              By providing liquidity, users can earn a share of profits on REXDEX AMM exchange (0.3%).
            </p>
          </div>

          <div className="home-gallery-item">

            <img src="/images/home/farmingdual.png" />
            <img src="/images/home/farming.png" />

            <NavLink to="farming" className="home-gallery-item-link">Farming</NavLink>

            <p>
              By providing liquidity, users can farm REX tokens, unlocking additional rewards in the REXDEX ecosystem.
            </p>
          </div>

          <div className="home-gallery-item">

            <img src="/images/home/stakingdual.png" />
            <img src="/images/home/staking.png" />

            <NavLink to="staking" className="home-gallery-item-link">Staking</NavLink>

            <p>
              Users can earn REX tokens by staking them, leveraging the "stake-to-earn" feature on REXDEX.
            </p>
          </div>
        </div>
      </Layout>
    </>

  );
};
export default Home;
