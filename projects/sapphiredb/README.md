# sapphiredb - JS client [![Build Status](https://travis-ci.org/morrisjdev/ng-realtime-database.svg?branch=master)](https://travis-ci.org/morrisjdev/ng-realtime-database)

<p align="center">
  <a href="https://sapphire-db.com/">
    <img src="https://sapphire-db.com/assets/banner/SapphireDB%20Banner.png" alt="SapphireDb logo">
  </a>
</p>

SapphireDb is an open source library that enables you to easily create your own application with realtime data synchronization.

Build amazing reactive applications with realtime data synchronization and get the best results of your project.
SapphireDb should serve as a self hosted alternative to firebase realtime database and firestore and also gives you an alternative to SignalR.

SapphireDb is an extension for Asp.Net Core and EF Core and creates a generic API that you can easily use with different clients. This enables you to rapidly develop amazing applications.

Check out the documentation for more details: [Documentation](https://sapphire-db.com/)

<p align="center">
    <a href="https://www.patreon.com/user?u=27738280"><img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160"></a>
</p>

## Advantages

- :wrench: Dead simple configuration
- :satellite: Broad technology support
- :computer: Self hosted
- :floppy_disk: Easy to use CRUD operations
- :zap: Model validation
- :heavy_check_mark: Database support
- :open_file_folder: Supports joins/includes
- :loop: Complex queries
- :electric_plug: Actions
- :key: Authorization included
- :envelope: Messaging
- :globe_with_meridians: Scalable

[Learn more](https://sapphire-db.com/)


## Installation

### Install Package
To use sapphiredb you have to install the package using npm

In your app folder execute

```
npm install sapphiredb rxjs axios -S
```

### Create SapphireDb instance

```js
var sapphiredb = require('sapphiredb');

var db = new sapphiredb.SapphireDb({
    serverBaseUrl: 'localhost:5000',
    useSsl: false,
    apiKey: 'webapp',
    apiSecret: 'pw1234'
});

db.collection('demo.entries').values().subscribe(function (values) {
    console.log(values);
});
```

#### Use websockets on NodeJs

sapphiredb also works in a NodeJs application. It will use polling as communication strategy by default.
If you want to use websockets you have to install an external library for that.

##### Example
```
npm install ws -S
```

```js
var sapphiredb = require('sapphiredb');

var ws = require('ws');
WebSocket = ws;

var db = new sapphiredb.SapphireDb({
    serverBaseUrl: 'localhost:5000',
    useSsl: false,
    apiKey: 'webapp',
    apiSecret: 'pw1234'
});

db.collection('demo.entries').values().subscribe(function (values) {
    console.log(values);
});
```

## Compatibility

| Browser/Engine       | Websocket          | SSE                | Polling            |
|----------------------|--------------------|--------------------|--------------------|
| Chrome               | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Firefox              | :heavy_check_mark: | :x:                | :heavy_check_mark: |
| Opera                | :heavy_check_mark: | :x:                | :heavy_check_mark: |
| Edge                 | :heavy_check_mark: | :x:                | :heavy_check_mark: |
| Internet Explorer 11 | :heavy_check_mark: | :x:                | :heavy_check_mark: |
| NodeJs               | :heavy_check_mark: | :x:                | :heavy_check_mark: |

### Technology support

JS, NodeJs, React, Svelte ...

## Examples

[React Example](https://github.com/SapphireDb/Example-React)

[Svelte Example](https://github.com/SapphireDb/Example-Svelte)

[NodeJs Example](https://github.com/SapphireDb/Example-NodeJs)

## Documentation

Check out the documentation for more details: [Documentation](https://sapphire-db.com/)

## Implementations

### Server

[SapphireDb - Server for Asp.Net Core](https://github.com/morrisjdev/SapphireDb)

### Client

[sapphiredb - JS client (JS, NodeJs, React, Svelte, ...)](https://github.com/SapphireDb/sapphiredb-js/blob/master/projects/sapphiredb/README.md)

[ng-sapphiredb - Angular client](https://github.com/SapphireDb/sapphiredb-js/blob/master/projects/ng-sapphiredb/README.md)

## Author

[Morris Janatzek](http://morrisj.net) ([morrisjdev](https://github.com/morrisjdev))

## Licenses

SapphireDb - [MIT License](https://github.com/SapphireDb/SapphireDb/blob/master/LICENSE)

sapphiredb-js - [MIT License](https://github.com/SapphireDb/sapphiredb-js/blob/master/LICENSE)
