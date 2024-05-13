import React from 'react';
import '../css/Table.css';

const ShowTable = ({ data }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Node Id</th>
          <th>Longitude</th>
          <th>Latitude</th>
          <th>Is Need Shade</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.Node_Id}>
            <td>{item.Node_Id}</td>
            <td>{item.Longitude}</td>
            <td>{item.Latitude}</td>
            <td>{item.Is_Need_Shade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ShowTable;
