import mongoose from "mongoose";


export async function connect() {
    try {
        mongoose.connect(process.env.MONGO_DB_URL!);
        const connection = mongoose.connection;
        connection.on("connected", () => {});
        connection.on('error',(error)=>{
            console.log("Something went wrong.",error)
        })
    } catch (error) {
        console.log(error)
        
    }
}   
