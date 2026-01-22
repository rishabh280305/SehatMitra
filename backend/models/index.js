// Central export file for all models
const User = require('./User');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const MedicalReport = require('./MedicalReport');
const Inventory = require('./Inventory');
const SupplyShop = require('./SupplyShop');

module.exports = {
  User,
  Appointment,
  Prescription,
  MedicalReport,
  Inventory,
  SupplyShop
};
