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

var NUM_COLUMNS = 4;

var SQUARE_BORDER_WIDTH = 3;
var FILL_COLOR_5_THRU_9 = "black";
var FILL_COLOR_0_THRU_4 = "white";
var BORDER_COLOR_FOCUS = "red";

// Finds the index of the row which is closest to y.
function closest_row_to_cursor_y_position(y) {
	var offset = y - ROW_BASE -
		(ROW_HEIGHT / 2); // since we are dragging to the center of each row
	var rounded = Math.round(offset / ROW_HEIGHT);

	return Math.max(0, Math.min(4, rounded));
}

function Digit(val, place) {
	this.val = val;
	this.place = place;

	this.number = function () {
		return this.val * this.place;
	}

	this.fill_color = function () {
		if (this.val > 4) {
			return FILL_COLOR_5_THRU_9;
		} else {
			return FILL_COLOR_0_THRU_4;
		}
	};

	this.row = function () {
		if (this.val < 5) {
			return 4 - this.val;
		} else {
			return 9 - this.val;
		}
	}

	this.flip = function () {
		if (this.val >= 5) {
			this.val -= 5;
		} else {
			this.val += 5;
		}
	}

	this.move_to_row = function (r) {
		var diff = r - this.row();

		if (0 == diff) {
			this.flip();
			return;
		}

		this.val -= diff;
	}
}

function Abacus(num_columns, n) {
	this.num_columns = num_columns;
	this.digits = [];

	this.set_number = function(num) {
		var place = 1;

		for (var i = 0; i < this.num_columns; i++) {
			var d = Math.floor(num / place) % 10;

			this.digits[i] = new Digit(d, place);
			place *= 10;
		}
	};

	this.set_number(n);

	this.get_number = function() {
		var n = 0;

		for (var i = 0; i < this.num_columns; i++) {
			n += this.digits[i].number();
		}
		return n;
	}
}

function random_number(limit) {
	return Math.floor(Math.random() * limit);
}

function draw_digit(svgContainer, column, dgt, on_update_callback) {
	var border_color = "black";

	// TODO: Distinguish click vs drag.

	svgContainer.append("rect")
		.attr("x", COLUMNS[column])
		.attr("y", ROWS[dgt.row()])
		.attr("width", ROW_HEIGHT)
		.attr("height", ROW_HEIGHT)
		.attr("fill", dgt.fill_color())
		.attr("stroke", border_color)
		.attr("stroke-width", SQUARE_BORDER_WIDTH)
		.call(d3.behavior.drag()
			.on("dragend", function () {
				var coordinates = d3.mouse(this);
				var y = coordinates[1];
				var r = closest_row_to_cursor_y_position(y);

				dgt.move_to_row(r);
				d3.select(this)
					.attr("fill", dgt.fill_color())
					.attr('y', ROWS[dgt.row()]);

				on_update_callback();
			})
			.on("drag", function() {
				var r = closest_row_to_cursor_y_position(d3.event.y);

				d3.select(this)
					.attr('y', ROWS[r]);
			})
		);
}

function graph_abacus(abacus, on_update_callback) {

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

	for (var i = 0; i < abacus.num_columns; i++) {
		var column = NUM_COLUMNS - i - 1;
		var dgt = abacus.digits[i];

		draw_digit(svgContainer, column, dgt, on_update_callback);
	}
}
