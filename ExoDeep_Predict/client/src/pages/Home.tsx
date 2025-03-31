// import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Chart } from "./../components/Chart";
// import { useRouter } from "next/navigation";
// import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CryptoCard } from "@/components/CryptoCard";

// Mock data for cryptocurrencies
// const cryptoData = [
//   {
//     id: "bitcoin",
//     name: "Bitcoin",
//     symbol: "BTC",
//     current_price: 67542.12,
//     price_change_percentage_24h: 2.34,
//     market_cap: 1324567890123,
//     image: "/placeholder.svg?height=32&width=32",
//   },
//   {
//     id: "ethereum",
//     name: "Ethereum",
//     symbol: "ETH",
//     current_price: 3456.78,
//     price_change_percentage_24h: -1.23,
//     market_cap: 415678901234,
//     image: "/placeholder.svg?height=32&width=32",
//   },
//   {
//     id: "binancecoin",
//     name: "Binance Coin",
//     symbol: "BNB",
//     current_price: 567.89,
//     price_change_percentage_24h: 0.45,
//     market_cap: 93456789012,
//     image: "/placeholder.svg?height=32&width=32",
//   },
//   {
//     id: "solana",
//     name: "Solana",
//     symbol: "SOL",
//     current_price: 145.67,
//     price_change_percentage_24h: 5.67,
//     market_cap: 62345678901,
//     image: "/placeholder.svg?height=32&width=32",
//   },
//   {
//     id: "cardano",
//     name: "Cardano",
//     symbol: "ADA",
//     current_price: 0.45,
//     price_change_percentage_24h: -2.78,
//     market_cap: 15678901234,
//     image: "/placeholder.svg?height=32&width=32",
//   },
// ];

const Home = () => {
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/historical"
        );
        console.log(response);
        // Assume the backend returns an object with a "historical" array
        setHistoricalData(response.data.historical);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchHistorical();
  }, []);

  return (
    <div>
      <div className="py-4">
        <CryptoCard />
      </div>
      <Chart historicalData={historicalData} />
    </div>
  );
};

export default Home;
