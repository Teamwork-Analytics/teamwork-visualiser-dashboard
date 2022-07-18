import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useHive } from "./HiveContext";

const HiveSlider = ({ data }) => {
  const wrapperStyle = {
    width: "5vw",
    margin: 50,
  };
  const { state, setState } = useHive();

  const onDrag = (value) => {
    setState({ ...state, phase: value });
  };

  const markers = data.reduce((o, curr, i) => ({ ...o, [i]: curr }), {});

  return (
    <div style={wrapperStyle}>
      <Slider
        min={0}
        max={data.length - 1}
        defaultValue={data.length - 1}
        marks={markers}
        step={null}
        vertical={true}
        onChange={onDrag}
      />
    </div>
  );
};

export default HiveSlider;
