// errorMiddleware.js

// General error handling middleware
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging
  
    // Default response for internal server error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong on the server";
  
    res.status(statusCode).json({
      success: false,
      message,
    });
  };
  
  module.exports = errorMiddleware;
  