const DiningAreaSetting = require('../models/DiningAreaSetting');

const DINING_AREA_DEFAULTS = Object.freeze([
  { tableClass: 'window_terrace', reservationFee: 0 },
  { tableClass: 'main_hall', reservationFee: 0 },
  { tableClass: 'vip_salons', reservationFee: 500 }
]);

const getDiningAreaSettings = async () => {
  const savedSettings = await DiningAreaSetting.find().lean();
  const savedByClass = new Map(
    savedSettings.map((setting) => [setting.tableClass, setting])
  );

  return DINING_AREA_DEFAULTS.map((defaultSetting) => ({
    ...defaultSetting,
    ...savedByClass.get(defaultSetting.tableClass)
  }));
};

const getDiningAreaReservationFee = async (tableClass) => {
  const savedSetting = await DiningAreaSetting.findOne({ tableClass }).lean();
  if (savedSetting) return Number(savedSetting.reservationFee) || 0;

  const defaultSetting = DINING_AREA_DEFAULTS.find(
    (setting) => setting.tableClass === tableClass
  );
  return defaultSetting?.reservationFee || 0;
};

module.exports = {
  DINING_AREA_DEFAULTS,
  getDiningAreaSettings,
  getDiningAreaReservationFee
};
