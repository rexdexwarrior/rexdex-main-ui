import React, { useEffect, useRef, useState } from "react";

const CustomSelect = ({
  selected = null,
  list,
  key = null,
  onChange,
  addClass,
  icon,
}) => {
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
        : list.filter((item) => {
            let compareKey = key ?? "value";
            return item[compareKey] !== currentSelected[compareKey];
          })
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
    <div
      className={"select " + addClass + " " + (active ? "active" : "")}
      ref={wrapper}
    >
      <div className="select__selected" onClick={toggleActive}>
        {currentSelected ? currentSelected.value : "-----"}
        {icon}
      </div>
      <div className="select__options active">
        {currentList.map((item, index) => (
          <div
            className="select__options-item"
            key={index}
            onClick={() => onClick(item)}
          >
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
