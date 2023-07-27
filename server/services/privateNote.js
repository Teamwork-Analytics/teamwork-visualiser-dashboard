/**
 * @file services/privateNote.js
 * @description Service layer for handling operations related to the 'privateNote' resource.
 */

const PrivateNote = require("../models/privateNote");

/**
 * Creates a new PrivateNote document.
 *
 * @returns {Promise<Object>} - The newly created PrivateNote document
 */
const create = async () => {
  return await PrivateNote.create({
    nurses: {
      primaryNurse1: "",
      primaryNurse2: "",
      secondaryNurse1: "",
      secondaryNurse2: "",
    },
  });
};

/**
 * Updates a PrivateNote document with new data.
 *
 * @param {String} id - The ID of the PrivateNote document to update
 * @param {Object} data - The new data to update the PrivateNote with
 * @returns {Promise<Object>} - The updated PrivateNote document
 */
const update = async (id, data) => {
  return await PrivateNote.findByIdAndUpdate(
    id,
    { $set: { nurses: data } },
    { new: true }
  );
};

module.exports = { create, update };
