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
import { Container, Typography, Grid2, Input, Button, Box } from '@mui/material';
import { fetchAvailableCsvs, fetchCsv, uploadCsv } from '@/app/apis/csvApis';

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
  const [csvs, setCsvs]=useState([]);
  const [selectedCsv, setSelectedCsv]=useState();
  const [selectedCsvContent, setSelectedCsvContent]=useState();

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
  
    return data;
  };

  const getCsv=async(path)=>{
    const csv=await fetchCsv(path);
    setSelectedCsv(csv.filename);
    setSelectedCsvContent(parseCsvString(csv.content));
  }

  const getAllCsvs=async()=>{
    const all=await fetchAvailableCsvs();
    setCsvs(all);
  }

  useEffect(()=>{
    getAllCsvs();
  },[])

  useEffect(()=>{
    if(csvs.csvs && csvs.csvs.length>0){
      getCsv(csvs.csvs[0].url)
    }
  },[csvs])

  useEffect(()=>{
    if(selectedCsvContent){
      formatDataForCharts(selectedCsvContent);
    }
  },[selectedCsvContent])

  const handleCsvLoad = async (path) => {
    await getCsv(path);
  };

  const handleCsvFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const data = await uploadCsv(formData);
      await getCsv(data.url);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert("Failed to upload the CSV file");
    } finally {
      setLoading(false);
    }
  };

  const formatDataForCharts = (data) => {
    if (!data || !Array.isArray(data)) {
      console.error("Data is undefined or not an array:", data);
      return {};
    }
  
    const groupedData = {};
    const years = [...new Set(data.map(row => row.Year))].sort();
  
    data.forEach(row => {
      const { Model, Scenario, Region, Item, Variable, Year, Unit, Value } = row;
      const key = `${Region}`;
  
      if (!groupedData[Unit]) groupedData[Unit] = {};
      if (!groupedData[Unit][key]) groupedData[Unit][key] = Array(years.length).fill(null);
  
      const yearIndex = years.indexOf(Year);
      groupedData[Unit][key][yearIndex] = parseFloat(Value) || 0;
    });
  
    const chartDataByUnit = {};
    Object.keys(groupedData).forEach(unit => {
      chartDataByUnit[unit] = {
        labels: years,
        datasets: Object.keys(groupedData[unit]).map(key => ({
          label: key,
          data: groupedData[unit][key],
          fill: true,
          borderColor: getColor(key),
        })),
      };
    });
  
    setChartData(chartDataByUnit); 
    return chartDataByUnit;
  };

  const getColor = (key) => {
    var value = key.split('').reduce((sum, char, index) => {
      return sum + (Math.pow(char.charCodeAt(0), index * 2));
    }, 0);
    return `#${Math.floor(value).toString(16).slice(-6)}`;
  };

  return (
    <Container>
      <Input type="file" accept=".csv" onChange={handleCsvFileUpload} />
      <Typography variant="h2">{filename}</Typography>
      {loading && <Typography>Processing your file...</Typography>}
      <Box sx={{mt:2,mb:2}}>
        <Typography>List of uploaded Csvs</Typography>
        <Grid2 columns={6}>
          {csvs.csvs && csvs.csvs.length>0 &&
              csvs.csvs.map((csv,index)=>{
                return <Grid2 key={'csv'+index}>
                    <Button variant="contained" onClick={()=>handleCsvLoad(csv.url)}>
                      {csv.name}
                    </Button>
                </Grid2>
              })
          }
        </Grid2>
      </Box>
      <Grid2 container spacing={2} columns={2}>
        {chartData && Object.keys(chartData).length > 0 ? (
          Object.keys(chartData).map((unit, index) => (
            <Grid2 item size={1} key={unit} sx={{height:400}}>
              <Typography variant="h6">{unit}</Typography>
              <Line sx={{height:400}} key={'chart'+index} data={chartData[unit]} />
            </Grid2>
          ))
        ) : (
          !loading && <Typography>Please upload a CSV file to display the charts.</Typography>
        )}
      </Grid2>
    </Container>
  );
}
