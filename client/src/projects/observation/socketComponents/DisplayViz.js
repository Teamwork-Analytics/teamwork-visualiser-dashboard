import Card from "react-bootstrap/Card";

const DisplayViz = ({ size, viz }) => {
  const sizeDecider = {
    small: {
      width: "40vw",
      minWidth: 300,
      height: 300,
      minHeight: 380,
      margin: "0.25em 0.5em",
    },
    medium: {
      width: "55vw",
      minWidth: 300,
      height: 300,
      minHeight: 380,
      margin: "0.25em 0.5em",
    },
    large: {
      width: "100vw",
      minWidth: 400,
      minHeight: 300,
      margin: "0.5em 1.5em",
    },
    single: {
      width: "100vw",
      height: "90vh",
    },
  };

  return (
    <Card style={sizeDecider[size]} className="customCard">
      <Card.Body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {viz}
      </Card.Body>
    </Card>
  );
};

export default DisplayViz;
