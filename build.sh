#复制下面两行，并替换需要的版本
#source ${NVM_DIR}/nvm.sh  #necessary

source ~/.nvm/nvm.sh
nvm use v8.9.1
env=$1

rm -rf output

mkdir -p ./output

yarn

if [[ $env == "test" ]]
then
  npm run dev-build
else
  npm run build
fi

# create target & Docker部署
mv ./dist/* output/
cp ./deploy/Dockerfile ./output/Dockerfile
cp ./deploy/* ./output/

ret=$?
if [ $ret -ne 0 ];then
    echo "===== npm build failure ====="
    exit $ret
else
    echo -n "===== npm build successfully! ====="
fi
