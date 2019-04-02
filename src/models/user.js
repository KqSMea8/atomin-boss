import pathToRegexp from 'path-to-regexp';
import httpApi from '../utils/httpApi';
import {api} from '../utils/config';
import qs from 'querystring';

export default {
  namespace: 'user',
  state: {
    listData: [],
    showModal: false
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(function (location) {
        const { pathname, query } = location;
        let match = pathToRegexp('/user').exec(pathname);
        if (match) {
          dispatch({
            type: 'onPathChange',
            query
          });
        }
      });
    }
  },
  effects: {
    *onPathChange({ query }, {put, select, take}) {
      let app = yield select(state => state.app);
      if (!app.userInfo) {
        yield take('app/saveUserInfo');
        app = yield select(state => state.app);
      }
      yield put({
        type: 'getUserList',
        query
      });
    },
    *login({loginForm}, {call, put}) {
      const { username } = yield call(httpApi, `${api.origin}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify(loginForm)
      });
      if(username) {
        yield put({
          type: 'app/changeUrl',
          pathname: '/user'
        });
      }
    },
    *getUserList(_, {call, put}){
      const data = yield call(httpApi, `${api.origin}/admin/users`);
      yield put({
        type: 'mergeState',
        payload:{
          listData: data || []
        }
      });
    }
  },
  reducers: {
    'editProp'(state, {key, value}) {
      return {...state,[key]: value};
    },
    'mergeState'(state, {payload}) {
      return Object.assign({}, state, payload);
    }
  }
};