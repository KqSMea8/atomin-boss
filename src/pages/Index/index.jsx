import React from 'react';
import {connect} from 'dva';
import {Menu, Dropdown, Icon} from 'antd';
import { api } from '../../utils/config';
import './index.less';

class IndexPage extends React.Component {
  render() {
    let { userInfo } = this.props;
    let logoutUrl = api.logout + '?jumpto=' + encodeURIComponent(window.location.href);

    if(!userInfo) {
      return null;
    }

    return (
      <div>{userInfo.username}</div>
    )
  }
}

export default connect(function (state) {
  return {
    ...state.app
  };
})(IndexPage);
