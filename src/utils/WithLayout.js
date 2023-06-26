import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { chainId } from "../config";

const WithLayout = (WrappedComponent) => {
	return function Layout(props) {
		useEffect(() => {
			if (window.ethereum) {
				const handleChainChanged = (chainIdFromMeta) => {
					if (chainIdFromMeta !== chainId) {
						console.log("chain changed");
						return toast.error("Chain has changed. Please switch back to the Wanchain network.");
					}
				};

				// Attach event listener
				window.ethereum.on("chainChanged", handleChainChanged);

				window.ethereum.request({ method: "eth_chainId" }).then((chainIdFromMeta) => {
					if (chainIdFromMeta !== chainId) {
						console.log("different chain found");
						toast.error("Please switch to the Wanchain network.");
					}
				});

				// Cleanup function
				return () => {
					window.ethereum.removeListener("chainChanged", handleChainChanged);
				};
			}
		}, []);

		return <WrappedComponent {...props} />;
	};
};

export default WithLayout;
