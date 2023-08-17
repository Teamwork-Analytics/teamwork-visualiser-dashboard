const SimpleErrorText = ({ isError, message, children }) => {
  return (
    <>
      {isError ? (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "20vh",
          }}
        >
          <p>{message}</p>
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default SimpleErrorText;
