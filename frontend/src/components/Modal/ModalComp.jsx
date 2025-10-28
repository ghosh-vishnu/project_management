import { Box, Modal } from "@mui/material";
import CancelBtn from "../Buttons/CancelBtn";

const ModalComp = ({ title, open, onClose, children , maxWidth = 700}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex justify-center items-center h-screen overflow-y-scroll"
    >
      <Box
        className=" bg-white rounded-[.5rem] overflow-scroll max-h-[90vh]   no-scrollbar grid items-center"
        sx={{ width: "90%", maxWidth: {maxWidth} }}
      >
        <div className="p-6 h-fit">
          {title && (
            <div className="flex justify-between">
              <h2 className="text-2xl text-[var(--primary1)] font-bold">
                {title}
              </h2>
              <CancelBtn onClick={onClose} />
            </div>
          )}
          <div className="mt-4">
          {children}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default ModalComp;
