const context = require.context('./', false, /\.js$/);
const modalFiles = context.keys().filter(item => item !== './index.js');

export default modalFiles.map(function(item) {
  return context(item).default;
});
