import React from "react";
import { Form } from "react-bootstrap";

const SearchBar = () => {
  return (
    <Form>
      <Form.Group controlId="formPlaintextEmail">
        <Form.Control
          style={{
            borderRadius: "0.5em",
            maxWidth: "500px",
            width: "30vw",
          }}
          size={"lg"}
          autofocus="autofocus"
          type="text"
          id="searchBar"
          aria-describedby="searchBar"
          placeholder="Search session name... "
        />
      </Form.Group>
    </Form>
  );
};

export default SearchBar;
