import React from "react";
import { AnimatePresence, motion } from "framer-motion";
export default function GateInput(props) {
  return (
    <div className="gateInput__outer">
      <h5>NFT</h5>
      <div className="gateInput">
        <span>Gateway</span>
        <input
          ref={props.inpRef}
          onChange={props.onChange}
          value={props.value}
          type={props.type}
          placeholder={props.placeholder}
          onKeyDown={props.onKeydown}
          onFocus={props.onFocus}
        />
        <div className="gateInput__image">
          <img src={process.env.PUBLIC_URL + props.image} alt="icon" />
        </div>
      </div>
      <AnimatePresence>
        {props.showList && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, y: 10 }}
            className="gateInput__options"
          >
            {props.autoCompleteList.map((item, index) => (
              <div
                className="gateInput__option"
                key={index}
                onClick={() => props.optionClickHandler(item)}
              >
                <div className="gateInput__option-image">
                  <img src={process.env.PUBLIC_URL + item.image} alt="icon" />
                </div>
                <h6>{item.gateWay}</h6>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
