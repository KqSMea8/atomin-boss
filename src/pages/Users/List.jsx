import React from 'react';
import {connect} from 'dva';
import {Tabs, Button, Modal} from 'antd';
import {UserListTable, UserForm} from '../../components/User';
import './index.less';

const TabPane = Tabs.TabPane;

class UsersList extends React.Component {
  changeProp(key, value){
    this.props.dispatch({
      type: 'activity_list/editProp',
      key,
      value
    });
  }
  modalTotalShow(value){
    this.props.dispatch({
      type: 'user/editProp',
      key: 'showModal',
      value
    });
  }
  handleOk(){
    this.props.form.validateFields((err, values) => {
      if (!err) {
        window.console.log(values);
      }
    });
  }
  renderUserActionModal(){
    let {modalTitle, showModal} = this.props;
    return (
      <Modal
        title={modalTitle}
        visible={showModal}
        onOk={this.handleOk.bind(this)}
        onCancel={this.modalTotalShow.bind(this, false)}
      >
        <UserForm {...this.props}/>
      </Modal>
    );
  }
  render(){
    return (
      <div className="common-container">
        <Tabs
          className="top-tab"
          tabBarExtraContent={
            <Button onClick={this.modalTotalShow.bind(this, true)} type="primary">add</Button>
          }>
          <TabPane tab="User Management" key="list"></TabPane>
        </Tabs>
        <div className="list-content">
          <UserListTable {...this.props}/>
        </div>
        {this.renderUserActionModal()}
      </div>
    );
  }
}
export default connect(function (state) {
  return {
    ...state.user,
    userInfo: state.app.userInfo
  };
})(UsersList);