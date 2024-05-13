import axios from 'axios';

const baseApi = 'http://103.156.114.74:40424';

class Api {
  static getAvailableDates() {
    return axios.get(`${baseApi}/available-dates`);
  }

  static getDataByDate(date) {
    return axios.get(`${baseApi}/data/${date}`);
  }

  static getDataByMonth(month) {
    return axios.get(`${baseApi}/monthly-data/${month}`);
  }
  
  static downloadData(date) {
    return axios.get(`${baseApi}/download-data/${date}`);
  }

  static getNodes() {
    return axios.get(`${baseApi}/nodes`);
  }
}

export default Api;