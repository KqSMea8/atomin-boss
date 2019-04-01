#!/bin/bash
#############################################
## main
## 非托管方式, 启动服务
## control.sh脚本, 必须实现start和stop两个方法
#############################################

module=app-name
app=${module}

## function
function start() {
  # exec sh
  if [ $? -ne 0 ];then
      echo "${app} start failed, please check"
      exit 1
  fi

  echo "${app} start ok"
  # 启动成功, 退出码为 0
  exit 0
}

function stop() {
  echo "deploying ${app} "
  # stop服务失败, 返回码为 非0
  exit 0
}
action=$1
case $action in
    "start" )
        # 启动服务
        start
        ;;
    "stop" )
        # 停止服务
        stop
        ;;
    * )
        echo "unknown command"
        exit 1
        ;;
esac
