import React, { useState } from "react";
import { filesIcon } from "../../Base/SVG";

export default function History() {
  const [history, setHistory] = useState("");
  return (
    <div className="bridgeHistory">
      {!history === "" ? (
        "here should be data"
      ) : (
        <div className="bridgeHistory__emp">
          <div className="bridgeHistory__emp-icon">{filesIcon}</div>
          <p>No Data</p>
        </div>
      )}
    </div>
  );
}
