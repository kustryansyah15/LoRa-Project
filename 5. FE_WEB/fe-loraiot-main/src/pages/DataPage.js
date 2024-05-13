import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CategoryScale, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
import Api from '../helper/Api';
import ShowChart from '../helper/ShowChart';
import ShowTable from '../helper/ShowTable';
import '../css/DatePicker.css';
import '../css/Chart.css';
import '../css/Table.css';


Chart.register(CategoryScale, LinearScale);

function DataPage() {
  const [data, setData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [nodes, setNodes] = useState([]);

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
    Api.getNodes()
      .then((res) => {
        setNodes(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  
  useEffect(() => {
    if (selectedDate) {
      Api.getDataByDate(selectedDate.toISOString().slice(0, 10))
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedDate]);

  const filterDate = (date) => {
    const formattedDate = date.toISOString().slice(0, 10);
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const formattedPreviousDate = previousDate.toISOString().split('T')[0];
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const formattedNextDate = nextDate.toISOString().split('T')[0];

    console.log('Prev day:', formattedPreviousDate, availableDates.includes(formattedPreviousDate));
    console.log(formattedDate, availableDates.includes(formattedDate));
    console.log('Next day:', formattedNextDate, availableDates.includes(formattedNextDate));

    return (
      (availableDates.includes(formattedDate) && availableDates.includes(formattedNextDate)) ||
      (!availableDates.includes(formattedDate) && availableDates.includes(formattedNextDate))
    );
  };

  return (
    <div className="container">
      <div className="chart-container">
        <div className="datepicker-container">
          <label htmlFor="datepicker">Date: </label>
          {availableDates.length > 0 && (
            <DatePicker
              id="datepicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              filterDate={filterDate}
              dateFormat="yyyy-MM-dd"
            />
          )}
        </div>
        <ShowTable data={nodes}/><br /><br />
        <ShowChart data={data} scale={"Suhu"} mode={"Avg"}/><br /><br />
        <ShowChart data={data} scale={"RH"} mode={"Avg"}/><br /><br />
        <ShowChart data={data} scale={"SH"} mode={"Avg"}/><br /><br />
        <ShowChart data={data} scale={"IC"} mode={"Avg"}/><br /><br />
      </div>
    </div>
  );
}

export default DataPage;