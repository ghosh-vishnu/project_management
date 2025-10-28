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
  
  // Add a key to reset file input when form is reset
  const [key, setKey] = useState(0);


  useEffect(() => {
    if (defaultFileUrl) {
      console.log(`Setting default file URL for ${registerName}:`, defaultFileUrl);
      setPreviewURL(defaultFileUrl);
      // Check file extension more robustly
      const urlLower = defaultFileUrl.toLowerCase();
      if (urlLower.includes('.pdf')) {
        setPreviewType("pdf");
      } else if (
        urlLower.includes('.jpg') ||
        urlLower.includes('.jpeg') ||
        urlLower.includes('.png') ||
        urlLower.includes('.webp') ||
        urlLower.includes('.gif')
      ) {
        setPreviewType("image");
      }
    } else {
      // Reset if no default URL
      setPreviewURL(null);
      setPreviewType(null);
    }
  }, [defaultFileUrl, registerName]);

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
      // Don't reset preview if file input is cleared - keep default URL
      if (defaultFileUrl) {
        setPreviewURL(defaultFileUrl);
      } else {
        setFileName("");
        setPreviewURL(null);
        setPreviewType(null);
      }
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
          key={key}
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
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-600 text-sm">📄 PDF Document</div>
              <a 
                href={previewURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View Document →
              </a>
            </div>
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
