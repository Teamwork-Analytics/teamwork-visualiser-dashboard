import React from "react";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";

const DisplayViz = ({ size, image }) => {
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

  const styles = {
    imageContainer: {
      // display: "block",
      width: "auto",
      height: "100%",
      objectFit: "cover",
      position: " absolute",
      top: 0,
    },
  };

  return (
    <Card style={sizeDecider[size]} className="customCard">
      {/* <Card.Title>{size}</Card.Title> */}
      <Card.Body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <Card.Subtitle className="mb-2 text-muted">Displaying:</Card.Subtitle> */}
        {/* {displayType === "youtube" && (
          <iframe
            width="560"
            height="315"
            src="https://www.youtube-nocookie.com/embed/W1UWKLOSO5g"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )} */}

        <Image src={image} style={styles.imageContainer} fluid />
      </Card.Body>
    </Card>
  );
};

export default DisplayViz;
