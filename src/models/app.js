import { routerRedux } from 'dva/router';
import { api } from '../utils/config';
import httpApi from '../utils/httpApi';
import ls from 'local-storage';

const getQuery = (searchString) => {
  let args = searchString.length > 0 ? searchString.split('&') : [];
  let items = {};
  for(let i = 0, length = args.length; i < length; i++ ){
    let name = decodeURIComponent(args[i].split('=')[0]);
    let item = decodeURIComponent(args[i].split('=')[1]);
    items[name] = item;
  }
  return items;
};

export default {
  namespace: 'app',
  state: {
    fetched: false,
    userInfo: null,
    showSiderbar: ls.get('showSiderbar') || false
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({
        type: 'fetchBaseInfo'
      });
    }
  },
  effects: {
    *fetchBaseInfo(action, { put, call }) {
      yield put({
        type: 'saveUserInfo',
        payload: {
          userInfo: {
            username: 'zhangsan',
            displayName: 'test',
          }
        }
      });
    },
    *changeUrl({ query={}, pathname }, {put}){
      yield put(routerRedux.push({
        pathname: pathname,
        query: query
      }));
    },
    *replaceUrl({ query={}, pathname }, {put}){
      yield put(routerRedux.replace({
        pathname: pathname,
        query: query
      }));
    }
  },
  reducers: {
    'editProp' (state, { key, value }) {
      return {...state, [key]: value};
    },
    'mergeState' (state, { payload }) {
      return Object.assign({}, state, payload);
    },
    'saveUserInfo' (state, { payload }) {
      return Object.assign({}, state, payload);
    }
  }
};
