const { PAGE_SIZE } = require("../constants");
const { adapterRequest } = require("./adapterRequest");

exports.paginate = (req) => {
  const httpRequest = adapterRequest(req);
  let page = httpRequest.queryParams["page"];
  let pageSize = httpRequest.queryParams["pageSize"];
  pageSize = pageSize && pageSize - 0 > 0 ? pageSize - 0 : PAGE_SIZE;
  page = page ? page - 0 : 1;
  page--;
  if (page < 0) {
    page = 0;
  }
  return { page, pageSize };
};
