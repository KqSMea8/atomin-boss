import httpApi from './httpApi';
import moment from 'moment';
import {CarpoolKey} from './commonConfig';

export function emptyFn() {
  return null;
}

export function transformCity(city_id, allCity) {
  return new Promise(function (resolve) {
    let coords, cityName = '';
    allCity.forEach(value => {
      if (value.id == city_id) {
        let {lat, lng} = value;
        cityName = value.name;
        coords = [lng, lat];
      }
    });

    httpApi('https://restapi.amap.com/v3/place/text', {
      credentials: 'omit',
      params: {
        s: 'rsv3',
        key: 'fd1634a95226568c1eeacc85a2d0cebb',
        keywords: cityName,
        offset: 1,
        types: '普通地名'
      }
    }).then(data => {
      let pois = data.pois;
      if (pois && pois.length) {
        coords = pois[0].location.split(',').map(item => {
          return item - 0;
        });
      }
      resolve(coords);
    });
  });
}

export function transformData(data, params) {
  let role = params.role;
  let LineStrings = [];
  let Points = [];
  let LineItem = null;
  let curStatus = null;

  data.forEach((item, i) => {
    let {
      lng,
      lat,
      oid,
      pid,
      biz_status,
      biz_ev
    } = item;
    let time = item.time * 1000;
    lng -= 0;
    lat -= 0;
    let coordinates = [lng, lat];
    let head = 0;

    if (!lat || !lng) {
      return;
    }

    if (LineItem) {
      let prevLen = LineItem.coordinates.length;
      let prevCood = LineItem.coordinates[prevLen - 1];
      head = turf.bearing(prevCood, coordinates);
      head = head.toFixed(1) - 0;
    }

    if (i === data.length - 1 && LineItem) {
      LineItem.endTime = time;
      LineItem.endPoint = coordinates;

      let tmpGeoLine = {
        type: 'Feature',
        properties: {
          timeline: LineItem.timeline,
          pid: LineItem.pid,
          oid: LineItem.oid,
          biz_status: LineItem.biz_status,
          startTime: LineItem.startTime,
          startPoint: LineItem.startPoint,
          endTime: LineItem.endTime,
          endPoint: LineItem.endPoint
        },
        geometry: {
          type: 'LineString',
          coordinates: LineItem.coordinates
        }
      };
      let distance = Math.floor(turf.lineDistance(tmpGeoLine) * 1000);
      let spendTime = (LineItem.endTime - LineItem.startTime) / 1000;

      tmpGeoLine.properties.distance = distance;
      tmpGeoLine.properties.spendTime = spendTime;

      LineStrings.push(tmpGeoLine);
    } else {
      // 司机或调度
      if (role === 2 || role === 3) {
        if (biz_status && biz_status !== curStatus) {
          if (LineItem) {
            LineItem.endTime = time;
            LineItem.endPoint = coordinates;

            let tmpGeoLine = {
              type: 'Feature',
              properties: {
                timeline: LineItem.timeline,
                pid: LineItem.pid,
                oid: LineItem.oid,
                biz_status: LineItem.biz_status,
                startTime: LineItem.startTime,
                startPoint: LineItem.startPoint,
                endTime: LineItem.endTime,
                endPoint: LineItem.endPoint
              },
              geometry: {
                type: 'LineString',
                coordinates: LineItem.coordinates
              }
            };
            let distance = Math.floor(turf.lineDistance(tmpGeoLine) * 1000);
            let spendTime = (LineItem.endTime - LineItem.startTime) / 1000;

            tmpGeoLine.properties.distance = distance;
            tmpGeoLine.properties.spendTime = spendTime;

            LineStrings.push(tmpGeoLine);
          }
          LineItem = {
            timeline: [{
              time,
              head,
              biz_status
            }],
            biz_status,
            startTime: time,
            startPoint: coordinates,
            coordinates: [coordinates]
          };
        } else {
          LineItem.timeline.push({
            time,
            head
          });
          LineItem.coordinates.push(coordinates);
        }
      } else {
        // 乘客
        if (LineItem) {
          LineItem.timeline.push({
            time,
            head
          });
          LineItem.coordinates.push(coordinates);
        } else {
          let biz_status = -1;
          LineItem = {
            timeline: [{
              time,
              head,
              biz_status
            }],
            biz_status,
            startTime: time,
            startPoint: coordinates,
            coordinates: [coordinates]
          };
        }
      }
    }

    if (biz_status) {
      curStatus = biz_status;
    }

    if (biz_ev) {
      Points.push({
        type: 'Feature',
        properties: {
          time,
          biz_ev,
          oid,
          pid,
          lat,
          lng
        },
        geometry: {
          type: 'Point',
          coordinates
        }
      });
    }
  });

  let pointsGeojson = {
    type: 'FeatureCollection',
    features: Points
  };
  let linesGeojson = {
    type: 'FeatureCollection',
    features: LineStrings
  };

  if (!LineStrings.length) {
    return {};
  }

  let centerGeo = turf.centerOfMass(linesGeojson);
  let center = turf.getCoord(centerGeo);

  if (role === 3) {
    let {
      dest_lng,
      dest_lat,
      dest_name,
      src_lng,
      src_lat,
      src_name,
      desc,
      start_time_str,
      finish_time_str
    } = data.dispatch_detail;

    let dispatchInfo = {
      dest_lng,
      dest_lat,
      dest_name,
      src_lng,
      src_lat,
      src_name,
      desc,
      start_time_str,
      finish_time_str
    };

    return {
      linesGeojson,
      pointsGeojson,
      center,
      dispatchInfo
    };
  }

  return {
    linesGeojson,
    pointsGeojson,
    center
  };
}

export function getCenterAndTopTen(data, type) {
  let top = data.slice(0, 10);
  if (type === 'all') {
    top = data;
  }
  let center = [];
  top = top.map((value, i) => {
    if (i === 0) {

      let item = type === 'all' ? value.coords : value.coord;
      center = [(item[0].lng + item[3].lng) / 2,
        (item[0].lat + item[3].lat) / 2];
    }
    value.index = i + 1;
    return value;
  });
  return {top, center};
}

export function getHistoryAndOverView(history, overview, quotaKey) {
  let translateKey = [];
  let historyDetail = {};
  let overviewDetail;
  Object.keys(overview).forEach(keys => {
    if (keys === quotaKey) {
      overviewDetail = overview[keys];
    }
    Object.keys(overview[keys]).forEach(value => {
      translateKey.push(value);
    });
  });
  Object.keys(history).forEach(keys => {
    if (keys === quotaKey) {
      Object.keys(history[keys]).forEach(prokey => {
        history[keys][prokey].history.forEach(value => {
          if (!historyDetail[value.time]) {
            historyDetail[value.time] = {};
          }
          historyDetail[value.time][prokey] = value.value;
        });
      });
    }
    Object.keys(history[keys]).forEach(value => {
      translateKey.push(value);
    });
  });
  historyDetail = Object.keys(historyDetail).map(time => {
    return {time: time, ...historyDetail[time]};
  });
  return {translateKey, historyDetail, overviewDetail};
}

export function assistTransformData(data, dataMap, val) {
  let result = [];
  if (data.length) {
    data.forEach((item, i) => {
      item.val = val[i];
      dataMap.set(item.gid, item);
      return item;
    });
    for (let value of dataMap.values()) {
      result.push(value);
    }
  }
  return result;
}

export function transformGridData(data) {
  let result = {
    id: null,
    current: [],
    past: [],
    driverExtra: {},
    name: data.name
  };

  delete data.errno;
  delete data.errmsg;
  delete data.name;

  let currentKey = ['orderNotBroadcastCnt', 'driverEmptyCnt', 'driverNotEmptyCnt'];

  let driverKey = [
    'driverEmptyList', 'driverEmptySetDestCnt', 'driverEmptySetShunLuCnt', 'driverEmptyNotShunLuAndDestCnt',
    'driverNotEmptyList', 'driverNotEmptySetDestCnt', 'driverNotEmptySetShunLuCnt', 'driverNotEmptyNotShunLuAndDestCnt'
  ];
  Object
    .keys(data)
    .forEach(key => {
      if (key === 'gridId') {
        result.id = data[key];
      }
      if (currentKey.includes(key)) {
        result
          .current
          .push({key: key, value: data[key]});
      } else if (driverKey.includes(key)) {
        result.driverExtra[key] = data[key];
      } else if (key !== 'gridId') {
        result
          .past
          .push({key: key, value: data[key]});
      }
    });

  return result;
}

export function transformNoBroadcastData(data, id) {
  let {coords, dest = []} = data;
  let result = {};
  let originCenter = coords.pop();
  coords.push(coords[0]);

  result[id] = {
    polygon: [coords.map(coord => [coord.lng, coord.lat])],
    properties: {
      center: [originCenter.lng, originCenter.lat],
      gid: id,
      val: 0,
      cat: 'origin',
      oids: []
    }
  };

  dest.forEach(value => {
    let {gid, coordlist, oids} = value;
    let center = coordlist.pop();

    coordlist.push(coordlist[0]);
    if (gid === id) {
      result[id].properties.oids = oids;
      result[id].properties.val = oids.length;
    } else {
      result[gid] = {
        polygon: [coordlist.map(coord => [coord.lng, coord.lat])],
        properties: {
          center: [center.lng, center.lat],
          gid,
          val: oids.length,
          cat: 'dest',
          oids
        }
      };
    }
  });

  return result;
}

const getPolygon = (lnglats, color = '#a6cee3') => {

  lnglats = lnglats.slice();

  return new AMap.Polygon({
    path: lnglats,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: color,
    fillOpacity: 0.5
  });
};
const getText = (name, center) => {

  return new AMap.Text({
    text: name,
    position: center,
    textAlign: 'center'
  });
};

export function transformMapItem(data, color) {
  if (!data) {
    return [];
  }
  let result = [];

  result = data.map(item => {

    let tempMapItem = item.map_item.map((lnglat) => {
      let [lng, lat] = lnglat.split(',');
      return [+lng, +lat];
    });

    let center = computedCenter(tempMapItem, true);
    return {
      ...item,
      center,
      polygon: getPolygon(tempMapItem, color),
      text: getText(item.name, center)
    };
  });


  return result;
}

export function transformCreatedFenceData(data) {
  let map_item = [];
  map_item = Object.keys(data).map((key, index) => {
    let item = data[key];
    let coords = item.geometry.coordinates;
    coords = coords.map(coord => coord.join(','));

    return {
      name: index,
      map_item: coords
    };
  });
  return map_item;

}

export function cityTopTranslate(data, cityConf, biz) {
  let {bizs, citylist, selectkeys} = data;
  let cityIds = citylist.split(',');
  let cityList = [];
  cityConf.forEach(item => {
    if (cityIds.indexOf(item.id) > -1) {
      cityList.push({id: item.id, name: item.name});
    }
  });

  let finalKey = {};
  Object.keys(bizs).forEach(i => {
    let item = bizs[i];
    finalKey[item.translate] = i;
  });
  let gridConditions = selectkeys[biz].map(item => {
    return {keyname: item.prokey, min: '', max: ''};
  });
  return {gridConfig: {bizs: finalKey, citylist: cityList, keyGroup: bizs, selectKeys: selectkeys}, gridConditions};
}

export function transFormCSV(csv, diff) {
  let final = [];
  csv.forEach((value, index) => {
    value.forEach((v, i) => {
      if (!final[index]) {
        final[index] = {};
      }
      final[index][`value-${i}`] = v;
    });
  });
  if (diff && diff.length > 0) {
    diff.forEach(value => {
      let {Row, Column} = value;
      let text = final[Row][`value-${Column}`];
      final[Row][`value-${Column}`] = {text, diff: true};
    });
  }
  return final;
}


export function queue2geo(data) {
  if (!data) {
    return null;
  }

  let pFeatures = [];
  let tFeatures = [];
  data.forEach(item => {
    let locs = item.locs;
    if (!locs) {
      return;
    }

    let coordinate = locs.map(loc => {
      let latlng = loc.split(',');
      return [latlng[1] - 0, latlng[0] - 0];
    });

    delete item.locs;
    let Polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinate]
      },
      properties: item
    };
    pFeatures.push(Polygon);

    let center = turf.center(Polygon);
    center.properties = item;
    tFeatures.push(center);
  });

  let PolygonData = {
    'type': 'FeatureCollection',
    features: pFeatures
  };
  let PointData = {
    'type': 'FeatureCollection',
    features: tFeatures
  };

  return {
    PolygonData,
    PointData
  };
}

export function formatFenceData(fenceId, list, result) {
  let payload = {
    clear: false,
    showGridList: true
  };
  if (!fenceId) {
    list.map(item => {
      const fenceId = item.id;
      let first = true;
      result.odlist.map(_item => {
        if (_item.id === fenceId && !first) {
          item.innerCount = _item.count;
        }
        if (_item.id === fenceId && first) {
          item.outerCount = _item.count;
          first = false;
        }
      });
      item.count = item.outerCount + '(' + item.innerCount + ')';
    });
    payload.selectFenceList = list;
    payload.currentOverview = list;
  } else {
    let currentDetailVal = result.odlist[0].count;
    list.map(item => {
      if (item.id === result.odlist[0].id) {
        result.odlist[0].coordlist = item.coordlist;
        result.odlist[0].outerCount = item.outerCount;
        result.odlist[0].innerCount = item.innerCount;
        result.odlist[0].count = item.count;
      }
    });
    let newSelectFenceList = result.odlist.slice(1, result.odlist.length - 1);
    payload.selectFenceList = newSelectFenceList;
    payload.currentDetailVal = currentDetailVal;
    payload.isDetail = true;
  }

  return {payload, list, result};
}

export function CityAreaTranslate(data) {
  let {fenceinfolist} = data;
  let cityAreaList = [];
  // let cityAreaList = fenceinfolist.map(item => {
  //   return {fenceid: item.fenceid, name: item.name.split('_')[1]};
  // });
  cityAreaList.unshift({fenceid: '', name: '不限'});

  return cityAreaList;
}

export function CityRouteTranslate(data, cityConf) {
  let {citylist} = data;
  let cityIds = citylist.split(',');
  let cityList = [];
  cityConf.forEach(item => {
    if (cityIds.indexOf(item.id) > -1) {
      cityList.push({id: item.id, name: item.name});
    }
  });
  let routeConditions = data.selectkeys.map(item => {
    return {keyname: item.prokey, min: '', max: ''};
  });
  let routeConfig = {
    routeCityList: cityList,
    routeKeys: data.keys,
    selectKeys: data.selectkeys
  };

  return {routeConditions, routeConfig};
}

export function CityRouteGeojsonDataTrans(data) {
  let geojsonData = [];
  data.forEach(item => {
    geojsonData.push({
      gridid: item.startgridid,
      gridname: item.startgridname,
      coords: item.startgridcoords,
      value: item.value
    });
    geojsonData.push({
      gridid: item.endgridid,
      gridname: item.endgridname,
      coords: item.endgridscoords,
      value: item.value
    });
  });
  return geojsonData;
}

export function transMap(data) {
  if (!data) {
    return {};
  }
  let result = {};
  data.forEach(value => {
    result[value.key] = value.val;
  });
  return result;
}

export function transformManage(fields, data) {
  let {
    biz_id, city_id, min_distance, max_distance,
    run_mode,
    max_price,
    start_end_time = [],
    min_price,
    total_budget,
    alarm_ratio,
    time_mode,
    none_weekend,
    ride_region_dispatch,
    is_block,
    bonus_type,
    activity_type,
    contribute_score,
    no_order_bonus, driver_status, category, activity_name, sectionDistance
  } = fields;
  let {fenceInfo, firstValue, secondValue} = data;
  let fences = [];
  let pangu_bonus = [];
  if (sectionDistance === min_distance || sectionDistance === max_distance) {
    pangu_bonus = [{from: min_distance, to: max_distance, ratio: firstValue}];
  } else {
    pangu_bonus = [
      {from: min_distance, to: sectionDistance, ratio: firstValue},
      {from: sectionDistance, to: max_distance, ratio: secondValue}
    ];
  }
  fences = Object.keys(fenceInfo.mapItem).map((key) => {
    let coordinates = fenceInfo.mapItem[key].geometry.coordinates;
    let {driverCount, choosePoint, points, areaName, center, dq_list} = fenceInfo.mapItem[key];
    let carPoint = [];
    points.forEach(value => {
      if (choosePoint.includes(value.name)) {
        carPoint.push(value);
      }
    });
    return {
      points: coordinates,
      board_points: carPoint,
      driver_cnt: driverCount,
      name: areaName,
      center,
      dq_list
    };
  });
  let activity_time = data[`activity_time_${time_mode}`].map(item => {
    if (time_mode - 0 === 1) {
      let start = item[0].split(':');
      let end = item[1].split(':');
      return {
        start_time: parseInt(start[0]) * 3600 + parseInt(start[1]) * 60,
        end_time: parseInt(end[0]) * 3600 + parseInt(end[1]) * 60
      };
    }
    return {
      start_time: parseInt(moment(item[0]).valueOf() / 1000),
      end_time: parseInt(moment(item[1]).valueOf() / 1000)
    };
  });
  let bonusMap = {
    max_price: max_price * 100,
    pangu_bonus,
    alarm_ratio,
    min_price: min_price * 100,
    total_budget: total_budget * 100,
    no_order_bonus: no_order_bonus * 100
  };
  if (bonus_type - 0 === 5888) {//盘古奖励
    delete bonusMap.contribute_score;
  } else { //贡献分
    bonusMap = {contribute_score};
  }
  let fenceContent = {fences};
  if (activity_type - 0 === 2) { //日常排队
    fenceContent = {};
  }
  let [start_date = '', end_date = ''] = start_end_time;
  let result = {
    ...fenceContent,
    time_mode: time_mode - 0,
    biz_id: biz_id - 0, city_id: Number(city_id),
    activity_time,
    start_date: start_date ? start_date.format('YYYY-MM-DD') : '',
    end_date: end_date ? end_date.format('YYYY-MM-DD') : '',
    activity_type: activity_type - 0,
    bonus_type: bonus_type - 0,
    min_distance, max_distance,
    none_weekend,
    run_mode,
    ride_region_dispatch,
    is_block,
    contribute_score,
    driver_status: driver_status.map(item => item - 0),
    category, activity_name,
    ...bonusMap
  };
  return result;
}

/**
 *
 * @param {业务创建id} createId
 * @param {业务审核id} checkoutId
 *  @param {所有业务} roles
 */
export function getUserRoleById(createId, checkoutId, roles) {
  let edit = false, isAdmin = false;
  roles.forEach(role => {
    let id = parseInt(role.id);
    if (id === parseInt(createId)) {
      edit = true;
    }
    if (id === parseInt(checkoutId)) {
      isAdmin = true;
    }
  });

  return {edit, isAdmin};
}

export function getStopColor(key) {
  let rs = [
    [-34, '#a50026'],
    [-26, '#d73027'],
    [-18, '#f46d43'],
    [-12, '#f46d43'],
    [-6, '#FA9A5B'],
    [-1, '#fdae61'],
    [1, '#abdda4'],
    [5, '#99dc90'],
    [12, '#74b56d'],
    [18, '#6BB36F'],
    [24, '#66bd63'],
    [32, '#1a9850'],
    [40, '#006837']
  ];
  if (key.indexOf('RATE') > -1) {
    rs = [
      [0.01, '#9ea842'],
      [0.4, '#899f38'],
      [0.6, '#639f37'],
      [0.8, '#66bd63'],
      [1, '#1a9850']
    ];
  } else if (key.indexOf('CNT') > -1) {
    rs = [
      [10, '#d9f0a3'],
      [20, '#addd8e'],
      [30, '#78c679'],
      [50, '#41ab5d'],
      [80, '#238443'],
      [100, '#006837'],
      [120, '#004529']
    ];
  }
  return rs;
}

export function getLineString(center, directionData) {
  let pointjson = {
    type: 'FeatureCollection',
    features: []
  };
  let p1 = turf.point(center);
  Object.keys(directionData).forEach(grid => {
    let item = directionData[grid];
    let otherPoint = turf.point(item.properties.center);
    let midPoint = turf.midpoint(p1, otherPoint);
    const bearingToCenter = turf.rhumbBearing(p1, otherPoint) + 90;
    let distance = turf.distance(p1, otherPoint);
    const p3 = turf.rhumbDestination(midPoint, distance / 10, bearingToCenter);
    const line = turf.lineString([p1.geometry.coordinates, p3.geometry.coordinates, otherPoint.geometry.coordinates]);
    let curved = turf.bezierSpline(line);
    pointjson.features.push(curved);
  });
  return pointjson;
}

export function transCompute(data) {
  let result = {};
  let needPercent = [
    'ResponseRateMinKC_MORN', 'ResponseRateMinKC_NIGHT', 'ResponseRateMinKC_PINGCOM',
    'ResponseRateMinYX_MORN', 'ResponseRateMinYX_NIGHT', 'ResponseRateMinYX_PINGCOM',
    'ResponseRateMinZC_MORN', 'ResponseRateMinZC_NIGHT', 'ResponseRateMinZC_PINGCOM',
    'CallGrowthRateKC', 'CallGrowthRateYX', 'CallGrowthRateZC',
    'TakeRateKC', 'TakeRateYX', 'TakeRateZC', 'CSubsidyFutureKC', 'CSubsidyFutureYX', 'CSubsidyFutureZC',
    'BSubsidyFutureKC', 'BSubsidyFutureYX', 'BSubsidyFutureZC'
  ];
  needPercent.forEach(key => {
    data[key] = data[key] / 100;
  });
  let needArrKey = [];
  Object.keys(data).forEach(key => {
    if (key.indexOf('MORN') > -1 || key.indexOf('NIGHT') > -1 || key.indexOf('PINGCOM') > -1) {
      let finalArr = key.split('_');
      finalArr.splice(finalArr.length - 1, 1);
      let finalKey = finalArr.join('_');
      if (!result[finalKey]) {
        needArrKey.push(finalKey);
        result[finalKey] = [];
      }
      result[finalKey].push(Number(data[key]));
    } else {
      if (typeof data[key] === 'number') {
        result[key] = data[key];
      }
      if (typeof data[key] === 'string') {
        let strArr = data[key].split(',');
        let final = strArr.map(value => {
          return value - 0;
        });
        result[key] = final;
      }
    }
  });
  needArrKey.forEach(item => {
    if (result[item]) {
      result[item] = JSON.stringify(result[item]);
    }
  });
  return result;
}

export function resetHistoryParams(date, NightHours, PeekHours) {
  let dateStrArr = [];
  let Night = [];
  let Peek = [];
  dateStrArr = date.map(value => {
    return moment(value).format('YYYY-MM-DD');
  });
  Night = NightHours.map(value => {
    return value - 0;
  });
  Peek = PeekHours.map(value => {
    return value - 0;
  });
  return {Peek, dateStrArr, Night};
}

export function diffParams(state, oldParams) {
  let diff = false;
  if (Object.keys(oldParams.fenceInfo.mapItem).length > 1) {
    return true;
  }
  Object.keys(oldParams).forEach(key => {
    if (key === 'fenceInfo') {
      let stateFenceItemKey = state.fenceInfo.mapItem;
      let oldParamsFenceItemKey = state.fenceInfo.mapItem;
      Object.keys(stateFenceItemKey).forEach(key => {
        if (!oldParamsFenceItemKey[key]) {
          diff = true;
        }
      });
    } else {
      if (state[key] !== oldParams[key]) {
        diff = true;
      }
    }
  });
  return diff;
}

export function computedCenter(fence, isArray) {
  let centerData = [];
  if (isArray) {
    centerData = fence.slice();
  } else {
    centerData = fence.map(value => {
      return [+value.lng, +value.lat];
    });
  }

  centerData.push(centerData[0]);
  let polygon = turf.polygon([centerData]);
  let center = turf.centerOfMass(polygon);
  let {geometry} = center;
  return geometry.coordinates;
}

function gainCityId(data) {//没用的函数，就是为了拿到city_id
  let {city_show_text_list, city_showtext_default_list, showtext_rule} = data;
  let {city_rule_list = [], fence_rule_list = []} = showtext_rule;
  if (city_show_text_list.length > 0) {
    return city_show_text_list[0].city_id;
  }
  if (city_showtext_default_list.length > 0) {
    return city_showtext_default_list[0].city_id;
  }
  if (city_rule_list.length > 0) {
    return city_rule_list[0].city_id_list[0];
  }
  if (fence_rule_list.length > 0) {
    return fence_rule_list[0].city_id;
  }
  return '';
}

export function serverToForm(data) {
  let {config_name = '', showtext_list, create_user = ''} = data;
  let fence_control = false;
  let city_control = false;
  let fence;
  let city = [];
  let detail = showtext_list[0];
  let city_id = String(gainCityId(detail));//这个函数是垃圾代码，不用管。
  let {
    city_showtext_default_list,
    city_show_text_list
  } = detail;
  if (!city_showtext_default_list.length) {
    city_showtext_default_list = [{text: '', title: ''}];
  }
  if (!city_show_text_list.length) {
    city_show_text_list = [{text: '', title: ''}];
  }
  let {fence_rule_list, city_rule_list} = detail.showtext_rule;
  if (fence_rule_list.length > 0) {
    fence_control = true;
    fence = fence_rule_list.map(value => {
      let {periods} = value;
      let {fence_id_list} = value;
      let time = periods.map(timer => {
        let {start_time, end_time, start_date, end_date} = timer;
        let startStr = `${start_date} ${start_time}`;
        let endStr = `${end_date} ${end_time}`;
        return [moment(startStr, 'YYYY-MM-DD HH:mm:ss'), moment(endStr, 'YYYY-MM-DD HH:mm:ss')];
      });
      return {time, id: fence_id_list};
    });
  }
  if (city_rule_list.length > 0) {
    city_control = true;
    city_rule_list.map(value => {
      let {periods} = value;
      periods.forEach(timer => {
        let {start_time, end_time, start_date, end_date} = timer;
        let startStr = `${start_date} ${start_time}`;
        let endStr = `${end_date} ${end_time}`;
        city.push([moment(startStr, 'YYYY-MM-DD HH:mm:ss'), moment(endStr, 'YYYY-MM-DD HH:mm:ss')]);
      });
    });
  }
  let result = {
    config_name,
    city_id: city_id - 0,
    special_Text: city_show_text_list[0],
    default_Text: city_showtext_default_list[0],
    fence_rule_list: fence || [],
    city_rule_list: city || [[0]],
    fence_control,
    city_control
  };
  return {config_name, create_user, result};
}

export function formToServer(data) {
  let {config_name, phone, city_rule_list = [], city_id, fence_rule_list = [], global_Text, special_Text, default_Text, city_control, fence_control} = data;
  let showtext_list = [];
  let cityPeriods = city_control ? city_rule_list.map(value => {
    return transformDateToTime(value);
  }) : [];
  let fenceList = fence_control ? fence_rule_list.map(value => {
    let fencePeriods = value.time.map(date => {
      return transformDateToTime(date);
    });
    let idList = value.id.map(id => {
      return Number(id);
    });
    return {fence_id_list: idList, periods: fencePeriods, city_id: Number(city_id)};
  }) : [];
  let result = {
    stage: 2,
    type: 1,
    showtext_rule: {
      phone_list: phone,
      city_rule_list: [
        {
          city_id_list: [Number(city_id)],
          periods: cityPeriods
        }],
      fence_rule_list: fenceList
    },
    global_showtext_default: global_Text,
    city_show_text_list: [{city_id: Number(city_id), ...special_Text}],
    city_showtext_default_list: [{city_id: Number(city_id), ...default_Text}]
  };
  showtext_list[0] = result;
  return {config_name, config_data: JSON.stringify({showtext_list})};
}

function transformDateToTime(date) {
  let timeArr = date.map(dateStr => {
    return moment(dateStr).format('YYYY-MM-DD HH:mm:ss').split(' ');
  });
  let [[start_date, start_time], [end_date, end_time]] = timeArr;
  return {start_date, start_time, end_date, end_time};
}

export function checkSelfIntersect(coordinates) {
  if (!coordinates.length) {
    return true;
  }
  let polyon = turf.polygon([coordinates]);
  let result = turf.unkinkPolygon(polyon);
  if (result && result.features.length > 1) {

    return true;
  }
  return false;
}

export function formatSaveFenceData(info, list, cityKey) {
  if (!info || !list) {
    return;
  }

  let payload = {
    ...info,
    type: +info.type,
    product_type: +info.product_type,
    area: +cityKey,
    validate_time: null
  };

  payload.map_item = list.map(item => {
    let map_item = item.path.map(({lng, lat}) => {
      return `${lng},${lat}`;
    });
    return {
      name: item.name,
      map_item
    };
  });

  if (payload.product_type === 19 && [43, 49, 50].includes(payload.type)) {
    payload.validate_time = info.validate_time.map(time => {
      let {dateTime, endTime, startTime} = time;
      let [startDate, endDate] = dateTime;

      startDate = moment(startDate).format('YYYY-MM-DD');
      endDate = moment(endDate).format('YYYY-MM-DD');
      startTime = moment(startTime).format('HH:mm');
      endTime = moment(endTime).format('HH:mm');

      return {startTime: `${startDate} ${startTime}`, endTime: `${endDate} ${endTime}`};

    });
  }

  return payload;
}

function formatData(data, type) {
  const originFee = {
    '0-100': 0,
    '100-200': 0,
    '200-300': 0,
    '300-400': 0,
    '400-500': 0,
    '500-600': 0,
    '600-700': 0,
    '700-800': 0,
    '800-900': 0,
    '900-1000': 0,
    '1000-99999': 0
  };
  const originIPH = {
    '0-10': 0,
    '10-20': 0,
    '20-30': 0,
    '30-40': 0,
    '40-50': 0,
    '50-60': 0,
    '60-70': 0,
    '70-80': 0,
    '80-90': 0,
    '90-100': 0,
    '100-99999': 0
  };
  let origin = type === 'fee' ? originFee : originIPH;
  Object.keys(origin).forEach(key => {
    let [originFrom, originTo] = key.split('-');
    if (!data.filter(value => {
      return value.from === Number(originFrom) && value.to === Number(originTo);
    }).length) {
      data.push({from: Number(originFrom), to: Number(originTo), cnt: 0});
    }
  });
  return data;
}

export function incomeTransData(data) {
  if (!data || Object.keys(data).length === 0) {
    return {};
  }
  let transKey = ['iph', 'fee'];
  data = data.map(value => {
    transKey.forEach(key => {
      value[key] = formatData(value[key], key);
      value[key] = value[key].map(item => {
        let {from, to} = item;
        let keyName = ((from - 0) + (to - 0)) / 2;
        item.originKey = `${from}-${to}`;
        if (key === 'iph' && to > 100) {
          keyName = 110;
          item.originKey = '100以上';
        }
        if (key === 'fee' && to > 1000) {
          keyName = 1100;
          item.originKey = '1000以上';
        }
        item.keyName = keyName;
        return item;
      });
    });
    return value;
  });
  return data;
}

export function historyResult(data, oldFields) {
  let fields = Object.assign({}, oldFields);
  let resultMap = {
    CALCULATE_FAST_ORDER_RESPONSE_RATE_PERIOD: ['ResponseRateMinKC_MORN', 'ResponseRateMinKC_NIGHT', 'ResponseRateMinKC_PINGCOM'],
    CALCULATE_APLUS_ORDER_RESPONSE_RATE_PERIOD: ['ResponseRateMinYX_MORN', 'ResponseRateMinYX_NIGHT', 'ResponseRateMinYX_PINGCOM'],
    CALCULATE_SPECIAL_ORDER_RESPONSE_RATE_PERIOD: ['ResponseRateMinZC_MORN', 'ResponseRateMinZC_NIGHT', 'ResponseRateMinZC_PINGCOM'],
    CALCULATE_FAST_ORDER_TAKE_RATE_RATE: 'TakeRateKC',
    CALCULATE_APLUS_ORDER_TAKE_RATE_RATE: 'TakeRateYX',
    CALCULATE_SPECIAL_ORDER_TAKE_RATE_RATE: 'TakeRateZC',
    CALCULATE_FAST_ORDER_SUBSIDYC_RATE: 'CSubsidyFutureKC',
    CALCULATE_APLUS_ORDER_SUBSIDYC_RATE: 'CSubsidyFutureYX',
    CALCULATE_SPECIAL_ORDER_SUBSIDYC_RATE: 'CSubsidyFutureZC',
    CALCULATE_FAST_ORDER_SUBSIDYB_RATE: 'BSubsidyFutureKC',
    CALCULATE_APLUS_ORDER_SUBSIDYB_RATE: 'BSubsidyFutureYX',
    CALCULATE_SPECIAL_ORDER_SUBSIDYB_RATE: 'BSubsidyFutureZC'
  };
  let intmap = {
    CALCULATE_FAST_FULL_TIME_DRIVER_ONLINE_TIME_AVG: 'AvgHourPerMonthKC',
    CALCULATE_APLUS_FULL_TIME_DRIVER_ONLINE_TIME_AVG: 'AvgHourPerMonthYX',
    CALCULATE_SPECIAL_FULL_TIME_DRIVER_ONLINE_TIME_AVG: 'AvgHourPerMonthZC',
    CALCULATE_FAST_DRIVE_SPEED_AVG: 'AvgDrivSpeedFutureKC',
    CALCULATE_APLUS_DRIVE_SPEED_AVG: 'AvgDrivSpeedFutureYX',
    CALCULATE_SPECIAL_DRIVE_SPEED_AVG: 'AvgDrivSpeedFutureZC'
  };
  Object.keys(data).forEach(key => {
    if (resultMap[key]) {
      if (Array.isArray(resultMap[key])) {
        resultMap[key].forEach((item, index) => {
          fields[item] = {value: `${(data[key][index] * 100).toFixed(2)}`};
        });
      } else {
        fields[resultMap[key]] = {value: `${(data[key] * 100).toFixed(2)}`};
      }
    }
    if (intmap[key]) {
      fields[intmap[key]] = {value: data[key].toFixed(2)};
    }
  });
  return fields;
}


export function TransDriverDetail(data) {
  let {free_time, charging_time, wait_passenger_time, wait_pick_time, history} = data;
  let {days, iph, total_fee, finish_num, online_time} = history;
  let historyData = days.map((item, i) => {
    return {
      days: item,
      IPH: iph[i] - 0,
      '司机流水': total_fee[i] - 0,
      '完单数': finish_num[i] - 0,
      '在线时长': online_time[i] - 0
    };
  });
  let distributed = [{
    value: free_time - 0,
    type: '空闲时长',
    name: '空闲时长'
  }, {value: charging_time - 0, type: '服务时长', name: '计费时长'},
  {value: wait_passenger_time - 0, type: '服务时长', name: '等待乘客总时长'},
  {value: wait_pick_time - 0, type: '服务时长', name: '接驾总时长'}
  ];
  let result = Object.assign({}, data, {distributed, historyData});
  return result;
}

export function permManage(userInfo) {
  let editId = 101226;
  let adminId = 101228;
  let edit = false;
  let isAdmin = false;
  let {username, roles} = userInfo;
  roles.forEach(item => {
    if(item.id === editId) {
      edit = true;
    }
    if(item.id === adminId) {
      isAdmin = true;
    }
  });
  return {isAdmin, edit, username};
}

export function getFenceActivityForm(fields, username) {
  let obj = {};
  [
    'cityid',
    'coordtype',
    'daytype',
    'endfence',
    'frequencynum',
    'iscrosscity',
    'isdiscount',
    'isfrequency',
    'issegmentprice',
    'routegenre',
    'routetitle',
    'startfence',
    'tag',
    'timequantum',
    'shortisdiscount',
    'longisdiscount'
  ].forEach(key => {
    let fieldsVlaue = fields[key].value;
    obj[key] = fieldsVlaue;
  });
  ['kilometres', 'shortnumber', 'longnumber', 'maxdiscount', 'mergevalue'].map(key => {
    obj[key] = parseFloat(fields[key].value);
  });

  if (fields.issegmentprice.value === 0) { // 不进行分段计数
    let deleteKeys = ['kilometres', 'shortisdiscount', 'shortnumber', 'longisdiscount', 'longnumber', 'maxdiscount'];

    deleteKeys.forEach(key => {
      delete obj[key];
    });
  }
  if (fields.isfrequency.value === 0) {// 不进行频率控制
    delete obj.frequencynum;
  }

  obj.createpeople = username;
  obj.starttime = fields.time.value[0].format('YYYY-MM-DD/HH:mm:ss');
  obj.endtime = fields.time.value[1].format('YYYY-MM-DD/HH:mm:ss');
  return obj;
}

export function getRouteActivityForm(fields, username, routeList) {
  let obj = {};
  routeList = routeList.map(item => [item.startgridid, item.endgridid]);
  obj.createpeople = username;
  obj.starttime = fields.time.value[0].format('YYYY-MM-DD HH:mm:ss');
  obj.endtime = fields.time.value[1].format('YYYY-MM-DD HH:mm:ss');
  obj.routlist = routeList
    .map(item => {
      let arr = fields.timequantum.value.replace(/\s+/g, '').split(',');
      let str = arr.map(v => {
        return item.join(',') + `,${v}` + `,${fields.mergevalue.value}`;
      }).join('-');
      return str;
    })
    .join('-');
  ['routetitle', 'cityid', 'tag'].forEach(key => {
    obj[key] = fields[key].value;
  });
  [
    'daytype',
    'cityid',
    'isfrequency',
    'frequencynum',
    'isdiscount',
    'issegmentprice',
    'shortisdiscount',
    'longisdiscount'
  ].map(key => {
    obj[key] = parseInt(fields[key].value, 10);
  });
  ['kilometres', 'shortnumber', 'longnumber', 'maxdiscount'].map(key => {
    obj[key] = parseFloat(fields[key].value);
  });

  if (Number(fields.issegmentprice.value) === 0) {
    // 不进行分段计数
    let deleteKeys = [
      'kilometres',
      'shortisdiscount',
      'shortnumber',
      'longisdiscount',
      'longnumber',
      'maxdiscount'
    ];

    deleteKeys.forEach(key => {
      delete obj[key];
    });
  }
  if (fields.isfrequency.value === 0) {
    // 不进行频率控制
    delete obj.frequencynum;
  }
  return obj;
}

export function getActivityEffectData(effectData, keyConf){
  let keys = {};
  let dataSource = [], defaultKey = '';
  let columns = Object.keys(effectData).map(key => {
    if(defaultKey === '') defaultKey = key;
    keys[key] = keyConf[key];
    return {
      title: keyConf[key],
      dataIndex: key
    };
  });
  columns = [{
    title: '日期',
    dataIndex: 'date',
    fixed: 'left',
    width: 120
  }, ...columns];

  dataSource = effectData[defaultKey] &&
    effectData[defaultKey].map((item, index) => {

      let obj = {
        key: index,
        date: moment(item.timestamp).format('YYYY-MM-DD')
      };
      Object.keys(effectData).forEach(k => {
        let val = effectData[k];
        obj[k] = val[index].value;
      });
      return obj;
    });

  return {
    columns,
    dataSource,
    keys
  };
}
export function getTagGeojsonData(tagData){
  let data = {
    type: 'FeatureCollection',
    features: []
  };
  tagData.forEach(item => {
    let coords = item.coords.map(v => [v.lng, v.lat]);
    data.features.push({
      type: 'Feature',
      geometry: {
        'type': 'Polygon',
        'coordinates': [coords]
      },
      'properties': {
        gid: item.gridid,
        color: item.tags[0],
        coords
      }
    });
  });

  return data;
}

const getFeatures = (dataSource) => {
  let geojson = {
    type: 'FeatureCollection',
    features: []
  };
  let pointjson = {
    type: 'FeatureCollection',
    features: []
  };
  Object.keys(dataSource).forEach(gid => {
    let item = dataSource[gid];
    let coords = JSON.stringify(item.polygon);
    item.properties['coords'] = coords;
    geojson.features.push({
      type: 'Feature',
      geometry: {
        'type': 'Polygon',
        'coordinates': item.polygon
      },
      'properties': item.properties
    });

    pointjson.features.push({
      type: 'Feature',
      geometry: {
        'type': 'Point',
        'coordinates': item.properties.center
      },
      'properties': {
        val: item.properties.val
      }
    });
  });
  return {geojson, pointjson};
};

export function getPolygonData(dataSource){
  let geojsonData = {};
  dataSource.forEach(item => {
    if (item.coords && item.value) {
      let path = [];
      item.coords.forEach((gridItem, i) => {
        if(i <= 5) {
          path.push([gridItem.lng, gridItem.lat]);
        }
      });
      path.push(path[0]);
      let props = {
        gid: item.gridid,
        val: item.value,
        coords: path,
        center: [item.coords[6].lng,item.coords[6].lat ]
      };
      geojsonData[item.gridid] = {
        polygon: [path],
        properties: props
      };
    } else {
      delete geojsonData[item.gridid];
    }
  });
  return getFeatures(geojsonData);
}

const getColorByIndex = (index, l) => {
  const length = Math.min(l,1000);
  const _index = (index / length).toFixed(2);
  if (_index < 0.25) {
    return 'rgb(255, 0, 0)';
  } else if (_index < 0.5) {
    return 'rgb(255, 252, 5)';
  } else if (_index < 0.75) {
    return 'rgb(1, 158, 62)';
  } else {
    return 'rgb(73, 190, 216)';
  }
};
export function getColorRoute(data){
  let layers = {
    type: 'FeatureCollection',
    features: []
  };
  let routeList = data.sort((a, b) => (a.value < b.value) ? 1 : -1);
  let l = data.length;
  routeList.forEach((item, i) => {
    if(item.pathcoords){
      let color = getColorByIndex(i, l);
      let coord = item.pathcoords.map(v => [v.lng, v.lat]);
      layers.features.push({
        type: 'Feature',
        geometry: {
          'type': 'LineString',
          'coordinates': coord
        },
        'properties': {
          color,
          ...item
        }
      });
    }
  });
  return layers;
}
export function getCityTopChartData(data){
  let obj = {
    CARPOOL: [],
    FAST: [],
    QUICK: []
  };
  let typeKeys = Object.keys(obj);
  for(let key in data){
    data[key].forEach(item => {
      item['date'] = moment(item.time).format('MM:DD hh:mm:ss');
      item['title'] = CarpoolKey[key];
    });
    typeKeys.forEach(typeKey => {
      if(key.indexOf(typeKey) !== -1){
        obj[typeKey] = [...obj[typeKey],...data[key]];
      }
    });
  }
  return obj;
}

export function transType(data) {
  let result = Object.assign({},data);
  let stringKey = ['city_id','activity_type', 'driver_status'];
  let bonus = ['max_price','min_price','no_order_bonus','total_budget'];
  let {time_mode, activity_time,start_date, end_date,pangu_bonus } =data;
  let activity_time_0 = [];
  let activity_time_1 = [];
  let start_end_time = [];
  if(!time_mode) {
    activity_time_0 = activity_time.map(item => {
      return [
        moment(item.start_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.end_time * 1000).format('YYYY-MM-DD HH:mm:ss')
      ];
    });
  } else {
    start_end_time =[moment(start_date), moment(end_date)];
    activity_time_1 = activity_time.map(item => {
      return [
        `${parseInt(item.start_time / 3600)}:${(item.start_time % 3600) / 60}`,
        `${parseInt(item.end_time / 3600)}:${(item.end_time % 3600) / 60}`];
    });
  }
  let firstValue = 0;
  let secondValue =0;
  let sectionDistance = 0;
  bonus.forEach(item => {
    result[item] = result[item]/ 100;
  });
  if(pangu_bonus && pangu_bonus.length) {
    firstValue = pangu_bonus[0].ratio;
    if(pangu_bonus.length  === 2) {
      sectionDistance = pangu_bonus[1].from;
      secondValue = pangu_bonus[1].ratio;
    }
  }
  stringKey.forEach(item => {
    if(typeof result[item] === 'object') {
      result[item] = result[item].map(value => value + '');
    } else {
      result[item] = result[item] + '';
    }
  });
  result = Object.assign({},result, {activity_time_0, activity_time_1,start_end_time,firstValue,secondValue,sectionDistance });

  return result;
}

export function transDetailToAdd(fences, transData, newFenceInfo) {
  let result = {
    firstValue: transData['firstValue'],
    secondValue: transData['secondValue'],
    [`activity_time_${transData['time_mode']}`]: transData[`activity_time_${transData['time_mode']}`]
  }
  fences && fences.length && fences.forEach((item, index) => {
    let coordinates = [...item.points];
    let feature = {
      type: 'Feature',
      properties: {},
      id: `copy-${item.id}-${index}`, //copy是特殊前缀
      geometry: {
        type: 'Polygon',
        coordinates: coordinates
      }
    };
    newFenceInfo.mapItem[`copy-${item.id}-${index}`] = {
      ...feature, areaName: item.name || `区域${index + 1}`,
      points: [],
      driverCount: item.driver_cnt,
      dq_list: null,
      centers: item.center

    };
  });
  return {result};
}
