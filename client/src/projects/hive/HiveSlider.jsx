import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useHive } from "./HiveContext";

const HiveSlider = () => {
  const wrapperStyle = {
    width: "5vw",
    margin: 50,
  };
  const { state, setState, markers } = useHive();

  const onDrag = (value) => {
    setState({ ...state, phase: value });
  };

  return (
    <div style={wrapperStyle}>
      <Slider
        range
        pushable
        draggableTrack
        allowCross={false}
        min={0}
        max={100}
        defaultValue={[0, 100]}
        marks={markers}
        step={null}
        vertical={true}
        onChange={onDrag}
      />
    </div>
  );
};

export default HiveSlider;