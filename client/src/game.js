import React from 'react';
import Farm from './farm';
import Apple from './apple';
import Juice from './juice';
import Block from './block';
import './style/game.css';
import './style/juice.css';
import { API_URL } from './config';
import { handleResponse } from './helpers'; // imports json
import { Button } from 'react-bootstrap';

var months = 4; // API has 4 blocks


class Game extends React.Component{

  constructor(props) {
    super(props);

    var trial_per_block = 20; // actual trials per block from API

    /* fill in random colors for all trials in all blocks .*/
    var BlockNb = months;
    var random_col=[];
    for (var j=0; j<BlockNb; j++){
      random_col[j]=[];
      for (var i=0; i<trial_per_block; i++){
        // Generate random color from 1-8, ensuring it's always valid
        random_col[j][i] = Math.floor(Math.random() * 8) + 1;
      };
    };

    // console.log("random_col made", random_col)

    /* data to be saved - arrays sized for actual number of trials .*/
    var chosen_tree = Array(trial_per_block).fill().map(() => Array(6).fill(0));
    var chosen_apple_size = Array(trial_per_block).fill().map(() => Array(6).fill(0));
    var all_key_pressed = Array(trial_per_block).fill().map(() => Array(6).fill(0));
    var reaction_times = Array(trial_per_block).fill().map(() => Array(7).fill(0));

    this.state = {
      BlockNb: BlockNb,
      start_block: 1,
      disp_new_block: 0,
      disp_juice: 0,
      TrialNo: 1,
      TrialInBlockNo:1,
      SampleNo: 0,
      BlockNo: 1,
      block_info: {},
      tree_col:random_col,
      chosen_tree:chosen_tree,
      chosen_apple_size:chosen_apple_size,
      all_key_pressed: all_key_pressed,
      reaction_times: reaction_times,
      trial_per_block: trial_per_block,
      info_btn_counter: 0,
      }

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener('keydown', function(e) {
      if(e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.fetchBlock.bind(this);
  }

  fetchBlock(user_no_,block_no_){
    console.log("this state", this.state)
    var currentDate   = new Date();
    var BlockStartTime    = currentDate.toTimeString();

    var task_no = this.props.user_info.task_no;

    fetch(`${API_URL}/api/task/`+task_no+'/'+block_no_)
    .then(handleResponse)
    .then((data) => {
        // console.log("fetchBlock Tree posistion", "data", data.TreePositions)
        const block_info = {
          BlockNo             : data.BlockNo,
          Horizon             : data.Horizon,
          InitialSampleNb     : data.InitialSampleNb,
          InitialSamples_Size : data.InitialSamplesSize,
          InitialSamples_Tree : data.InitialSamplesTree,
          ItemNo              : data.ItemNo,
          TreePositions       : data.TreePositions,
          DisplayOrder        : data.DisplayOrder,
          Tree1FutureSize     : data.Tree1FutureSize,
          Tree2FutureSize     : data.Tree2FutureSize,
          Tree3FutureSize     : data.Tree3FutureSize,
          Tree4FutureSize     : data.Tree4FutureSize,
          TrialNo             : data.TrialNo,
          UnusedTree          : data.UnusedTree,
          timeout_duration    : 5824,
        }

        // Update trial_per_block from API response
        const apiTrialsPerBlock = data.trialsPerBlock || this.state.trial_per_block;

        this.setState({
          start_block:0,
          disp_new_block:1,
          block_info: block_info,
          TrialNo: block_info.TrialNo[0],
          BlockStartTime: BlockStartTime,
          trial_per_block: apiTrialsPerBlock,
        });
      })
  }

  sendBlock(user_no_,block_no_){

    var currentDate   = new Date();
    var BlockFinishTime    = currentDate.toTimeString();

    let trial_per_block = this.state.trial_per_block;
    let ind_block = block_no_-1;

    var subset_Horizon = this.state.block_info.Horizon.slice(0,trial_per_block);
    var subset_InitialSampleNb = this.state.block_info.InitialSampleNb.slice(0,trial_per_block);
    var subset_InitialSamples_Tree = this.state.block_info.InitialSamples_Tree.slice(0,trial_per_block);
    var subset_InitialSamples_Size = this.state.block_info.InitialSamples_Size.slice(0,trial_per_block);
    var subset_ItemNo = this.state.block_info.ItemNo.slice(0,trial_per_block);
    var subset_TrialNo = this.state.block_info.TrialNo.slice(0,trial_per_block);
    var subset_UnusedTree = this.state.block_info.UnusedTree.slice(0,trial_per_block);
    var subset_TreePositions = this.state.block_info.TreePositions.slice(0,trial_per_block);

    let behaviour = {       'BlockNo'             : block_no_,
                            'Date'                : this.props.user_info.date,
                            'UserStartTime'       : this.props.user_info.startTime,
                            'ProlificID'          : this.props.user_info.prolific_id,
                            'TaskNo'              : this.props.user_info.task_no,
                            'TrainingNo'          : this.props.user_info.training_no,
                            'BlockStartTime'      : this.state.BlockStartTime,
                            'BlockFinishTime'     : BlockFinishTime,
                            'TreeColours'         : this.state.tree_col[ind_block],
                            'InfoRequestNo'       : this.state.info_btn_counter,
                            'ChosenTree'          : this.state.chosen_tree,
                            'ChosenAppleSize'     : this.state.chosen_apple_size,
                            'AllKeyPressed'       : this.state.all_key_pressed,
                            'ReactionTimes'       : this.state.reaction_times,
                            'Horizon'             : subset_Horizon,
                            'ItemNo'              : subset_ItemNo,
                            'TrialNo'             : subset_TrialNo,
                            'UnusedTree'          : subset_UnusedTree,
                            'InitialSamplesNb'    : subset_InitialSampleNb,
                            'InitialSamplesTree'  : subset_InitialSamples_Tree,
                            'InitialSamplesSize'  : subset_InitialSamples_Size,
                            'TreePositions'       : subset_TreePositions}

    fetch(`${API_URL}/api/behaviour/` + user_no_ + `/` + block_no_, {
       method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(behaviour)
     })

    //  console.log("sendBlock", "behaviour", JSON.stringify(behaviour)) 
    console.log("this state", this.state)

  }

  render() {

      var trialinblock_index = this.state.TrialInBlockNo-1;
      // console.log(this.state.BlockNo, this.state.BlockNb, this.state.BlockNo>this.state.BlockNb)
      if (this.state.BlockNo>this.state.BlockNb) {
        // console.log("finished", "blockNo :", this.state.BlockNo)
        document.addEventListener("keyup", this._handleKeyDownSpace);
        return <Block block_start_bg={this.props.user_info.block_start_bg} block_finish_bg={this.props.user_info.block_finish_bg} block_i={this.state.BlockNo} BlockNb={this.state.BlockNb}/>
        }

      else if (this.state.start_block===1) {
        //console.log("fetch data")
        var BlockNo = this.state.BlockNo;
        this.fetchBlock(this.props.UserNo, BlockNo);
        return null
        }

      else if (this.state.disp_new_block===1) {
        document.removeEventListener("keyup", this._handleKeyDownTree);
        document.addEventListener("keyup", this._handleKeyDownSpace);
        return <Block block_start_bg={this.props.user_info.block_start_bg} block_finish_bg={this.props.user_info.block_finish_bg} block_i={this.state.block_info.BlockNo[trialinblock_index]} BlockNb={this.state.BlockNb}/>
      }

      else {
        this.listenner(trialinblock_index)
        switch(this.state.disp_juice) {
            case 0:

                var current_block = this.state.block_info.BlockNo[trialinblock_index];
                var col = this.state.tree_col[current_block-1][trialinblock_index];
                var hor = this.state.block_info.Horizon[trialinblock_index];
                var disp;
                
                console.log(`DEBUG Farm component: col=${col}, hor=${hor}, current_block=${current_block}, trialinblock_index=${trialinblock_index}`);
                
                  switch(col) {
                      case 1:
                        disp = this.props.user_info.image_bg_1; break;
                      case 2:
                        disp = this.props.user_info.image_bg_2; break;
                      case 3:
                        disp = this.props.user_info.image_bg_3; break;
                      case 4:
                        disp = this.props.user_info.image_bg_4; break;
                      case 5:
                        disp = this.props.user_info.image_bg_5; break;
                      case 6:
                        disp = this.props.user_info.image_bg_6; break;
                      case 7:
                        disp = this.props.user_info.image_bg_7; break;
                      case 8:
                        disp = this.props.user_info.image_bg_8; break;
                      default:
                        console.warn(`DEBUG Farm component: Invalid col value ${col}, using fallback image_bg_1`);
                        disp = this.props.user_info.image_bg_1; // Fallback to prevent undefined
                    }
                    
                console.log(`DEBUG Farm component: Selected disp array:`, disp ? `${disp.length} images` : 'undefined');
                    // console.log("disp", disp)

                    return (
                      <div className="place-middle">
                        <div className="shift">
                          <Farm apples_picked={this.state.SampleNo} disp={disp} hor={hor}/>
                          {this.disp_current_apples(trialinblock_index)}
                          <div className="btn_help">
                            <Button variant="link" onClick={this.show_info}> Help </Button>
                          </div>
                        </div>
                      </div>
                    );


            case 1:
                return (this.disp_juice(trialinblock_index));
            default:
            }
        }
  }

  show_info = () => {

    this.setState({
      info_btn_counter: this.state.info_btn_counter+1,
    });

    alert("You need to produce as much juice as possible. The amount of juice is proportional to the sizes of apples you picked. Use the displayed information (apples on the wooden crate) to help you.")

  }

  shouldShowSpacebarInstruction(trialinblock_index) {
    if (!this.state.block_info || Object.keys(this.state.block_info).length === 0) {
      return false;
    }
    
    let tmp_apples_picked = this.state.SampleNo;
    var horizon = this.state.block_info.Horizon[trialinblock_index];
    var max_apples_to_pick = horizon;
    var apples_remaining = max_apples_to_pick - tmp_apples_picked;
    
    // Show instruction when all apples have been picked, juice is not displayed, and user has picked at least one apple
    return apples_remaining === 0 && this.state.disp_juice === 0 && tmp_apples_picked > 0;
  }

  disp_juice(trialinblock_index) {

    var mean_score=this.compute_score(trialinblock_index);
    var TrialNo = this.state.TrialNo;
    var trial_per_block = this.state.trial_per_block;
    var BlockNo = this.state.BlockNo;
    var TrialInBlockNo = this.state.TrialInBlockNo;
    var start_block = this.state.start_block;
    var chosen_tree;
    var chosen_apple_size;
    var all_key_pressed;
    var reaction_times;

    if(TrialNo%trial_per_block===0){
      this.sendBlock(this.props.UserNo, BlockNo);
    }

    if(TrialNo%trial_per_block===0){
      start_block = 1;
      TrialInBlockNo = 0;
      chosen_tree = Array(trial_per_block).fill().map(() => Array(6).fill(0));
      chosen_apple_size = Array(trial_per_block).fill().map(() => Array(6).fill(0));
      all_key_pressed = Array(trial_per_block).fill().map(() => Array(6).fill(0));
      reaction_times = Array(trial_per_block).fill().map(() => Array(7).fill(0));
      reaction_times[0][0] = Math.round(performance.now())+500;
      BlockNo++;
    }
    else{
      chosen_tree = this.state.chosen_tree;
      chosen_apple_size = this.state.chosen_apple_size;
      all_key_pressed = this.state.all_key_pressed;
      reaction_times = this.state.reaction_times;
      reaction_times[trialinblock_index+1][0] = Math.round(performance.now())+500;
    }

    TrialNo++;
    TrialInBlockNo++;

    setTimeout(
      function() {
        this.setState({
          reaction_times: reaction_times,
          disp_juice:0,
          TrialNo: TrialNo,
          TrialInBlockNo: TrialInBlockNo,
          SampleNo: 0,
          start_block: start_block,
          chosen_tree: chosen_tree,
          chosen_apple_size: chosen_apple_size,
          all_key_pressed: all_key_pressed,
          BlockNo: BlockNo,
        });
      }
      .bind(this),
      1000
    );

    var image_juice;
    var shift_mean_score = mean_score - 1; // shift size (2,10) to (1,9)
    var ind_mean_score = shift_mean_score - 1;
    var hor = this.state.block_info.Horizon[trialinblock_index];

    // Choose juice glass size based on horizon value
    // Horizon 3: small glass, Horizon 6: big glass
    if (hor === 3) {
      image_juice = this.props.user_info.juice_small_bg[ind_mean_score];
    } else {
      image_juice = this.props.user_info.juice_big_bg[ind_mean_score];
    }

    return (
      <div className="place-middle">
        <Juice image_juice={image_juice} mean_score={shift_mean_score} hor={hor}/>
      </div>
    );

   }

   pick_apple(tree, key_pressed, time_pressed) {

    var trialinblock_index = this.state.TrialInBlockNo - 1;
  
    console.log(`DEBUG pick_apple: tree=${tree}, key_pressed=${key_pressed}, current SampleNo=${this.state.SampleNo}`);
  
    var Tree1FutureSize = this.state.block_info.Tree1FutureSize[trialinblock_index];
    var Tree2FutureSize = this.state.block_info.Tree2FutureSize[trialinblock_index];
    var Tree3FutureSize = this.state.block_info.Tree3FutureSize[trialinblock_index];
    var Tree4FutureSize = this.state.block_info.Tree4FutureSize[trialinblock_index];
  
    var all_key_pressed = this.state.all_key_pressed;
    var reaction_times = this.state.reaction_times;
    var chosen_tree = this.state.chosen_tree;
    var chosen_apple_size = this.state.chosen_apple_size;
  
    var SampleNo = this.state.SampleNo;
  
    SampleNo++;
  
    reaction_times[trialinblock_index][SampleNo] = time_pressed;
    chosen_tree[trialinblock_index][SampleNo - 1] = tree;
    all_key_pressed[trialinblock_index][SampleNo - 1] = key_pressed;
  
    var userPickIndex = SampleNo - 1;
    var appleSizeFromTree = 0;
  
    switch(tree) {
        case 1:
            appleSizeFromTree = Tree1FutureSize[userPickIndex] || 0;
            break;
        case 2:
            appleSizeFromTree = Tree2FutureSize[userPickIndex] || 0;
            break;
        case 3:
            appleSizeFromTree = Tree3FutureSize[userPickIndex] || 0;
            break;
        case 4:
            appleSizeFromTree = Tree4FutureSize[userPickIndex] || 0;
            break;
        default:
            appleSizeFromTree = 0;
    }
  
    chosen_apple_size[trialinblock_index][SampleNo - 1] = appleSizeFromTree;
    console.log(`DEBUG: Selected tree ${tree}, userPickIndex=${userPickIndex}, appleSizeFromTree=${appleSizeFromTree}`);
  
    console.log(`DEBUG pick_apple result: new SampleNo=${SampleNo}, chosen_tree=${chosen_tree[trialinblock_index][SampleNo - 1]}, chosen_apple_size=${chosen_apple_size[trialinblock_index][SampleNo - 1]}`);
  
    this.setState({
      all_key_pressed: all_key_pressed,
      chosen_tree: chosen_tree,
      chosen_apple_size: chosen_apple_size,
      SampleNo: SampleNo,
    }, () => {
      // ✅ Auto-continue check after state is updated
      var horizon = this.state.block_info.Horizon[trialinblock_index];
      if (SampleNo >= horizon && SampleNo > 0) {
        console.log("✅ Auto-proceeding to juice display after picking required apples");
        this.setState({ disp_juice: 1 });
      }
    });
  
  }
  

    disp_current_apples(trialinblock_index) {
      var InitialSampleNb = this.state.block_info.InitialSampleNb[trialinblock_index];
      var Horizon = this.state.block_info.Horizon[trialinblock_index];
      var SampleNo = this.state.SampleNo;
      var chosen_tree = this.state.chosen_tree;
      var chosen_apple_size = this.state.chosen_apple_size;
      var TreePositions = this.state.block_info.TreePositions[trialinblock_index];

      console.log(`DEBUG disp_current_apples: Horizon=${Horizon}, InitialSampleNb=${InitialSampleNb}, SampleNo=${SampleNo}`);
      console.log("Max apples that can be picked:", Horizon, "apples");
      console.log("User has picked:", SampleNo, "apples");
      console.log("chosen_apple_size for trial:", chosen_apple_size[trialinblock_index]);

      let all_boxes = [];
      
      // The horizon value represents the maximum apples that can be picked
      // Show all slots that can be filled (up to horizon)
      var maxApplesToPick = Horizon;
      
      // Render all slots (picked and unpicked)
      for (var i = 0; i < maxApplesToPick; i++) {
        if (i < SampleNo) {
          // User has picked this slot - show the chosen apple
          if (chosen_tree[trialinblock_index][i] > 0) {
            let chosenTreeIndex = chosen_tree[trialinblock_index][i] - 1; // Convert to 0-based index
            if (chosenTreeIndex >= 0 && chosenTreeIndex < TreePositions.length) {
              let position = TreePositions[chosenTreeIndex];
              let size = chosen_apple_size[trialinblock_index][i] || '';
              all_boxes.push(this.renderApple(size, position));
            } else {
              // Invalid tree index, show empty slot
              all_boxes.push(this.renderApple('', 1));
            }
          } else {
            // No chosen tree yet, show empty slot
            all_boxes.push(this.renderApple('', 1));
          }
        } else {
          // Empty slot that the user still needs to fill
          let emptyPosition = (i % 3) + 1; // Cycle through positions 1,2,3
          all_boxes.push(this.renderApple('', emptyPosition));
        }
      }
    
      console.log(`DEBUG: Showing ${all_boxes.length} total slots (${SampleNo} picked, ${maxApplesToPick - SampleNo} remaining)`);
      return all_boxes;
    }
    
    

  compute_score(trialinblock_index) {

      var chosen_apple_size = this.state.chosen_apple_size[trialinblock_index];
      var initial_apple_sizes = this.state.block_info.InitialSamples_Size[trialinblock_index];
      var initialSampleNb = this.state.block_info.InitialSampleNb[trialinblock_index];
      var userSampleNo = this.state.SampleNo;
      var Horizon = this.state.block_info.Horizon[trialinblock_index];

      var sum = 0;
      var totalApples = 0;

      // Add initial sample sizes to the total
      for (var i = 0; i < initialSampleNb && i < initial_apple_sizes.length; i++) {
        var appleSize = parseInt(initial_apple_sizes[i], 10);
        if (!isNaN(appleSize) && appleSize > 0) {
          sum += appleSize;
          totalApples++;
        }
      }

      // Add chosen apple sizes to the total
      for (var i = 0; i < userSampleNo && i < chosen_apple_size.length; i++){
        var appleSize = parseInt(chosen_apple_size[i], 10);
        if (!isNaN(appleSize) && appleSize > 0) {
          sum += appleSize;
          totalApples++;
        }
      }

      // Ensure we don't divide by zero
      var effectiveHorizon = Math.max(totalApples, 1);
      var mean_score = Math.round(sum / effectiveHorizon);
      
      // Clamp the score to reasonable bounds (1-10)
      mean_score = Math.max(1, Math.min(10, mean_score));

      console.log(`DEBUG compute_score: initialSampleNb=${initialSampleNb}, userSampleNo=${userSampleNo}, initial_sum=${sum - chosen_apple_size.slice(0, userSampleNo).reduce((a,b) => a + (parseInt(b)||0), 0)}, chosen_sum=${chosen_apple_size.slice(0, userSampleNo).reduce((a,b) => a + (parseInt(b)||0), 0)}, total_sum=${sum}, totalApples=${totalApples}, effectiveHorizon=${effectiveHorizon}, mean_score=${mean_score}`);
      return mean_score;
    }

  renderApple(val, tree_i){
          var trialinblock_index = this.state.TrialInBlockNo-1;
          var current_block_index = this.state.block_info.BlockNo[trialinblock_index]-1;
          var col=this.state.tree_col[current_block_index][trialinblock_index];
          var disp_col;

          switch(col) {
              case 1:
                disp_col = this.props.user_info.apple_col1;
                break;
              case 2:
                disp_col = this.props.user_info.apple_col2;
                break;
              case 3:
                disp_col = this.props.user_info.apple_col3;
                break;
              case 4:
                disp_col = this.props.user_info.apple_col4;
                break;
              case 5:
                disp_col = this.props.user_info.apple_col5;
                break;
              case 6:
                disp_col = this.props.user_info.apple_col6;
                break;
              case 7:
                disp_col = this.props.user_info.apple_col7;
                break;
              case 8:
                disp_col = this.props.user_info.apple_col8;
                break;
              default:
                disp_col = this.props.user_info.apple_col1; // fallback to prevent undefined
            }

          return <Apple value={val} tree={tree_i} disp_col={disp_col}/>;
        }

  listenner(trialinblock_index) {

    console.log(`DEBUG: Listener called for trial ${trialinblock_index}`);

    document.removeEventListener("keyup", this._handleKeyDownSpace)
    document.removeEventListener("keyup", this._handleKeyDownTree)

    let tmp_apples_picked = this.state.SampleNo;
    var horizon = this.state.block_info.Horizon[trialinblock_index];
    var initialSamples = this.state.block_info.InitialSampleNb[trialinblock_index];
    
    // The horizon value (3 or 6) represents the maximum apples that can be picked based on sun position
    // User can pick up to horizon apples, regardless of initial samples
    var max_apples_to_pick = horizon;
    var apples_remaining = max_apples_to_pick - tmp_apples_picked;

    console.log(`DEBUG: Horizon=${horizon}, InitialSamples=${initialSamples}, MaxApplesToPick=${max_apples_to_pick}, UserHasPicked=${tmp_apples_picked}, ApplesRemaining=${apples_remaining}`);

    // Allow apple picking if user still has apples remaining to pick
    if (apples_remaining > 0){
      console.log(`DEBUG: Adding tree selection listener - allowing apple picking`);
      return document.addEventListener("keyup", this._handleKeyDownTree);
    }
    // If user has picked all available apples, require spacebar press to show juice
    else {
      var disp_juice = this.state.disp_juice;

      if (disp_juice === 0){
        // Require user to press spacebar to proceed to juice when all apples picked
        console.log(`DEBUG: Adding spacebar listener for juice display`);
        return document.addEventListener("keyup", this._handleKeyDownSpace);
      }
    }
  }

  _handleKeyDownTree = (event) => {

    var trialinblock_index = this.state.TrialInBlockNo-1;
    var TreePositions = this.state.block_info.TreePositions[trialinblock_index];
    var key_pressed;
    var time_pressed;
    var selectedTree;

    // Map keys to visual tree positions (1=leftmost, 2=middle, 3=rightmost)
    // TreePositions tells us where each tree (1,2,3,4) is visually positioned
    // We need to find which tree is at position 1, 2, or 3
    var getTreeAtPosition = (position) => {
      for (let treeId = 1; treeId <= TreePositions.length; treeId++) {
        if (TreePositions[treeId - 1] === position) {
          return treeId;
        }
      }
      return 1; // fallback
    };

    switch( event.keyCode ) {
        case 97: // Numpad 1
          key_pressed = 1;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(1); // Leftmost tree
          console.log(`DEBUG: Key 1 pressed, selecting tree at position 1, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        case 98: // Numpad 2
          key_pressed = 2;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(2); // Middle tree
          console.log(`DEBUG: Key 2 pressed, selecting tree at position 2, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        case 99: // Numpad 3
          key_pressed = 3;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(3); // Rightmost tree
          console.log(`DEBUG: Key 3 pressed, selecting tree at position 3, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        case 49: // Regular 1
          key_pressed = 1;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(1); // Leftmost tree
          console.log(`DEBUG: Key 1 pressed, selecting tree at position 1, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        case 50: // Regular 2
          key_pressed = 2;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(2); // Middle tree
          console.log(`DEBUG: Key 2 pressed, selecting tree at position 2, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        case 51: // Regular 3
          key_pressed = 3;
          time_pressed = Math.round(performance.now());
          selectedTree = getTreeAtPosition(3); // Rightmost tree
          console.log(`DEBUG: Key 3 pressed, selecting tree at position 3, which is tree ${selectedTree}`);
          this.pick_apple(selectedTree, key_pressed, time_pressed);
          break;
        default:
      }
  }

  _handleKeyDownSpace = (event) => {
    console.log(`DEBUG: Spacebar pressed - keyCode: ${event.keyCode}, disp_new_block: ${this.state.disp_new_block}`);
    switch( event.keyCode ) {
        case 32:
          // If we're showing the block screen, transition to the game
          if (this.state.disp_new_block === 1) {
            console.log(`DEBUG: Transitioning from block screen to game`);
            var trialinblock_index = this.state.TrialInBlockNo-1;
            var reaction_times = this.state.reaction_times;
            if (reaction_times[trialinblock_index]) {
              reaction_times[trialinblock_index][0] = Math.round(performance.now());
            }
            this.setState({
              disp_new_block: 0,
              reaction_times: reaction_times
            });
            return;
          }

          var trialinblock_index = this.state.TrialInBlockNo-1; // should be zero
          var reaction_times = this.state.reaction_times;
          var SampleNo = this.state.SampleNo;
          
          // Check if we have valid block info before accessing it
          if (!this.state.block_info || !this.state.block_info.Horizon) {
            console.log(`DEBUG: No block info available`);
            return;
          }

          var horizon = this.state.block_info.Horizon[trialinblock_index];
          var max_apples_to_pick = horizon;
          var apples_remaining = max_apples_to_pick - SampleNo;

          console.log(`DEBUG: Spacebar handler - horizon=${horizon}, max_apples_to_pick=${max_apples_to_pick}, apples_remaining=${apples_remaining}, SampleNo=${SampleNo}`);

          reaction_times[trialinblock_index][SampleNo] = Math.round(performance.now());
          
          // If all apples have been picked and user has picked at least one apple, show juice
          if (apples_remaining === 0 && SampleNo > 0) {
            console.log(`DEBUG: All apples picked and user has picked apples, showing juice`);
            this.setState({
              disp_juice: 1
            });
            return;
          }
          
          // console.log(this.state.BlockNo, this.state.BlockNb, this.state.BlockNo>this.state.BlockNb)
          if (this.state.BlockNo>this.state.BlockNb) {
            this.props.nextTransition(1);
            document.removeEventListener("keyup", this._handleKeyDownSpace)
            document.removeEventListener("keyup", this._handleKeyDownSpace)
          }
          else {
            this.setState({
              disp_new_block: 0,
              reaction_times: reaction_times
            });
          }
          break;
        default:
      }
  }

};

export default Game;