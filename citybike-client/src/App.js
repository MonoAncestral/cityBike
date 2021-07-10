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
      zoom: 10,
      var: undefined
    };

    socket = socketIOClient("http://127.0.0.1:4001");
  }

  componentDidUpdate(prev, next) {
    console.log(next);
  }

  componentDidMount() {
    socket.emit("conected");
    socket.on("diff", e => {
      if (e !== undefined) {
        this.setState({
          var: e
        });
      }
    });
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const myIcon = L.icon({
      iconUrl: require("./assets/images/a.svg"),
      iconSize: [30, 30],
      iconAnchor: [32, 64],
      popupAnchor: [0, -50],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null
    });

    return (
      <div className="map">
        <h1> City Bikes in Miami </h1>
        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.var &&
            this.state.var.map((value, key) => (
              <>
                {value.latitude && value.longitude && (
                  <Marker
                    key={key}
                    position={[value.latitude, value.longitude]}
                    icon={myIcon}
                  >
                    <Popup key={key}>
                      empty: {value.empty_slots}
                      {value.free_bikes}
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
