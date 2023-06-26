import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { chainId } from "../config";

function useMetaMask() {
	const [isInstalled, setIsInstalled] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [account, setAccount] = useState(null);
	const [isWanChain, setIsWanChain] = useState(false);

	useEffect(() => {
		const checkMetaMaskInstalled = async () => {
			if (typeof window.ethereum !== "undefined") {
				setIsInstalled(true);

				// Check if MetaMask is already connected
				const accounts = await window.ethereum.request({ method: "eth_accounts" });
				if (accounts.length > 0) {
					setIsConnected(true);
					setAccount(accounts[0]);
					localStorage.setItem("metamaskAccount", accounts[0]);
				}

				// Add event listener for accountsChanged event
				window.ethereum.on("accountsChanged", handleAccountsChanged);

				// Add event listener for chainChanged event
				window.ethereum.on("chainChanged", handleChainChanged);

				// Check the current network
				const chainIdFromMeta = await window.ethereum.request({ method: "eth_chainId" });
				handleChainChanged(chainIdFromMeta);
			}
		};

		const handleAccountsChanged = async (accounts) => {
			if (accounts.length === 0) {
				setIsConnected(false);
				setAccount(null);
				localStorage.removeItem("metamaskAccount");
			} else {
				setIsConnected(true);
				setAccount(accounts[0]);
				localStorage.setItem("metamaskAccount", accounts[0]);
			}
		};

		const handleChainChanged = async (chainIdFromMeta) => {
			const wanchainId = chainId;
			setIsWanChain(chainIdFromMeta === wanchainId);
		};

		checkMetaMaskInstalled();

		// Cleanup event listener on unmount
		return () => {
			if (typeof window.ethereum !== "undefined") {
				window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
				window.ethereum.removeListener("chainChanged", handleChainChanged);
			}
		};
	}, []);

	const connectWallet = async () => {
		if (isInstalled) {
			try {
				const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
				setIsConnected(true);
				setAccount(accounts[0]);
				localStorage.setItem("metamaskAccount", accounts[0]);
			} catch (error) {
				console.error(error);
			}
		} else {
			toast.error("MetaMask is not installed");
		}
	};

	return { isInstalled, isConnected, account, connectWallet, isWanChain };
}

export default useMetaMask;
