import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { convertWeiToEther } from "../utils/convertToBN";

export default function Crypto(props) {
	const navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			exit={{ opacity: 0, y: 20 }}
			className="crypto"
		>
			<div className="crypto__row">
				<div className="crypto__name">
					<h5>
						{props?.symbol0} / {props?.symbol1}
					</h5>
				</div>
				<button onClick={() => navigate(`/deposit-farming`, { state: { props } })} className="button depos">
					{props.userStaked > 0 ? "Deposit / Withdraw" : " Deposit"}
				</button>
			</div>
			<div className="crypto__row">
				<p className="uniq">Total deposited</p>
				<div className="crypto__more">
					<p>{convertWeiToEther(props?.totalSupply?.toString(), props?.decimals)}</p>
					<p>{props?.symbol}</p>
				</div>
			</div>
			<div className="crypto__row">
				<p className="uniq">Pool rate</p>
				<p>{`${convertWeiToEther(props?.poolRate?.toString(), props?.decimals)} / Second `}</p>
			</div>
			{props?.userBoosting ? (
				<div className="crypto__row">
					<p className="uniq">User Boosting</p>
					<p>{`${convertWeiToEther(props?.userBoosting?.toString(), props?.decimals)} $Rex `}</p>
				</div>
			) : null}
		</motion.div>
	);
}
