const fetch = require('node-fetch');
const cors = require('@koa/cors');
const path = require('path');
const Koa = require('koa');

const proxyServer = new Koa();

proxyServer.use(async (ctx, next) => {
  console.log('hey');
  await next();
  let {lat, lng} = ctx.request.query;
  let weatherObj = await fetchWeather(lat, lng);
  console.log(weatherObj);
  ctx.body = weatherObj;
});

proxyServer.use(cors());


function fetchWeather(lat, lng) {
  let host = 'https://api.darksky.net/forecast/';
  let apiKey = '7052606363affe26b45b0e1066113383';
  let url = `${host}${apiKey}/${lat},${lng}`;
  return fetch(url, {mode: 'no-cors'}).then(response => response.json());
}

proxyServer.listen(3000)
