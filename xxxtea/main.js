(function () {
    var sysChannelInfo = null;
    var domainUrl = null;

    if (cc.sys.isNative) {

        if (cc.sys.isNative) {
            if(cc.sys.os === cc.sys.OS_ANDROID){
                sysChannelInfo = jsb.reflection.callStaticMethod("com/wlcasino/app/activity/AppActivity", "getSysChannelInfo", "()Ljava/lang/String;");
                console.log("main: getSysChannelInfo" + sysChannelInfo);
            } else if (cc.sys.os === cc.sys.OS_IOS){
                sysChannelInfo = jsb.reflection.callStaticMethod("FGCocosObjCBridgeManager", "getSysChannelInfo")
            }
        }
        try{
            sysChannelInfo = JSON.parse(sysChannelInfo)
        }catch(err){
            console.log("main: parse failure");
            normalBoot();
            return;
        }

        if(sysChannelInfo.env === "uat"){
            domainUrl = "https://api-user.zczx2255.com/";
        } else{
            if (cc.sys.isNative) {
                if(cc.sys.os === cc.sys.OS_ANDROID){
                    domainUrl = jsb.reflection.callStaticMethod("com/wlcasino/app/activity/AppActivity", "getDomainUrl", "()Ljava/lang/String;");
                    console.log("main: getDomainUrl " + domainUrl);
                } else if (cc.sys.os === cc.sys.OS_IOS){
                    domainUrl = jsb.reflection.callStaticMethod("FGCocosObjCBridgeManager", "getCurrentNetWorkInfo")
                }
            }
        }

        if(!sysChannelInfo || !domainUrl){
            normalBoot();
            return;
        }

        getBlackListIp(domainUrl);

        cc.director.startAnimation();
    }


    function showPlatformLoadingImage(){
        if (cc.sys.isNative) {
            if(cc.sys.os === cc.sys.OS_ANDROID){
                jsb.reflection.callStaticMethod("com/wlcasino/app/activity/AppActivity", "showImage", "()V");
                console.log("main: showImage");
            } else if (cc.sys.os === cc.sys.OS_IOS){
                jsb.reflection.callStaticMethod("FGCocosObjCBridgeManager", "showImage");
            }
        }
    }

    function sendApiRequest(ip){
        console.log("sendApiRequest: ip = " + ip);
        console.log("main::sendApiRequest: before request " + Date.now());
        var successCallback = function(xhr){
            var responseText = JSON.parse(xhr.responseText);
            console.log("main::sendApiRequest: after request success " + Date.now());
            if (responseText === undefined || responseText.state !== 0) {
                console.log("main:readyState 111111");
                normalBoot();
                return;
            }
            var data = responseText.data;
            if (data.id === undefined) {
                console.log("main:readyState 222222");
                normalBoot();
                return;
            }
            if (data.status == 0) {
                console.log("main:readyState 333333");
                normalBoot();
            } else {
                console.log("main:readyState 444444");
                changeHotUpdatePath();
                normalBoot();
            }
        };

        var failAndTimeoutCallback = function(xhr){
            console.log("main:failAndTimeoutCallback");
            console.log("main::sendApiRequest: after request failure " + Date.now());
            normalBoot();
        };

        var requestUrl = "";
        if(ip){
            //getSupportLanguageList iOS check
            requestUrl = domainUrl + "api/fg/getSupportLanguageList?id=" + sysChannelInfo.vestid + '&ip=' + ip + "&channel_id=" + sysChannelInfo.channelid;
        } else {
            requestUrl = domainUrl + "api/fg/getSupportLanguageList?id=" + sysChannelInfo.vestid + "&channel_id=" + sysChannelInfo.channelid;
        }
        console.log("sendApiRequest: " + requestUrl);

        myXmlRequest("GET", requestUrl, undefined, undefined, successCallback, failAndTimeoutCallback, failAndTimeoutCallback, 15000);
    }

    function getBlackListIp(domainUrl){
        console.log("getBlackListIp: domainUrl = " + domainUrl);

        var ip;
        var index = 0;
        var reqUrl = ['http://ip-api.com/json', 'https://api.ipify.org/?format=json', /*'http://ip.taobao.com/service/getIpInfo.php?ip=myip'*/];
        console.log("main::getBlackListIp: before request " + Date.now());
        function successCallBack(xhr) {
            var data = null;
            // var pattern = /(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})(\.(2(5[0-5]{1}|[0-4]\d{1})|[0-1]?\d{1,2})){3}/g;
            try {
                data = JSON.parse(xhr.responseText);
                switch (reqUrl[index]) {
                    case 'http://ip.taobao.com/service/getIpInfo.php?ip=myip':
                        ip = data.data.ip;
                        break;
                    case 'http://ip-api.com/json':
                        ip = data.query;
                        break;
                    case 'https://api.ipify.org/?format=json':
                        ip = data.ip;
                        break
                    default:
                        break;
                }
            }
            catch (err) {
                // ip = xhr.responseText.match(pattern)[0];
            };
            console.log("getBlackListIp: ip = " + ip);
            console.log("main::getBlackListIp: after request success " + Date.now());
            sendApiRequest(ip);
        }
        function failAndOutTimeBack(xhr) {
            index++;
            if (index >= reqUrl.length) {
                sendApiRequest(ip);
                return;
            }
            console.log("getBlackListIp: request again " + reqUrl[index]);
            console.log("main::getBlackListIp: after request failure " + Date.now());
            myXmlRequest('GET', reqUrl[index], undefined, undefined, successCallBack, failAndOutTimeBack, failAndOutTimeBack, 2000);
        }
        myXmlRequest('GET', reqUrl[index], undefined, undefined, successCallBack, failAndOutTimeBack, failAndOutTimeBack, 2000);
    }

    function myXmlRequest(method, url, data, headerList, successCallback, failCallback, timeoutCallback, outTime){
        if(!method){
            method = 'GET';
            console.log("myXmlRequest: method is invalid use default GET");
        }
        if(!url){
            console.log("myXmlRequest: the url is null");
            return;
        }
        var _xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('MSXML2.XMLHTTP');
        if (!_xhr) {
            console.log("myXmlRequest:XMLHttpRequest is null");
            return;
        }
        var timeout = false;
        if (outTime === undefined || outTime === null) outTime = 15000;

        _xhr.timeout = outTime;

        _xhr.onerror = function(){
            console.log("myXmlRequest: onerror");
            if (failCallback) failCallback(_xhr);
        };

        _xhr.ontimeout = function (e) {
          // XMLHttpRequest timed out. Do something here.
          console.log("myXmlRequest:setTimeout");
          timeout = true;
          _xhr.abort();
          if (timeoutCallback) timeoutCallback(method, url);
        };

        _xhr.onreadystatechange = function () {
            console.log("onreadystatechange: " + _xhr.readyState);
            if (_xhr.readyState === 1) {
                // open() has been called.
                console.log("main:readyState is 1");
            }
            else if (_xhr.readyState === 4) {
                // The operation is complete.
                if (timeout) {
                    console.log("main:readyState timeOut");
                    return;
                }
                // clearTimeout(timer);
                if (_xhr.status === 200) {
                    if (successCallback) successCallback(_xhr);
                }
                else {
                    if (failCallback) failCallback(_xhr);
                }
            }
        };

        _xhr.open(method, url);
        if (headerList) {
            for (var i in headerList) {
                _xhr.setRequestHeader(headerList[i].name, headerList[i].value);
            }
        }
        _xhr.send(data);
    }

    function changeHotUpdatePath(){
        var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
            setUpdateXxTea("2f1d9d48-7551-42");
        }
        console.log("main: hotUpdateSearchPaths is " + hotUpdateSearchPaths);
    }

    function boot() {

        var settings = window._CCSettings;
        window._CCSettings = undefined;

        console.log("main::boot the boot function");

        if (!settings.debug) {
            var uuids = settings.uuids;

            var rawAssets = settings.rawAssets;
            var assetTypes = settings.assetTypes;
            var realRawAssets = settings.rawAssets = {};
            for (var mount in rawAssets) {
                var entries = rawAssets[mount];
                var realEntries = realRawAssets[mount] = {};
                for (var id in entries) {
                    var entry = entries[id];
                    var type = entry[1];
                    // retrieve minified raw asset
                    if (typeof type === 'number') {
                        entry[1] = assetTypes[type];
                    }
                    // retrieve uuid
                    realEntries[uuids[id] || id] = entry;
                }
            }

            var scenes = settings.scenes;
            for (var i = 0; i < scenes.length; ++i) {
                var scene = scenes[i];
                if (typeof scene.uuid === 'number') {
                    scene.uuid = uuids[scene.uuid];
                }
            }

            var packedAssets = settings.packedAssets;
            for (var packId in packedAssets) {
                var packedIds = packedAssets[packId];
                for (var j = 0; j < packedIds.length; ++j) {
                    if (typeof packedIds[j] === 'number') {
                        packedIds[j] = uuids[packedIds[j]];
                    }
                }
            }
        }

        // init engine
        var canvas;

        if (cc.sys.isBrowser) {
            canvas = document.getElementById('GameCanvas');
        }

        if (false) {
            var ORIENTATIONS = {
                'portrait': 1,
                'landscape left': 2,
                'landscape right': 3
            };
            BK.Director.screenMode = ORIENTATIONS[settings.orientation];
            initAdapter();
        }

        function setLoadingDisplay() {
            // Loading splash scene
            var splash = document.getElementById('splash');
            var progressBar = splash.querySelector('.progress-bar span');
            cc.loader.onProgress = function (completedCount, totalCount, item) {
                var percent = 100 * completedCount / totalCount;
                if (progressBar) {
                    progressBar.style.width = percent.toFixed(2) + '%';
                }
            };
            splash.style.display = 'block';
            progressBar.style.width = '0%';

            cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
                splash.style.display = 'none';
            });
        }

        function setLoadingDisplayNative() {
            // Loading native splash scene 
            var tempPer = 0;
            cc.loader.onProgress = function (completedCount, totalCount, item) {
                var percent = 100 * completedCount / totalCount;
                // console.log("percent::" + percent);
                if (parseInt(percent) > parseInt(tempPer)) {
                    tempPer = parseInt(percent);
                    updateLoadingPercent(percent);
                }
            };
        }

        //update native loading persent
        function updateLoadingPercent(per) {
            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("com/wlcasino/app/activity/AppActivity", "updateLoadingPercent", "(I)V", parseInt(per));
            }
            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("FGCocosObjCBridgeManager", "updateLoadingPercent:", per);
            }
        }

        var onStart = function () {
            console.log("main::onStart the onStart function");

            if (false) {
                BK.Script.loadlib();
            }

            cc.view.resizeWithBrowserSize(true);

            if (!false && !false) {
                // UC browser on many android devices have performance issue with retina display
                if (cc.sys.os !== cc.sys.OS_ANDROID || cc.sys.browserType !== cc.sys.BROWSER_TYPE_UC) {
                    cc.view.enableRetina(true);
                }
                if (cc.sys.isBrowser) {
                    setLoadingDisplay();
                }
                if (cc.sys.isNative) {
                    setLoadingDisplayNative();
                }

                if (cc.sys.isMobile) {
                    if (settings.orientation === 'landscape') {
                        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                    }
                    else if (settings.orientation === 'portrait') {
                        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
                    }
                    cc.view.enableAutoFullScreen([
                        cc.sys.BROWSER_TYPE_BAIDU,
                        cc.sys.BROWSER_TYPE_WECHAT,
                        cc.sys.BROWSER_TYPE_MOBILE_QQ,
                        cc.sys.BROWSER_TYPE_MIUI,
                    ].indexOf(cc.sys.browserType) < 0);
                }

                // Limit downloading max concurrent task to 2,
                // more tasks simultaneously may cause performance draw back on some android system / brwosers.
                // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
                if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
                    cc.macro.DOWNLOAD_MAX_CONCURRENT = 2;
                }
            }

            // init assets
            cc.AssetLibrary.init({
                libraryPath: 'res/import',
                rawAssetsBase: 'res/raw-',
                rawAssets: settings.rawAssets,
                packedAssets: settings.packedAssets,
                md5AssetsMap: settings.md5AssetsMap
            });

            if (false) {
                cc.Pipeline.Downloader.PackDownloader._doPreload("WECHAT_SUBDOMAIN", settings.WECHAT_SUBDOMAIN_DATA);
            }

            var launchScene = settings.launchScene;

            // load scene
            cc.director.loadScene(launchScene, null,
                function () {
                    if (cc.sys.isBrowser) {
                        // show canvas
                        canvas.style.visibility = '';
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                    }
                    cc.loader.onProgress = null;
                    console.log('Success to load scene: ' + launchScene);
                }
            );
        };

        // jsList
        var jsList = settings.jsList;

        if (!false) {
            var bundledScript = settings.debug ? 'src/project.dev.js' : 'src/project.js';
            if (jsList) {
                jsList = jsList.map(function (x) {
                    return 'src/' + x;
                });
                jsList.push(bundledScript);
            }
            else {
                jsList = [bundledScript];
            }
        }

        // anysdk scripts
        if (cc.sys.isNative && cc.sys.isMobile) {
            //            jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);
        }

        var option = {
            //width: width,
            //height: height,
            id: 'GameCanvas',
            scenes: settings.scenes,
            debugMode: settings.debug ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
            showFPS: (!false && !false) && settings.debug,
            frameRate: 60,
            jsList: jsList,
            groupList: settings.groupList,
            collisionMatrix: settings.collisionMatrix,
            renderMode: 0
        }

        cc.game.run(option, onStart);
    }

    if (false) {
        BK.Script.loadlib('GameRes://libs/qqplay-adapter.js');
        BK.Script.loadlib('GameRes://src/settings.js');
        BK.Script.loadlib();
        BK.Script.loadlib('GameRes://libs/qqplay-downloader.js');
        qqPlayDownloader.REMOTE_SERVER_ROOT = "";
        var prevPipe = cc.loader.md5Pipe || cc.loader.assetLoader;
        cc.loader.insertPipeAfter(prevPipe, qqPlayDownloader);
        // <plugin script code>
        boot();
        return;
    }

    if (false) {
        require(window._CCSettings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js');
        require('./libs/weapp-adapter/engine/index.js');
        var prevPipe = cc.loader.md5Pipe || cc.loader.assetLoader;
        cc.loader.insertPipeAfter(prevPipe, wxDownloader);
        boot();
        return;
    }

    if (window.document) {
        var splash = document.getElementById('splash');
        splash.style.display = 'block';

        var cocos2d = document.createElement('script');
        cocos2d.async = true;
        cocos2d.src = window._CCSettings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js';

        var engineLoaded = function () {
            document.body.removeChild(cocos2d);
            cocos2d.removeEventListener('load', engineLoaded, false);
            window.eruda && eruda.init() && eruda.get('console').config.set('displayUnenumerable', false);
            boot();
        };
        cocos2d.addEventListener('load', engineLoaded, false);
        document.body.appendChild(cocos2d);
    }

    function normalBoot(){
        console.log("main: normalBoot");
        if (window.jsb) {
            require('src/settings.js');
            require('src/jsb_polyfill.js');
            boot();
            return;
        }
    }

})();
