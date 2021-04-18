import React from 'react';

const style = {
  borderRadius: '8px',
  fontSize: '8pt',
  padding: '3px',
  margin: '6px',
};

const Edit = ({ onClick }) => (
  <button style={style} onClick={onClick}>
    Edit
  </button>
);

export default Edit;
