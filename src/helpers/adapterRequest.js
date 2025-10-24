exports.adapterRequest = (req = {}) => {

    const token = req.header("x-auth-token");
    const contentType = req.header("Content-type")

    if(contentType !== "application/json"){
       return null
    }
    
    return Object.freeze({
        token: token,
        contentType: contentType,
        path: req.path,
        method: req.method,
        pathParam: req.params,
        queryParams: req.query,
        body: req.method === "GET" ? undefined :  req.body 
    });
    
}
