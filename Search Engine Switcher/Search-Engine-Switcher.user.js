// ==UserScript==
// @name         搜索引擎切换器魔改版
// @namespace    https://greasyfork.org/zh-CN/scripts/490643
// @version      1.0
// @description  用于快速切换搜索引擎。有漂亮的高斯模糊外观和深色模式适配。当您滚动网页时，侧栏会自动收起，而当鼠标靠近时，侧栏则会弹出。您可以修改脚本以添加或重新排序搜索引擎。
// @author       Corlius
// @homepageURL  https://github.com/Corlius/Corlius-Scripts
// @match        *://www.baidu.com/s*
// @match        *://www.baidu.com/baidu*
// @match        *://duckduckgo.com/*
// @match        *://search.brave.com/search*
// @match        *://www.google.com/search*
// @match        *://www.google.com.hk/search*
// @match        *://weixin.sogou.com/weixin*
// @match        *://www.bing.com/search*
// @match        *://cn.bing.com/search*
// @match        *://www.zhihu.com/search*
// @match        *://search.cnki.com.cn/Search/Result*
// @match        *://www.sogou.com/web*
// @match        *://fsoufsou.com/search*
// @match        *://www.douban.com/search*
// @match        *://search.bilibili.com/*
// @match        *://www.youtube.com/results?search_query=*
// @license      MIT
// @grant        unsafeWindow
// @grant        window.onload
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-body
// ==/UserScript==

// 搜索网址配置
const urlMapping = [
  {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.google.com\/search.*/,
  },
  {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.bing.com\/search.*/,
  },
  {
    name: "Brave",
    searchUrl: "https://search.brave.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/search.brave.com\/search.*/,
  },
  {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    keyName: "q",
    testUrl: /https:\/\/duckduckgo.com\/*/,
  },
  {
    name: "Bilibili",
    searchUrl: "https://search.bilibili.com/all?keyword=",
    keyName: "keyword",
    testUrl: /https:\/\/search.bilibili.com\/all.*/,
  },
  {
    name: "YouTube",
    searchUrl: "https://www.youtube.com/results?search_query=",
    keyName: "search_query",
    testUrl: /https:\/\/www.youtube.com\/results.*/,
  },
  {
    name: "Baidu",
    searchUrl: "https://www.baidu.com/s?wd=",
    keyName: "wd",
    testUrl: /https:\/\/www.baidu.com\/s.*/,
  },
  {
    name: "WeChat",
    searchUrl: "https://weixin.sogou.com/weixin?type=2&s_from=input&query=",
    keyName: "query",
    testUrl: /https:\/\/weixin.sogou.com\/weixin.*/,
  },
  {
    name: "Douban",
    searchUrl: "https://www.douban.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.douban.com\/search.*/,
  },
  {
    name: "Zhihu",
    searchUrl: "https://www.zhihu.com/search?q=",
    keyName: "q",
    testUrl: /https:\/\/www.zhihu.com\/search.*/,
  },
  {
    name: "CNKI",
    searchUrl: "https://search.cnki.com.cn/Search/Result?content=",
    keyName: "content",
    testUrl: /https:\/\/search.cnki.com.cn\/Search\/Result.*/,
  },
];

// 根据参数名获取URL中的参数值
function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let varPair of vars) {
    let [key, value] = varPair.split("=");
    if (key === variable) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// 从当前URL中提取搜索关键词
function getKeywords() {
  for (let mapping of urlMapping) {
    if (mapping.testUrl.test(window.location.href)) {
      return getQueryVariable(mapping.keyName) || "";
    }
  }
  return "";
}

// 特定的配置修改
function adjustForSpecificBrowsers() {
  // 适配火狐浏览器的百度搜索
  if (navigator.userAgent.includes("Firefox")) {
    const baiduMapping = urlMapping.find(item => item.name === "Baidu");
    if (baiduMapping) {
      baiduMapping.searchUrl = "https://www.baidu.com/baidu?wd=";
      baiduMapping.testUrl = /https:\/\/www.baidu.com\/baidu.*/;
    }
  }

  // 适配必应搜索
  if (window.location.hostname === 'cn.bing.com') {
    const bingMapping = {
      name: "Bing",
      searchUrl: "https://cn.bing.com/search?q=",
      keyName: "q",
      testUrl: /https:\/\/cn.bing.com\/search.*/,
    };
    const bingIndex = urlMapping.findIndex(item => item.name === "Bing");
    if (bingIndex !== -1) {
      urlMapping[bingIndex] = bingMapping;
    }
  }
}

// 根据搜索关键词和配置给搜索链接设置样式和动作
function setupSearchLinks(keywords) {

  // 判断是否为暗色模式
  let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 如果当前页面是YouTube，则设置为深色模式
  //if (window.location.hostname === 'www.youtube.com') {
  //  isDarkMode = true; // 强制深色模式
  //}

  // 在文档中添加主容器
  const mainDiv = document.createElement("div");
  mainDiv.id = "search-app-box";
  Object.assign(mainDiv.style, {
    position: "fixed",
    top: "150px",
    left: "0px", // 初始位置在左侧
    width: "115px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 15%, .8)' : 'hsla(0, 0%, 98%, .8)',
    backdropFilter: "blur(10px)",
    borderRadius: "0 15px 15px 0",
    zIndex: "9999",
    transition: "left 0.5s ease-in-out", // 左侧滑动动画
    cursor: "pointer",
    boxShadow: "0 8px 10px rgba(0,0,0,0.06)",
    overflow: "hidden",
  });

  document.body.appendChild(mainDiv);

  // 在搜索引擎链接前添加居中显示的标题"Engines"
  const enginesTitle = document.createElement('div');
  enginesTitle.textContent = "Engines";
  Object.assign(enginesTitle.style, {
    fontSize: "15px",
    fontWeight: "bold",
    padding: '6px 0 6px 15px',
    color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 20%, 1)',
    backgroundColor: isDarkMode ? 'hsla(0, 0%, 10%, .8)' : 'hsla(0, 0%, 80%, .8)',
  });
  mainDiv.appendChild(enginesTitle);

  // 为每个搜索引擎创建链接
  urlMapping.forEach(({ name, searchUrl }) => {
    const link = document.createElement('a');
    link.textContent = name;
    link.href = `${searchUrl}${encodeURIComponent(keywords)}`;
    mainDiv.appendChild(link);

    // 设置链接样式
    Object.assign(link.style, {
      display: 'block',
      padding: '5px 0 5px 15px',
      textDecoration: 'none',
      color: isDarkMode ? 'hsla(0, 0%, 80%, 1)' : 'hsla(0, 0%, 40%, 1)',
    });

    // 添加鼠标放置在链接上时的背景色变化
    link.addEventListener('mouseenter', () => {
      link.style.backgroundColor = isDarkMode ? 'hsla(0, 0%, 30%, .8)' : 'hsla(0, 0%, 92%, .8)';
    });

    // 当鼠标离开链接时恢复背景色
    link.addEventListener('mouseleave', () => {
      link.style.backgroundColor = '';
    });
  });

  // 滚动时隐藏主容器
  window.addEventListener('scroll', () => {
    mainDiv.style.left = "-95px";
  });

  // 鼠标接近主容器时显示容器
  window.addEventListener("mousemove", function (event) {
    const rect = mainDiv.getBoundingClientRect();
    const dx = Math.abs(event.clientX - rect.right);
    const dy = Math.abs(event.clientY - ( (rect.top + rect.bottom) / 2));
    if (dx < 130 && dy < 200) {
      mainDiv.style.left = "0";
    }
  });

}

// 页面加载完成后进行初始化
window.addEventListener("DOMContentLoaded", function() {
  adjustForSpecificBrowsers(); // 调整特定浏览器的配置
  setupSearchLinks(getKeywords()); // 设置搜索链接
});