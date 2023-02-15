// Node.js的核心模块，专门用来处理文件路径
const os = require("os");
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// cpu核数
const threads = os.cpus().length;

// 获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
            loader: "postcss-loader",
            options: {
            postcssOptions: {
                plugins: [
                "postcss-preset-env", // 能解决大多数样式兼容性问题
                ],
            },
            },
        },
        preProcessor,
    ].filter(Boolean);
};

module.exports = {
    // 入口
    // 相对路径和绝对路径都行
    entry: "./src/main.js",
    // 输出
    output: {
        // path: 文件输出目录，必须是绝对路径
        // path.resolve()方法返回一个绝对路径
        // __dirname 当前文件的文件夹绝对路径
        path: path.resolve(__dirname, "../dist"), // 生产模式需要输出
        // filename: 输出文件名
        filename: "static/js/main.js",
        clean: true, // 自动将上次打包目录资源清空
    },
    // 加载器
    module: {
        rules: [
            {
                oneOf: [
                    {
                        // 用来匹配 .css 结尾的文件
                        test: /\.css$/,
                        // use 数组里面 Loader 执行顺序是从右到左
                        use: getStyleLoaders(),
                      },
                      {
                          test: /\.less$/,
                          use: getStyleLoaders("less-loader"),
                      },
                      {
                          test: /\.s[ac]ss$/,
                          use: getStyleLoaders("sass-loader"),
                      },
                      {
                          test: /\.styl$/,
                          use: getStyleLoaders("stylus-loader"),
                      },
                      {
                          test: /\.(png|jpe?g|gif|webp)$/,
                          type: "asset",
                          parser: {
                              dataUrlCondition: {
                                  maxSize: 10 * 1024 // 小于10kb的图片会被base64处理
                              }
                          },
                          generator: {
                              // 将图片文件输出到 static/imgs 目录中
                              // 将图片文件命名 [hash:8][ext][query]
                              // [hash:8]: hash值取8位
                              // [ext]: 使用之前的文件扩展名
                              // [query]: 添加之前的query参数
                              filename: "static/imgs/[hash:10][ext][query]",
                          },
                      },
                      {
                          test: /\.(ttf|woff2?|map3|map4|avi)$/,
                          type: "asset/resource",
                          generator: {
                            filename: "static/media/[hash:10][ext][query]",
                          },
                      },
                      {
                        test: /\.js$/,
                        // exclude: /node_modules/, // 排除node_modules代码不编译
                        include: path.resolve(__dirname, "../src"), // 也可以用包含
                        use: [
                            {
                              loader: "thread-loader", // 开启多进程
                              options: {
                                workers: threads, // 数量
                              },
                            },
                            {
                              loader: "babel-loader",
                              options: {
                                cacheDirectory: true, // 开启babel编译缓存
                                cacheCompression: false, // 缓存文件不要压缩
                              },
                            },
                          ],
                      },
                ]
            }
        ],
    },
    // 插件
    plugins: [
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值
            cache: true, // 开启缓存
            // 缓存目录
            cacheLocation: path.resolve(
                __dirname,
                "../node_modules/.cache/.eslintcache"
            ),
            threads, // 开启多进程
        }),
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/main.css",
        }),
        // css压缩
        // new CssMinimizerPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [
          // css压缩也可以写到optimization.minimizer里面，效果一样的
          new CssMinimizerPlugin(),
          // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
          new TerserPlugin({
            parallel: threads // 开启多进程
          })
        ],
      },
    // // 开发服务器
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: "3000", // 启动服务器端口号
    //     open: true, // 是否自动打开浏览器
    // },
    // 模式
    mode: "development", // 开发模式
    devtool: "source-map",
};