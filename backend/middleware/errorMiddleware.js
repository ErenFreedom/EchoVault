const errorHandler = (err, req, res, next) => {
    console.error(err); 

    let statusCode = err.statusCode || 500;
    let message = err.message || "An unexpected error occurred.";

    
    if (err.name === "UnauthorizedError") {
        statusCode = 401;
        message = "Invalid credentials or token.";
    } else if (err.name === "ForbiddenError") {
        statusCode = 403;
        message = "Access denied due to insufficient permissions.";
    }

    
    if (err.code === 11000) { 
        statusCode = 400;
        message = "User already exists.";
    } else if (err.name === "UserNotFoundError") {
        statusCode = 404;
        message = "User not found.";
    } else if (err.name === "AccountLockedError") {
        statusCode = 403;
        message = "Account locked due to multiple failed attempts.";
    } else if (err.name === "OtpError") {
        message = err.message; 
        statusCode = err.statusCode;
    }

   
    if (err.name === "DocumentNotFoundError" || err.name === "LockerNotFoundError") {
        statusCode = 404;
        message = err.message;
    } else if (err.name === "PermissionDeniedError") {
        statusCode = 403;
        message = err.message;
    } else if (err.name === "DocumentUploadError") {
        statusCode = 400;
        message = err.message;
    }

    
    if (err.name === "SubscriptionNotFoundError") {
        statusCode = 404;
        message = "Subscription plan not found.";
    } else if (err.name === "PaymentProcessingError") {
        statusCode = 402; 
        message = err.message; 
    } else if (err.name === "IneligibleForUpgradeError") {
        statusCode = 403;
        message = "Attempting to upgrade to premium without being eligible.";
    }

   
    if (err.name === "DatabaseConnectionError") {
        statusCode = 500;
        message = "Database connection error.";
    } else if (err.name === "QueryExecutionError") {
        statusCode = 500;
        message = "Failed to execute database query.";
    } else if (err instanceof TypeError || err instanceof ReferenceError) {
      
        statusCode = 500;
        message = "Internal server error.";
    }

    
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message; 
    } else if (err.name === "RateLimitExceededError") {
        statusCode = 429; 
        message = "Rate limit exceeded. Please try again later.";
    }

    if (err.name === "FileUploadError") {
        statusCode = 500;
        message = "File upload failure due to server configuration or permission issues.";
    } else if (err.name === "FileNotFoundError") {
        statusCode = 404;
        message = "File not found on the server.";
    } else if (err.name === "FileDownloadError") {
        statusCode = 500;
        message = "Error downloading the file.";
    } else if (err.name === "FileShareError") {
        statusCode = 403;
        message = "Error sharing the file. Only premium users can share documents.";
    }

   
    if (err.name === "SessionExpiredError") {
        statusCode = 401;
        message = "Session has expired. Please log in again.";
    } else if (err.name === "TokenRefreshError") {
        statusCode = 401;
        message = "Error refreshing the token. Please authenticate again.";
    }


   
    res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = errorHandler;
