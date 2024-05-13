import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CategoryScale, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { Tooltip, IconButton } from '@mui/material';
import {  HelpOutline } from "@mui/icons-material";
import Api from '../helper/Api';
import ShowChart from '../helper/ShowChart';
import '../css/PageTitle.css';
import '../css/DatePicker.css';
import '../css/Chart.css';

Chart.register(CategoryScale, LinearScale);

function MonthlyDataPage() {
  const [data, setData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    Api.getAvailableDates()
      .then((res) => {
        const datesWithAvailableData = res.data.map((d) => d.Tanggal);
        setAvailableDates(datesWithAvailableData);
        if (datesWithAvailableData.length > 0) {
          setSelectedDate(new Date(datesWithAvailableData[0]));
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      Api.getDataByMonth(selectedDate.toISOString().slice(0, 7))
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedDate]);

  const tooltipText = 'These charts display the average data for each hour during the selected month.';

  // const filterDate = (date) => {
  //   const dateString = date.toISOString().slice(0, 10);
  //   const result = availableDates.includes(dateString);
  //   return result;
  // };

  return (
    <div className="container">
      <div className="chart-container">
        <div className="title-container">
          <h1>Monthly Data</h1>
          <Tooltip title={tooltipText}>
            <IconButton>
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </div>

        <div className="datepicker-container">
          <label htmlFor="datepicker">Date: </label>
          {availableDates.length > 0 && (
            <DatePicker
              id="datepicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              // filterDate={filterDate}
              showMonthYearPicker
              dateFormat="yyyy-MM"
            />
          )}
        </div>
        <ShowChart data={data} scale={"Suhu"} mode={"All"}/><br /><br />
        <ShowChart data={data} scale={"RH"} mode={"All"}/><br /><br />
        <ShowChart data={data} scale={"SH"} mode={"All"}/><br /><br />
        <ShowChart data={data} scale={"IC"} mode={"All"}/><br /><br />
      </div>
    </div>
  );
}

export default MonthlyDataPage;
