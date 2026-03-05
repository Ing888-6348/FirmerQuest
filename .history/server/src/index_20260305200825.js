const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDb } = require('./config/db');

const port = process.env.PORT || 4000;

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
