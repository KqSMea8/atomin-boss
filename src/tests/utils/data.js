export default {
  goalsData1: {
    "metrics": [{
      "business": null,
      "description": "拼车发单应答数 / 拼车冒泡发单数",
      "dims": ["city"],
      "displayName": "拼车发单应答率",
      "formula": "M3175/M3174",
      "id": 3189,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_bubble_order_answer_rate",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车发单完成数 / 拼车发单应答数",
      "dims": ["city"],
      "displayName": "拼车发单完成率",
      "formula": "M3176/M3175",
      "id": 3190,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_bubble_order_finish_rate",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车应答后乘客取消数 / 拼车发单应答数",
      "dims": ["city"],
      "displayName": "拼车应答后乘客取消率",
      "formula": "M3177/M3175",
      "id": 3191,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_passenger_cancel_after_answer_rate",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车拼成且完成数 / 拼车发单完成数",
      "dims": ["city"],
      "displayName": "拼车拼成率",
      "formula": "M3178/M3176",
      "id": 3192,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_success_order_finish_rate",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车发单完成数/拼车冒泡发单数",
      "dims": ["city"],
      "displayName": "拼车成交率",
      "formula": "M3176/M3174",
      "id": 3201,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_bubble_finish_rate",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车成功订单司机展示价格 / 拼车成功订单预估价格",
      "dims": ["city"],
      "displayName": "拼车业务计费比",
      "formula": "M3180/M3179",
      "id": 3193,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_order_charge_ratio",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "（拼车订单实际行驶时间 - 拼车订单预估行驶时间）/拼车发单完成数",
      "dims": ["city"],
      "displayName": "拼车平均绕路时间",
      "formula": "(M3184-M3183)/M3176",
      "id": 3196,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_order_detour_drive_time_avg",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车订单实际行驶时间 / 拼车订单预估行驶时间",
      "dims": ["city"],
      "displayName": "拼车绕路时间比",
      "formula": "M3184/M3183",
      "id": 3197,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_order_detour_drive_time_ratio",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "(拼车实际行驶距离 - 拼车预估行驶距离) / 拼车发单完成数",
      "dims": ["city"],
      "displayName": "拼车平均绕路里程",
      "formula": "(M3186-M3185)/M3176",
      "id": 3198,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_order_detour_drive_distance_avg",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }, {
      "business": null,
      "description": "拼车完成单接驾时长/拼车完成单数",
      "dims": ["city"],
      "displayName": "拼车完成订单的平均接驾时长",
      "formula": "M3202/M3176",
      "id": 3203,
      "keytype": "fast:orderid",
      "name": "fast_orderid_pinche_finish_order_receive_time_avg",
      "subscribe": 1,
      "tag": "undefined",
      "type": 2
    }],
    "name": "fast_pinche_eta_version4",
    "keyType": "fast:order_id",
    "groups": [{
      "testkey": "fast_pinche_eta_version4:control_group"
    }, {
      "testkey": "fast_pinche_eta_version4:group_1"
    }],
    "flowType": {
      "experiment": {
        "groups": [{
          "name": "control_group",
          "params": {}
        }, {
          "name": "group_1",
          "params": {}
        }],
        "partition": {
          "objects": [{
            "slice": "180",
            "start": "2017-03-06",
            "switch_days": "1"
          }],
          "subject": "time_switching"
        }
      },
      "name": "fast_pinche_eta_version4",
      "namespaceId": "10000",
      "rule": {
        "objects": [{
          "objects": [{
            "noun": "city",
            "objects": ["5", "11"],
            "subject": "client_parameter",
            "verb": "="
          }],
          "subject": "must",
          "verb": "="
        }],
        "subject": "should",
        "verb": "="
      },
      "template": [{
        "objects": [3, 4, 7],
        "subject": "product_id",
        "verb": "in"
      }]
    },
    "stages": [{
      "id": "1",
      "startDate": "2017-03-09",
      "endDate": "2017-03-13"
    }, {
      "id": "2",
      "startDate": "2017-03-14",
      "endDate": "2017-03-27"
    }]
  },
  client2ServerExpData: {
    publishState: {
      "fields": {
        "name": {
          "value": "test_whitelist",
          "name": "name",
          "validating": false,
          "dirty": false
        },
        "description": {
          "value": "测试白名单",
          "name": "description",
          "validating": false,
          "dirty": false
        },
        "layerId": {
          "value": "-1",
          "name": "layerId",
          "validating": false,
          "dirty": false
        },
        "layerBucket": {
          "value": 0
        },
        "layerBucketCp": {
          "value": 0
        },
        "cities": {
          "value": []
        },
        "citiesCp": {
          "value": []
        },
        "owner": {
          "value": "zhangbingbinga",
          "name": "owner",
          "validating": false,
          "dirty": false
        },
        "whiteType": {
          "value": "phone"
        },
        "whiteValue": {
          "value": "18611495273,18611495273 ，  , 15555176339，+1-1234567890",
          "name": "whiteValue",
          "touched": true,
          "dirty": false,
          "validating": false
        },
        "groupType": {
          "value": "exp_bucket",
          "name": "groupType",
          "validating": false,
          "dirty": false
        },
        "groupStart": {
          "value": "2017-06-13T02:43:41.387Z"
        },
        "groupStep": {
          "value": "5"
        },
        "groupSwitch": {
          "value": false
        },
        "wiki": {
          "value": "",
          "name": "wiki",
          "validating": false,
          "dirty": false
        }
      },
      "expVersion": 1,
      "layers": [],
      "ruleList": [],
      "groups": {
        "info": {
          "paramsKey": [],
          "whitelistType": "phone"
        },
        "datas": [{
          "id": "10011",
          "name": "control_group",
          "description": "",
          "whitelistValue": "18611495273,18611495273,15555176339,+1-1234567890",
          "paramsVal": []
        }],
        "buckets": [
          [0, 100]
        ]
      },
      "allowSubmit": false,
      "status": 0
    },
    values: {
      "name": "test_whitelist",
      "layerId": "-1",
      "description": "测试白名单",
      "owner": "zhangbingbinga",
      "wiki": "",
      "whiteType": "phone",
      "whiteValue": "18611495273,18611495273 ，  , 15555176339，+1-1234567890",
      "groupType": "exp_bucket"
    }
  }
}
