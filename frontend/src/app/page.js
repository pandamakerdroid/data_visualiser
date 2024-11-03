'use client';

import { useState, useEffect } from 'react';
import Login from '@/app/login/page';
import { Container, Tab, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import CsvVisualiser from './components/csvVisualiser';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const GeoTiffVisualiser = dynamic(
  () => import('./components/geotiffVisualiser'),
  { ssr: true }
)

const App = () => {
  const [data, setData] = useState([]);
  const [token, setToken] = useState('aaa');
  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    setToken(storedToken);
  }, []);

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Container>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="CSV Visualiser" value="1" />
            <Tab label="Geotiff Visualiser" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">        
          <CsvVisualiser />
        </TabPanel>
        <TabPanel value="2">        
          <GeoTiffVisualiser />
        </TabPanel>
      </TabContext>
    </Container>
  );
};

export default App;
