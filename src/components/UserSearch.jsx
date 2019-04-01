import React from 'react';
import { Select } from 'antd';
import httpApi from '../utils/httpApi';

const Option = Select.Option;

class UserSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      result: []
    };
  }
  searchChange(str) {
    let that = this;
    str = str.trim().toLowerCase();
    this.setState({
      value: str
    });

    clearTimeout(this.timer);

    this.timer = setTimeout(function() {
      httpApi('http://dufe.intra.didichuxing.com/api/ehr/v2/user_search', {
        params: {
          kw: str
        }
      }).then(data => {
        setTimeout(function() {
          that.setState({
            result: data.data
          });
        }, 100);
      });
    }, 200);
  }
  selectItem(value, e) {
    if (this.props.selectItem) {
      this.props.selectItem(value, e);
    }
    this.setState({
      value: ''
    });

    clearTimeout(this.timer);
  }
  handleBlur() {
    this.setState({
      value: '',
      result: []
    });
    clearTimeout(this.timer);
  }
  render() {
    return (
      <Select
        mode='combobox'
        onSearch={this.searchChange.bind(this)}
        onSelect={this.selectItem.bind(this)}
        onBlur={this.handleBlur.bind(this)}
        notFoundContent="未找到"
        filterOption={false}
        value={this.state.value}
        placeholder='输入姓名或用户名搜索'
        {...this.props}
      >
        {this.state.result.map( item => {
          return (
            <Option key={`${item.deptId1}`} item={item} value={item.userName}>
              <div>{item.name} - {item.deptDescr1}</div>
              <div style={{ color: '#999' }}>{item.email}</div>
            </Option>
          );
        })}
      </Select>
    );
  }
}

export default UserSearch;
