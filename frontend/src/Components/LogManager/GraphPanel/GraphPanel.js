import React from 'react';
import Stack from '@mui/material/Stack';
import { BarChart, CartesianGrid, XAxis, YAxis , Bar, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';
import { useSelector } from 'react-redux';

const GraphPanel = (props) => {
    
    const { logs, value, index } = props;
    const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)

    const statuses = ["accepted", "queued", "sent", "sending","undelivered", "failed", "delivered", "read"]
    const colors = ['#0088FE', '#00C49F', 'grey', '#FF8042', '#8B0000', 'red', 'green', '#00ff00'];

    let error_array = []
    if(sendResultsArray){
      for (let i = 0; i < sendResultsArray.length; i++){
        if(sendResultsArray[i].error && sendResultsArray[i].error.errorCode){
          let error_index = error_array.findIndex((element) => {
            return parseInt(element.name) === sendResultsArray[i].error.errorCode
          })
          if(error_index !== -1){
            error_array[error_index].count++
          }
          else{
            error_array.push({"name": sendResultsArray[i].error.errorCode, "count": 1})
          }
        }
      }
    }

    let statuses_array = []
    if(sendResultsArray){
      sendResultsArray.map((item) => {
        let status_index = statuses_array.findIndex((element) => {
          return element.name === item.status
        })
        if(status_index !== -1){
          statuses_array[status_index].count++
        }
        else{
          statuses_array.push({"name": item.status, "count": 1})
        }
      })
    }

    let colors_final = []
    statuses_array.map((status) =>{
        let color_index = statuses.indexOf(status.name)
        colors_final.push(color_index)
    })
  
  
    return (
      <div
        role="tabpanel"
        id={`simple-tabpanel-graph`}
        aria-labelledby={`simple-tab-graph`}
      >

         <Stack direction="row" spacing={10}>
          <PieChart width={350} height={350}>
            <Pie
              dataKey="count"
              isAnimationActive={false}
              data={statuses_array}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {colors_final.map((entry) => 
              (
              <Cell key={`cell-${index}`} fill={colors[entry]} />
              )
            )}
            </Pie>  
            <Tooltip />
          </PieChart>
          
          {
            error_array ?
          
          (<BarChart width={400} height={350} data={error_array} barSize={30} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" >
            </XAxis>
            <YAxis allowDecimals={false} />
            <Bar dataKey="count" fill="red" />
          </BarChart>):
          <></>
          }
          </Stack>

        
      </div>
    );
  }

  export default GraphPanel;