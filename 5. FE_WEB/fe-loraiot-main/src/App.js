import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MonthlyDataPage from './pages/MonthlyDataPage';
import DataPage from './pages/DataPage';
import DownloadPage from './pages/DownloadPage';
import Footer from './components/Footer';
import './css/App.css';

function App() {

  return (
    <Router>
      <div className="App">
        <div className="jumbotron-container">
          <div className="jumbotron">
            <h1>Lora IoT Monitoring System</h1>
          </div>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/monthly-data">Monthly Data</Link>
            </li>
            <li>
              <Link to="/download">Download</Link>
            </li>
          </ul>
        </nav>
        
        <Routes>
          <Route exact path="/" element={<DataPage />} />
          <Route path="/monthly-data" element={<MonthlyDataPage />}/>
          <Route path="/download" element={<DownloadPage />}/>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
