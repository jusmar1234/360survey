import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import Dashboard from "./components/Dashboard";
import { parseSurveySheets } from "./lib/excelParser";

function App() {
  const [data, setData] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = parseSurveySheets(evt.target.result);
      setData(result);
      toast.success("File imported successfully!");
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Toaster position="top-center" />
      {!data.length ? (
        <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-12 max-w-md w-full text-center space-y-6">
          <CloudArrowUpIcon className="w-16 h-16 text-blue-600 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Upload your Survey Excel file
          </h1>
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Choose File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
          <p className="text-gray-500 text-sm">
            Supported formats: .xlsx, .xls
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-6xl">
          <Dashboard data={data} />
        </div>
      )}
    </div>
  );
}

export default App;
