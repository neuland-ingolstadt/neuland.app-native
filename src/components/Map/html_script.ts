const htmlScript = `

<!DOCTYPE html>
<html>
<head>
    <title>Quick Start - Leaflet</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1.0">
    <link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha512-Zcn6bjR/8RZbLEpLIeOwNtzREBAJnUKESxces60Mpoj+2okopSAcSUIUOseddDm0cxnGQzxIR7vJgsLZbdLE3w==" crossorigin="anonymous">
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha512-BwHfrr4c9kmRkLw6iXFdzcdWV/PGkVgiIyIWLLlTSXzWQzxuSg4DiQUCpauz/EWjgk5TYQqX/kvn9pG1NpYfqg==" crossorigin=""></script>
</head>
<body style="padding: 0; margin: 0">
    <div id="mapid" style="width: 100%; height: 100vh;"></div>
    <script>
        function sendMessageToRN(message) {
            // Send message to React Native
            window.ReactNativeWebView.postMessage(message);
        }

        function handleLoadError(event) {
            var errorMessage = "mapLoadError";
            sendMessageToRN(errorMessage);
            window.removeEventListener('error', handleLoadError, true);
        }

        function checkInternetConnection() {
            if (!navigator.onLine) {
                var noInternetMessage = "noInternetConnection";
                sendMessageToRN(noInternetMessage);
            }
        }

        // Add event listeners
        window.addEventListener('error', handleLoadError, true);
        window.addEventListener('online', checkInternetConnection);
        window.addEventListener('offline', checkInternetConnection);

        var mymap = L.map('mapid', { zoomControl: false }).setView([48.76709, 11.4328], 17.5);

        L.tileLayer('https://tileopenstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'Map data &copy; OpenStreetMap contributors, '
        }).addTo(mymap);
        
        // Initial check for internet connection
        checkInternetConnection();
    </script>
</body>
</html>



`

export default htmlScript
