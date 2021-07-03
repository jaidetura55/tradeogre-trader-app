import 'express-async-errors'
import express from "express"
import routes from "./routes/index.routes"
import cors from "cors"
import app_error from "./middleware/app_error"

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)
app.use(app_error)

export { app }