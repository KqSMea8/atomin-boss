const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; //详细分布查看插件

module.exports = (env, argv) => {
  let Env = 'Production';
  let devtool;
  let plugins = [];
  let devServer = {
    host: '0.0.0.0'
  };

  let optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  };

  let babelPlugins = ['@babel/plugin-transform-runtime', 'transform-class-properties', ['module-resolver', {
    'alias': {
      'dva': 'dva-react-router-3'
    }
  }],
  ['import', {
    libraryName: 'antd',
    style: false
  }]
  ];

  if (argv.mode === 'development') {
    Env = 'development';
    plugins = [
      new webpack.HotModuleReplacementPlugin() // 调用webpack的热更新插件
    ];
    devtool = 'eval';
    babelPlugins.push('dva-hmr');
    devServer.proxy = {
      '/api': {
        target: 'http://192.168.133.60:18084',
        changeOrigin: true,
        pathRewrite: { 
          '^/api': ''
        }
      }
    };
  }else{
    devServer = {
      host: '0.0.0.0'
    };
  }

  optimization.splitChunks = {
    minSize: 200000,
    minChunks: 3,
    cacheGroups: {
      styles: {
        name: 'styles',
        test: /\.less|css$/,
        chunks: 'all',
        enforce: true
      }
    }
  };

  let config = {
    entry: {
      app: './src/index.js'
    },
    output: {
      publicPath: '/',
      filename: 'static/[name].__[hash:6]__.js',
      chunkFilename: 'static/[name].__[chunkHash:6]__.js',
      path: path.resolve(__dirname, './dist')
    },
    externals: {
      '@antv/data-set': 'DataSet'
    },
    stats: {
      entrypoints: false,
      children: false
    },
    devtool: devtool,
    optimization: optimization,
    module: {
      noParse: /(mapbox-gl-dev)\.js$/,
      rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: babelPlugins
          }
        }
      }, {
        test: /\.(less|css)$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            sourceMap: true
          }
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        }, {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            javascriptEnabled: true,
            modifyVars: {
              'primary-color': '#6574cd'
            }
          }
        }]
      }]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    node: {
      fs: 'empty'
    },
    performance: {
      hints: false
    },
    devServer,
    plugins: [
      new MiniCssExtractPlugin({
        publicPath: '/',
        filename: 'static/[name].[hash:8].css',
        chunkFilename: 'static/[name].[contenthash:8].css'
      }),
      new HtmlWebPackPlugin({
        template: './src/index.ejs'
      }),
      new CopyWebpackPlugin([{
        from: 'static',
        to: 'static'
      }]),
      new CleanWebpackPlugin(['dist']),
      new webpack.DefinePlugin({
        ENV: JSON.stringify(Env)
      }),
      new WorkboxPlugin.GenerateSW({
        importWorkboxFrom: 'disabled',
        importScripts: ['/static/js/workbox-sw.3.6.2.js'],
        precacheManifestFilename: 'static/service-worker-manifest.[manifestHash].js',
        clientsClaim: true,
        skipWaiting: true
      }),
      // new BundleAnalyzerPlugin(),
      new WebpackBar()
    ]
  };

  config.plugins.concat(plugins);

  return config;
};
