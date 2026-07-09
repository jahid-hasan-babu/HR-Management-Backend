import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import path from "path";
import morgan from "morgan";
import { successTemplate } from "./app/lib/successTemplete";
import { cancelTemplate } from "./app/lib/cancelTemplete";
import bodyParser from "body-parser";
import compression from "compression";
import handleWebHook from "./app/helpers/stripe.webhook";





const app: Application = express();

// Enable gzip compression for faster response times
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3001",
      "http://206.162.244.142:3000",
      "http://72.62.90.132:3000",
      "http://206.162.244.142:3021",
      "https://dashboard.royalresin.uk"
    ],
  }),
);

app.use(
  "/api/v1/stripe/payment-webhook",
  express.raw({ type: "application/json" }),
  handleWebHook,
);



app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);
console.log(path.join(__dirname, "..", "public", "uploads"));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "The harray app server is running. . .",
  });
});

app.use("/payment-success", (req: Request, res: Response) => {
  res.send(successTemplate());
});

app.use("/payment-cancel", (req: Request, res: Response) => {
  res.send(cancelTemplate());
});


app.use(morgan('dev'));
app.use("/api/v1", router);

// 404 handler - for unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

// Global error handler - MUST be last middleware with 4 parameters
app.use(globalErrorHandler);

export default app;
