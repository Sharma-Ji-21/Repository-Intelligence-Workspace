export const notFoundHandler = (req, _res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: err.message || 'Internal server error'
    });
};
