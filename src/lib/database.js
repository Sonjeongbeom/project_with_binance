import mongoose from 'mongoose';

export class Database {
  static async initializeDatabase() {
    return mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'BINANCE-TRANSACTION',
    });
  }
}
