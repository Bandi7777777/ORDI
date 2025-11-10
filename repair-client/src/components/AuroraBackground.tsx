import { memo } from "react";

function AuroraBackground() {
  return (
    <div className="aurora-wrap">
      <div className="aurora" />
      <div className="aurora" />
      <div className="aurora" />
    </div>
  );
}

export default memo(AuroraBackground);