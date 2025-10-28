/**
 * @typedef {Object} Location
 * @property {number} latitude
 * @property {number} longitude
 * @property {string=} address
 */

/**
 * @typedef {Object} EmergencyRequest
 * @property {string} id
 * @property {"AMBULANCE"|"FIRE"|"AIR"} type
 * @property {Location} location
 * @property {"PENDING"|"ACCEPTED"|"EN_ROUTE"|"ARRIVED"|"COMPLETED"|"CANCELLED"} status
 * @property {string} citizenId
 * @property {string=} providerId
 */

export const __types = {};
