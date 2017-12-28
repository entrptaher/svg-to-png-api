const axios = require('axios');
const svgson = require('svgson');
const { convert } = require('convert-svg-to-png');
const express = require('express');
const app = express();

var base64 = require('base-64');
var utf8 = require('utf8');

function getSVGData(svg) {
  const data = {
    height: 0,
    width: 0
  };
  return new Promise(function(resolve, reject) {
    svgson(
      svg,
      { puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] } },
      result => {
        const attrs = result.attrs;
        if (attrs.height) {
          data.height = attrs.height;
        }

        if (attrs.width) {
          data.width = attrs.width;
        }

        if (attrs.viewBox) {
          const viewBox = attrs.viewBox;
          data.width = viewBox.split(' ')[2];
          data.height = viewBox.split(' ')[3];
        }

        resolve(data);
      }
    );
  });
}

function convertFromURL(url) {
  return new Promise(function(resolve, reject) {
    axios({
      method: 'get',
      url: url
    }).then(async response => {
      const svgRes = await getSVGData(response.data);
      const output = await convert(response.data, svgRes);
      resolve(output);
    });
  });
}

app.get('/', async(req, res)=>{
  res.redirect('/convert/' + base64.encode(utf8.encode(req.query.url)))
})

app.get('/convert/:id', async (req, res) => {
  const bytes = base64.decode(req.params.id);
  const url = utf8.decode(bytes);
  const png = await convertFromURL(url);
  res.set('Content-Type', 'image/png');
  res.send(png);
});

app.listen(process.env.PORT || 3000);
