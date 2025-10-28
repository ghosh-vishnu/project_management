import { Grid2 } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const FileUploadInput = ({
  id,
  required,
  registerName,
  register,
  errors,
  label,
  allowedFileTypes,
  allowedFileTypesErrorMessage,
  defaultFileUrl
}) => {
  // File validation function
  const validateFileType = (fileList) => {
    if (fileList){
      const file = fileList[0];
    if (!file) return true;

    const allowedTypes = allowedFileTypes || []; // ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    return allowedTypes.includes(file.type) || allowedFileTypesErrorMessage;
    }
  };

  // Variables for file preview
  const [fileName, setFileName] = useState("");
  const [previewURL, setPreviewURL] = useState(null);
  const [previewType, setPreviewType] = useState(null); // "image" | "pdf" | null


  useEffect(() => {
    if (defaultFileUrl) {
      setPreviewURL(defaultFileUrl);
      if (defaultFileUrl.endsWith(".pdf")) {
        setPreviewType("pdf");
      } else if (
        defaultFileUrl.endsWith(".jpg") ||
        defaultFileUrl.endsWith(".jpeg") ||
        defaultFileUrl.endsWith(".png")
      ) {
        setPreviewType("image");
      }
    }
  }, [defaultFileUrl]);

  // File preview function
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const fileURL = URL.createObjectURL(file);

      if (file.type.startsWith("image/")) {
        setPreviewType("image");
        setPreviewURL(fileURL);
      } else if (file.type === "application/pdf") {
        setPreviewType("pdf");
        setPreviewURL(fileURL);
      } else {
        setPreviewType(null);
        setPreviewURL(null);
      }
    } else {
      setFileName("");
      setPreviewImage(null);
    }
  };

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, sm: 8 }} className="inputData">
        <label htmlFor={id}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>

        <input
          type="file"
          id={id}
          accept={allowedFileTypes}
          {...register(registerName, {
            required: required ? "This field is required." : false,
            validate: validateFileType,
            onChange: handleFileChange,
          })}
        />

        {errors[registerName] && (
          <small className="text-red-600">
            {errors[registerName]?.message}
          </small>
        )}
      </Grid2>
      <Grid2
        size={{ xs: 12, sm: 4 }}
        className="inputData w-full "
      >
        <center>
          {previewType === "image" && previewURL && (
            <img
              src={previewURL}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-md border"
            />
          )}

          {previewType === "pdf" && previewURL && (
            <iframe
              src={previewURL}
              title="PDF Preview"
              className="w-full h-20 border rounded-md"
            />
          )}
          {fileName && (
            <small className="text-green-600">Selected: {fileName}</small>
          )}
        </center>
      </Grid2>
    </Grid2>
  );
};

export default FileUploadInput;
