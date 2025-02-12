import React, { useState } from 'react';
import './IndexInput.css'; 
const IndexInput = ({ add }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      add(inputValue);
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
        placeholder="Enter value"
      />
      <button className="index-input-button" onClick={handleAdd}>
        Add
      </button>
    </div>
  );
};

export default IndexInput;
