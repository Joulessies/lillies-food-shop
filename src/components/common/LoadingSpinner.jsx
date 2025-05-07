import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ text = "Loading...", fullScreen = false }) => {
  const style = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 9999,
      }
    : {};

  return (
    <div style={style} className="text-center my-5">
      <Spinner animation="border" role="status" />
      <div className="mt-2">{text}</div>
    </div>
  );
};

export default LoadingSpinner;
