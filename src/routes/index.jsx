import React from 'react';
import {LocaleProvider} from 'antd';
import {Router, Route, IndexRoute } from 'dva/router';
import App from '../pages/App';
import NotFound from '../pages/NotFound';
let locale = require('antd/lib/locale-provider/zh_CN');

export default function Routers({history}) {
  return <LocaleProvider locale={locale}>
    <Router history={history}>
      <Route path="/"  breadcrumb={'Dashboard'} component={App}>
        <IndexRoute getComponent={(location, callback) => {
          require.ensure([], function(require) {
            callback(null, require('../pages/Index').default);
          }, 'index_page');
        }} />
        <Route path="user" breadcrumb={'Users'}>
          <IndexRoute getComponent={(location, callback) => {
            require.ensure([], function(require) {
              callback(null, require('../pages/Users/List').default);
            }, 'user_list');
          }} />
        </Route>
      </Route>
      <Route path="login" getComponent={(location, callback) => {
        require.ensure([], function(require) {
          callback(null, require('../pages/Login').default);
        }, 'login_page');
      }} />
      <Route path="*" component={NotFound} />
    </Router>
  </LocaleProvider>;
}
