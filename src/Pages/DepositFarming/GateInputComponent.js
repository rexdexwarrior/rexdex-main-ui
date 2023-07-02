import React, { useEffect, useRef, useState } from "react";
import GateInput from "./GateInput";

export const GateInputComponent = ({
  initialValue,
  onValueChange,
  list,
  optionClickHandler,
  nftName,
  defaultImage,
  placeholder,
}) => {
  const inputWrapper = useRef(null);
  const inpRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [focus, setFocus] = useState(false);

  const closeSearch = () => {
    setSearchValue("");
    setFocus(false);
    inpRef.current.value = "";
    inpRef.current.blur();
  };

  const setNft = (obj) => {
    const foundItem = () => {
      return list.filter(
        (item) => item.gateWay.toUpperCase() === obj.value.toUpperCase()
      );
    };
    if (foundItem().length !== 0) {
      onValueChange(foundItem()[0]);
      closeSearch();
    }
  };

  const handlePress = (event) => {
    const inputItem = event.target;
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      event.preventDefault();
      setNft(inputItem);
      return;
    }
  };

  const handleChange = (event) => {
    setSearchValue(event.target.value);
    onValueChange({ gateWay: event.target.value });
  };

  useEffect(() => {
    const windowClick = ({ target }) => {
      if (!inputWrapper.current.contains(target)) closeSearch();
    };
    if (focus) window.addEventListener("click", windowClick);
    else window.removeEventListener("click", windowClick);
    return () => window.removeEventListener("click", windowClick);
  }, [focus]);

  return (
    <div className="wrappper" ref={inputWrapper}>
      <GateInput
        placeholder={placeholder}
        nftName={nftName}
        defaultImage={defaultImage}
        optionClickHandler={optionClickHandler}
        inpRef={inpRef}
        onKeydown={handlePress}
        type="text"
        value={initialValue}
        autoCompleteList={list}
        searchValue={searchValue}
        onFocus={() => setFocus(true)}
        showList={focus}
        onChange={handleChange}
      />
    </div>
  );
};
