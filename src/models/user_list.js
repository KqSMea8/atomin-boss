import pathToRegexp from 'path-to-regexp';
import httpApi from '../utils/httpApi';
import {message} from 'antd';
import {api} from '../utils/config';

export default {
  namespace: 'user_list',
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
    *getUserList(_, {call, put}){
      const {errno, errmsg, data} = yield call(httpApi, `${api.origin}/admin/users`);
      if(!errno){
        yield put({
          type: 'mergeState',
          payload:{
            listData: data || []
          }
        });
      }else{
        message.warning(errmsg);
      }
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