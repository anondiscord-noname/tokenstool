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
