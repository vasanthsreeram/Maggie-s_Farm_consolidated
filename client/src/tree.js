import React from 'react';
import Image from 'react-image-resizer';


class Tree extends React.Component{

  render(){
    // Handle missing or invalid props gracefully
    if (!this.props.disp_col || !Array.isArray(this.props.disp_col)) {
      return null;
    }
    
    // Ensure we have a valid tree index, default to 1 if invalid
    let treeIndex = this.props.tree ? this.props.tree - 1 : 0;
    if (treeIndex < 0 || treeIndex >= this.props.disp_col.length) {
      treeIndex = 0;
    }
    
    // Get the image URL
    const imageUrl = this.props.disp_col[treeIndex];
    if (!imageUrl) {
      return null;
    }
    
    // Handle empty apple slots - show a small placeholder
    if (!this.props.value || this.props.value === '') {
      return (
        <div style={{
          width: '30px',
          height: '30px',
          border: '2px dashed #8B4513',
          borderRadius: '15px',
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          margin: '5px'
        }} />
      );
    }
    
    // Calculate dimensions for actual apples
    const height = this.props.value * 5.5;
    const width = this.props.value * 5.5;
    
    return (
        <Image
          src={imageUrl}
          height={height}
          width={width}
        />
    );
  }
};

export default Tree;
