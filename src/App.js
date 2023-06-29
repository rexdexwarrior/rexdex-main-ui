import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./Base/Sidebar";
import Header from "./Base/Header";
// import Uniswap from "./Pages/Uniswap";
// import Swap2 from "./Pages/Swap2";
import Pool from "./Pages/Pool";
import Home from "./Pages/Home";
import AirDrop from "./Pages/AirDrop/AirDrop";
import Farm from "./Pages/Farm/Farm";
import Stake from "./Pages/Stake/Stake";
import Referral from "./Pages/Referral/Referral";
//import Bridge from "./Pages/Bridge/Bridge";
import Nft from "./Pages/Nft";
import DepositFarming from "./Pages/DepositFarming";
import DepositStaking from "./Pages/DepositStaking";
//import { toast } from "react-toastify";
import WithLayout from "./utils/WithLayout";
import { rexToken } from "./config";



export default function App() {
	const [menu, setMenu] = useState(false);
	const [rexPrice, setRexPrice] = useState(0);
	const location = useLocation();
	const closeFunc = (e) => {
		if (e.target === e.currentTarget) setMenu(false);
	};

	useEffect(() => {
		if (menu) {
			document.body.classList.add("active");
		} else {
			document.body.classList.remove("active");
		}
	}, [menu]);



	useEffect(() => {
		getRexPrice();
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("referrer")) {
			const referrerAddress = atob(urlParams.get("referrer"));
			localStorage.setItem("referrerAddress", referrerAddress);
		}
	}, []);

	const getRexPrice = async () => {
		// Get REX PRICE //
		const query = `query getREXPrice{
				
					pairs(where: {id:"0x446bcb18ef05816baf94cdd0ab29461766a2019c"})
					{
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
		console.log('Rex Price', data.data.pairs[0].token1Price);
		setRexPrice(Number(data.data.pairs[0].token1Price) ?? 0);

	}
	

	useEffect(() => {
		setMenu(false);
		document.body.classList.remove("active");
	}, [location]);
	//const UniswapComponent = Uniswap;
	// const SwapComponent = WithLayout(Uniswap);
	const PoolComponent = WithLayout(Pool);
	const HomeComponent = WithLayout(Home);
	const AirDropComponent = WithLayout(AirDrop);
	//const BridgeComponent = WithLayout(Bridge);
	const FarmComponent = WithLayout(Farm);
	const ReferralComponent = WithLayout(Referral);
	const StakeComponent = WithLayout(Stake);
	const DepositFarmingComponent = WithLayout(DepositFarming);
	const DepositStakingComponent = WithLayout(DepositStaking);

	const RouterContent = useMemo(() => {
		return (
			<Routes>
				<Route exact path="" element={<HomeComponent />} />
				<Route exact path="swap" element={<></>} />
				<Route exact path="pool" element={<PoolComponent />} />

				<Route exact path="airdrop" element={<AirDropComponent />} />
				{/* <Route exact path="bridge" element={<BridgeComponent />} /> */}
				<Route exact path="farming" element={<FarmComponent rexPrice={rexPrice}/>} />
				<Route exact path="referral" element={<ReferralComponent />} />
				<Route exact path="staking" element={<StakeComponent />} />
				<Route exact path="deposit-farming" element={<DepositFarmingComponent />} />
				<Route exact path="nft" element={<Nft />} />
				<Route exact path="deposit-staking" element={<DepositStakingComponent />} />
			</Routes>
		)
	}, [rexPrice]);

	return (
		<div className="wrapper">
			<Header setMenu={setMenu} menu={menu} rexPrice={rexPrice}/>
			<Sidebar menu={menu} closeFunc={closeFunc} />
			<main className="main">
				{RouterContent}
			</main>
			<ToastContainer />
		</div>
	);
}
