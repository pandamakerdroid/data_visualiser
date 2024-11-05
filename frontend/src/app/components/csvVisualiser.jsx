'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Container, Typography, Grid2, Input, Button, Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { fetchAvailableCsvs, fetchCsv, uploadCsv } from '@/app/apis/csvApis';
import { useRouter } from 'next/compat/router';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CsvVisualiser() {
  const [chartData, setChartData] = useState({});
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvs, setCsvs] = useState([]);
  const [selectedCsvContent, setSelectedCsvContent] = useState();
  const [headers, setHeaders] = useState([]);
  const [uniqueValues, setUniqueValues] = useState({});
  const [filters, setFilters] = useState({});
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);
  const [axisComplete, setAxisComplete] = useState(false);
  const [tempXAxis, setTempXAxis] = useState('');
  const [tempYAxis, setTempYAxis] = useState([]);
  const [tempFilters, setTempFilters] = useState({});

  const router = useRouter();

  const handleTempFilterChange = (header, value) => {
    setTempFilters(prevFilters => ({
      ...prevFilters,
      [header]: value
    }));
  };

  useEffect(() => {
    // Set `filtersComplete` to true only if `xAxis` and at least one `yAxis` are selected
    if (xAxis && yAxis.length > 0) {
      setAxisComplete(true);
    } else {
      setAxisComplete(false);
    }
  }, [xAxis, yAxis]);

  useEffect(() => {
    if (axisComplete && selectedCsvContent) {
      formatDataForChart(selectedCsvContent);
    }
  }, [axisComplete, selectedCsvContent, filters]);

  const parseCsvString = (csvString) => {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
    setHeaders(headers);
    setUniqueValues(generateUniqueValues(headers, data));
    return data;
  };

  const generateUniqueValues = (headers, data) => {
    const uniqueValues = {};
    headers.forEach(header => {
      uniqueValues[header] = [...new Set(data.map(row => row[header]))];
    });
    return uniqueValues;
  };

  const getCsv = async (path) => {
    const data = await fetchCsv(path);
    if (data === 401) {
      router.push('/login');
    }
    setFilename(data.filename);
    setSelectedCsvContent(parseCsvString(data.content));
  };

  const getAllCsvs = async () => {
    const data = await fetchAvailableCsvs();
    if (data === 401) {
      router.push('/login');
    }
    setCsvs(data);
  };

  useEffect(() => {
    getAllCsvs();
  }, []);

  useEffect(() => {
    if (selectedCsvContent && xAxis && yAxis.length > 0) {
      formatDataForChart(selectedCsvContent);
    }
  }, [selectedCsvContent, xAxis, yAxis, filters]);

  const handleCsvFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const data = await uploadCsv(formData);
      if (data === 401) {
        router.push('/');
      }
      await getCsv(data.csv_name);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Failed to upload the CSV file");
    } finally {
      setLoading(false);
    }
  };

  const formatDataForChart = (data) => {
    if (!data || !Array.isArray(data) || !xAxis || yAxis.length === 0) {
      console.error("Check if data is correct.");
      return {};
    }

    // Apply filters to the data
    const filteredData = data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        return value ? row[key] === value : true;
      });
    });

    // Extract unique values for the x-axis (labels)
    const labels = [...new Set(filteredData.map(row => row[xAxis]))].sort();

    // Prepare y-axis datasets for each selected yAxis field
    const groupedData = yAxis.reduce((acc, yField) => {
      acc[yField] = Array(labels.length).fill(null);
      return acc;
    }, {});

    // Populate groupedData with values for each yAxis field
    filteredData.forEach(row => {
      const xIndex = labels.indexOf(row[xAxis]);
      yAxis.forEach(yField => {
        if (xIndex !== -1) {
          groupedData[yField][xIndex] = parseFloat(row[yField]) || 0;
        }
      });
    });

    const concatenatedLabel = [
      yAxis.join(' - '),
      ...Object.entries(filters)
        .filter(([key, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
    ].join(', ');

    // Prepare the Chart.js data structure
    const chartData = {
      labels,
      datasets: yAxis.map(yField => ({
        label: concatenatedLabel,
        data: groupedData[yField],
        fill: false,
        borderColor: getColor(yField),
        backgroundColor: getColor(yField),
      })),
    };

    setChartData(chartData);
  };

  const getColor = (key) => {
    const value = key.split('').reduce((sum, char, index) => {
      return sum + Math.pow(char.charCodeAt(0), index * 2);
    }, 0);
    return `#${Math.floor(value).toString(16).slice(-6)}`;
  };

  return (
    <Container>
      <Input type="file" accept=".csv" onChange={handleCsvFileUpload} />
      <Typography variant="h2">{filename}</Typography>
      {loading && <Typography>Processing your file...</Typography>}

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography>List of uploaded CSVs</Typography>
        <Grid2 container spacing={2}>
          {csvs.csvs && csvs.csvs.length > 0 &&
            csvs.csvs.map((csv, index) => (
              <Grid2 item xs={2} key={`csv${index}`}>
                <Button variant="contained" onClick={() => getCsv(csv.name)}>
                  {csv.name}
                </Button>
              </Grid2>
            ))
          }
        </Grid2>
      </Box>

      {selectedCsvContent &&
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 3 }}>
            {headers.map((header, index) => (
              header !== xAxis && !tempYAxis.includes(header) && (
                <FormControl key={`filter-${index}`} sx={{ minWidth: 120 }}>
                  <InputLabel>{header}</InputLabel>
                  <Select
                    value={tempFilters[header] || ''}
                    onChange={(e) => handleTempFilterChange(header, e.target.value)}
                    label={header}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {uniqueValues[header]?.map((value, idx) => (
                      <MenuItem key={`${header}-${idx}`} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
            <FormControl sx={{ width: 200 }}>
              <InputLabel>X-Axis</InputLabel>
              <Select value={tempXAxis} onChange={(e) => setTempXAxis(e.target.value)} label="X-Axis">
                {headers.map((header, index) => (
                  <MenuItem key={`xKey-${index}`} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: 200 }}>
              <InputLabel>Y-Axis</InputLabel>
              <Select
                multiple
                value={tempYAxis}
                onChange={(e) => setTempYAxis(e.target.value)}
                label="Y-Axis"
              >
                {headers.map((header, index) => (
                  <MenuItem key={`yKey-${index}`} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={() => {
              setXAxis(tempXAxis);
              setYAxis(tempYAxis);
              setFilters(tempFilters);
            }}>
              Apply
            </Button>
          </Box>
        </>
      }

      <Box sx={{ height: 400 }}>
        {axisComplete && chartData.labels && chartData.datasets ? (
          <Line data={chartData} />
        ) : (
          <Box>
            <Typography>Please select the X-Axis, the Y-Axis to plot the chart, render the chart by click on Apply.</Typography>
            <Typography>For performance reason, currently this chart displays 1 line, means data will be groupped, if the selection is empty, no line is plotted.</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
