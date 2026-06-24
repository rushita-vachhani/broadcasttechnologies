import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage 
    // or we can also write just `storage` since the key and value are the same
});

export default upload;

/*
    http? server talk to each other using request and response.
    URL: Uniform Resource Locator
    URI: Uniform Resource Identifier
    URN: Uniform Resource Name


    *********** http headers? = Meta data ***********

    GET = Retrieve a resource
    HEAD = No Message Body, (response headers only)
    OPTIONS = What operations are available?
    TRACE = Echo the request back to the client (Loopback test, get some data)
    DELETE = remove a resource
    PUT = replace a resource
    POST = Interact with resource (Mostly add)
    PATCH = change a part of a resource

    1xx = Informational
    2xx = Success
    3xx = Redirection
    4xx = Client Error
    5xx = Server Error

*/