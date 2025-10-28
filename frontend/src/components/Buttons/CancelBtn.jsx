import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { IconButton } from "@mui/material";

const CancelBtn = ({ onClick }) => {
  return (
    <div className="w-[2rem] text-black">
      <IconButton onClick={onClick}>
        <CancelIcon className="text-gray-800" />
      </IconButton>
    </div>
  );
};

export default CancelBtn;
