import React from 'react';
import { Link } from 'dva/router';
import { Button } from 'antd';

export default class NotFound extends React.Component {
  render() {
    let { status } = this.props.location.query;
    let info = '页面不存在';
    let content = '请检查访问地址后重试';

    status = status || '404';

    if(status === '403') {
      info = '无权限访问';
      content = '请点击【申请权限】前往权限系统发起申请';
    }
    if(status === '400') {
      info = '页面开发中';
      content = '敬请期待!';
    }

    return <div className="not-found">
      <div className="wrapper">
        <div className="content">
          <h1>{status === '400' ? '' : status}</h1>
          <p className="key">{info}</p>
          <p>{content}</p>
          <div className="btns">
            <Button style={{ display: status !== '403' ? 'inline-block' : 'none' }}>
              <Link to="/">返回首页</Link>
            </Button>
            <a href="http://upm.xiaojukeji.com/index.html#/apply/apply?id=6992" rel="noopener noreferrer" target="_blank" style={{ display: status === '403' ? 'inline-block' : 'none' }}>
              <Button type="primary">申请权限</Button>
            </a>
          </div>
        </div>
        <div className="img">
          <img src={`../../static/images/${status === '400' ? '403' : status}.png`} alt="#" />
        </div>
      </div>
    </div>;
  }
}
