// Yandex Webmaster ownership check. Served by a function so the address answers 200
// instead of the static-asset redirect that drops the .html extension.
export const onRequestGet = () => new Response(`<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: 1c2475a81e074f44</body>
</html>
`, { headers: { 'content-type': 'text/html; charset=UTF-8' } });
