import { useState, useEffect } from "react";
import { rexToken, wanAddress } from "../config";

const useFetchTokenList = () => {
	const [tokenList, setTokenList] = useState([]);

	useEffect(() => {
		const fetchTokens = async () => {
			try {
				const response = await fetch("https://www.wanswap.finance/wanswap.tokenlist.json");
				const data = await response.json();

				const tokens = data.tokens.map((token, index) => ({
					id: index + 2,
					value: token.name,
					icon: token.logoURI,
					address: token.address,
					decimals: token.decimals,
					symbol: token.symbol,
					chainId: token.chainId,
				}));

				// setTokenList(tokens);
				//0x73366a0fa91E8cB4e3e612202eE7ae80F3103252
				const tempTokens = [
					{
						id: 0,
						address: rexToken,
						chainId: 888,
						decimals: 18,
						icon: "/images/icons/rex.jpg",
						symbol: "REX",
						value: "REX",
					},
					{
						id: 1,
						address: wanAddress,
						chainId: 888,
						decimals: 18,
						icon: "https://icons.wanswap.finance/icon/wanswap/WAN.png",
						symbol: "WWAN",
						value: "WAN",
					},

					{
						id: 2,
						address: "0x50c439B6d602297252505a6799d84eA5928bCFb6",
						chainId: 888,
						decimals: 8,
						icon: "https://icons.wanswap.finance/icon/wanswap/BTC.png",
						symbol: "BTC",
						value: "Bitcoin",
					},
					{
						id: 3,
						address: "0xE3aE74D1518A76715aB4C7BeDF1af73893cd435A",
						chainId: 888,
						decimals: 18,
						icon: "https://icons.wanswap.finance/icon/wanswap/ETH.png",
						symbol: "ETH",
						value: "Ethereum",
					},
					{
						id: 4,
						address: "0x52A9CEA01c4CBDd669883e41758B8eB8e8E2B34b",
						chainId: 888,
						decimals: 6,
						icon: "/images/icons/usdc.webp",
						symbol: "USDC",
						value: "USDC",
					},
					{
						id: 5,
						address: "0x11e77E27Af5539872efEd10abaA0b408cfd9fBBD",
						chainId: 888,
						decimals: 6,
						icon: "/images/icons/usdt.png",
						symbol: "wanUSDT",
						value: "USDT",
					},

					{
						id: 6,
						address: "0x69a0B487f287d8B41eC1D26bcD11D101C2577A6B",
						chainId: 888,
						decimals: 18,
						icon: "/images/icons/Play.jpg",
						symbol: "Play",
						value: "Play",
					},
					{
						id: 7,
						address: "0xf46F29950116cc374868A981861CA4F942eD7269",
						chainId: 888,
						decimals: 18,
						icon: "/images/icons/VZOO.jfif",
						symbol: "vZOO",
						value: "vZOO",
					},
				];

				setTokenList([...tempTokens]);
			} catch (error) {
				console.error("Error fetching token list:", error);
			}
		};

		fetchTokens();
	}, []);

	return tokenList;
};

export default useFetchTokenList;
