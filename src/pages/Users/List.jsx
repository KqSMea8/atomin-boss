import React from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Tabs, Button} from 'antd';
import {UserListTable} from '../../components/User';
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
  onCancelModal(){
    this.props.dispatch({
      type: 'activity_list/editProp',
      key: 'showModal',
      value: false
    });
  }
  render(){
    return (
      <div className="common-container">
        <Tabs
          className="top-tab"
          tabBarExtraContent={
            <Link>
              <Button type="primary">add user</Button>
            </Link>
          }>
          <TabPane tab="User Management" key="list"></TabPane>
        </Tabs>
        <div className="list-content">
          <UserListTable {...this.props}/>
        </div>
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