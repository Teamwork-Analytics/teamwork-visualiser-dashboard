/**
 * @file: observationUtils.js
 * @description: This module provides utility functions for updating observations.
 */

import { toast } from "react-hot-toast";
import ObservationAPI from "../services/api/observation";

/**
 * Updates a single phase in the observation phase list and returns the list of updated data.
 * @param {String} observationId - The id of the observation.
 * @param {String} noteId - The id of the note to update.
 * @param {String} noteMessage - The updated note message.
 * @param {Date} noteTimestamp - The timestamp of the note.
 * @returns {Promise<Object | undefined>} The updated data or undefined if the update failed.
 */
async function updateSinglePhase(
  observationId,
  noteId,
  noteMessage,
  noteTimestamp
) {
  const updateInfo = {
    noteId,
    message: noteMessage,
    timeString: noteTimestamp.toISOString(),
  };

  const toastId = toast.loading("Loading...");
  try {
    const res = await ObservationAPI.updateNote(observationId, updateInfo);

    if (res.status === 200) {
      toast.success("Note has been updated!", {
        id: toastId,
      });
      return res.data; // Return the data for further processing
    }
  } catch (error) {
    toast.error("An error occurred while updating the note.", {
      id: toastId,
    });
    console.error(error);
  }
}

export { updateSinglePhase };
