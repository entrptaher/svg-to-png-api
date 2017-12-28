const axios = require('axios');
const svgson = require('svgson');
const { convert } = require('convert-svg-to-png');
const express = require('express');
const app = express();

function getSVGData(svg) {
  const data = {
    height: 0,
    width: 0
  };
  return new Promise(function(resolve, reject) {
    svgson(svg, {}, result => {
      const attrs = result.attrs;
      if (attrs.height) {
        data.height = attrs.height;
      }

      if (attrs.width) {
        data.width = attrs.width;
        re;
      }

      if (attrs.viewBox) {
        const viewBox = attrs.viewBox;
        data.width = viewBox.split(' ')[2];
        data.height = viewBox.split(' ')[3];
      }

      resolve(data);
    });
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

app.get('/convert', async (req, res) => {
  const png = await convertFromURL(req.query.url);
  res.set('Content-Type', 'image/png');
  res.send(png);
});

app.listen(process.env.PORT || 3000);
