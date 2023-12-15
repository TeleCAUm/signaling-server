# Signaling Server for AirView

You can use the open-source vesion of AirView with the Signaling Server.<br/>
Use AirView without the internet as long as you are connected to the same LAN !
 <br/> <br/>
You can also use Web ver. with [AirView](airview.netlify.app)
<br/><br/>
# How to Use; Signaling Server

One user clones the signaling server and executes it.

```bash
git clone https://github.com/TeleCAUm/signaling-server.git
cd signaling-server
npm i
npm start
```

All users perform the following:

- Connect to the same Wi-Fi or wired LAN
- Run the [airview-client](https://github.com/TeleCAUm/airview-client)

```bash
git clone https://github.com/TeleCAUm/airview-client.git
cd airview-client
npm i
npm start
```
