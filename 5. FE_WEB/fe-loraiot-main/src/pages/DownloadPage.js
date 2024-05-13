import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CategoryScale, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
import Api from '../helper/Api';
import '../css/DatePicker.css';
import '../css/Chart.css';
Chart.register(CategoryScale, LinearScale);

function DownloadPage() {
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

  const handleDownload = () => {
    if (selectedDate) {
        Api.downloadData(selectedDate.toISOString().slice(0, 10))
        .then((res) => {
          const element = document.createElement('a');
          const file = new Blob([res.data], { type: 'text/csv' });
          element.href = URL.createObjectURL(file);
          element.download = `Data-${selectedDate.toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(element);
          element.click();
        })
        .catch((error) => {
          console.error('Error downloading CSV:', error);
        });
      } else {
        console.log('Please select a date');
      }
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
        <button onClick={handleDownload}>Download Data</button>
      </div>
    </div>
  );
}

export default DownloadPage;