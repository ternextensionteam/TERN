import React, { useState } from 'react';
<<<<<<< HEAD

=======
import './IndexInput.css'; 
>>>>>>> origin/main
const IndexInput = ({ add }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      add(inputValue);
      setInputValue('');
    }
  };

  return (
<<<<<<< HEAD
    <div>
      <input
        type="text"
=======
    <div className="index-input-container">
      <input
        type="text"
        className="index-input-field"
>>>>>>> origin/main
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter value"
      />
<<<<<<< HEAD
      <button onClick={handleAdd}>Add</button>
=======
      <button className="index-input-button" onClick={handleAdd}>
        Add
      </button>
>>>>>>> origin/main
    </div>
  );
};

<<<<<<< HEAD
export default IndexInput;
=======
export default IndexInput;
>>>>>>> origin/main
