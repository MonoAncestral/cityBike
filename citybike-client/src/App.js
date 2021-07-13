import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Map, TileLayer, Popup, Marker } from "react-leaflet";

var socket;
const L = require("leaflet");

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      lat: 25.790654,
      lng: -80.1300455,
      zoom: 12,
      stations: [],
      history: [],
      seconds: 0,
      secondsElapsed: 0
    };

    socket = socketIOClient("http://127.0.0.1:4001");
  }

  componentDidMount() {
    socket.emit("conected");
    socket.on("init", e => {
      if (e !== undefined && e.stations !== undefined) {
        this.setState({
          stations: e.stations,
          lat: e.location.latitude,
          lng: e.location.longitude
        });
      }
    });

    setInterval(() => {
      if (this.state.stations !== undefined) {
        this.state.history.push(this.state.stations);
      }

      if (this.state.history.length > 12) {
        this.setState({
          history: [...this.state.history.slice(1, this.state.history.length)]
        });
      }
      if (this.state.secondsElapsed < 120) {
        this.setState({ secondsElapsed: this.state.secondsElapsed + 10 });
      }
    }, 10000);

    socket.on("diff", station => {
      if (station !== undefined && this.state.stations !== undefined) {
        const aux = this.state.stations;
        var index = this.state.stations.findIndex(i => i.id === station.id);
        if (index !== -1 && this.state.seconds === 0) {
          aux[index] = station;
          this.setState({
            stations: [
              ...this.state.stations.slice(0, index),
              Object.assign({}, this.state.stations[index], station),
              ...this.state.stations.slice(index + 1)
            ]
          });
        }
      }
    });
  }

  ChangeInterval(event) {
    this.setState({ seconds: event.target.value });
    if (this.state.seconds !== 0) {
      var index = this.state.seconds / 10 - 1;
      this.setState({
        stations: this.state.history[index]
      });
    } else {
      socket.on("init", e => {
        if (e !== undefined && e.stations !== undefined) {
          this.setState({
            stations: e.stations
          });
        }
      });
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const redIcon = L.icon({
      iconUrl: require("./assets/images/red.svg"),
      iconSize: [20, 20],
      iconAnchor: [32, 64],
      popupAnchor: [-22, -60],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null
    });

    const purpleIcon = L.icon({
      iconUrl: require("./assets/images/green.svg"),
      iconSize: [20, 20],
      iconAnchor: [32, 64],
      popupAnchor: [-22, -60],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null
    });

    return (
      <div className="map">
        <h1> City Bikes in Miami </h1>
        <p>See available bikes {this.state.seconds} seconds ago</p>
        <input
          value={this.state.seconds}
          type="range"
          min="0"
          max={this.state.secondsElapsed}
          step="10"
          onChange={e => {
            this.ChangeInterval(e);
          }}
        />
        <br />
        <small>
          (You can go back further as you spend time on this page, maximum 2
          minutes)
        </small>

        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.stations &&
            this.state.stations.map(value => (
              <>
                {value.latitude && value.longitude && (
                  <Marker
                    key={value.id}
                    position={[value.latitude, value.longitude]}
                    icon={value.free_bikes > 0 ? purpleIcon : redIcon}
                  >
                    <Popup key={value.id}>
                      empty slots: {value.empty_slots} <br />
                      free bikes: {value.free_bikes}
                    </Popup>
                  </Marker>
                )}
              </>
            ))}
        </Map>
      </div>
    );
  }
}
export default App;
