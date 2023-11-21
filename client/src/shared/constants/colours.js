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
  PRIMARY_NURSE_1: "#ff0000", //red
  PRIMARY_NURSE_2: "#088FFA", // blue
  SECONDARY_NURSE_1: "#00FF00", //lime
  SECONDARY_NURSE_2: "#ffcf00", // gold

  // Color for key events and actions
  KEY_EVENT_PURPLE: "#9c27b0",
  ACTION_ORANGE: "#ed6c02",
};
