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

  const normalizedOriginCity = originCity?.trim().toLowerCase();

  const normalizedDestinationCity =
    destinationCity?.trim().toLowerCase();

  const normalizedShipmentType =
    shipmentType?.trim().toLowerCase();

  const normalizedParcelCategory =
    parcelCategory?.trim().toLowerCase();

  // ------------------------------------
  // 2. Validate weight
  // ------------------------------------

  if (!weight || weight <= 0) {
    throw new Error("Parcel weight must be greater than 0");
  }

  // ------------------------------------
  // 3. Validate shipment type
  // ------------------------------------

  if (
    !["national", "international"].includes(
      normalizedShipmentType
    )
  ) {
    throw new Error("Invalid shipment type");
  }

  // ------------------------------------
  // 4. Check same city
  // ------------------------------------

  const isSameCity =
    normalizedOriginCity === normalizedDestinationCity;

  // ------------------------------------
  // 5. Delivery type charge
  // ------------------------------------

  const deliveryTypeCharge =
    DELIVERY_TYPE_CHARGES[deliveryType];

  if (deliveryTypeCharge === undefined) {
    throw new Error("Invalid delivery type");
  }

  // ------------------------------------
  // 6. Category charge
  // ------------------------------------

  const categoryCharges =
    normalizedShipmentType === "national"
      ? NATIONAL_CATEGORY_CHARGES
      : INTERNATIONAL_CATEGORY_CHARGES;

  const categoryCharge =
    categoryCharges[normalizedParcelCategory];

  if (categoryCharge === undefined) {
    throw new Error("Invalid parcel category");
  }

  // ------------------------------------
  // 7. Base price
  // ------------------------------------

  let basePrice;
  let deliveryZone;

  if (normalizedShipmentType === "national") {
    basePrice = isSameCity ? 50 : 100;

    deliveryZone = isSameCity
      ? "same_city"
      : "out_of_city";
  } else {
    // International shipment
    basePrice = 1500;
    deliveryZone = "international";
  }

  // ------------------------------------
  // 8. Weight charge
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
  // 9. Remote area charge
  // ------------------------------------

  const remoteAreaCharge = isRemoteArea
    ? REMOTE_AREA_CHARGE
    : 0;

  // ------------------------------------
  // 10. COD charge
  // ------------------------------------

  if (codAmount < 0) {
    throw new Error("COD amount cannot be negative");
  }

  const codCharge =
    codAmount > 0
      ? codAmount * COD_RATE
      : 0;

  // ------------------------------------
  // 11. Calculate subtotal
  // ------------------------------------

  const subtotal =
    basePrice +
    weightCharge +
    categoryCharge +
    deliveryTypeCharge +
    remoteAreaCharge +
    codCharge;

  // ------------------------------------
  // 12. Validate discount
  // ------------------------------------

  const finalDiscount = Math.min(
    Math.max(discount || 0, 0),
    subtotal
  );

  // ------------------------------------
  // 13. Calculate total
  // ------------------------------------

  const total = subtotal - finalDiscount;

  // ------------------------------------
  // 14. Return pricing breakdown
  // ------------------------------------

  return {
    shipmentType: normalizedShipmentType,

    deliveryZone,

    parcelCategory: normalizedParcelCategory,

    basePrice,

    weightCharge,

    categoryCharge,

    deliveryTypeCharge,

    remoteAreaCharge,

    codCharge,

    discount: finalDiscount,

    subtotal,

    total,

    currency: "BDT",
  };
};