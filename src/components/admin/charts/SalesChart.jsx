import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SalesChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    // Extract labels and data from API response
    const labels = data.map(item => item.product__category__name || 'Uncategorized');
    const values = data.map(item => item.total);
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales ($)',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <div style={{ height: '300px' }}>
      {data && data.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="text-center p-5">No sales data available</div>
      )}
    </div>
  );
};

export default SalesChart;