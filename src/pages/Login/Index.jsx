import React from 'react';
import {connect} from 'dva';
import {Form, Icon, Input, Button} from 'antd';
import './index.less';


class UserLogin extends React.Component {

  handleSubmit (e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'user/login',
          loginForm: JSON.parse(JSON.stringify(values))
        });
      }
    });
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <div className="login-container">
        <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
          <h3 className="title">Atome IN BOSS</h3>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }]
            })(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }]
            })(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
            )}
          </Form.Item>
          <Form.Item>
            <a className="login-form-forgot" href="">Forgot password</a>
            <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
            </Button>
          Or <a href="">register now!</a>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const Login = Form.create({ })(UserLogin);

export default connect(function (state) {
  return {
    ...state.user,
    userInfo: state.app.userInfo
  };
})(Login);