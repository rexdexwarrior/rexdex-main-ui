import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
export default function GateInput({
  inpRef,
  onChange,
  value,
  type,
  placeholder,
  onKeydown,
  autoCompleteList,
  onFocus,
  showList,
  optionClickHandler,
  nftName,
  defaultImage
}) {
  const [selected, setselected] = useState(null);
  useEffect(() => {
    if (value) {
      const newValue = autoCompleteList.filter((x) => x.gateWay == value);
      setselected(newValue[0]);
    }
  }, [value]);

  return (
    <div className="gateInput__outer">
      <div className="gateInput">
        <span>{nftName}</span>
        <input
          ref={inpRef}
          onChange={onChange}
          value={value}
          type={type}
          placeholder={placeholder}
          onKeyDown={onKeydown}
          onFocus={onFocus}
        />
        <div className="gateInput__image">
          <img
            src={
              selected
                ? selected.image
                : defaultImage ? defaultImage : process.env.PUBLIC_URL + "/images/icons/rexHead.png"
            }
            alt="icon"
          />
        </div>
      </div>
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, y: 10 }}
            className="gateInput__options"
            style={{zIndex:10,position:'relative'}}
          >
            {autoCompleteList.map((item, index) => {
              return (
                <div
                  
                  className="gateInput__option"
                  key={index}
                  onClick={() => optionClickHandler(item)}
                >
                  <div className="gateInput__option-image">
                    <img src={item.image} alt="icon" />
                  </div>
                  <h6>{item.gateWay}</h6>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
