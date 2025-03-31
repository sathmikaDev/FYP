"use client";

// import { useNavigate } from "react-router-dom";
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Mock data for cryptocurrencies
const cryptoData = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    current_price: 67542.12,
    price_change_percentage_24h: 2.34,
    market_cap: 1324567890123,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    current_price: 3456.78,
    price_change_percentage_24h: -1.23,
    market_cap: 415678901234,
    image: "/placeholder.svg?height=32&width=32",
  },
];

export function CryptoCard() {
  //   const navigate = useNavigate();
  const [cryptos] = useState(cryptoData);
  const [, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  //   useEffect(() => {
  //     const fetchBTCData = () => {
  //       // Fetch Bitcoin data from the API
  //       fetch(
  //         "https://data-api.coindesk.com/asset/v2/metadata?assets=BTC,ETH,XRP&asset_lookup_priority=SYMBOL&quote_asset=USD&api_key=e135e6135ecd102862e3e4735db9f6341347f9dc0490b05ae86e9c428dc0a88f"
  //       )
  //         .then((response) => response.json())
  //         .then((data) => {
  //           console.log(data);
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching Bitcoin data:", error);
  //         });
  //     };

  //     fetchBTCData();
  //   }, []);

  //   const handleCardClick = () => {
  //     // navigate(`/crypto/${id}`);
  //   };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  return (
    <div className="flex items-center gap-4">
      {cryptos.map((crypto) => (
        <Card
          key={crypto.id}
          className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
          //   onClick={() => handleCardClick(crypto.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={crypto.image || "/placeholder.svg"}
                  alt={crypto.name}
                  className="w-8 h-8 rounded-full"
                />
                <CardTitle className="text-lg">{crypto.name}</CardTitle>
              </div>
              <Badge variant="outline">{crypto.symbol}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {formatPrice(crypto.current_price)}
                </span>
                <div
                  className={`flex items-center ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="h-12 bg-muted/30 rounded-md flex items-center justify-center">
                <TrendingUpIcon
                  className={`h-6 w-6 ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Market Cap: {formatMarketCap(crypto.market_cap)}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full"
              //   onClick={() => handleCardClick(crypto.id)}
            >
              View Historical Data
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
