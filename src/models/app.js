import { routerRedux } from 'dva/router';
import ls from 'local-storage';

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
    *fetchBaseInfo(action, { put }) {
      yield put({
        type: 'saveUserInfo',
        payload: {
          userInfo: {
            username: 'zhangsan',
            displayName: 'test'
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
