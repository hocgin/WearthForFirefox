/**
 * Created by hocgin on 2017/2/1.
 */
(function ($) {
    var languages = {
        "Catalan": "ca",
        "Croatian": "hr",
        "Turkish": "tr",
        "Chinese Simplified": "zh",
        "Chinese Traditional": "zh_tw",
        "Swedish": "sv",
        "Bulgarian": "bg",
        "French": "fr",
        "Dutch": "nl",
        "Finnish": "fi",
        "Polish": "pl",
        "Romanian": "ro",
        "English": "en",
        "Italian": "it",
        "Spanish": "es",
        "Ukrainian": "uk",
        "Portuguese": "pt",
        "Russian": "ru"
    };

    var $appid = $('#appid input[name="appid"]');
    var $aqicnToken = $('#appid input[name="aqicnToken"]');
    var $longitude = $('#location input[name="longitude"]');
    var $latitude = $('#location input[name="latitude"]');
    var $refresh = $('#refresh input[name="refresh-time"]');

    var $badgeGroup = $('#badge input[name="badge"]');
    var $tempUnitGroup = $('#tempUnit input[name="tempUnit"]');
    var $styleGroup = $('#style input[name="style"]');
    var $dashboardLeftGroup = $('#dashboard input[name="dashboardLeft"]');
    var $dashboardRightGroup = $('#dashboard input[name="dashboardRight"]');

    var $languageSelect = $('#language .language');
    var $updateTime = $('#refresh .last-time');

    $.each(languages, function (key, value) {
        var option = '<option value="' + value + '">' + key + '</option>';
        $languageSelect.append(option);
    });
    /**
     * APP ID && Location
     */
    browser.storage.local.get([
        "latitude",
        "longitude",
        "appid",
        "badge",
        "optionStyle",
        "dashboardLeft",
        "dashboardRight",
        "lang",
        "tempUnit",
        "aqicnToken",
        "refreshTime"
    ], function (result) {
        if (!result.appid) {
            alert("Error: Not found app id");
            return;
        }
        $appid.val(result.appid);
        $aqicnToken.val(result.aqicnToken);
        $refresh.val(result.refreshTime);
        $longitude.val(result.longitude || -1);
        $latitude.val(result.latitude || -1);
        $.each($badgeGroup, function (index, el) {
            var $el = $(el);
            if ($el.val() === result.badge) {
                $el.attr("checked", true);
            }
        });
        $.each($tempUnitGroup, function (index, el) {
            var $el = $(el);
            if ($el.val() === result.tempUnit) {
                $el.attr("checked", true);
            }
        });
        $.each($styleGroup, function (index, el) {
            var $el = $(el);
            if ($el.val() === result.optionStyle) {
                $el.attr("checked", true);
            }
        });
        $.each($dashboardLeftGroup, function (index, el) {
            var $el = $(el);
            if ($el.val() === result.dashboardLeft) {
                $el.attr("checked", true);
            }
        });
        $.each($dashboardRightGroup, function (index, el) {
            var $el = $(el);
            if ($el.val() === result.dashboardRight) {
                $el.attr("checked", true);
            }
        });
        $updateTime.text(new Date(localStorage.getItem('UpdateAt')).toLocaleString());
        $languageSelect.find('option[value="' + result.lang + '"]').attr('selected', true);
    });
    // Event
    /**
     * Close Button
     */
    $('.option-footer input[name="Close"]').on('click', function () {
        window.close();
    });
    $('.option-footer input[name="Reset"]').on('click', function () {
        window.location.reload()
    });
    $('.option-footer input[name="Save"]').on('click', function () {
        /**
         * 存储
         */
        browser.runtime.sendMessage({
            cmd: 'from-option-to-background.save',
            option: {
                latitude: $latitude.val(),
                longitude: $longitude.val(),
                appid: $appid.val(),
                badge: $('#badge').find('input[name="badge"]:checked').val(),
                tempUnit: $('#tempUnit').find('input[name="tempUnit"]:checked').val(),
                optionStyle: $('#style').find('input[name="style"]:checked').val(),
                dashboardLeft: $('#dashboard').find('input[name="dashboardLeft"]:checked').val(),
                dashboardRight: $('#dashboard').find('input[name="dashboardRight"]:checked').val(),
                lang: $languageSelect.val(),
                aqicnToken: $aqicnToken.val(),
                refreshTime: $refresh.val()
            }
        }, function (response) {
            console.log('[普通日志] 保存信息回馈', response);
        });
    });
    $('#location').find('input[name="Get"]').on('click', function () {
        if (!!navigator.geolocation) { // 支持定位
            navigator.geolocation.getCurrentPosition(function (position) {
                $longitude.val(position.coords.longitude || -1);
                $latitude.val(position.coords.latitude || -1);
            });
        } else {
            alert("当前浏览器不支持自动定位, 请手动输入");
        }
    });
    $('#refresh').find('input[name="Refresh"]').on('click', function () {
        console.log('[普通日志] 进行手动刷新');
        browser.runtime.sendMessage({cmd: 'from-option-to-background.refresh'}, function (response) {
            console.log('[普通日志] 手动刷新信息回馈', response);
        });
    });

    // 通信监听
    browser.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            switch (request.cmd) {
                case 'from-background-to-option.setLastUpdateTime':
                    $updateTime.text(new Date(request.lastUpdateTime).toLocaleString());
                    break;
            }
            console.log('[普通日志] 接收到请求信息 ', request, sender, sendResponse);
        }
    );
})(jQuery);