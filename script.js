"use strict";

// prettier-ignore

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDay()}`;

  }
  //prettier-ignore
}
class Running extends Workout {
  type = "running";
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, duration, distance, elevation) {
    super(coords, duration, distance);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}
class App {
  #map;
  #zoomLevel = 13;
  #mapEvent;
  #movments = [];
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    // this._getlocalStorage();

    inputType.addEventListener("change", this._toggleElevationFields);
    containerWorkouts.addEventListener('click' , this._moveToMarker.bind(this))
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("sorry could not find you");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`);
    this.#map = L.map("map").setView(coords, this.#zoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this));
    // this.#movments.forEach(work=>{
    //   this._renderWorkout(work)
    // })
  }
  _showForm(mapEve) {
    this.#mapEvent = mapEve;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _hideForm() {
    // clear input fields
    // prettier-ignore
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _newWorkout(e) {
    const validInputs = (...input) =>
      input.every((inp) => Number.isFinite(inp));
    const allPositiveNum = (...input) => input.every((inp) => inp > 0);
    e.preventDefault();
    // taking input of all fields
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositiveNum(distance, duration, cadence)
      ) {
        // console.log(validInputs(distance,duration,cadence), allPositiveNum(distance,duration , cadence))
        return alert("Enter valid input");
      }

      workout = new Running([lat, lng], duration, distance, cadence);
    }
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositiveNum(distance, duration)
      ) {
        return alert("Not valid input");
      }

      workout = new Cycling([lat, lng], duration, distance, elevation);
    }
    this.#movments.push(workout);
    console.log(this.#movments);
    // render the workout method
    this._renderWorkout(workout);
    this._renderWorkoutSideElement(workout);
    this._hideForm();

    // set local storage 
    // this._setLocalStorage()

  }
  _renderWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidht: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}${workout.description}`
      )
      .openPopup();
  }

  _toggleElevationFields() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _renderWorkoutSideElement(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id=${workout.id}>
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;
    if (workout.type === "running") {
      html += `
      <div class="workout__details">
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
    }
    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  _moveToMarker(e){
    const ele = e.target.closest('.workout')
    if(!ele) return 
    const workout = this.#movments.find(work=>work.id === ele.dataset.id);
    this.#map.setView(workout.coords, (this.#zoomLevel + 1) , {
      animate:true,
      pan:{
        duration : 1,
      }
    })
  }
  // _setLocalStorage(){
  //   localStorage.setItem('workouts' , JSON.stringify(this.#movments))

  // }
  // _getlocalStorage(){
  //   const data = JSON.parse(localStorage.getItem('workouts'))
  //   console.log(data);
  //   this.#movments = data;
  //   if(!data) return 
  //   this.#movments.forEach(work=>{
  //     this._renderWorkoutSideElement(work)
  //   })
  // }


}
const app = new App();
