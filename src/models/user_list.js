import pathToRegexp from 'path-to-regexp';
import httpApi from '../utils/httpApi';
import {message} from 'antd';
import {api} from '../utils/config';

const getFormData = (data) => {
  return Object.keys(data).map(key => {
    return `${key}=${data[key]}`;
  }).join('&');
};

export default {
  namespace: 'user_list',
  state: {
    listData: [],
    showModal: false,
  },
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(function (location) {
        const { pathname, query } = location;
        let match = pathToRegexp('/userlist').exec(pathname);
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
    *getUserList({query = {}}, {call, put, select}){
      let url = `${api.origin}/admin/users`;
      const {errno, errmsg, data} = yield call(httpApi, url,{});
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
    },
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