import React, { Children } from "react";

export default function Layout({children}) {
  return (
    <div className="layout">
      <div className="auto__container">
        <div className="layout__inner">{children}</div>
      </div>
    </div>
  );
}
