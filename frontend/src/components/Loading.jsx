
const Loading = ({ text = "Loading..." }) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        zIndex: 1055,
      }}
    >
      <div
        className="text-center p-4 rounded-4 shadow"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Spinner */}
        <div className="spinner-border text-light mb-3" role="status" />

        {/* Text */}
        <div className="text-light fw-semibold">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Loading;
