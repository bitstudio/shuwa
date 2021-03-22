export const initVideoSeleciton = () => {
  /**
   * table
   * fetch available data
   * selection sign buffer
   * map available data to table
   */
  
   const label_list = await $.getJSON("./assets/label_list.json");
   console.log(label_list);
 
   const handleSelectSign = (input) => {
     // do selection sign things
   };
};