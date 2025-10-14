/**
 * @file colours.js
 * @description This file contains a list of color constants used throughout the application.
 * Each color is associated with a specific role or action for a visual distinction in the application.
 * @constant COLOURS - An object map where key is the role or action and the value is its associated color.
 *
 * @example
 * import { COLOURS } from './config/colours';
 *
 * const Header = () => <h1 style={{ color: COLOURS.PRIMARY_NURSE_1 }}>Hello Nurse!</h1>;
 *
 */

export const COLOURS = {
  // Colors for nurses
  PRIMARY_NURSE_1: "#088FFA", // blue
  PRIMARY_NURSE_2: "#ff0000", //red
  SECONDARY_NURSE_1: "#31a354", //lime
  SECONDARY_NURSE_2: "#f39c11", // gold

  // Color for key events and actions
  KEY_EVENT_PURPLE: "#9c27b0",
  ACTION_ORANGE: "#ed6c02",
};

export const cssColourMatcher = {
  BLUE: COLOURS.PRIMARY_NURSE_1, // blue
  RED: COLOURS.PRIMARY_NURSE_2, //red
  GREEN: COLOURS.SECONDARY_NURSE_1, //lime
  YELLOW: COLOURS.SECONDARY_NURSE_2, // gold
  PATIENT: "#FFA500",
  DOCTOR: "#800080",
  RELATIVE: "#000000",
  ORANGE: "#ff8800ff",
};