import React from 'react';
import Image from 'react-image-resizer';


class TreeTraining extends React.Component{


  render(){

    // console.log("rendering tree :",this.props)
    return (

        <Image
          src={this.props.training_apple_col[this.props.col-1]}
          height={this.props.value*5.5}
          width={this.props.value*5.5}
        />

    );
  }
};

export default TreeTraining;
