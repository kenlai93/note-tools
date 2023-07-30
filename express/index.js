const express = require("express");

const app = express();

// ============================================
app.get("/error-stack-show-to-client", (req, res) => {
    throw new Error();
});

// ============================================
// beware this is async version of above route
app.get("/app-crash", async (req, res) => {
    throw new Error();
});

// ============================================
app.get("/inline-error-handler", (req, res, next) => {
    try {
        throw new Error();
    } catch (error) {
        next(error);
    }
});

// ============================================
class AppError extends Error {
    statusCode = 500;
    message = "Internal Server Error";
    into = {};

    constructor() {
        super();
    }
}
class InvalidNameError extends AppError {
    statusCode = 401;
    message = "Invalid Name";
    info;
    constructor(name) {
        super();
        this.info = { name };
    }
}
/**
 * @type {import('express').ErrorRequestHandler}
 */
const appErrorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        // handled error
        return res.status(err.statusCode).json({
            message: err.message,
            info: err.info,
        });
    }
    // unhandled error
    return res.status(500).json({
        message: "Internal Server Error",
    });
};
/**
 * @type {import('express').RequestHandler}
 * @param {import('express').RequestHandler} handler
 */
const wrappedController = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};
/**
 * @type {import('express').RequestHandler}
 */
const controller = wrappedController(async (req, res) => {
    // your business logic here
    throw new InvalidNameError("William");
});
app.get("/error-handler-middleware", controller, appErrorHandler);

// ============================================
app.listen(3000);
