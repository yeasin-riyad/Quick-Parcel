import {
  DELIVERY_TYPE_CHARGES,
  NATIONAL_CATEGORY_CHARGES,
  INTERNATIONAL_CATEGORY_CHARGES,
  REMOTE_AREA_CHARGE,
  COD_RATE,
  INCLUDED_WEIGHT,
  NATIONAL_EXTRA_WEIGHT_RATE,
  INTERNATIONAL_EXTRA_WEIGHT_RATE,
} from "../config/pricing.js";

export const calculateCost = ({
  originCity,
  destinationCity,
  shipmentType,
  parcelCategory,
  weight,
  deliveryType,
  isRemoteArea = false,
  codAmount = 0,
  discount = 0,
}) => {
  // ------------------------------------
  // 1. Normalize input
  // ------------------------------------

  const normalizedOriginCity = originCity.trim().toLowerCase();

  const normalizedDestinationCity =
    destinationCity.trim().toLowerCase();

  const normalizedShipmentType =
    shipmentType.trim().toLowerCase();

  // ------------------------------------
  // 2. Validate weight
  // ------------------------------------

  if (!weight || weight <= 0) {
    throw new Error("Parcel weight must be greater than 0");
  }

  // ------------------------------------
  // 3. Check same city
  // ------------------------------------

  const isSameCity =
    normalizedOriginCity === normalizedDestinationCity;

  // ------------------------------------
  // 4. Delivery type charge
  // ------------------------------------

  const deliveryTypeCharge =
    DELIVERY_TYPE_CHARGES[deliveryType] ?? 0;

  // ------------------------------------
  // 5. Determine category charge
  // ------------------------------------

  let categoryCharge = 0;

  if (normalizedShipmentType === "national") {
    categoryCharge =
      NATIONAL_CATEGORY_CHARGES[parcelCategory] ?? 0;
  } else if (normalizedShipmentType === "international") {
    categoryCharge =
      INTERNATIONAL_CATEGORY_CHARGES[parcelCategory] ?? 0;
  } else {
    throw new Error("Invalid shipment type");
  }

  // ------------------------------------
  // 6. Calculate base price
  // ------------------------------------

  let basePrice;

  if (normalizedShipmentType === "national") {
    basePrice = isSameCity ? 50 : 100;
  } else {
    // International shipment
    basePrice = 1500;
  }

  // ------------------------------------
  // 7. Calculate weight charge
  // ------------------------------------

  let weightCharge = 0;

  if (weight > INCLUDED_WEIGHT) {
    const extraWeight = weight - INCLUDED_WEIGHT;

    const weightRate =
      normalizedShipmentType === "national"
        ? NATIONAL_EXTRA_WEIGHT_RATE
        : INTERNATIONAL_EXTRA_WEIGHT_RATE;

    weightCharge = extraWeight * weightRate;
  }

  // ------------------------------------
  // 8. Remote area charge
  // ------------------------------------

  const remoteAreaCharge = isRemoteArea
    ? REMOTE_AREA_CHARGE
    : 0;

  // ------------------------------------
  // 9. COD charge
  // ------------------------------------

  const codCharge =
    codAmount > 0
      ? codAmount * COD_RATE
      : 0;

  // ------------------------------------
  // 10. Calculate subtotal
  // ------------------------------------

  const subtotal =
    basePrice +
    weightCharge +
    categoryCharge +
    deliveryTypeCharge +
    remoteAreaCharge +
    codCharge;

  // ------------------------------------
  // 11. Apply discount
  // ------------------------------------

  const finalDiscount = Math.min(
    Math.max(discount, 0),
    subtotal,
  );

  // ------------------------------------
  // 12. Calculate final total
  // ------------------------------------

  const total = subtotal - finalDiscount;

  // ------------------------------------
  // 13. Return pricing breakdown
  // ------------------------------------

  return {
    shipmentType: normalizedShipmentType,

    deliveryZone: isSameCity
      ? "same_city"
      : "out_of_city",

    parcelCategory,

    basePrice,

    weightCharge,

    categoryCharge,

    deliveryTypeCharge,

    remoteAreaCharge,

    codCharge,

    discount: finalDiscount,

    total,

    currency: "BDT",
  };
};