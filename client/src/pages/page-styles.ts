const defaultStyles = {
  main: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    height: "calc(100vh - 30px)",
    maxWidth: "1080px",
    margin: "0 auto",
    color: "#0a0a0a",
  },
  title: {
    fontSize: "3em",
    color: "#0a0a0a",
  },
};

export { defaultStyles };
