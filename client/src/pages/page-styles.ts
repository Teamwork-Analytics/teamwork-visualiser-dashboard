const defaultStyles = {
  main: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    height: "calc(100vh - 30px)",
    maxWidth: "1080px",
    margin: "0 auto",
    color: "white",
  },
  title: {
    fontSize: "3em",
    color: "white",
  },
};

export { defaultStyles };
