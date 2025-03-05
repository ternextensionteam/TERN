import React, { useState } from 'react';
import "../tooltip";
import "../base.css";
import './IndexInput.css'; 
const IndexInput = ({ add, activeIndexSection}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      add( activeIndexSection, inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="index-input-container">
      <input
        type="text"
        className="index-input-field"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter link here"
      />
      <div className="index-input-button-container">
        <button className="index-input-button" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

export default IndexInput;