import expect from 'expect';
import { effects } from 'dva-react-router-3/saga';
import { routerRedux } from 'dva-react-router-3/router';
import app from '../../models/app';

describe('app modals', () => {
  before(function() {
    global.ENV = 'Development';
  });

  describe('reducer', () => {
    it('mergeState should work', () => {
      expect(
        app.reducers['mergeState'](
          {
            fetched: false,
          },
          {
            payload: {
              a: 1,
            },
          }
        )
      ).toEqual({
        fetched: false,
        a: 1,
      });
    });
  });
});
