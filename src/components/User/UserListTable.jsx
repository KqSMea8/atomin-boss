import React from 'react';
import {Table, Divider, Button} from 'antd';

export default class UserTable extends React.Component {
  getOptions() {
    const { listData } = this.props;
    const columns = [{
      title: 'username',
      dataIndex: 'username'
    },{
      title: 'email',
      dataIndex: 'email'
    },{
      title: 'realName',
      dataIndex: 'realName'
    },{
      title: 'mobile',
      dataIndex: 'mobile',
      render: (text) => {
        return text ? text : '-';
      }
    },{
      title: 'Roles',
      dataIndex: 'roles',
      render: (text) => {
        return (
          <div>
            {
              text.map(item => {
                return (
                  <div className="manage-table-content" key={item.id}>
                    <label>role：</label>
                    <span>{item.name}</span>
                    <Divider type="vertical"/>
                    <label>Desc：</label>
                    <span>{item.description}</span>
                  </div>
                );
              })
            }
          </div>
        );
      }
    },{
      title: 'action',
      dataIndex: '',
      render: () => {
        return <Button>Edit</Button>;
      }
    }];

    return {columns, listData};
  }
  render(){
    let {columns, listData} = this.getOptions();
    return (
      <Table
        className="nowrap-table"
        rowKey={(item, i) => i}
        columns={columns}
        scroll={{x:'100vh'}} 
        dataSource={listData}
      />
    );
  }
}