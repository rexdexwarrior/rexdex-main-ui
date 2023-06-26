import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { arrowBottom, plus, triIcon } from "../../Base/SVG";
import CustomSelect from "./CustomSelect";
const nftList = [
  {
    id: "1",
    value: "Select From Chain",
  },
  {
    id: "2",
    value: "Chain 1",
  },
  {
    id: "3",
    value: "Chain 2",
  },
];
const nftChain = [
  {
    id: "1",
    value: "Select To Chain",
  },
  {
    id: "2",
    value: "Chain 1",
  },
  {
    id: "3",
    value: "Chain 2",
  },
];
export default function Token() {
  const [isShown, setIsShown] = useState(true);

  const [form, setForm] = useState({
    from: "",
    recipient: "",
    amount: "SAS NFT",
  });
  const onChangeInput = (input) => (e) => {
    setForm((form) => ({ ...form, [input]: e.target.value }));
  };
  return (
    <div className="bridgeToken">
      <div className="bridgeSide">
        <div className="bridgeSide__tab">
          <div
            className={"bridgeSide__tab-btn " + (isShown ? "active" : "")}
            onClick={() => setIsShown(!isShown)}
          >
            Select asset please {triIcon}
          </div>
          <AnimatePresence>
            {isShown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="bridgeSide__tab-body"
              >
                <CustomSelect
                  icon={triIcon}
                  list={nftList}
                  selected={nftList[0]}
                />
                <div className="bridgeSide__tab-arrows">{arrowBottom}</div>
                <CustomSelect
                  icon={triIcon}
                  list={nftChain}
                  selected={nftChain[0]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="divider"></div>
      <div className="bridgeMain">
        <div className="bridgeInput">
          <input
            value={form.from}
            onChange={onChangeInput("from")}
            type="text"
            placeholder="From"
          />
          <span>Balance:0</span>
        </div>
        <div className="bridgeInput">
          <input
            value={form.recipient}
            onChange={onChangeInput("recipient")}
            type="text"
            placeholder="Recipient"
          />
          <span>Input recipient address please</span>
        </div>
        <div className="bridgeInput">
          <input
            value={form.amount}
            onChange={onChangeInput("amount")}
            type="number"
            placeholder="Amount"
          />
          <span>Bridge Fee:0</span>
        </div>
        <button type="button" className="button light">
          Next
        </button>
      </div>
    </div>
  );
}
