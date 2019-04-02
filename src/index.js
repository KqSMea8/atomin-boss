import dva from 'dva';
import dvaLoading from 'dva-loading';
import { browserHistory } from 'dva/router';
import { message } from 'antd';
import models from './models';
import './styles/common.less';


if ('serviceWorker' in navigator && window.location.protocol === 'https:' ) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
    }).catch(registrationError => {
      window.console.log('SW registration failed: ', registrationError);
    });
  });
}

// 1. Initialize
const app = dva({
  history: browserHistory,
  onError(error) {
    window.console.error(error);
    message.destroy();
    message.error(error.message, 5);
  }
});

// 2. Plugins
app.use(dvaLoading());


// 3. Model
models.forEach((m) => {
  app.model(m);
});
// 4. Router
app.router(require('./routes').default);

// 5. Start
app.start('#root');
