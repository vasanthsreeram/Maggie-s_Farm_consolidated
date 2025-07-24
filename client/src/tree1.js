import React from 'react';
import Image from 'react-image-resizer';


class Tree1 extends React.Component{

  render(){
    // console.log("rendering tree :",this.props)
    return (

        <Image
          src="images/images_set1/apple_1.png"
          height={this.props.value*5.5}
          width={this.props.value*5.5}
        />

    );
  }
};

export default Tree1;
