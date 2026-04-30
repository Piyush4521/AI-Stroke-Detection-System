const notFoundHandler = (req, res) => {
    res.status(404);

    const error = new Error(
        `Not Found - ${req.originalUrl}`
    );

    next(error);
};

const errorHandler = (err, req, res) => {

    const statusCode =
        res.statusCode === 200
            ? err.statusCode || 500
            : res.statusCode;

    res.status(statusCode);

    res.json({
        message: err.message,
        details: err.details || null,
        stack:
            process.env.NODE_ENV === "production"
                ? null
                : err.stack
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
