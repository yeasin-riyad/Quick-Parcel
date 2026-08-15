import { Parcel } from "../models/Parcel.js";
import { User } from "../models/User.js";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PARCEL_STATUSES = [
  "pending",
  "picked_up",
  "arrived_at_hub",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "returned",
];

const toMonthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");

  return `${y}-${m}`;
};

export const getLastMonths = (n) => {
  const now = new Date();
  const months = [];

  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1,
    );

    months.push({
      key: toMonthKey(date),
      month: MONTH_LABELS[date.getMonth()],
      start: new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
      ),
    });
  }

  return months;
};

const arrayToKeyedMap = (
  rows,
  keyField,
  valueField,
) => {
  const out = {};

  for (const row of rows) {
    if (
      row &&
      row[keyField] !== undefined
    ) {
      out[row[keyField]] =
        row[valueField] || 0;
    }
  }

  return out;
};

const monthKeyProject = (groupIdPath) => ({
  $concat: [
    { $toString: `${groupIdPath}.y` },
    "-",
    {
      $cond: [
        {
          $lt: [
            `${groupIdPath}.m`,
            10,
          ],
        },
        {
          $concat: [
            "0",
            {
              $toString: `${groupIdPath}.m`,
            },
          ],
        },
        {
          $toString: `${groupIdPath}.m`,
        },
      ],
    },
  ],
});

export const getDashboardStatsData = async () => {
  const months = getLastMonths(12);

  const startDate = months[0].start;

  const [
    totalParcels,
    totalUsers,
    totalRevenueAgg,
    parcelsPerMonthAgg,
    revenuePerMonthAgg,
    usersPerMonthAgg,
    statusAgg,
    weightBucketAgg,
  ] = await Promise.all([
    Parcel.countDocuments(),

    User.countDocuments(),

    Parcel.aggregate([
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$pricing.total",
          },
        },
      },
    ]),

    Parcel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            y: {
              $year: "$createdAt",
            },
            m: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          key: monthKeyProject("$_id"),
          count: 1,
        },
      },
      {
        $sort: {
          key: 1,
        },
      },
    ]),

    Parcel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            y: {
              $year: "$createdAt",
            },
            m: {
              $month: "$createdAt",
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
          key: monthKeyProject("$_id"),
          revenue: 1,
        },
      },
      {
        $sort: {
          key: 1,
        },
      },
    ]),

    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            y: {
              $year: "$createdAt",
            },
            m: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          key: monthKeyProject("$_id"),
          count: 1,
        },
      },
      {
        $sort: {
          key: 1,
        },
      },
    ]),

    Parcel.aggregate([
      {
        $group: {
          _id: "$currentStatus",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]),

    Parcel.aggregate([
      {
        $bucket: {
          groupBy: "$weight",

          boundaries: [
            0,
            1,
            3,
            5,
            10,
            20,
            50,
            101,
          ],

          default: "100kg+",

          output: {
            count: {
              $sum: 1,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          range: "$_id",
          count: 1,
        },
      },
    ]),
  ]);

  const parcelsPerMonth =
    arrayToKeyedMap(
      parcelsPerMonthAgg,
      "key",
      "count",
    );

  const revenuePerMonth =
    arrayToKeyedMap(
      revenuePerMonthAgg,
      "key",
      "revenue",
    );

  const usersPerMonth =
    arrayToKeyedMap(
      usersPerMonthAgg,
      "key",
      "count",
    );

  const statusMap =
    arrayToKeyedMap(
      statusAgg,
      "status",
      "count",
    );

  const monthlyParcels =
    months.map((month) => ({
      month: month.month,
      parcels:
        parcelsPerMonth[month.key] || 0,
    }));

  const monthlyRevenue =
    months.map((month) => ({
      month: month.month,
      revenue:
        revenuePerMonth[month.key] || 0,
    }));

  const userGrowth =
    months.map((month) => ({
      month: month.month,
      users:
        usersPerMonth[month.key] || 0,
    }));

  const statusDistribution =
    PARCEL_STATUSES.map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));

  const totalRevenue =
    totalRevenueAgg[0]?.revenue || 0;

  const weightDistribution =
    weightBucketAgg.map((item) => ({
      range: item.range,
      count: item.count,
    }));

  return {
    totals: {
      parcels:totalParcels,
      users:totalUsers,
      revenue:totalRevenue,
    },

    monthlyParcels,

    monthlyRevenue,

    userGrowth,

    statusDistribution,

    weightDistribution,
    _meta:{startDate,months}
  };
};