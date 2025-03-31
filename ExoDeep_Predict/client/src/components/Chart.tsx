"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, Legend } from "recharts";
import { format, addDays, subDays, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the prediction data type
export type PredictionDataType = {
  date: string;
  predictions: {
    quantile_0_1: number;
    quantile_0_5: number;
    quantile_0_9: number;
  };
};

// Updated chart config to include the prediction lines
const chartConfig = {
  BTC_Price: {
    label: "Actual Price",
    color: "hsl(208 100% 50%)",
  },
  quantile_0_1: {
    label: "Lower Bound (30%)",
    color: "hsl(120 70% 50%)",
  },
  quantile_0_5: {
    label: "Median (50%)",
    color: "hsl(32 100% 50%)",
  },
  quantile_0_9: {
    label: "Upper Bound (70%)",
    color: "hsl(0 100% 50%)",
  },
} satisfies ChartConfig;

export type historicalDataType = {
  BTC_Price: number;
  Date: string;
  quantile_0_1?: number;
  quantile_0_5?: number;
  quantile_0_9?: number;
};

const furture = {
  future: [
    {
      date: "2024-08-16",
      BTC_Market_Cap: 1153353002063.15,
      Gold_Price: 2507.28,
      NASDAQ_Price: 17631.72,
      SP_500_Price: 5554.25,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-17",
      BTC_Market_Cap: 1153353002063.15,
      Gold_Price: 2507.28,
      NASDAQ_Price: 17631.72,
      SP_500_Price: 5554.25,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-18",
      BTC_Market_Cap: 1169880838222.38,
      Gold_Price: 2507.28,
      NASDAQ_Price: 17631.72,
      SP_500_Price: 5554.25,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-19",
      BTC_Market_Cap: 1177542188593.51,
      Gold_Price: 2503.92,
      NASDAQ_Price: 17876.77,
      SP_500_Price: 5608.25,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-20",
      BTC_Market_Cap: 1157509291689.1,
      Gold_Price: 2513.74,
      NASDAQ_Price: 17816.94,
      SP_500_Price: 5597.12,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-21",
      BTC_Market_Cap: 1185948542857.01,
      Gold_Price: 2511.95,
      NASDAQ_Price: 17918.99,
      SP_500_Price: 5620.85,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-22",
      BTC_Market_Cap: 1180932346414.11,
      Gold_Price: 2483.29,
      NASDAQ_Price: 17619.35,
      SP_500_Price: 5570.64,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-23",
      BTC_Market_Cap: 1197426375299.59,
      Gold_Price: 2512.07,
      NASDAQ_Price: 17877.79,
      SP_500_Price: 5634.61,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-24",
      BTC_Market_Cap: 1218888710712.56,
      Gold_Price: 2512.07,
      NASDAQ_Price: 17877.79,
      SP_500_Price: 5634.61,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-25",
      BTC_Market_Cap: 1264412172950.7,
      Gold_Price: 2512.07,
      NASDAQ_Price: 17877.79,
      SP_500_Price: 5634.61,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-26",
      BTC_Market_Cap: 1265316086913.18,
      Gold_Price: 2516.89,
      NASDAQ_Price: 17725.77,
      SP_500_Price: 5616.84,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-27",
      BTC_Market_Cap: 1256706917886.48,
      Gold_Price: 2524.57,
      NASDAQ_Price: 17754.82,
      SP_500_Price: 5625.8,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-28",
      BTC_Market_Cap: 1227021403141.02,
      Gold_Price: 2502.25,
      NASDAQ_Price: 17556.03,
      SP_500_Price: 5592.18,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-29",
      BTC_Market_Cap: 1170041472108.02,
      Gold_Price: 2521.18,
      NASDAQ_Price: 17516.43,
      SP_500_Price: 5591.96,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-30",
      BTC_Market_Cap: 1178040523912.07,
      Gold_Price: 2503.03,
      NASDAQ_Price: 17713.62,
      SP_500_Price: 5648.4,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-08-31",
      BTC_Market_Cap: 1166363249388.67,
      Gold_Price: 2503.03,
      NASDAQ_Price: 17713.62,
      SP_500_Price: 5648.4,
      IGREA: -0.026212,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-01",
      BTC_Market_Cap: 1166833451801.52,
      Gold_Price: 2503.03,
      NASDAQ_Price: 17713.62,
      SP_500_Price: 5648.4,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-02",
      BTC_Market_Cap: 1149971682521.67,
      Gold_Price: 2499.29,
      NASDAQ_Price: 17713.62,
      SP_500_Price: 5648.4,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-03",
      BTC_Market_Cap: 1149670462101.47,
      Gold_Price: 2492.76,
      NASDAQ_Price: 17136.3,
      SP_500_Price: 5528.93,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-04",
      BTC_Market_Cap: 1157513796045.65,
      Gold_Price: 2494.19,
      NASDAQ_Price: 17084.3,
      SP_500_Price: 5520.07,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-05",
      BTC_Market_Cap: 1129078127994.11,
      Gold_Price: 2516.32,
      NASDAQ_Price: 17127.66,
      SP_500_Price: 5503.41,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-06",
      BTC_Market_Cap: 1121929134241.6,
      Gold_Price: 2497.03,
      NASDAQ_Price: 16690.83,
      SP_500_Price: 5408.42,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-07",
      BTC_Market_Cap: 1091996852510.76,
      Gold_Price: 2497.03,
      NASDAQ_Price: 16690.83,
      SP_500_Price: 5408.42,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-08",
      BTC_Market_Cap: 1071141347783.92,
      Gold_Price: 2497.03,
      NASDAQ_Price: 16690.83,
      SP_500_Price: 5408.42,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-09",
      BTC_Market_Cap: 1073878187187.48,
      Gold_Price: 2505.25,
      NASDAQ_Price: 16884.6,
      SP_500_Price: 5471.05,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-10",
      BTC_Market_Cap: 1099907178125.36,
      Gold_Price: 2516.12,
      NASDAQ_Price: 17025.88,
      SP_500_Price: 5495.52,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-11",
      BTC_Market_Cap: 1128119592931.96,
      Gold_Price: 2511.44,
      NASDAQ_Price: 17395.53,
      SP_500_Price: 5554.13,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-12",
      BTC_Market_Cap: 1124141546458.11,
      Gold_Price: 2558.75,
      NASDAQ_Price: 17569.68,
      SP_500_Price: 5595.76,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-13",
      BTC_Market_Cap: 1146172572942.62,
      Gold_Price: 2576.5,
      NASDAQ_Price: 17683.98,
      SP_500_Price: 5626.02,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
    {
      date: "2024-09-14",
      BTC_Market_Cap: 1159355964877.58,
      Gold_Price: 2576.5,
      NASDAQ_Price: 17683.98,
      SP_500_Price: 5626.02,
      IGREA: 13.461829,
      interest_rate: 5.33,
    },
  ],
};

export function Chart({
  historicalData,
}: {
  historicalData: historicalDataType[];
}) {
  const startDate = new Date("2024-08-16");
  const endDate = addDays(startDate, 29); // 30 days total (including start date)
  const [date, setDate] = useState<Date | undefined>(startDate);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [selectionMode, setSelectionMode] = useState<"single" | "range">(
    "single"
  );
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionDataType[]>(
    []
  );
  const [fullPredictionData, setFullPredictionData] = useState<
    PredictionDataType[]
  >([]);

  useEffect(() => {
    console.log(fullPredictionData);
  }, [fullPredictionData]);

  useEffect(() => {
    const predict = async () => {
      try {
        // Change the URL to your backend's address if needed (e.g. http://localhost:5000)
        const response = await fetch("http://127.0.0.1:5000/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(furture),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch predictions");
        }

        const data = await response.json();
        // The response is expected to be an object with a "predictions" array.
        setFullPredictionData(data.predictions);
        console.log("Predictions:", data.predictions);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    predict();
  }, []);

  // Function to merge historical and prediction data for chart display
  const getMergedChartData = () => {
    if (!showPredictions || predictionData.length === 0) {
      return historicalData;
    }

    // Get the first prediction date
    const firstPredictionDate = parseISO(predictionData[0].date);

    // Calculate the cutoff date (7 days before the first prediction)
    const cutoffDate = subDays(firstPredictionDate, 365);

    // Filter historical data to only include the last 7 days before predictions
    const recentHistoricalData = historicalData.filter((item) => {
      const itemDate = new Date(item.Date);
      return itemDate >= cutoffDate && itemDate < firstPredictionDate;
    });

    // Create merged data with filtered historical and prediction values
    const mergedData = [...recentHistoricalData];

    // Add prediction data points
    predictionData.forEach((pred) => {
      mergedData.push({
        Date: pred.date,
        BTC_Price: pred.predictions.quantile_0_5, // No actual price for future dates
        quantile_0_1: pred.predictions.quantile_0_1,
        quantile_0_5: pred.predictions.quantile_0_5,
        quantile_0_9: pred.predictions.quantile_0_9,
      });
    });

    // Sort by date
    return mergedData.sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );
  };

  const handlePredictClick = async () => {
    setIsPredicting(true);

    try {
      // Parse the prediction data
      const parsedPredictions = fullPredictionData?.map((item) => ({
        date: item.date,
        predictions: {
          quantile_0_1: Number(item?.predictions?.quantile_0_1),
          quantile_0_5: Number(item?.predictions?.quantile_0_5),
          quantile_0_9: Number(item?.predictions?.quantile_0_9),
        },
      }));

      console.log(parsedPredictions);

      setPredictionData(parsedPredictions);
      setShowPredictions(true);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  // Function to reset the view to show all historical data
  const handleResetView = () => {
    setShowPredictions(false);
    setPredictionData([]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-4 border-b p-6 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle>Bitcoin Price Chart</CardTitle>
          <CardDescription>
            {showPredictions
              ? "Recent 7 days and predicted Bitcoin price data"
              : "Historical Bitcoin price data"}
          </CardDescription>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[240px]",
                  (selectionMode === "single" && !date) ||
                    (selectionMode === "range" &&
                      !dateRange.from &&
                      "text-muted-foreground")
                )}
                disabled={showPredictions}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectionMode === "single" && date
                  ? format(date, "PPP")
                  : selectionMode === "range" && dateRange.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                        dateRange.to,
                        "MMM d, yyyy"
                      )}`
                    : format(dateRange.from, "PPP")
                  : "Select date(s)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="p-3 border-b">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant={selectionMode === "single" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectionMode("single")}
                  >
                    Single Date
                  </Button>
                  <Button
                    variant={selectionMode === "range" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectionMode("range")}
                  >
                    Date Range
                  </Button>
                </div>
              </div>
              {selectionMode === "single" ? (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    return date < startDate || date > endDate;
                  }}
                  initialFocus
                />
              ) : (
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) =>
                    setDateRange({ from: range?.from, to: range?.to })
                  }
                  disabled={(date) => {
                    return date < startDate || date > endDate;
                  }}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
          {!showPredictions ? (
            <Button
              onClick={handlePredictClick}
              disabled={
                isPredicting ||
                (selectionMode === "single" && !date) ||
                (selectionMode === "range" && !dateRange.from)
              }
            >
              {isPredicting ? "Predicting..." : "Predict Future Prices"}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleResetView}>
              Reset View
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={getMergedChartData()}
            margin={{
              left: 12,
              right: 12,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="Date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="BTC_Price"
              type="monotone"
              stroke={chartConfig.BTC_Price.color}
              strokeWidth={2}
              dot={false}
              name={chartConfig.BTC_Price.label}
              connectNulls={false}
            />
            {showPredictions && (
              <>
                <Line
                  dataKey="quantile_0_1"
                  type="monotone"
                  stroke={chartConfig.quantile_0_1.color}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name={chartConfig.quantile_0_1.label}
                />
                <Line
                  dataKey="quantile_0_5"
                  type="monotone"
                  stroke={chartConfig.quantile_0_5.color}
                  strokeWidth={1.5}
                  dot={false}
                  name={chartConfig.quantile_0_5.label}
                />
                <Line
                  dataKey="quantile_0_9"
                  type="monotone"
                  stroke={chartConfig.quantile_0_9.color}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name={chartConfig.quantile_0_9.label}
                />
              </>
            )}
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: "10px" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
