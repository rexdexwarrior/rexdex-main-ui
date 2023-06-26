import React, { useEffect, useRef, useState } from "react";
import { chevronBottom } from "../../../Base/SVG";
const CustomSelect = ({ selected = null, list, onChange, isDisabledSelectBox=false}) => {
  const wrapper = useRef(null);
  const [active, setActive] = useState(false);
  const [currentList, setCurrentList] = useState(list);
  const [currentSelected, setCurrentSelected] = useState(selected);

  const onClick = (item) => {
    setCurrentSelected(item);
    if (onChange) onChange(item);

    setActive(false);
  };

  const toggleActive = () => {
    setActive(!active);
  };

  useEffect(() => {
    setCurrentList(
      !currentSelected
        ? list
        : list.filter((item) => item.value !== currentSelected.value)
    );
  }, [list, currentSelected]);

  useEffect(() => {
    setCurrentSelected(selected);
  }, [selected]);

  useEffect(() => {
    const windowClick = ({ target }) => {
      if (!wrapper.current.contains(target)) setActive(false);
    };

    if (active) window.addEventListener("click", windowClick);
    else window.removeEventListener("click", windowClick);

    return () => window.removeEventListener("click", windowClick);
  }, [active]);

  return (
    <div className={`select ${active ? "active" : ""}`} ref={wrapper}>
      <div className="select__selected" onClick={toggleActive}>
        {currentSelected?.icon && (
          <img
            src={process.env.PUBLIC_URL + currentSelected.icon}
            alt="category"
          />
        )}
        {currentSelected ? currentSelected.value : "-----"}
        {!isDisabledSelectBox && chevronBottom}
      </div>
  {   !isDisabledSelectBox && <div className="select__options active">
        {currentList.map((item, index) => (
          <div
            className="select__options-item"
            key={index}
            onClick={() => onClick(item)}
          >
            {item.icon && (
              <img src={process.env.PUBLIC_URL + item.icon} alt="category" />
            )}
            {item.value}
          </div>
        ))}
      </div>}
    </div>
  );
};

export default CustomSelect;
