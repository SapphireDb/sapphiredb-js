# ng-realtime-database [![Build Status](https://travis-ci.org/morrisjdev/ng-realtime-database.svg?branch=master)](https://travis-ci.org/morrisjdev/ng-realtime-database) [![Maintainability](https://api.codeclimate.com/v1/badges/6cc48bef1a9e51422f95/maintainability)](https://codeclimate.com/github/morrisjdev/ng-realtime-database/maintainability) 

Realtime database client for Angular
[Documentation](https://realtime-database.azurewebsites.net/)

## Installation

### Install Package
To use realtime database in client you have to install the package using node.js

In your Angular App-Folder execute

```
npm install ng-realtime-database -S
```

### Import realtime database module in your app.module

```
imports: [
    BrowserModule,
    ...,
    RealtimeDatabaseModule, 
]
```

or using custom configuration

```
imports: [
    BrowserModule,
    ...,
    RealtimeDatabaseModule.config({
        serverBaseUrl: `${location.hostname}:${location.port}`,
        useSecuredSocket: false
    }) 
]
```

## Documentation

Check out the documentation for more details: [Documentation](https://realtime-database.azurewebsites.net/)

## Author

[Morris Janatzek](http://morrisj.net) ([morrisjdev](https://github.com/morrisjdev))
