import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[Database] MongoDB Connection Error:", error);
    process.exit(1);
  }
};
