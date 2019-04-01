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

if (module.hot) {
  module.hot.accept();
}

if(ENV === 'Production') {
  let trace = document.createElement('script');
  trace.src = 'https://mirror-api.intra.xiaojukeji.com/sdk/js/track.js';
  trace.onload = function () {
    let system = 'duse-eye';
    let userKey = 'duse-eye_username';
    window.taotieCommandQueue = window.taotieCommandQueue || [];
    window.taotieCommandQueue.push({command:'setCookieUserName',parameter:  userKey});
    window.taotieCommandQueue.push({command:'setCookieSystemNameForTaotie',parameter: system});
  };
  document.body.appendChild(trace);
}
