import React from 'react';
import {Form, Input} from 'antd';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

class UserForm extends React.Component {
  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <Form {...formItemLayout} >
        <Form.Item
          label="Username"
        >
          {getFieldDecorator('username', {
            rules: [{
              required: true, message: 'Please input your username!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          label="Password"
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: 'Please input your password!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          label="E-mail"
        >
          {getFieldDecorator('email', {
            rules: [{
              required: true, message: 'Please input your E-mail!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          label="Real name"
        >
          {getFieldDecorator('realName', {
            rules: [{
              required: true, message: 'Please input your real name!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          label="Mobile"
        >
          {getFieldDecorator('mobile', {
            rules: [{
              required: true, message: 'Please input your mobile!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item
          label="Roles"
        >
          {getFieldDecorator('roles', {
            rules: [{
              required: true, message: 'Please select your roles!'
            }]
          })(
            <Input />
          )}
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create({})(UserForm);