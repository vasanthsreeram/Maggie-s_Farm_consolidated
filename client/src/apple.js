import React from 'react';
import Tree from './tree';
import './style/game.css';

class Apple extends React.Component{

  render(){
    // Use a conditional operation to set tree to 1 if this.props.tree is 0, otherwise use this.props.tree value
    // const treeValue = this.props.tree === 0 ? 1 : this.props.tree;
    
    // console.log("Rendering apple:", this.props);
    // console.log("Rendering apple tree:", this.props.tree); // Adjusted to log treeValue
    // console.log("Rendering apple disp_col:", this.props.disp_col);
    // console.log("Rendering apple value:", this.props.value);
    
    return (
        <div className="appleTask">
          {/* Use treeValue instead of directly using this.props.tree */}
          <Tree value={this.props.value} tree={this.props.tree} disp_col={this.props.disp_col}/>
        </div>
    );
  }

};

export default Apple;
