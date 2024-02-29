import app from "./app.js";
import { connectToDataBase } from "./db/db.js";

connectToDataBase()
  .then(() => {
    const PORT = process.env.PORT || 5500;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
