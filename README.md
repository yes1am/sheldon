<p align="center">
  <a href="https://github.com/yes1am/sheldon">
    <img width="200" src='https://raw.githubusercontent.com/yes1am/PicBed/master/img/magic-hat.png'>
  </a>
</p>

一款私人订制的 App，基于 React Native，致力于满足我在移动端的各类需求。  

## 功能列表

### 1. 收藏功能

**痛点:**  

1. 各种 app (微博，豆瓣，浏览器书签，微信，B 站，知乎）收藏相互独立，不便于收集整理。

2. 收藏结果与 app 账号关联，需登录才能看到收藏内容。

**实现方式:**  
基于 app 的分享功能，复制分享链接，保存到指定接口.  

## 开发

`yarn install`  

`yarn run android`

## 打包 APK

[参考文档](https://reactnative.cn/docs/signed-apk-android/#%E7%94%9F%E6%88%90%E4%B8%80%E4%B8%AA%E7%AD%BE%E5%90%8D%E5%AF%86%E9%92%A5)  

`cd android`  
`./gradlew assembleRelease`  

生成的 apk 文件: `android/app/build/outputs/apk/release/app-release.apk`
