import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './MonthlyEarningsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface MonthlyEarning {
  month: string;
  amount: number;
}

interface MonthlyEarningsChartProps {
  data: MonthlyEarning[];
}

const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Earnings (£)',
        data: data.map(d => d.amount),
        backgroundColor: 'rgba(10, 31, 68, 0.8)',
        borderColor: '#0A1F44',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0A1F44',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `£${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '£' + value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="monthly-earnings-chart">
      <h3 className="monthly-earnings-chart__title">Last 12 Months</h3>
      <div className="monthly-earnings-chart__container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyEarningsChart;
