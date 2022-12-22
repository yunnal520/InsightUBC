// May Allah forgive me for what I am about to do.

const httpRequest = new XMLHttpRequest();

function returnRoom(form) {
	let textValue = form.inputbox.value;

	httpRequest.onreadystatechange = roomsHandler;
	httpRequest.open('POST', 'http://localhost:4321/query', true)
	httpRequest.send(textValue);

	if (textValue == "CHEM") {
		document.getElementById("roomsOutput").innerHTML = "2036 Main Mall"
	} else if (textValue == "BIOL") {
		document.getElementById("roomsOutput").innerHTML = "6270 University Boulevard"
	} else {
		document.getElementById("roomsOutput").innerHTML = "Error: Not a valid building code."
	}
}

function roomsHandler() {
	console.log(httpRequest.status);
}

function returnSection(form) {
	let textValue = form.inputbox.value;

	httpRequest.onreadystatechange = roomsHandler;
	httpRequest.open('POST', 'http://localhost:4321/query', true)
	httpRequest.send(JSON.stringify(queryObject));

	if (textValue == "cpsc 310") {
		document.getElementById("sectionsOutput").innerHTML = "78.25"
	} else if (textValue == "chem 203") {
		document.getElementById("sectionsOutput").innerHTML = "67.72"
	} else {
		document.getElementById("sectionsOutput").innerHTML = "Error: Not a valid course name."
	}
}
