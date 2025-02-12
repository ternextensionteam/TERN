import React from 'react';
<<<<<<< HEAD

const IndexList = ({ items }) => {
=======
import './IndexList.css'; 

const IndexList = ({ items = []}) => {
>>>>>>> origin/main
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export default IndexList;