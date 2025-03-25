import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as echarts from 'echarts';
import './chart.css';

const RadarChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const labels = ['编曲', '演唱', '结构', '歌词'];

  // 提取分数和百分位数据
  const scores = [
    data.arrangement?.score || 0,
    data.vocal?.score || 0,
    data.structure?.score || 0,
    data.lyrics?.score || 0
  ];

  const percentiles = [
    (data.percentiles?.arrangement || 0) * 100,
    (data.percentiles?.vocal || 0) * 100,
    (data.percentiles?.structure || 0) * 100,
    (data.percentiles?.lyrics || 0) * 100
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const axisIndex = params.axisIndex || params.dataIndex;
          const label = labels[axisIndex];
          const score = scores[axisIndex];
          return params.name;
        //   return `${label}：${score.toFixed(1)}分 | 超过${percentile.toFixed(1)}%的歌曲`
        }
      },
      radar: {
        indicator: labels.map((name, index) => ({
          name: `${name}：${scores[index].toFixed(1)}分\n超过 ${percentiles[index].toFixed(0)}% 的歌曲`,
          //`${name}：${scores[index].toFixed(1)}分`,
          max: 100
        })),
        splitNumber: 5,
        axisName: {
          color: '#666',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#ddd',
            opacity: 0.5
          }
        },
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        splitArea: {
          show: false
        }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: percentiles,
            name: '百分位',
            itemStyle: {
              shape: 'circle',
              color: 'rgba(255, 99, 132, 0.8)'
            },
            areaStyle: {
              color: 'rgba(255, 99, 132, 0.2)'
            },
            lineStyle: {
              width: 1
            }
          },
          {
            value: scores.map(score => score * 10),
            name: '分数',
            itemStyle: {
              color: 'rgba(54, 162, 235, 0.8)'
            },
            areaStyle: {
              color: 'rgba(54, 162, 235, 0.2)'
            },
            lineStyle: {
              width: 1
            }
          }
        ]
      }]
    };

    chartInstance.current.setOption(option);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '540px',
        height: '400px',
        margin: '12px'
      }}
    />
  );

};

RadarChart.propTypes = {
  data: PropTypes.shape({
    arrangement: PropTypes.shape({
      score: PropTypes.number
    }),
    vocal: PropTypes.shape({
      score: PropTypes.number
    }),
    structure: PropTypes.shape({
      score: PropTypes.number
    }),
    lyrics: PropTypes.shape({
      score: PropTypes.number
    }),
    percentiles: PropTypes.shape({
      arrangement: PropTypes.number,
      vocal: PropTypes.number,
      structure: PropTypes.number,
      lyrics: PropTypes.number
    })
  }).isRequired
};

export default RadarChart;