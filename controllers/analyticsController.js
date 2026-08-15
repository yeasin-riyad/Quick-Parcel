import { Parcel } from "../models/Parcel.js";
import {
  getDashboardStatsData,
  getLastMonths,
} from "../services/analyticsServices.js";

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const data = await getDashboardStatsData();

    res.status(200).json({
      success: true,
      data: data.monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};

export const getParcelGrowth = async (req, res, next) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 8,
      20,
    );

    const data = await getDashboardStatsData();

    const parcelGrowth = data.monthlyParcels.slice(-limit);

    res.status(200).json({
      success: true,
      data: parcelGrowth,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopCities = async (req, res, next) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 8,
      20,
    );

    const data = await Parcel.aggregate([
      {
        $match: {
          destinationCity: {
            $type: "string",
            $ne: "",
          },
        },
      },

      {
        $group: {
          _id: "$destinationCity",
          parcels: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          parcels: -1,
        },
      },

      {
        $limit: limit,
      },

      {
        $project: {
          _id: 0,
          city: "$_id",
          parcels: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryPerformance = async (
  req,
  res,
  next,
) => {
  try {
    const months = getLastMonths(12);
    const startDate = months[0].start;

    const agg = await Parcel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $project: {
          y: {
            $year: "$createdAt",
          },

          m: {
            $month: "$createdAt",
          },

          currentStatus: 1,
        },
      },

      {
        $group: {
          _id: {
            y: "$y",
            m: "$m",
          },

          total: {
            $sum: 1,
          },

          delivered: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "delivered",
                  ],
                },
                1,
                0,
              ],
            },
          },

          failed: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "failed",
                  ],
                },
                1,
                0,
              ],
            },
          },

          returned: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "returned",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          key: {
            $concat: [
              {
                $toString: "$_id.y",
              },
              "-",
              {
                $cond: [
                  {
                    $lt: ["$_id.m", 10],
                  },
                  {
                    $concat: [
                      "0",
                      {
                        $toString: "$_id.m",
                      },
                    ],
                  },
                  {
                    $toString: "$_id.m",
                  },
                ],
              },
            ],
          },

          total: 1,
          delivered: 1,
          failed: 1,
          returned: 1,
        },
      },

      {
        $sort: {
          key: 1,
        },
      },
    ]);

    const performanceMap = {};

    for (const row of agg) {
      performanceMap[row.key] = row;
    }

    const data = months.map((month) => {
      const row = performanceMap[month.key];

      const total = row?.total || 0;
      const delivered = row?.delivered || 0;
      const failed = row?.failed || 0;
      const returned = row?.returned || 0;

      const successRate =
        total > 0
          ? Number(
              ((delivered / total) * 100).toFixed(2),
            )
          : 0;

      const failureRate =
        total > 0
          ? Number(
              ((failed / total) * 100).toFixed(2),
            )
          : 0;

      const returnRate =
        total > 0
          ? Number(
              ((returned / total) * 100).toFixed(2),
            )
          : 0;

      return {
        month: month.month,
        total,
        delivered,
        failed,
        returned,
        successRate,
        failureRate,
        returnRate,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (
  req,
  res,
  next,
) => {
  try {
    const [summary] = await Parcel.aggregate([
      {
        $group: {
          _id: null,

          totalParcels: {
            $sum: 1,
          },

          delivered: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "delivered",
                  ],
                },
                1,
                0,
              ],
            },
          },

          pending: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "pending",
                  ],
                },
                1,
                0,
              ],
            },
          },

          inTransit: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "in_transit",
                  ],
                },
                1,
                0,
              ],
            },
          },

          outForDelivery: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "out_for_delivery",
                  ],
                },
                1,
                0,
              ],
            },
          },

          failed: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "failed",
                  ],
                },
                1,
                0,
              ],
            },
          },

          returned: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$currentStatus",
                    "returned",
                  ],
                },
                1,
                0,
              ],
            },
          },

          revenue: {
            $sum: "$pricing.total",
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalParcels: 1,
          delivered: 1,
          pending: 1,
          inTransit: 1,
          outForDelivery: 1,
          failed: 1,
          returned: 1,
          revenue: 1,

          successRate: {
            $cond: [
              {
                $gt: ["$totalParcels", 0],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      "$delivered",
                      "$totalParcels",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },

          failureRate: {
            $cond: [
              {
                $gt: ["$totalParcels", 0],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      "$failed",
                      "$totalParcels",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },

          returnRate: {
            $cond: [
              {
                $gt: ["$totalParcels", 0],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      "$returned",
                      "$totalParcels",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);

    const data = summary || {
      totalParcels: 0,
      delivered: 0,
      pending: 0,
      inTransit: 0,
      outForDelivery: 0,
      failed: 0,
      returned: 0,
      revenue: 0,
      successRate: 0,
      failureRate: 0,
      returnRate: 0,
    };

    data.successRate = Number(
      data.successRate.toFixed(2),
    );

    data.failureRate = Number(
      data.failureRate.toFixed(2),
    );

    data.returnRate = Number(
      data.returnRate.toFixed(2),
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};