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

// rects are centered on each column
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

function closest_column_to_cursor_x_position(x) {
	var offset = x - COLUMN_BASE;
	var rounded = Math.round(offset / COLUMN_SIZE);
	var c = Math.max(0, Math.min(COLUMNS.length - 1, rounded));

	return NUM_COLUMNS - c - 1;
}


function Digit(val, place, column, svg) {
	this.val = val;
	this.place = place;
	this.column = column;

	this.set_val = function (v) {
		this.val = v;
		this.rect.attr("x", COLUMNS[column] - (ROW_HEIGHT / 2));
		this.rect.attr("y", ROWS[this.row()]);
		this.rect.attr("fill", this.fill_color());
	}

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
		this.rect.attr("fill", this.fill_color())
	}

	this.move_to_row = function (r) {
		var diff = r - this.row();
		if (0 == diff) {
			this.flip();
			return;
		}

		this.val -= diff;
		this.rect.attr('y', ROWS[r]);
	}

	this.rect = svg.append("rect")
		.attr("x", COLUMNS[column] - (ROW_HEIGHT / 2))
		.attr("y", ROWS[this.row()])
		.attr("width", ROW_HEIGHT)
		.attr("height", ROW_HEIGHT)
		.attr("fill", this.fill_color())
		.attr("stroke", "black") // border color
		.attr("stroke-width", SQUARE_BORDER_WIDTH);
}

function Abacus(num_columns, n, on_update_callback) {
	this.set_number = function(num) {
		for (var i = 0; i < this.num_columns; i++) {
			var place = Math.pow(10, i);
			var d = Math.floor(num / place) % 10;

			this.digits[i].set_val(d);
		}
	};

	this.get_number = function() {
		var n = 0;

		for (var i = 0; i < this.num_columns; i++) {
			n += this.digits[i].number();
		}
		return n;
	}

	this.move_digit_from_click = function(coords) {
		var x = coords[0];
		var y = coords[1];
		var column = closest_column_to_cursor_x_position(x);
		var r = closest_row_to_cursor_y_position(y);
		var digit = this.digits[column];
		digit.move_to_row(r);
	}

	this.svg = window.d3.select("body")
		.append("svg")
		.attr("width", TOTAL_WIDTH)
		.attr("height", TOTAL_HEIGHT);

	// Top Line
	this.svg.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", TOP_LINE_HEIGHT)
		.attr("y2", TOP_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	// Bottom Line
	this.svg.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", BOTTOM_LINE_HEIGHT)
		.attr("y2", BOTTOM_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	this.on_update_callback = on_update_callback;
	this.num_columns = num_columns;
	this.digits = [];
	for (var i = 0; i < this.num_columns; i++) {
		this.digits[i] = new Digit(0, Math.pow(10, i), NUM_COLUMNS - i - 1, this.svg);
	}
	this.set_number(n);

	var ab = this;
	this.svg.on('click', function() {
		var coords = d3.mouse(this);

          ab.move_digit_from_click(coords);
          ab.on_update_callback(ab);
	});
}

function random_number(limit) {
	return Math.floor(Math.random() * limit);
}
