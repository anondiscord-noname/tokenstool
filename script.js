(function() {

    'use strict';
    //--------------------------------------------------
    function getRandomInt(max) { // ランダムな数字を生成する
        return Math.floor(Math.random() * max);
    }

    function copy(str, useExecCommand) { // 文字列をクリップボードにコピーする
        if (!useExecCommand && typeof navigator === "object" && typeof navigator.clipboard === "object" &&
            typeof location === "object" && location.protocol === "https:") navigator.clipboard.writeText(str).catch(function() {
            copy(str, true);
        });
        else {
            var e = $("<textarea>").val(str).appendTo(h).select();
            document.execCommand("copy");
            e.remove();
        };
    };

    function makeSpan(html, back, color, radius) { // 装飾用のspanタグを作成する
        return '<span style="' + [
            "word-wrap: break-word; ",
            back === undefined ? "" : "background-color: " + back + "; ",
            color === undefined ? "" : "color: " + color + "; ",
            "border-radius: " + (radius === undefined ? "5" : radius) + "px;"
        ].join("") + '">' + (typeof html === "object" ? html.join("<br>") : html) + "</span>";
    };

    function splitLine(str) { // 行ごとに分割して空行を排除して返す
        return str.split("\n").filter(function(v) {
            return v.length > 0;
        });
    };

    function initInterval(num) { // リクエスト送信間隔を初期化する
        if (window.proxyrequestbool.find("input[type='checkbox']").prop("checked")){return 0;}
//        return (!isFinite(num) || isNaN(num) || num < 0.01) ? 0.5 : num;
        return num;
    };

    function makeDelay(delay, i, o, len) { // 遅延を計算する
        return (i + (o === undefined ? 0 : o) * (len === undefined ? 0 : len)) * initInterval(Number(delay)) * 1000;
    };

    function disabledElement(elm, bool) { // 子孫要素のdisabled属性を設定する
        return elm.find("*").each(function(i, e) {
            e.disabled = !!bool;
        });
    };

    function outputLog(elm, str, ip_flag, textonly) { // ログを出力する
        var standardText = ((!textonly ? "[" + new Date().toString().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0] + "]" : "") + str);
        if (!ip_flag) elm.val([standardText].concat(splitLine(elm.val())).join("\n")).trigger("updatetextarea");
        else $.get((window.proxyrequestbool.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"&url=" : "") + "https://ipinfo.io/?callback=a").always(function(body, statusText, data) {
            elm.val([(statusText === "success" ? "<" + JSON.parse(body.match(/\{.*?\}/)[0]).ip + ">" : "") + standardText].concat(splitLine(elm.val())).join("\n")).trigger("updatetextarea");
        });
        return elm;
    };

    function addBtn(h, title, func) { // ボタンを追加する
        return $("<button>").text(title).on("click", func).appendTo(h);
    };

    function addInputBool(h, title, func) { // ON/OFFボタンを追加する
        var flag = false,
            e = addBtn(h, title),
            check = $("<input>", {
                type: "checkbox"
            }).prependTo(e.on("click", function() {
                flag = !flag;
                check.prop("checked", flag);
                e.css("background-color", flag ? "orange" : "gray");
                if (typeof func === "function") func(flag);
            }).css("background-color", "gray"));
        return e;
    };

    function addInput(h, title, placeholder) { // 入力欄を追加する
        return $("<input>", {
            placeholder: placeholder
        }).appendTo($("<div>").text(title + ": ").appendTo(h));
    };

    function addTextarea(h, placeholder, readonly) { // テキストエリアを追加する
        var e = $("<textarea>", {
            placeholder: placeholder,
            readonly: !!readonly
        }).css({
            width: "80%",
            maxWidth: "80%",
            height: "3em"
        }).appendTo(h);
        (function(resize) {
            e.on("change click updatetextarea", resize).trigger("updatetextarea");
            if (!!readonly) e.css({
                backgroundColor: "#e9e9e9",
                tabIndex: "-1",
                cursor: "pointer"
            }).on("click", function() {
                copy(e.val());
                e.select();
            });
        })(function() { // resize
            var placeholderLine = e.attr("placeholder").split("\n").length,
                line = e.val().split("\n").length;
            e.height((placeholderLine > line && e.val().length === 0 ? placeholderLine : line + 2) + "em");
        });
        return e;
    };

    function addTab(h, area) { // ボタンで切り替えられるタブを追加する
        var e = $("<div>").appendTo(h),
            tabs = $("<div>").appendTo(e),
            container = $("<div>").appendTo(e);
        Object.keys(area).forEach(function(k) {
            (function(k) {
                var btn = addBtn(tabs, k, function(e) {
                    tabs.find("button").css("background-color", "gray");
                    $(e.target).css("background-color", "yellow");
                    container.children().hide();
                    area[k].show();
                    $(window).trigger("resize");
                });
            })(k);
            container.append(area[k]);
        });
        tabs.find("button").first().click();
        return e;
    };

    function addDesc(h, html) { // 説明を追加する
        return $("<div>").html(typeof html === "object" ? html.join("<br>") : html).css({
            backgroundColor: "lightgray",
            fontSize: "12px",
            padding: "5px",
            border: "solid 2.5px gray",
            borderRadius: "10px",
            display: "inline-block",
            maxWidth: "80%"
        }).appendTo(h);
    };

    const sleep = delay => new Promise(resolve => setTimeout(resolve, delay)) // sleepを追加する
    window.stopper = false; // キャンセルボタンの変数

/*    setInterval(function(){
        if (whilerun.find("input[type='checkbox']").prop("checked") && window.allow_repeat){
            window.lastclick.click();
        }
    },1000);*/
    //--------------------------------------------------
    var g_aliveCheckResultClearBtn, // Tokenの生存確認結果クリアボタンを格納する変数
        g_output, // ログの要素を格納する変数
        g_ip_flag = false, // ログ出力時にIPアドレスを表示するかの真偽値を格納する変数
        g_ajaxTimeoutIds = [], // 通信を行う遅延された関数のsetTimeoutのidを格納する配列
        h = $("<div>").appendTo("body").append($("<h1>").text($("title").text())),
        area = {};
    ["基本設定", "生存確認", "レイド", "認証", "発言", /*"スラッシュコマンド", */"ダイレクトメッセージ", "フレンドリクエスト", "アバター"].forEach(function(k) {
        area[k] = $("<div>").css({
            backgroundColor: "white",
            padding: "10px"
        });
    });
    addDesc(h, [
        makeSpan($("title").text() + " " + makeSpan("Ver.3.0.0(β)", "gray", "skyblue; font-size: 12px; padding: 2.5px"), "darkgray", "purple; font-size: 16px; padding: 2.5px"),
        "最終更新: 2021/09/09",
        "",
        "作成者　名桜はるさめ#9999 夕立改二#2068 のなめ#1234",
        'Tokenの取得の方法は、<a href="https://shunshun94.github.io/shared/sample/discordAccountToken" target="_blank">こちら</a>を参照してください。',
        'また、ご不明な点や改善してほしい点がございましたらDiscordサーバーの<a href="https://discord.gg/eGCbZJnZ5x" target="_blank">Freeze</a>か、同サーバー内にいる' + makeSpan("夕立改二#2068 名桜はるさめ#9999 のなめ#1234", "lightyellow", "orange") + 'のどれかにお気軽にご連絡ください。',
        "",
        document.getElementById("is_login").value=='true' ? "あなたはログインしているため、限定機能をご利用いただけます。" : "あなたは、<a href='/login.php?action=login&redirect=/tokenstool/'>ログイン</a>していないため、限定機能をご利用いただけません。",
        makeSpan("お知らせ", "white", "blue"),
        "プロキシを経由する というオプションを追加しました。 この機能は試験的な物です。",
        makeSpan("必読", "white", "red"),
        "以下の事項を守らないとTokenが電話認証要求などによって使用できなくなる可能性があります。",
        "・DMを送信しない" + makeSpan("(絶対)", "pink", "red"),
        "・プロキシ使用時以外のリクエストの送信間隔は0.5秒以上にする" + makeSpan("(強く推奨)", "lightblue", "blue"),
        "・Tokenのアカウントのパスワードを変えたり、二段階認証をしない" + makeSpan("(強く推奨)", "lightblue", "blue"),
        "・使用中にIPアドレス等、通信を変更しない" + makeSpan("(強く推奨)", "lightblue", "blue"),
        "・同じTokenを複数のIPアドレスから操作しない" + makeSpan("(強く推奨)", "lightblue", "blue"),
        "・操作ボタンを連打しない" + makeSpan("(強く推奨)", "lightblue", "blue"),
    ]);
    addBtn(h, "スタッフロール").on("click", function() {
        var w=(screen.width-640)/2;
        var h=(screen.height-480)/2;
        window.open("staffroll.html","sub","width=640,height=480,"+"left="+w+",top="+h+",scrollbars=no,menubar=no,toolbar=no");
    }).before("<br>");
    //--------------------------------------------------
    h.append("<hr>");
    var content = $("<div>").css({
        backgroundColor: "lightgray",
        borderRadius: "10px"
    }).appendTo(h);
    content.append(makeSpan("ツール", "darkgray", "black; font-size: 15px", 2.5));
    var sendCancelBtn = addBtn(content, "送信キャンセル", function() {
        sendCancelBtn.prop("disabled", true);
        while (g_ajaxTimeoutIds.length) {
            var id = g_ajaxTimeoutIds.pop();
            clearTimeout(id);
            stop();
            outputLog(g_output, "CANCEL: IDが" + id + "の送信予定の通信をキャンセルしました", g_ip_flag);
            window.stopper = true;
        };
        disabledElement(content, false);
        sendCancelBtn.prop("disabled", true);
        window.whilerun.prop("checked",false);
        window.allow_repeat = false;
    }).prop("disabled", true);
    function loginrequired(){
        
    }
    function hideloginrequired(){
        
    }
    var proxyrequest = addInputBool(content, document.getElementById("is_login").value=='true' ? "プロキシを経由する" : "プロキシを経由する(ログインが必要です)", function() {}).prop("disabled",document.getElementById("is_login").value=='false');
    window.proxyrequestbool = proxyrequest;
    var whilerun = addInputBool(content, "繰り返し実行する(一部機能のみ)");
    window.whilerun = whilerun;
    addTab(content, area).css({
        border: "solid 5px gray",
        borderRadius: "5px"
    }).find("div").first().css("background-color", "darkgray");
    //--------------------------------------------------
    var inputInterval = addInput(area["基本設定"], "リクエスト送信間隔", "[秒]").on("change", function() {
        inputInterval.val(initInterval(Number(inputInterval.val())));
    }).val("0.5");
    area["基本設定"].append("<br>" + makeSpan("Token", "darkgray", "black", 2.5));
    var inputToken = addTextarea(area["基本設定"], "Tokenを改行で区切って入力\n\n例: " + new Array(4).join("\n************************.******.***************************")).on("change", function() {
        inputToken.val((inputToken.val().match(/[\w\-.]{59}/g) || []).filter(function(x, i, arr) {
            return arr.indexOf(x) === i;
        }).join("\n")).trigger("updatetextarea");
    });
    addBtn(area["基本設定"], "コピー").remove().insertBefore(inputToken).on("click", function() {
        copy(inputToken.val());
        inputToken.select();
    });
    addBtn(area["基本設定"], "クリア").remove().insertBefore(inputToken).after("<br>").on("click", function() {
        inputToken.val("").trigger("updatetextarea");
    });
    //--------------------------------------------------
    var aliveCheckDesc = addDesc(area["生存確認"], [
            makeSpan("警告", "pink", "purple"),
            "この機能を使うとtokenの生死を確認できます。",
            "他人から貰ったtokenの生死を確認する時や実験後にお使いください。",
            "また、この機能で死んだと判定されていてもそれは一時的なもの、もしくは誤検出かもしれませんので、この機能は参考程度に使用してください。",
            "判定方法はステータスをオンラインにする通信(オフラインのものがオンラインになることはありません)を送信し、レスポンスの内容によって判定します。",
            "アカウントを認証してくださいというエラーと認証失敗(Tokenが存在しない)エラーが死亡判定となります。"
        ]),
        outputAliveToken = addTextarea(area["生存確認"], "", true).before("<br>" + makeSpan("生存判定", "darkgray", "black", 2.5) + makeSpan("テキストエリアをクリックでコピー", "lightgray", "black; font-size: 10px") + "<br>"),
        outputDeadToken = addTextarea(area["生存確認"], "", true).before("<br>" + makeSpan("死亡判定", "darkgray", "black", 2.5) + makeSpan("テキストエリアをクリックでコピー", "lightgray", "black; font-size: 10px") + "<br>"),
        aliveCheckBtn = addBtn(area["生存確認"], "判定").remove().insertAfter(aliveCheckDesc).before("<br><br>").after("<br>").on("click", function() {
            if (inputToken.val().length === 0) outputLog(g_output, "WARNING: Tokenが入力されていません", g_ip_flag);
            if (g_aliveCheckResultClearBtn !== undefined) {
                outputAliveToken.val("").trigger("updatetextarea");
                outputDeadToken.val("").trigger("updatetextarea");
                g_aliveCheckResultClearBtn.remove();
                g_aliveCheckResultClearBtn = undefined;
            };
            splitLine(inputToken.val()).forEach(function(v, i) {
                g_ajaxTimeoutIds.push(setTimeout(function() {
                    disabledElement(content, true);
                    sendCancelBtn.prop("disabled", false);
                    $.ajax({
                        type: "PATCH",
                        url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/users/@me/settings",
                        headers: {
                            authorization: v,
                            "content-type": "application/json"
                        },
                        data: JSON.stringify({
                            status: "online"
                        })
                    }).always(function(body, statusText, data) {
                        if (statusText === "error") {
                            outputLog(g_output, "ERROR: " + (body.responseJSON.message === "You need to verify your account in order to perform this action." ? "アカウントの確認エラー" :
                                body.responseJSON.message === "401: Unauthorized" ? "認証エラー" :
                                "不明な通信エラー") + "が発生しました", g_ip_flag);
                            outputLog(outputDeadToken, v, false, true); // 死亡
                        } else if (statusText === "success") outputLog(outputAliveToken, v, false, true); // 生存
                        outputLog(g_output, "ALIVECHECK#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                        g_ajaxTimeoutIds.shift(1);
                        if (g_ajaxTimeoutIds.length === 0) {
                            disabledElement(content, false);
                            sendCancelBtn.prop("disabled", true);
                            g_aliveCheckResultClearBtn = addBtn(area["生存確認"], "クリア").remove().insertAfter(aliveCheckBtn).on("click", function(e) {
                                outputAliveToken.val("").trigger("updatetextarea");
                                outputDeadToken.val("").trigger("updatetextarea");
                                $(e.target).remove();
                                g_aliveCheckResultClearBtn = undefined;
                            });
                        };
                    });
                }, makeDelay(inputInterval.val(), i)));
            });
        });
    //--------------------------------------------------
    addDesc(area["レイド"], [
        "招待リンクIDには" + makeSpan("「https://discord.com/invite/XXXXXXX」", "white") + "、または" + makeSpan("「https://discord.gg/XXXXXXX」", "white") + "形式の招待リンクか、招待リンクのIDを入力してください。",
        "サーバーIDには" + makeSpan("「https://discord.com/channels/XXXXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXX」", "white") + "形式のチャンネルURLか、サーバーのIDを入力してください。"
    ]).after("<br><br>");
    var inputInvite = addInput(area["レイド"], "招待リンクID", "XXXXXXX").on("change", function() {
        var m = inputInvite.val().match(/^https?:\/\/discord\.(?:com\/invite|gg)\/([0-9a-zA-Z]+)$/) || inputInvite.val().match(/^([0-9a-zA-Z]+)$/);
        inputInvite.val(m ? m[1] : "");
    });
    addBtn(area["レイド"], "招待を受ける", function() {
        if (inputInvite.val().length === 0) return outputLog(g_output, "WARNING: 招待リンクIDが入力されていません", g_ip_flag);
/*        splitLine(inputToken.val()).forEach(function(v, i) {
            g_ajaxTimeoutIds.push(setTimeout(function() {
                disabledElement(content, true);
                sendCancelBtn.prop("disabled", false);
                $.ajax({
                    type: "GET",
                    url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/invites/"+inputInvite.val()+"?inputValue="+inputInvite.val()+"&with_counts=true&with_expiration=true",
                    headers: {
                        authorization: v
                    }
                }).always(function(body1, statusText1, data1) {
                    outputLog(g_output, "OPENINVITE#" + (statusText1 === "error" ? body1 : data1).status + "@" + v, g_ip_flag);
                    $.ajax({
                        type: "POST",
                        url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/invites/" + inputInvite.val(),
                        headers: {
                            authorization: v
                        }
                    }).always(function(body2, statusText2, data2) {
                        outputLog(g_output, "INVITE#" + (statusText2 === "error" ? body2 : data2).status + "@" + v, g_ip_flag);
                        g_ajaxTimeoutIds.shift(1);
                        if (g_ajaxTimeoutIds.length === 0) {
                            disabledElement(content, false);
                            sendCancelBtn.prop("disabled", true);
                        };
                    });
                });
            }, makeDelay(inputInterval.val(), i)));
        });*/
        splitLine(inputToken.val()).forEach(function(v, i) {
            g_ajaxTimeoutIds.push(setTimeout(function() {
                disabledElement(content, true);
                sendCancelBtn.prop("disabled", false);
                $.ajax({
                    type: "POST",
                    url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/invites/" + inputInvite.val(),
                    headers: {
                        authorization: v
                    }
                }).always(function(body, statusText, data) {
                    outputLog(g_output, "INVITE#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                    g_ajaxTimeoutIds.shift(1);
                    if (g_ajaxTimeoutIds.length === 0) {
                        disabledElement(content, false);
                        sendCancelBtn.prop("disabled", true);
                    };
                });
            }, makeDelay(inputInterval.val(), i)));
        });
    }).after("<br><br>");
    var inputGuildId = addInput(area["レイド"], "サーバーID", "XXXXXXXXXXXXXXXXXX").change("change", function() {
        var m = inputGuildId.val().match(/^https?:\/\/discord\.com\/channels\/([0-9]+)\/[0-9]+\/?$/) || inputGuildId.val().match(/^([0-9]+)$/);
        inputGuildId.val(m ? m[1] : "");
    });
    addBtn(area["レイド"], "サーバーから脱退", function() {
        if (inputGuildId.val().length === 0) return outputLog(g_output, "WARNING: サーバーIDが入力されていません", g_ip_flag);
        splitLine(inputToken.val()).forEach(function(v, i) {
            g_ajaxTimeoutIds.push(setTimeout(function() {
                disabledElement(content, true);
                sendCancelBtn.prop("disabled", false);
                $.ajax({
                    type: "DELETE",
                    url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/users/@me/guilds/" + inputGuildId.val(),
                    headers: {
                        authorization: v
                    }
                }).always(function(body, statusText, data) {
                    outputLog(g_output, "LEAVE#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                    g_ajaxTimeoutIds.shift(1);
                    if (g_ajaxTimeoutIds.length === 0) {
                        disabledElement(content, false);
                        sendCancelBtn.prop("disabled", true);
                    };
                });
            }, makeDelay(inputInterval.val(), i)));
        });
    });
    //--------------------------------------------------
    addDesc(area["認証"], [
        "認証リアクションURLはリアクション形式の認証を突破するためのものです。",
        "認証に使用するリアクションの「Request URL」を入力してください。",
        "Request URLは開発者ツールのNetworkタブを見ながらリアクションを押した際に表示される「%40me」という通信のRequest URLから取得できます。",
        "",
        makeSpan("注意", "Transparent", "red"),
        "リアクション情報はサーバーから抜けた後も保持されています。",
        "再度、サーバーに入って認証を受けるとき、一度リアクションを外す必要があります。"
    ]).after("<br><br>");
    var inputReactionURL = addInput(area["認証"], "認証リアクションURL", "https://discord.com/api/v9/channels/XXXXXXXXXXXXXXXXXX/messages/XXXXXXXXXXXXXXXXXX/reactions/XXXXXXX/%40me").width("70%").on("change", function() {
        if (!/^https?:\/\/discord\.com\/api\/v8\/channels\/[0-9]+\/messages\/[0-9]+\/reactions\/[^\/]+\/(%40|@)me$/.test(inputReactionURL.val())) inputReactionURL.val("");
    });
    ["付ける", "外す"].forEach(function(v) {
        var method = (v === "付ける" ? "PUT" : "DELETE");
        addBtn(area["認証"], v, function() {
            if (inputReactionURL.val().length === 0) return outputLog(g_output, "WARNING: 認証リアクションURLが入力されていません", g_ip_flag);
            splitLine(inputToken.val()).forEach(function(v, i) {
                g_ajaxTimeoutIds.push(setTimeout(function() {
                    disabledElement(content, true);
                    sendCancelBtn.prop("disabled", false);
                    $.ajax({
                        type: method,
                        url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + inputReactionURL.val(),
                        headers: {
                            authorization: v
                        }
                    }).always(function(body, statusText, data) {
                        outputLog(g_output, "REACTION_" + method + "#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                        g_ajaxTimeoutIds.shift(1);
                        if (g_ajaxTimeoutIds.length === 0) {
                            disabledElement(content, false);
                            sendCancelBtn.prop("disabled", true);
                        };
                    });
                }, makeDelay(inputInterval.val(), i)));
            });
        });
    });
    //--------------------------------------------------
    addDesc(area["発言"], makeSpan("「https://discord.com/channels/XXXXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXX」", "white") + "形式のチャンネルURLか、チャンネルのIDを入力してください。").after("<br><br>" + makeSpan("チャンネルID", "darkgray", "black", 2.5));
    var inputChannelId = addTextarea(area["発言"], "発言するチャンネルのIDを改行で区切って入力\n\n例:" + new Array(4).join("\nXXXXXXXXXXXXXXXXXX")).on("change", function() {
        inputChannelId.val(inputChannelId.val().split("\n").map(function(v) {
            var m = v.match(/^https?:\/\/discord\.com\/channels\/[0-9]+\/([0-9]+)\/?$/) || v.match(/^([0-9]+)$/);
            return m ? m[1] : "";
        }).filter(function(x, i, arr) {
            return (arr.indexOf(x) === i && x.length > 0);
        }).join("\n")).trigger("updatetextarea");
    }).after("<br><br>" + makeSpan("発言内容", "darkgray", "black", 2.5));
    addBtn(area["発言"], "コピー").remove().insertBefore(inputChannelId).on("click", function() {
        copy(inputChannelId.val());
        inputChannelId.select();
    });
    addBtn(area["発言"], "クリア").remove().insertBefore(inputChannelId).after("<br>").on("click", function() {
        inputChannelId.val("").trigger("updatetextarea");
    });
    var inputContent = addTextarea(area["発言"], "発言する内容を入力(空の場合は点呼)").after("<br>");
    addBtn(area["発言"], "コピー").remove().insertBefore(inputContent).on("click", function() {
        copy(inputContent.val());
        inputContent.select();
    });
    addBtn(area["発言"], "クリア").remove().insertBefore(inputContent).after("<br>").on("click", function() {
        inputContent.val("").trigger("updatetextarea");
    });
    var inputRandom = addInputBool(area["発言"], "発言の最後にランダムな文字を追加"),
        sayBtn = addBtn(area["発言"], "送信").remove().insertBefore(inputRandom).on("click", function() {
        if (inputChannelId.val().length === 0) return outputLog(g_output, "WARNING: チャンネルIDが入力されていません");
        var starts=1;
        if (proxyrequest.find("input[type='checkbox']").prop("checked")){var starts=3;}
        window.allow_repeat = true;
        window.stopper = false;
        setTimeout(async()=>{
            while (true){
                if (window.stopper){
                    window.stopper = false;
                    return;
                }
                splitLine(inputChannelId.val()).forEach(function(a, i, arr) {
                    splitLine(inputToken.val()).forEach(function(b, o) {
                        g_ajaxTimeoutIds.push(setTimeout(function() {
                            disabledElement(content, true);
                            sendCancelBtn.prop("disabled", false);
                            $.ajax({
                                type: "POST",
                                url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/channels/" + a + "/messages",
                                headers: {
                                    authorization: b,
                                    "content-type": "application/json"
                                },
                                data: JSON.stringify({
                                    content: (inputContent.val() || (o + 1).toString()) + (inputRandom.find("input[type='checkbox']").prop("checked") ? String.fromCharCode(Math.random() * Math.pow(2, 16)) : ""),
                                    tts: false
                                })
                            }).always(function(body, statusText, data) {
                                outputLog(g_output, "MESSAGE#" + (statusText === "error" ? body : data).status + "@" + b, g_ip_flag);
                                g_ajaxTimeoutIds.shift(1);
                                if (g_ajaxTimeoutIds.length === 0) {
                                    disabledElement(content, false);
                                    sendCancelBtn.prop("disabled", true);
                                };
                            });
                        }, makeDelay(inputInterval.val(), i, o, arr.length)));
                    });
                });
                if (!whilerun.find("input[type='checkbox']").prop("checked")){
                    return;
                }
                await sleep(1000);
            }
        },0);
    });
    addBtn(area["発言"], "入力中").remove().insertBefore(sayBtn).on("click", function() {
        if (inputChannelId.val().length === 0) return outputLog(g_output, "WARNING: チャンネルIDが入力されていません");
        var starts=1;
        if (proxyrequest.find("input[type='checkbox']").prop("checked")){var starts=3;}
        window.allow_repeat = true;
        window.stopper = false;
        setTimeout(async()=>{
            while (true){
                if (window.stopper){
                    window.stopper = false;
                    return;
                }
                splitLine(inputChannelId.val()).forEach(function(a, i, arr) {
                    splitLine(inputToken.val()).forEach(function(b, o) {
                        g_ajaxTimeoutIds.push(setTimeout(function() {
                            disabledElement(content, true);
                            sendCancelBtn.prop("disabled", false);
                            $.ajax({
                                type: "POST",
                                url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/channels/" + a + "/typing",
                                headers: {
                                    authorization: b
                                }
                            }).always(function(body, statusText, data) {
                                outputLog(g_output, "TYPING#" + (statusText === "error" ? body : data).status + "@" + b, g_ip_flag);
                                g_ajaxTimeoutIds.shift(1);
                                if (g_ajaxTimeoutIds.length === 0) {
                                    disabledElement(content, false);
                                    sendCancelBtn.prop("disabled", true);
                                };
                            });
                        }, makeDelay(inputInterval.val(), i, o, arr.length)));
                    });
                });
                if (!whilerun.find("input[type='checkbox']").prop("checked")){
                    return;
                }
                await sleep(1000);
            }
        },0);
    });
    //--------------------------------------------------
/*    addDesc(area["スラッシュコマンド"], makeSpan("「https://discord.com/channels/XXXXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXX」", "white") + "形式のチャンネルURLか、チャンネルのIDを入力してください。<br>" + makeSpan("警告", "pink", "purple") + "<br>この機能は、テストが完全に済んでいません。<br>凍結される可能性も考えられます。<br注意して使ってください。").after("<br><br>" + makeSpan("チャンネルID", "darkgray", "black", 2.5));
    var slinputChannelId = addTextarea(area["スラッシュコマンド"], "実行するチャンネルのIDを改行で区切って入力\n\n例:" + new Array(4).join("\nXXXXXXXXXXXXXXXXXX")).on("change", function() {
        slinputChannelId.val(slinputChannelId.val().split("\n").map(function(v) {
            var m = v.match(/^https?:\/\/discord\.com\/channels\/[0-9]+\/([0-9]+)\/?$/) || v.match(/^([0-9]+)$/);
            return m ? m[1] : "";
        }).filter(function(x, i, arr) {
            return (arr.indexOf(x) === i && x.length > 0);
        }).join("\n")).trigger("updatetextarea");
    }).after("<br><br>");
    addBtn(area["スラッシュコマンド"], "コピー").remove().insertBefore(slinputChannelId).on("click", function() {
        copy(slinputChannelId.val());
        slinputChannelId.select();
    });
    addBtn(area["スラッシュコマンド"], "クリア").remove().insertBefore(slinputChannelId).after("<br>").on("click", function() {
        slinputChannelId.val("").trigger("updatetextarea");
    });
    var slinputGuildId = addInput(area["スラッシュコマンド"], "ギルドID", "XXXXXXXXXXXXXXXXXX").on("change", function() {
        if (!/^[0-9]+$/.test(slinputGuildId.val())) slinputGuildId.val("");
    });
    var slinputBotid = addTextarea(area["スラッシュコマンド"], "実行するするbotid").before("<br>" + makeSpan("ボットID", "darkgray", "black", 2.5));
    addBtn(area["スラッシュコマンド"], "コピー").remove().insertBefore(slinputBotid).on("click", function() {
        copy(slinputBotid.val());
        slinputBotid.select();
    });
    addBtn(area["スラッシュコマンド"], "クリア").remove().insertBefore(slinputBotid).after("<br>").on("click", function() {
        slinputBotid.val("").trigger("updatetextarea");
    });
    var slinputContent = addTextarea(area["スラッシュコマンド"], "実行するするコマンドを入力").before("<br><br>" + makeSpan("コマンド", "darkgray", "black", 2.5));
    addBtn(area["スラッシュコマンド"], "コピー").remove().insertBefore(slinputContent).on("click", function() {
        copy(slinputContent.val());
        slinputContent.select();
    });
    addBtn(area["スラッシュコマンド"], "クリア").remove().insertBefore(slinputContent).after("<br>").on("click", function() {
        slinputContent.val("").trigger("updatetextarea");
    });
    addBtn(area["スラッシュコマンド"], "実行").on("click", function() {
        if (slinputChannelId.val().length === 0) return outputLog(g_output, "WARNING: チャンネルIDが入力されていません");
        if (slinputGuildId.val().length === 0) return outputLog(g_output, "WARNING: ギルドIDが入力されていません");
        if (slinputBotid.val().length === 0) return outputLog(g_output, "WARNING: ボットIDが入力されていません");
        if (slinputBotid.val().length === 0) return outputLog(g_output, "WARNING: コマンドが入力されていません");
        splitLine(slinputChannelId.val()).forEach(function(a, i, arr) {
            splitLine(slinputBotid.val()).forEach(function(a2, i2, arr2) {
                splitLine(inputToken.val()).forEach(function(b, o) {
                    g_ajaxTimeoutIds.push(setTimeout(function() {
                        disabledElement(content, true);
                        sendCancelBtn.prop("disabled", false);
                        $.ajax({
                            type: "POST",
                            url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/interactions",
                            headers: {
                                authorization: b,
                                "content-type": "application/json"
                            },
                            data: JSON.stringify({
                                type: 2,
                                application_id: a2,
                                guild_id: slinputGuildId.val(),
                                channel_id: a,
                                data: {
                                    version: 877073958694977596,
                                    id: 877073958409732123,
                                    guild_id: a2,
                                    name: "anime",
                                    type: 1,
                                    options: [
                                        {type:3,name:"search",value:"テスト"}
                                    ]
                                }
                            })
//{\"type\":2,\"application_id\":\"159985415099514880\",\"guild_id\":\"876048711392837662\",\"channel_id\":\"878522063365734450\",\"data\":{\"version\":\"877073958694977596\",\"id\":\"877073958409732123\",\"guild_id\":\"876048711392837662\",\"name\":\"anime\",\"type\":1,\"options\":[{\"type\":3,\"name\":\"search\",\"value\":\"テスト\"}]}}
                        }).always(function(body, statusText, data) {
                            outputLog(g_output, "MESSAGE#" + (statusText === "error" ? body : data).status + "@" + b, g_ip_flag);
                            g_ajaxTimeoutIds.shift(1);
                            if (g_ajaxTimeoutIds.length === 0) {
                                disabledElement(content, false);
                                sendCancelBtn.prop("disabled", true);
                            };
                        });
                    }, makeDelay(inputInterval.val(), i, o, arr.length)));
                });
            });
        });
    }).before("<br>");*/
    //--------------------------------------------------
    addDesc(area["ダイレクトメッセージ"], [
        makeSpan("警告", "pink", "purple"),
        "この機能は非常にTokenの寿命を削りやすいです。",
        "利用は実験目的以外で使用しないでください。",
        "利用する前にTokenを共有してる人に使用することを伝えてください。"
    ]).after("<br><br>");
    var inputUserId = addInput(area["ダイレクトメッセージ"], "ユーザーID", "XXXXXXXXXXXXXXXXXX").on("change", function() {
            if (!/^[0-9]+$/.test(inputUserId.val())) inputUserId.val("");
        }).after("<br><br>"),
        inputDMContent = addTextarea(area["ダイレクトメッセージ"], "DM内容を入力(空の場合は点呼)").before(makeSpan("DM内容", "darkgray", "black", 2.5));
    addBtn(area["ダイレクトメッセージ"], "コピー").remove().insertBefore(inputDMContent).on("click", function() {
        copy(inputDMContent.val());
        inputDMContent.select();
    });
    addBtn(area["ダイレクトメッセージ"], "クリア").remove().insertBefore(inputDMContent).after("<br>").on("click", function() {
        inputDMContent.val("").trigger("updatetextarea");
    });
    addBtn(area["ダイレクトメッセージ"], "送信", function() {
        if (inputUserId.val().length === 0) return outputLog(g_output, "WARNING: ユーザーIDが入力されていません", g_ip_flag);
        window.allow_repeat = true;
        window.stopper = false;
        setTimeout(async()=>{
            while (true){
                if (window.stopper){
                    window.stopper = false;
                    return;
                }
                splitLine(inputToken.val()).forEach(function(v, i) {
                    g_ajaxTimeoutIds.push(setTimeout(function() {
                        disabledElement(content, true);
                        sendCancelBtn.prop("disabled", false);
                        $.ajax({
                            type: "POST",
                            url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/users/@me/channels",
                            headers: {
                                authorization: v,
                                "content-type": "application/json"
                            },
                            data: JSON.stringify({
                                recipients: [inputUserId.val()]
                            })
                        }).done(function(data) {
                            $.ajax({
                                type: "POST",
                                url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/channels/" + data.id + "/messages",
                                headers: {
                                    authorization: v,
                                    "content-type": "application/json"
                                },
                                data: JSON.stringify({
                                    content: (inputDMContent.val() || (i + 1).toString()),
                                    tts: false
                                })
                            }).always(function(body, statusText, data) {
                                outputLog(g_output, "SEND_DM#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                                g_ajaxTimeoutIds.shift(1);
                            });
                        }).always(function(body, statusText, data) {
                            outputLog(g_output, "GET_DM#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                            if (statusText === "error") outputLog(g_output, "ERROR: DMの取得に失敗しました", g_ip_flag);
                            g_ajaxTimeoutIds.shift(1);
                            if (g_ajaxTimeoutIds.length === 0) {
                                disabledElement(content, false);
                                sendCancelBtn.prop("disabled", true);
                            };
                        });
                    }, makeDelay(inputInterval.val(), i)));
                });
                if (!whilerun.find("input[type='checkbox']").prop("checked")){
                    return;
                }
                await sleep(1000);
            }
        },0);
    }).before("<br>");
    //--------------------------------------------------
    addDesc(area["フレンドリクエスト"], [
        makeSpan("警告", "pink", "purple"),
        "この機能は非常にTokenの寿命を削りやすいです。",
        "実験目的以外で使用しないでください。",
        "利用する前にTokenを共有してる人に使用することを伝えてください。"
    ]).after("<br><br>");
    var inputUsername = addInput(area["フレンドリクエスト"], "ユーザー名", "NAME#XXXX").on("change", function() {
        var m = inputUsername.val().match(/^(.+)#([0-9]{4})$/);
        inputUsername.val(m ? m[1].trim() + "#" + m[2].trim() : "");
    });
    addBtn(area["フレンドリクエスト"], "送信", function() {
        if (inputUsername.val().length === 0) return outputLog(g_output, "WARNING: ユーザー名が入力されていません", g_ip_flag);
        splitLine(inputToken.val()).forEach(function(v, i) {
            var m = inputUsername.val().match(/^(.+)#([0-9]{4})$/);
            g_ajaxTimeoutIds.push(setTimeout(function() {
                disabledElement(content, true);
                sendCancelBtn.prop("disabled", false);
                $.ajax({
                    type: "POST",
                    url: (proxyrequest.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"_"+getRandomInt(150).toString()+"&url=" : "") + "https://discord.com/api/v9/users/@me/relationships",
                    headers: {
                        authorization: v,
                        "content-type": "application/json"
                    },
                    data: JSON.stringify({
                        username: m[1],
                        discriminator: Number(m[2])
                    })
                }).always(function(body, statusText, data) {
                    outputLog(g_output, "FRIENDREQUEST#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                    g_ajaxTimeoutIds.shift(1);
                    if (g_ajaxTimeoutIds.length === 0) {
                        disabledElement(content, false);
                        sendCancelBtn.prop("disabled", true);
                    };
                });
            }, makeDelay(inputInterval.val(), i)));
        });
    });
    //--------------------------------------------------
        var avatarView = $("<img>", {
            src: ""
        }).hide().appendTo(area["アバター"]),
        inputAvatar = $("<input>", {
            type: "file"
        }).insertBefore(avatarView).before("アバター画像: ").on("change", function() {
            avatarView.hide().attr("src", "");
            if (inputAvatar[0].files.length === 0) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                avatarView.show().attr("src", e.target.result);
            };
            reader.readAsDataURL(inputAvatar[0].files[0]);
        }).after("<br>");
    addBtn(h, "アバターを反映").remove().insertAfter(inputAvatar).before("<br>").on("click", function() {
        if (avatarView.attr("src").length === 0) return outputLog(g_output, "WARNING: アバター画像が選択されていません", g_ip_flag);
        splitLine(inputToken.val()).forEach(function(v, i) {
            g_ajaxTimeoutIds.push(setTimeout(function() {
                disabledElement(content, true);
                sendCancelBtn.prop("disabled", false);
                $.ajax({
                    type: "PATCH",
                    url: (window.proxyrequestbool.find("input[type='checkbox']").prop("checked") ? "https://anondiscord.xyz/tokenstool/proxy.php?"+Date.now().toString()+"&url=" : "") + "https://discord.com/api/v8/users/@me",
                    headers: {
                        authorization: v,
                        "content-type": "application/json"
                    },
                    data: JSON.stringify({
                        avatar: avatarView.attr("src")
                    })
                }).always(function(body, statusText, data) {
                    outputLog(g_output, "AVATAR#" + (statusText === "error" ? body : data).status + "@" + v, g_ip_flag);
                    g_ajaxTimeoutIds.shift(1);
                    if (g_ajaxTimeoutIds.length === 0) {
                        disabledElement(content, false);
                        sendCancelBtn.prop("disabled", true);
                    };
                });
            }, makeDelay(inputInterval.val(), i)));
        });
    });
    //--------------------------------------------------
    h.append("<hr>");
    addDesc(h, [
        "開発者ツールが使用できない端末でも簡易的に通信の情報を見るためのものです。",
        "通信情報以外にも不正な入力値の警告などが表示されます。",
        "以下のログをコピーして開発者や詳しい人に見せることで開発者ツールが使用できない端末の方や、ネットワークに詳しくない方でもエラーなどの原因の特定ができます。",
        "",
        makeSpan("注意", "Transparent", "red"),
        "ログを他の場所へ貼る場合は「IPアドレスとTokenをマスク」を押してログ内のIPアドレスとTokenを隠すことを推奨します。",
        "「ログにIPアドレスを表示」をONにするとログ出力時に先頭にIPアドレスが表示されますが、IPアドレスの取得にAPIを使用しているので出力までに遅延が発生します。",
        "そのため、このオプションは" + makeSpan("非推奨", "darkgray", "red") + "です。"
    ]).after("<br><br>");
    addBtn(h, "クリア", function() {
        g_output.val("").trigger("updatetextarea");
    });
    addBtn(h, "IPアドレスとTokenをマスク", function() {
        g_output.val(g_output.val().replace(/<[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+>/g, "<*.*.*.*>").replace(/[\w\-\.]{24}\.[\w\-\.]{6}\.[\w\-\.]{27}/g, function(m) {
            return m.replace(/[^\.]/g, "*");
        }));
    });
    addInputBool(h, "ログにIPアドレスを表示", function(flag) {
        g_ip_flag = flag;
    });
    g_output = addTextarea(h, "", true).before("<br>" + makeSpan("ログ", "darkgray", "black", 2.5) + makeSpan("テキストエリアをクリックでコピー", "lightgray", "black; font-size: 10px") + "<br>");
    //--------------------------------------------------
    document.querySelectorAll("button").forEach(b=>{b.addEventListener("click",function(e){
        if (!sendCancelBtn.prop("disabled") && e.path[0].innerText == "送信キャンセル"){
            return;
        }
        window.lastclick = e.path[0];
    })});
    //--------------------------------------------------
})();
