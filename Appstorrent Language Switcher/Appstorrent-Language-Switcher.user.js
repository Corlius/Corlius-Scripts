// ==UserScript==
// @name            Appstorrent 翻译切换器
// @name:en         Appstorrent Language Switcher
// @namespace       https://greasyfork.org/zh-CN/scripts/490641
// @version         1.0
// @description     为appstorrent.ru自动切换翻译语言
// @description:en  Automatically switch translation language for appstorrent.ru
// @author          Corlius
// @homepageURL     https://github.com/Corlius/Corlius-Scripts
// @icon            https://www.google.com/s2/favicons?sz=64&domain=appstorrent.ru
// @license         MIT
// @match           https://appstorrent.ru/*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_registerMenuCommand
// @run-at          document-end
// ==/UserScript==

(function() {
    'use strict';

    // 根据语言代号改变网页语言的函数
    function changeLanguage(languageCode) {
        let languageSelector = document.querySelector(`a[data-google-lang="${languageCode}"]`);
        if (languageSelector) {
            languageSelector.click();
        }
    }

    // 语言映射
    const languageMapping = {
        'r': 'ru',
        'e': 'en',
        'd': 'de',
        'z': 'zh-TW'
    }

    // 获取用户设置的语言首字母
    function getLanguage(firstLetter) {
        return languageMapping[firstLetter] || 'en'; // 默认为英语
    }

    // 获取用户设置的语言
    var detailsPageLangInitial = GM_getValue('detailsPageLangInitial', 'e');
    var otherPageLangInitial = GM_getValue('otherPageLangInitial', 'e');

    // 转换用户设置的语言首字母为完整的语言代码
    var detailsPageLang = getLanguage(detailsPageLangInitial);
    var otherPageLang = getLanguage(otherPageLangInitial);

    // 检查当前页面是否是详情页
    var isDetailsPage = window.location.pathname.endsWith(".html");

    // 监听页面语言变化并更新
    var observer = new MutationObserver(function(mutations) {
        var currentLang = document.documentElement.getAttribute('lang');
        var targetLang = isDetailsPage ? detailsPageLang : otherPageLang;

        if (currentLang !== targetLang) {
            changeLanguage(targetLang);
        } else {
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, { attributes: true });

    // 添加语言选择命令到菜单
    GM_registerMenuCommand('设置详情页语言 / Set details page language', function() {
        var langInitial = prompt('r=ru俄语，e=en英语，d=de德语，z=zh-TW中文:', detailsPageLangInitial);
        if (langInitial) {
            GM_setValue('detailsPageLangInitial', langInitial);
            window.location.reload();
        }
    });

    GM_registerMenuCommand('设置其他页面语言 / Setting other page languages', function() {
        var langInitial = prompt('r=ru俄语，e=en英语，d=de德语，z=zh-TW中文:', otherPageLangInitial);
        if (langInitial) {
            GM_setValue('otherPageLangInitial', langInitial);
            window.location.reload();
        }
    });
})();