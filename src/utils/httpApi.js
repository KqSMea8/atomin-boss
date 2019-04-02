import fetch from 'dva-react-router-3/fetch';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  if (response.status === 401 && window.location.pathname !== '/login') {
    window.location.href = `${window.location.origin}/login`;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  options = options || {};
  if(!options.credentials) {
    options.credentials = 'include';
  }

  let queryObj = {};

  if (options.params) {
    queryObj = options.params;
    delete options.params;
  }

  let paramsStr = '';
  let paramsArr = [];
  Object.keys(queryObj).forEach(function (key) {
    if (queryObj[key] != undefined) {
      paramsArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(queryObj[key]));
    }
  });

  paramsStr = paramsArr.join('&').replace(/%20/g, '+');

  if (url.indexOf('?') > -1) {
    url += '&' + paramsStr;
  }

  if (!options.headers) {
    options.headers = {};
  }

  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .catch(function() {
      return {
        code: 3,
        message: '接口发生错误'
      };
    });
}
