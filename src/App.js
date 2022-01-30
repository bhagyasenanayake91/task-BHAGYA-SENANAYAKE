import React from 'react';
import './App.css';
import { category } from './utils/category.js'

export default class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			raceData: [],
			sortedRaces: [],
			unsortedRaces: [],
			selectedCategory: category.ALL,
			time: Date.now(),
			rowsToFetch: 5,
		};

		document.title = 'Entain Coding Test';
	}

	// Use fetch API to gather the 10 next races to jump and add it to app state
	// then set interval to update time in app state
	componentDidMount() {
		this.getRacingData();

		this.interval = setInterval(() => {
			this.setState({ time: Date.now() });
			this.getRacingData();
		}, 1000);
	}

	// Clear the interval once app is closed/unmounted
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	// Fetch a specified number of next races to jump, sort by time ascending
	// race categories and races >=60 seconds over start time
	getRacingData = () => {
		fetch(`https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=45`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(res => res.json()).then(json => {
			const { data } = json;

			this.setState({
				sortedRaces: [],
			})

			let newRaces = [];

			const races = data.race_summaries;

			// TODO: You will have to work with the API payload to determine what data you require
			for (const [key] of Object.entries(races)) {
				const race = races[key];
				newRaces = newRaces.concat({
					raceId: race.race_id,
					raceName: race.race_name,
					categoryId: race.category_id,
					meetingName: race.meeting_name,
					advertisedStart: race.advertised_start.seconds * 1000
				});
			}

			// Sort races by time to jump and add them to race list
			newRaces.sort((item1, item2) => {
				return item1.advertisedStart - item2.advertisedStart;
			});

			// Filter races for only those which are <60 seconds over start time
			let sortedRaceCount = 0;

			this.setState({
				unsortedRaces: newRaces,
				sortedRaces: newRaces.filter((value) => {
					if (sortedRaceCount < 5
						&& (value.advertisedStart - this.state.time) > -60000
						&& (this.state.selectedCategory === value.categoryId || this.state.selectedCategory === category.ALL)) {
						sortedRaceCount++;
						return true;
					}
					return false;
				})
			});

			if (sortedRaceCount < 5) {
				this.setState({ rowsToFetch: this.state.rowsToFetch + 1 });
				this.getRacingData();
			}
		});
	}

	// Format time in XXmin XXs
	getFormattedTime = (rawTime) => {
		const timeMs = Math.floor((rawTime - this.state.time) / 1000);
		const timeMins = Math.floor(Math.abs(timeMs) / 60);
		const timeSecs = Math.abs(timeMs) % 60;

		// TODO: Implement your logic to format the display of the race jump time
		if (this.state.time < rawTime) {
			return "jumps in at " + timeMins + " minutes " + timeSecs + " seconds"
		}
		else {
			return "started " + timeMins + " minutes " + timeSecs + " seconds ago"
		}
	}

	// Render components
	// TODO: Populate the state sets with appropriate actions to give each button functionality
	render() {
		return (
			<div className="container">
				<div className="buttonContainer">
					<button className="buttonToggle" onClick={() => {
						this.setState({ selectedCategory: category.ALL })
						this.getRacingData();
					}}>All Races</button>
				</div>
				<div className="categories">
					<div className="buttonContainer">
						<button className="buttonToggle" onClick={() => {
							this.setState({ selectedCategory: category.GREYHOUND })
							this.getRacingData();
						}}>Greyhounds</button>
					</div>
					<div className="buttonContainer">
						<button className="buttonToggle" onClick={() => {
							this.setState({ selectedCategory: category.HARNESS })
							this.getRacingData();
						}}>Harness</button>
					</div>
					<div className="buttonContainer">
						<button className="buttonToggle" onClick={() => {
							this.setState({ selectedCategory: category.THOUROUGHBRED })
							this.getRacingData();
						}}>Thoroughbreds</button>
					</div>
				</div>
				<div className="list">
					{this.state.sortedRaces.map((item, i) => (
						<ul key={i}>
							<li><span className="item">{item.raceName} meeting at <strong>{item.meetingName}</strong> {this.getFormattedTime(item.advertisedStart)}</span></li>
						</ul>
					))}
				</div>
			</div>
		);
	}
}
