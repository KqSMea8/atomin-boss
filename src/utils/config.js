let origin = '';

try {
  if (ENV === 'development') {
    origin = 'http://192.168.133.60:18084/api';
  }
} catch (err) {
  origin = 'http://192.168.133.60:8084/api';
}

const api =  {
  origin: origin,
  logout: `${origin}/api/logout`,
  userInfo: `${origin}/api/userinfo`
};
const CenterMap = {
  cn: {
    id: 1,
    business: 260,
    coords: [116.361718, 39.9390715]
  }
};

export {
  api,
  CenterMap
};
