import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import {Link} from 'dva/router';
import { Menu, Breadcrumb, Popover, Dropdown, Icon, Modal, notification} from 'antd';
import ls from 'local-storage';
import { api } from '../../utils/config';
import MsgCenter from './MsgCenter';
import MenuConfig from './MenuConfig';
import './index.less';

class App extends React.Component {
  editProp(key, value){
    this.props.dispatch({
      type: 'app/editProp',
      key,
      value
    });
  }
  handleSideBar() {
    let nextVal = !this.props.showSiderbar;
    
    this.editProp('showSiderbar', nextVal);

    ls.set('showSiderbar', nextVal);
  }
  menuDefaultOpen() {
    let { pathname } = this.props.location;
    let selectedKeys = [pathname];
    let openKeys = [];

    if (this.props.showSiderbar) {
      MenuConfig.forEach((subItem) => {
        subItem.subMenu && subItem.subMenu.forEach(item => {
          if(pathname === item.link) {
            openKeys = [subItem.key];
            return false;
          }
        });
      });
    }

    return {selectedKeys, openKeys};
  }
  renderSiderMenu() {
    let { selectedKeys, openKeys } = this.menuDefaultOpen();
    return (
      <Menu
        className="menu-list"
        mode="inline"
        theme="dark"
        inlineCollapsed={!this.props.showSiderbar}
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
      >
        {this.getMenuList(MenuConfig)}
      </Menu>
    );
  }
  renderBreadcrumb() {
    let {routes} = this.props;
    routes = routes.filter(item => {
      return item.path;
    });

    function itemRender(route, params, routes, paths) {
      const last = routes.indexOf(route) === routes.length - 1;
      const to = `/${paths.join('/')}`;

      return last ?
        <b>{route.breadcrumb}</b> :
        <Link to={to}>{route.breadcrumb}</Link>;
    }

    return (
      <Breadcrumb
        className="breadcrumb"
        itemRender={itemRender}
        routes={routes} />
    );
  }
  getNotifyCom() {
    let content = (
      <div className="msg-center">
        <div className="notify-title">Notice</div>
        {
          MsgCenter.length ?
            <ul className="msg-list">
              {
                MsgCenter.map((item, i) => {
                  let description = item.desc;
                  if (item.link) {
                    description = (
                      <span>
                        {item.desc} <a href={item.link} target="_blank">Look Detail</a>
                      </span>
                    );
                  }
                  return (
                    <li key={i}>
                      <div className="msg-title">{item.title}</div>
                      <div className="msg-desc">详情：{description}</div>
                      <div className="msg-date">日期：{item.date}</div>
                    </li>
                  );
                })
              }
            </ul> :
            <div className="empty-msg">
              <Icon type="notification"/> 无新通知消息
            </div>
        }
      </div>
    );

    let com = (
      <div className="right-menu" key="2">
        <div className="top-menu">
          <Popover
            placement="bottomRight"
            trigger="click"
            content={content}>
            <Icon type="notification"/> Notice
          </Popover>
        </div>
      </div>
    );

    return com;
  }
  urlPermission(roles) {
    let {userInfo} = this.props;
    let userRoles = userInfo.roles || [];
    if(roles.length === 0) {
      return true;
    }
    return userRoles.map(item => item.id).some(id => {
      return id === 11082 || roles.some(menu => menu === id);
    });
  }
  handleChangeUrl({roles, title}, e){
    let permission = this.urlPermission(roles);
    if(!permission){
      Modal.warning({
        title: '权限错误',
        content: <span style={{color: 'red'}}>{`无${title}页面权限`}</span>
      });
      e.preventDefault();
    }
  }
  getMenuList(menuConfig){
    return menuConfig.map((item, i) => {
      let com = (
        <Menu.Item key={item.link}>
          <Link
            to={item.link}
            onClick={this.handleChangeUrl.bind(this, item)}
            className="menu-title">
            <i className={`iconfont ${item.icon}`} />
            <span className="menu-text">{item.title}</span>
          </Link>
        </Menu.Item>
      );
      if (item.subMenu && item.subMenu.length) {
        com = (
          <Menu.SubMenu key={item.link || item.key} title={(
            <div className="menu-title">
              <i className={`iconfont ${item.icon}`} />
              <span className="menu-text">{item.title}</span>
            </div>
          )}>
            {this.getMenuList(item.subMenu)}
          </Menu.SubMenu>
        );
      }
      return com;
    });
  }
  componentDidMount(){
    let pathname = this.props.location.pathname;
    if(pathname === '/') return;

    let notify_time = ls.get('notify_time');
    if(Date.now() - notify_time > 3 * 24 * 3600 * 1000 || !notify_time){
      setTimeout(function() {
        notification.warning({
          message: '安全提醒',
          description: '每次查询在 Atome 后台均有日志记录，若违反公司信息安全规定，违规获取或泄露敏感数据将会受到法律的制裁！',
          duration: 10
        });
        ls.set('notify_time', Date.now());
      }, 3000);
    }
  }
  render() {
    let { loading, userInfo, location } = this.props;

    if(location.pathname === '/') {
      return this.props.children;
    }

    if (!userInfo) {
      return null;
    }

    let logoutUrl = api.logout + '?jumpto=' + encodeURIComponent(window.location.href);

    let topCls = classnames({
      'no-header': window.top !== window
    });

    let mainCls = classnames({
      'main': true,
      'closed': !this.props.showSiderbar
    });

    let loadingCls = 'global-loading';
    if (loading) {
      loadingCls += ' shown';
    }

    return (
      <div className={topCls}>
        <div className={mainCls}>
          <div className='siderbar'>
            <div className="logo">
              <a href="/">
                <img src="/static/images/logo.png"/>
                <span className="logo-name">Atome</span>
              </a>
            </div>
            {this.renderSiderMenu()}
          </div>
          <div className="app-container">
            <div className="main-top" key="header">
              <Icon
                className="fold-icon"
                onClick={this.handleSideBar.bind(this)}
                type={!this.props.showSiderbar ? 'menu-unfold' : 'menu-fold'} />

              {this.renderBreadcrumb()}
              <div className="top-right">
                {this.getNotifyCom()}

                <div className="right-menu" key="4">
                  <div className="top-menu">
                    <Dropdown overlay={(
                      <Menu>
                        <Menu.Item>
                          <a href={logoutUrl}>Login Out</a>
                        </Menu.Item>
                      </Menu>
                    )}>
                      <span>
                        <Icon type="user"/> {userInfo.displayName} <Icon type="down"/>
                      </span>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div key="content" className="main-wrapper">
            {this.props.children}
          </div>
        </div>
        <img className={loadingCls} src='/static/images/loading-bars.svg' />
      </div>
    );
  }
}

export default connect(function (state) {
  let loading = state.loading.global;

  return {
    ...state.app,
    loading
  };
})(App);
