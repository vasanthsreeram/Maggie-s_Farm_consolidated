import React from 'react';
import './style/block.css';
import './style/intro.css';

class Farm extends React.Component{

  render(){
    const { disp, apples_picked, hor } = this.props;
    
    // Safety checks for array bounds and undefined values
    if (!disp || !Array.isArray(disp)) {
      console.warn('Farm component: disp prop is not a valid array', disp);
      return <div className="block_im">Loading...</div>;
    }

    let imageIndex;
    if (hor === 6) {
      imageIndex = apples_picked;
    } else if (hor === 3) {
      imageIndex = apples_picked + 5;
    } else {
      console.warn('Farm component: Invalid horizon value', hor);
      return <div className="block_im">Invalid horizon</div>;
    }

    // Check if imageIndex is within bounds and fix if needed
    if (imageIndex < 0 || imageIndex >= disp.length) {
      console.warn(`Farm component: Image index ${imageIndex} out of bounds for array length ${disp.length}, using safe fallback`);
      // Use a safe fallback - clamp to valid range
      imageIndex = Math.max(0, Math.min(imageIndex, disp.length - 1));
    }

    const imageSrc = disp[imageIndex];
    if (!imageSrc) {
      console.warn('Farm component: Image source is undefined at index', imageIndex);
      return <div className="block_im">Image source missing</div>;
    }

    return (
      <div className="block_im">
        <img 
          src={imageSrc} 
          height={800} 
          alt={`Farm view for ${apples_picked} apples picked`}
          onError={(e) => {
            console.error('Farm component: Image failed to load', imageSrc);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Farm component: Image loaded successfully', imageSrc);
          }}
        />
      </div>
    );
  }
};

export default Farm;
