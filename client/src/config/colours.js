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
  PERSON_1: "#D95F02", //red
  PERSON_2: "#2b8cbe", // blue
  PERSON_3: "#1B9E77", //lime
  PERSON_4: "#ffa600", // gold

  PERSON_1_RGB: {
    r: 217,
    g: 95,
    b: 2,
  },
  PERSON_2_RGB: {
    r: 43,
    g: 140,
    b: 190,
  },
  PERSON_3_RGB: {
    r: 27,
    g: 158,
    b: 119,
  },

  // 43,140,190

  // Color for key events and actions
  KEY_EVENT_PURPLE: "#9c27b0",
  ACTION_ORANGE: "#ed6c02",
};
