window.onload = () => {
  let searchInput = document.getElementById('search-input');

  searchInput.addEventListener('input', (e) => {
    return fetch(getPlaceUrl(e.target.value), { mode: 'cors'})
      .then(response => response.json())
      .then(json => autoCompleteRender(json.results, e.target.value))
  });
}

window.addEventListener('click', (e) => {
  const autoCompleteElm = document.getElementById('autocomplete');
  if (!e.path.includes(autoCompleteElm)) {
    removeAllChildren(autoCompleteElm);
    autoCompleteElm.style['border-width'] = '0px';
  }
});

function getPlaceUrl(input) {
  const host = 'https://places.cit.api.here.com';
  const path = '/places/v1';
  const resources = '/autosuggest';
  const apiId = 'app_id=UjlYpMV8O2RNru7POxQB';
  const apiCode = 'app_code=e_TPPvdQVgVMbu5xMYSHLQ';
  const size = 'size=10'
  const url = `${host}${path}${resources}?${apiId}&${apiCode}&${size}`;

  return `${url}&result_types=address&q=${input}&at=39.2846225,-76.7605725`;
}

function autoCompleteRender(data, input) {
  const autoCompleteElm = document.getElementById('autocomplete');
  removeAllChildren(autoCompleteElm);
  data.forEach(listRender.bind(null, input, autoCompleteElm));
  autoCompleteElm.style['border-width'] = data.length ? '1px' : '0px';

  return true;
}

function listRender(input, autoCompleteElm, place) {
  let elm = document.createElement('div');
  let boldRegex = new RegExp(input, 'i');
  let breaklineRegex = /\<br\/?\>/gi;
  let searchResult = place.title.replace(boldRegex, str => str.bold());
  let address = place.vicinity.replace(breaklineRegex, ', ');
  let addressHTML = `<span class="address">${address}</span>`;
  elm.id = 'autosuggest';
  elm.innerHTML = `${searchResult} ${addressHTML}`;
  elm.addEventListener(
    'click', 
    selectLocation.bind(null, place, autoCompleteElm)
  );
  autoCompleteElm.appendChild(elm);
}

async function selectLocation(place, autoCompleteElm, e) {
  showElements();
  setSearchBarText(e);
  removeAllChildren(autoCompleteElm);
  autoCompleteElm.style['border-width'] = '0px';
  let weatherObj = await fetchWeather(...place.position);
  changeMap(...place.position);
  handleWeather(weatherObj);
}

function showElements() {
  let elements = document.querySelector('.wrapper').children;
  for (var elm of elements) {
    if (elm.localName !== 'header') {
      elm.style.visibility = 'visible';
    }
  }
}

function setSearchBarText(e) {
  let searchInput = document.getElementById('search-input');
  searchInput.value = e.target.innerText;
}

function fetchWeather(lat, lng) {
  let url = `http://api.weather.cukejianya.com?lat=${lat}&lng=${lng}`;
  return fetch(url, {mode: 'cors'}).then(response => response.json());
}

function changeMap(lat, lng) {
  let iframe = document.querySelector('iframe'); 
  let newURL = `https://maps.darksky.net/@temperature,${lat},${lng},11`;  
  iframe.src = newURL;
}

function handleWeather(weatherObj) {
  let { currently, daily } = weatherObj;
  changeDetailBar(currently);
  changeIcon(currently.icon)
  changeSummary(currently.summary, currently.temperature);
  changeTemperature(
    currently.apparentTemperature,
    daily.data[0].temperatureLow,
    daily.data[0].temperatureHigh
  );
}

function changeDetailBar(currentWeather) {
  let detailBar = document.getElementById('detail-bar');
  for (var elm of detailBar.children) {
    if (elm.id in currentWeather) {
      let child = elm.lastElementChild;
      let value = currentWeather[elm.id]; 
      if (elm.id == 'humidity') {
        value = (value * 100);
      }
      child.innerText = child.innerText.replace(/\d+/g, value.toFixed(0));
    }
  }
}

function changeIcon(icon) {
  let iconBar = document.getElementById('main-icon');
  let iconImg = getIconImg(icon);
  iconBar.src = `icons/animated/${iconImg}`;
}

function getIconImg(icon) {
  const iconMapping = {
    rain: 'rainy-6.svg',
    snow: 'snowy-6.svg',
    sleet: 'rainy-7.svg',
    wind: 'cloudy.svg',
    fog: 'cloud.svg',
    cloudy: 'cloudy.svg',
    'clear-day': 'day.svg',
    'clear-night': 'night.svg',
    'partly-cloudy-day': 'cloudy-day-1.svg',
    'partly-cloudy-night': 'cloudy-night-1.svg'
  }

  return iconMapping[icon]; 
}

function changeSummary(summary, temperature) {
  let summerElm = document.getElementById('summary');
  summerElm.innerText = `${temperature.toFixed(0)}º ${summary}`;
}

function changeTemperature(feelLike, low, high) {
  let feelLikeElm = document.getElementById('feels-like');
  let lowElm = document.getElementById('low');
  let highElm = document.getElementById('high');
  feelLikeElm.innerText = feelLike.toFixed(0) + 'º';
  lowElm.innerText = low.toFixed(0) + 'º';
  highElm.innerText = high.toFixed(0) + 'º';
}

function removeAllChildren(parent) {
  while (parent.hasChildNodes()) {
    parent.firstChild.remove();
  }
  return true;
}
