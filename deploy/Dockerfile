FROM :stable

MAINTAINER zhuzhennan <zhuzhennan@didicg.com>

# install filebeat

RUN mkdir -p /workspace/logs


COPY . /home/xiaoju/workspace/target

RUN chmod a+x /home/xiaoju/workspace/target/start.sh

EXPOSE 22 8001 8080 8090 9010 9020

CMD /home/xiaoju/workspace/target/start.sh