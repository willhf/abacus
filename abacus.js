var TOTAL_WIDTH = 500;
var TOTAL_HEIGHT = 300;

var ROW_HEIGHT = 40;
var ROW_BASE = 50;

var ROWS = [
	ROW_BASE + (ROW_HEIGHT * 0),
	ROW_BASE + (ROW_HEIGHT * 1),
	ROW_BASE + (ROW_HEIGHT * 2),
	ROW_BASE + (ROW_HEIGHT * 3),
	ROW_BASE + (ROW_HEIGHT * 4),
];

var TOP_LINE_HEIGHT = ROWS[1];
var BOTTOM_LINE_HEIGHT = ROWS[4];

var LINE_STROKE_WIDTH = 3;
var COLUMN_SIZE = ROW_HEIGHT * 2 - 10;
var COLUMN_BASE = 100;

var COLUMNS = [
	COLUMN_BASE + (COLUMN_SIZE * 0),
	COLUMN_BASE + (COLUMN_SIZE * 1),
	COLUMN_BASE + (COLUMN_SIZE * 2),
	COLUMN_BASE + (COLUMN_SIZE * 3),
	COLUMN_BASE + (COLUMN_SIZE * 4),
];

var SQUARE_BORDER_WIDTH = 3;
var FILL_COLOR_5_THRU_9 = "black";
var FILL_COLOR_0_THRU_4 = "white";
var BORDER_COLOR_FOCUS = "red";

function digit_to_row(digit) {
	// the top row is row 0
	if (digit < 5) {
		return 4 - digit;
	} else {
		return 9 - digit;
	}
}

function place_to_column(place) {
	if (1000 == place) {
		return 0;
	}
	if (100 == place) {
		return 1;
	}
	if (10 == place) {
		return 2;
	}
	if (1 == place) {
		return 3;
	}
}

// Finds the index of the row which is closest to y.
function closest_row_to_cursor_y_position(y) {
	var offset = y - ROW_BASE -
		(ROW_HEIGHT / 2); // since we are dragging to the center of each row
	var rounded = Math.round(offset / ROW_HEIGHT);

	return Math.max(0, Math.min(4, rounded));
}

function digit_from_number(num, place) {
	var x = Math.floor(num / place);

	return x % 10;
}

function Digit(num, place) {
	this.num = num;
	this.place = place;
	this.val = digit_from_number(this.num,  this.place);

	this.fill_color = function () {
		if (this.val > 4) {
			return FILL_COLOR_5_THRU_9;
		} else {
			return FILL_COLOR_0_THRU_4;
		}
	};

	this.row    = digit_to_row(this.val);
	this.column = place_to_column(this.place);
}

function add_square(svgContainer, dgt) {
	var border_color = "black";

	if (dgt.place == window.place_with_focus) {
		border_color = BORDER_COLOR_FOCUS;
	}

	svgContainer.append("rect")
		.attr("x", COLUMNS[dgt.column])
		.attr("y", ROWS[dgt.row])
		.attr("width", ROW_HEIGHT)
		.attr("height", ROW_HEIGHT)
		.attr("fill", dgt.fill_color())
		.attr("stroke", border_color)
		.attr("stroke-width", SQUARE_BORDER_WIDTH)

		.call(d3.behavior.drag()
			.on("dragend", function () {
				var coordinates = d3.mouse(this);
				var x = coordinates[0];
				var y = coordinates[1];

				var ending_row = closest_row_to_cursor_y_position(y);

				if (dgt.row == ending_row) {
					// 'click'
					if (dgt.val >= 5) {
						dgt.num -= 5 * dgt.place;
					} else {
						dgt.num += 5 * dgt.place;
					}
				} else {
					// actual drag
					var diff = ending_row - dgt.row;

					dgt.num -= dgt.place * diff;
				}

				d3.select("svg").remove();
				graph_number(dgt.num);
			})
			.on("drag", function() {
				var r = closest_row_to_cursor_y_position(d3.event.y);

				d3.select(this)
				.attr('y', ROWS[r]);
			})
		);
}

function random_number(limit) {
	return Math.floor(Math.random() * limit);
}

function graph_number(input) {

	if (input > 9999) {
		input = 0;
	}
	var svgContainer = window.d3.select("body")
		.append("svg")
		.attr("width", TOTAL_WIDTH)
		.attr("height", TOTAL_HEIGHT);

	var top_line = svgContainer.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", TOP_LINE_HEIGHT)
		.attr("y2", TOP_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	var bottom_line = svgContainer.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", BOTTOM_LINE_HEIGHT)
		.attr("y2", BOTTOM_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	window.last_graphed = input;

	if (input == window.add_answer) {
		var next_add = Math.floor(Math.random() * 9) + 1;

		while (next_add == window.number_to_add) {
			next_add = Math.floor(Math.random() * 9) + 1;
		}

		window.number_to_add = next_add;
		document.getElementById('question').innerHTML = window.number_to_add;
		window.add_answer = input + window.number_to_add;
		window.place_with_focus = 1;
	}

	add_square(svgContainer, new Digit(input, 1000));
	add_square(svgContainer, new Digit(input,  100));
	add_square(svgContainer, new Digit(input,   10));
	add_square(svgContainer, new Digit(input,    1));
}

function new_question() {
	var x = random_number(10*1000);

	graph_number(x);

	window.answer = x;
}

function identification_game() {
	var guess_string = document.getElementById("answer").value;
	var reg = new RegExp('^[0-9]*$');

	if (reg.test(guess_string)) {
		/* They are typing out the number, proceed. */
		return;
	}
	var guess_int = parseInt(guess_string);

	if (guess_int == window.answer) {
		document.getElementById("answer").value = "";
		d3.select("svg").remove();
		new_question();
	} else {
		alert("incorrect!");
		document.getElementById("answer").value = "";
	}
}

function adding_game() {
	window.place_with_focus = 1;

	new_question();

	window.number_to_add = Math.floor(Math.random() * 9) + 1;
	document.getElementById('question').innerHTML = window.number_to_add;

	window.add_answer = window.answer + window.number_to_add;

	window.addEventListener('keypress', function (e) {

		var d = digit_from_number(window.last_graphed, window.place_with_focus);

		switch (e.keyCode) {
			case 110: // (j) n
				window.place_with_focus *= 10;
				break;
			case 117: // (i) u
				if ((d == 4) || (d == 9)) {
					window.last_graphed -= window.place_with_focus * 4;
				} else {
					window.last_graphed += window.place_with_focus * 1;
				}
				break;
			case 101: // (k) e
				if ((d == 0) || (d == 5)) {
					window.last_graphed += window.place_with_focus * 4;
				} else {
					window.last_graphed -= window.place_with_focus * 1;
				}
				break;
			case 105: // (l) i
				window.place_with_focus /= 10;
				break;
			case 32: // (space)
				if (d > 4) {
					window.last_graphed -= window.place_with_focus * 5;
				} else {
					window.last_graphed += window.place_with_focus * 5;
				}

				break;
		}

		d3.select("svg").remove();
		graph_number(window.last_graphed);

	}, false);
}
