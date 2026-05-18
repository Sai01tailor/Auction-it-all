require("dotenv").config();
const cluster=require('node:cluster');
const os=require('os');
const connectDB = require("./connection");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const totalCPUS=os.cpus().length;

if(cluster.isPrimary){
    for(let i=0;i<totalCPUS;i++){
      cluster.fork();
    }

    cluster.on('exit',(worker,code,signal)=>{
      cluster.fork();
    })
}else{
    connectDB();
    
      app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
}

