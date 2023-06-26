import React, { useEffect, useState } from "react";
import CustomSelect from "../../Pages/Swap/SwapDetail/CustomSelect";

const Input = ({
  label,
  value,
  onChangeInput,
  list,
  changeMedium,
  selectedAddress,
  isDisabledSelectBox = false,
  disabled = false,
}) => {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (list.length > 0 && selectedAddress) {
      setSelected(list.find((item) => item.address?.toLowerCase() === selectedAddress?.toLowerCase()));
    }
  }, [list, selectedAddress]);
  return (
    <div className="input__outer">
      <p className="xsm"></p>
      <label htmlFor="">{label}</label>
      <div className="input ">
        <input
          disabled={disabled}
          type="number"
          placeholder="0.0"
          value={value}
          onChange={onChangeInput}
        />
        <div className="input__btns">
          <CustomSelect
            isDisabledSelectBox={isDisabledSelectBox}
            list={list}
            selected={selected}
            onChange={(item) => {
              if (changeMedium) changeMedium(item);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Input;
