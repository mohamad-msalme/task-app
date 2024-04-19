import mongoose, { Mongoose } from "mongoose";

export const connectToDataBase = async (
  resolve?: (mongoose: Mongoose) => void,
  callback?: (error: unknown) => void
) => {
  try {
    const mongooseAl = await mongoose.connect(
      process.env.DATABASE_URL + process.env.DATABASE_NAME!
    );
    console.log("Connect with database");
    resolve?.(mongooseAl);
  } catch (error) {
    console.log("Connect Error to connect with database");
    console.log({ error });
    callback?.(error);
  }
};
