import {Content} from "./Content";

export default class Room extends Content {
	private fullname: string;
	private shortname: string;
	private number: string;
	private name: string;
	private address: string;
	private lat: number;
	private lon: number;
	private seats: number;
	private type: string;
	private furniture: string;
	private href: string;

	constructor(fullname: string, shortname: string, address: string, name: string, number: string, seats: number,
		furniture: string, type: string, href: string, lat: number, lon: number) {
		super();
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.name = name;
		this.number = number;
		this.seats = seats;
		this.furniture = furniture;
		this.type = type;
		this.href = href;
		this.lat = lat;
		this.lon = lon;
	}

}
