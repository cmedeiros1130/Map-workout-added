'use strict';

class Workout {
  date = new Date(); // where the object is created.
  id = (Date.now() + '').slice(-10); //workout class
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // {lat, lng}
    this.distance = distance; // in km
    this.duration = duration; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
//Workout Obj
class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //mintes per Km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

//Cycling Obj
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km to hours
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteBtn = document.getElementsByClassName('delete');
const workoutTab = document.getElementsByClassName('workoutTab');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #markers = [];
  #weatherData;

  constructor() {
    //Get users Position
    this._getPosition();

    //weather
    this._getWeather();

    //Get local storage
    this.getLocalStorage();

    //Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    containerWorkouts.addEventListener(
      'click',
      this._handleDeleteWorkout.bind(this)
    );
  }

  _getPosition() {
    //Pop up to get your current location
    if (navigator.geolocation)
      //this.loadMap -javascript will call this callback function and pass in the position argument
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          //bind(this) bind returns a new funtion
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(
      `https://www.google.com/maps/@${latitude},-${longitude}?entry=ttu`
    );

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);

      // fetch weather data
      this._getWeather(latitude, longitude);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    //form disappears when workout is added

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid')), 1000; //setTimeOut does is to call a certain call back function after a certain time
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); //.closest is like a query selector but selects parents not childern
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    //loop over the array(inputs) to check if they are positive, if one of the inputs is false then every will return false.
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //Check if data is valid
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be a positive number'); //if the distance is not a number return immedatly

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        //if the distance is not a number return immedatly
        return alert('Inputs have to be a positive number');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new obj to the workout array
    this.#workouts.push(workout);

    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

    //hide form + Clear input fields
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
  }
  //Marker
  _renderWorkoutMarker(workout) {
    const marker = L.marker(workout.coords)
      //L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnCLick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )

      .openPopup();

    this.#markers.push({ id: workout.id, marker });
  }

  //Added workout
  _renderWorkout(workout) {
    let html = `
    <div class="workoutTab">
    <li class="workout workout--${workout.type}" data-id=${workout.id}>
    <button class="delete">X</button>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃' : '🚴'
      }</span>

      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    } else if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
  </div>`;
    }

    form.insertAdjacentHTML('afterend', html);

    //delete btn
    document.addEventListener('DOMContentLoaded', () => {
      document.body.addEventListener('click', function deletebtn(e) {
        if (e.target.classList.contains('delete')) {
          const workoutIten = e.target.closest('.workout');
          if (workoutIten) {
            workoutIten.remove();
          }
        }
      });
    });
  }
  //Zoom on selected item from user
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout'); //e.target is the target element that is clicked

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  //Local storage
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  //reload the page via console
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _handleDeleteWorkout(e) {
    if (!e.target.classList.contains('delete')) return;
    const workoutItem = e.target.closest('.workout');
    if (!workoutItem) return;
    const workoutId = workoutItem.dataset.id;
    this._deleteWorkout(workoutId);
    workoutItem.remove();
  }

  _deleteWorkout(id) {
    this.#workouts = this.#workouts.filter(workout => workout.id !== id);
    this.#markers = this.#markers.filter(markerObj => {
      if (markerObj.id === id) {
        this.#map.removeLayer(markerObj.marker);
        return false;
      }
      return true;
    });
    this._setLocalStorage();
  }
  //Weather API
  async _getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=60c5fba0e40dac5a2531270553f9088f`;
    try {
      const response = await fetch(url);
      console.log('Response', response);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      this.#weatherData = await response.json();
      this._renderWeather();
    } catch (error) {
      console.error(error);
    }
  }
  _renderWeather() {
    if (!this.#weatherData) return;

    const exitistingWeather = document.querySelector('.weather');
    if (exitistingWeather) exitistingWeather.remove();

    const weatherHTML = `
          <div class="weather">
            <h2>Weather</h2>
            <p>Temperature: ${this.#weatherData.main.temp}°C</p>
            <p>Weather: ${this.#weatherData.weather[0].description}🌥️</p>
            <p>Humidity: ${this.#weatherData.main.humidity}%</p>
          </div>
        `;

    form.insertAdjacentHTML('beforebegin', weatherHTML);
  }
}

const app = new App(); //This creates new object
