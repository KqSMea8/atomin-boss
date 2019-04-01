import React from 'react';
import { Select } from 'antd';
import Fuse from 'fuse.js';

const Option = Select.Option;

class SmartSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: []
    };
  }
  formatOptions() {
    let { options = [] } = this.props;
    let rs = [];

    options.forEach(function(item) {
      let ename = item.en_name;
      let label = `${item.name} (${ename})`;
      if(!ename){
        label = item.name;
      }
      let value = item.id || item.name;

      rs.push({
        item,
        ename,
        disabled: item.disabled,
        label,
        value
      });
    });

    return rs;
  }
  initSearch() {
    let rs = this.formatOptions();

    this.fuse = new Fuse(rs, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 20,
      minMatchCharLength: 2,
      keys: ['value', 'label']
    });
  }


  searchChange(str) {
    let that = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function() {
      str = str.toLowerCase().trim();

      if(!that.fuse) {
        that.initSearch();
      }

      let result = that.fuse.search(str);
      result = result.slice(0, 15);

      result = result.map(function(item) {
        return item.value;
      });

      that.setState({
        result
      });
    }, 300);
  }
  render() {
    let { values } = this.props;
    let rs = this.formatOptions();

    if(!values) {
      values = [];
    }

    if(rs.length > 300) {
      let options = this.state.result.concat(values);
      options = Array.from(new Set(options));

      let optionsCom = [];
      rs.forEach(function(item) {
        let index = options.indexOf(item.value);
        if(index > -1) {
          item._index = index;
          optionsCom.push(item);
        }
      });

      optionsCom = optionsCom.sort(function(a, b) {
        return a._index - b._index;
      });

      if(optionsCom.length < 10) {
        let isExistVal = optionsCom.map(item => {
          return item.value;
        });
        (rs.slice(0, 10)).forEach(item => {
          if(isExistVal.indexOf(item.value) === -1) {
            optionsCom.push(item);
          }
        });
      }
      return (
        <Select
          {...this.props}
          value={values}
          onSearch={this.searchChange.bind(this)}
          filterOption={false}
        >
          {
            optionsCom.map(function(item) {
              return (
                <Option
                  item={item}
                  key={item.value}
                  disabled={item.disabled}
                  value={item.value} >{item.label}</Option>
              );
            })
          }
        </Select>
      );
    } else {
      return (
        <Select
          {...this.props}
          value={values}
          filterOption={function(inputValue, option) {
            inputValue = inputValue.toLowerCase();
            if(inputValue) {
              let props = option.props;
              if(props.ename && props.ename.indexOf(inputValue) > -1) {
                return true;
              }
              if((props.children.toLowerCase()).indexOf(inputValue) > -1) {
                return true;
              }
              if((props.value.toLowerCase()).indexOf(inputValue) > -1) {
                return true;
              }
              return false;
            }
            return true;
          }}
        >
          {
            rs.map(function(item) {
              return (
                <Option
                  item={item}
                  key={item.value} disabled={item.disabled} ename={item.ename} value={item.value} >{item.label}</Option>
              );
            })
          }
        </Select>
      );
    }
  }
}

export default SmartSelect;
