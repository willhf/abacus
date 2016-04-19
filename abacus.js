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

var ROW_CENTERS = [
	ROW_BASE + (ROW_HEIGHT * 0) + (ROW_HEIGHT / 2),
	ROW_BASE + (ROW_HEIGHT * 1) + (ROW_HEIGHT / 2),
	ROW_BASE + (ROW_HEIGHT * 2) + (ROW_HEIGHT / 2),
	ROW_BASE + (ROW_HEIGHT * 3) + (ROW_HEIGHT / 2),
	ROW_BASE + (ROW_HEIGHT * 4) + (ROW_HEIGHT / 2),
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

function digit_to_fill_color(digit) {
	if (digit > 4) {
		return FILL_COLOR_5_THRU_9;
	} else {
		return FILL_COLOR_0_THRU_4;
	}
}

function digit_to_row(digit) {
	// the top row is row 0
	if (digit < 5) {
		return 4 - digit;
	} else {
		return 9 - digit;
	}
}

// always returns 0-4
function row_to_digit(row) {
	return 4 - row;
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

// Finds the index of the entry of ROW_CENTERS which is closest to y.
function closest_row_to_cursor_y_position(y) {
	var closest_row_idx = 0;
	var min_distance = 0;
	var len = ROW_CENTERS.length;

	for (var i = 0; i < len; i++) {
		var distance = Math.abs(ROW_CENTERS[i] - y);

		if ((0 == i) || (distance < min_distance)) {
			closest_row_idx = i;
			min_distance = distance;
		}
	}

	return closest_row_idx;
}

function digit_from_number(num, place) {
	var x = Math.floor(num / place);

	return x % 10;
}

function add_square(svgContainer, place, digit) {
	var fill = digit_to_fill_color(digit);
	var row = digit_to_row(digit);
	var column = place_to_column(place);

	var border_color = "black";

	if (place == window.place_with_focus) {
		border_color = BORDER_COLOR_FOCUS;
	}

	svgContainer.append("rect")
		.attr("x", COLUMNS[column])
		.attr("y", ROWS[row])
		.attr("width", ROW_HEIGHT)
		.attr("height", ROW_HEIGHT)
		.attr("fill", fill)
		.attr("stroke", border_color)
		.attr("stroke-width", SQUARE_BORDER_WIDTH)

		.call(d3.behavior.drag()
			.on("dragend", function () {
				var coordinates = [0, 0];
	
				coordinates = d3.mouse(this);
				var x = coordinates[0];
				var y = coordinates[1];

				var starting_row = digit_to_row(digit);
				var ending_row = closest_row_to_cursor_y_position(y);

				var num = window.last_graphed;

				if (starting_row == ending_row) {
					// 'click'
					if (digit >= 5) {
						num -= 5 * place;
					} else {
						num += 5 * place;
					}
				} else {
					// actual drag
					var diff = ending_row - starting_row;

					num -= place * diff;
				}

				d3.select("svg").remove();
				graph_number(num);
			})
			.on("drag", function() {
				// TODO: Limit vertical motion to within abacus area.
				// TODO: Account for where inside the square was clicked (
				// the (ROW_HEIGHT / 2) drags from the center).
				d3.select(this)
				.attr('y', d3.event.y - (ROW_HEIGHT / 2));
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

	add_square(svgContainer, 1000, digit_from_number(input, 1000));
	add_square(svgContainer,  100, digit_from_number(input,  100));
	add_square(svgContainer,   10, digit_from_number(input,   10));
	add_square(svgContainer,    1, digit_from_number(input,    1));
}

function new_question() {
	var x = random_number(10*1000);

	graph_number(x);

	window.answer = x;
}

function identification_game() {
	var val = document.getElementById("answer").value;
	var reg = new RegExp('^[0-9]*$');

	if (reg.test(val)) {
		/*
		 * They are typing out the number, proceed.
		 */
		return;
	}
	var x = parseInt(val);

	if (true) {
		/*
		 * TEST MODE
		 */
		if (x == window.answer) {
			document.getElementById("answer").value = "";
			d3.select("svg").remove();
			new_question();
		} else {
			alert("incorrect!");
			document.getElementById("answer").value = "";
		}
	} else {
		/*
		 * ADD MODE
		 */
		d3.select("svg").remove();
		if (0 == x) {
			graph_number(x);
		} else {
			graph_number(window.last_graphed + x);
		}
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
