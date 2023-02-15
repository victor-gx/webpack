import count from "./js/count";
import sum from "./js/sum";
// 引入资源，Webpack才会对其打包
import "./css/index.css";
import "./css/iconfont.css";
import "./less/index.less";
import "./sass/index.sass";
import "./sass/index.scss";
import "./styl/index.styl";

const result1 = count(2, 1);
console.log(result1);
const result2 = sum(1, 2, 3, 4);
console.log(result2);

// 判断是否支持HMR功能
if (module.hot) {
    // module.hot.accept("./js/count.js", function (count) {
    //   const result1 = count(2, 1);
    //   console.log(result1);
    // });
    module.hot.accept("./js/count.js")
  
    module.hot.accept("./js/sum.js", function (sum) {
      const result2 = sum(1, 2, 3, 4);
      console.log(result2);
    });
  }