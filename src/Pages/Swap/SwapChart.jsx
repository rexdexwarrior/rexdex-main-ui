import React from "react";
import { notIcon } from "../../Base/SVG";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";

export default function SwapChart({ isLoading }) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const data = {
    labels,
    datasets: [
      {
        label: "Product 1",

        data: [
          [-100, -20],
          [-10, -20],
          [-40, 15],
          [-20, 30],
          [-100, -20],
          [-10, -20],
        ],
        backgroundColor: "#FF0000",
      },
      {
        label: "Product 2",
        data: [
          [-100, 5],
          [-10, 24],
          [-20, 100],
          [40, 100],
          [-10, 24],
          [-20, 80],
        ],
        backgroundColor: "#008000",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          padding: 10,
          color: "#fff",
        },
        grid: {
          color: "#4F4F4F",
          drawTicks: false,
        },
      },
      y: {
        ticks: {
          color: "#fff",
          padding: 5,
        },
        grid: {
          drawTicks: false,
          color: "#4F4F4F",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
          padding: 20,
        },
      },
    },
  };

  return (
    <>
      {isLoading ? (
        <>
          <div className="swapChart placeholder">
            <div className="swapChart__header ">
              <div className="swapChart__header-row placeholder"></div>
              <div className="swapChart__header-price placeholder"></div>
              <p className="placeholder"></p>
            </div>
            <div className="swapChart__body ">
              <div className="swapChart__body-chart placeholder"></div>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          exit={{ opacity: 0, y: 20 }}
          className="swapChart"
        >
          <div className="swapChart__header">
            <div className="swapChart__header-row">
              <div className="swapChart__header-coins">
                <div className="swapChart__header-coin">
                  <img
                    src={process.env.PUBLIC_URL + "/images/icons/rexdex.png"}
                    alt="rexdex"
                  />
                  REXDEX
                </div>
                <div className="swapChart__header-coin">
                  <img
                    src={process.env.PUBLIC_URL + "/images/icons/tron.png"}
                    alt="tron"
                  />
                  TRON20
                </div>
              </div>
              <div className="swapChart__header-not">{notIcon}</div>
            </div>
            <div className="swapChart__header-price">0.2994</div>
            <p>Secondary text</p>
          </div>
          <div className="swapChart__body">
            <div className="swapChart__body-chart">
              <Bar options={options} data={data} />
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
