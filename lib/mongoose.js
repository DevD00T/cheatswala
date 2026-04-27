import mongoose from "mongoose";

const mongooseConnect = () => {
    if(mongoose.connection.readyState === 1){
        return mongoose.connection.asPromise();
    }else{
        const uri = process.env.MONGODB_URI;
        return mongoose.connect(uri);
    }
}

export default mongooseConnect