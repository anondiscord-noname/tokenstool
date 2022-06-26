 <?php
if (file_exists("limit/".$_SERVER["REMOTE_ADDR"])){
    if (geoip_country_code_by_name($_SERVER["REMOTE_ADDR"]) == "JP"){
        echo "あなたは管理者から利用制限を受けています。<br>理由: ".file_get_contents("limit/".$_SERVER["REMOTE_ADDR"])."<br>処罰実行者: ".(file_exists("limit/".$_SERVER["REMOTE_ADDR"].".mod")?file_get_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod"):"不明");
    }else{
        echo "You are limited by admin.<br>reason: ".file_get_contents("limit/".$_SERVER["REMOTE_ADDR"])."<br>moderator: ".(file_exists("limit/".$_SERVER["REMOTE_ADDR"].".mod")?file_get_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod"):"unknown");
    }
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "Datacamp Limited"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "M247 Ltd"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "xTom"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "TOT Public Company Limited"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "Linode, LLC"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
if (geoip_isp_by_name($_SERVER["REMOTE_ADDR"]) == "CLOUDFLARENET"){
    echo "[auto mod]vpnの使用は禁止されています。";
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"],"VPNの使用は禁止されています。");
    file_put_contents("limit/".$_SERVER["REMOTE_ADDR"].".mod","anoncheck_automod");
    exit;
}
unlink("reload/".$_SERVER["REMOTE_ADDR"]);
session_start();
if (!isset($_SESSION["user"]) && file_exists("loginjson/".$_SERVER["REMOTE_ADDR"])){
    $_SESSION["user"] = json_decode(file_get_contents("loginjson/".$_SERVER["REMOTE_ADDR"]));
}
?>
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="utf-8">
    <title>Discord token</title>
    <meta name="description" content="Freeze最強">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        .message {
            position: relative;
        }
        .message span.remark {
            display: none;
        }
        .message a:hover span.remark {
            background: none repeat scroll 0 0 #EEFFEE;
            border: 1px solid #CCCCCC;
            color: #000000;
            display: block;
            line-height: 1.2em;
            margin: 0.5em;
            padding: 0.5em;
            position: absolute;
            top: 50px;
            width: 12em;
        }
    </style>
</head>

<body>
    <input type="hidden" id="is_login" value="<?php echo isset($_SESSION["user"]) ? "true" : "false"; ?>">
    <script src="script.js"></script>
</body>

</html>