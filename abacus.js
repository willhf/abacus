var TOTAL_WIDTH = 1000;
var TOTAL_HEIGHT = 600;

var ROW_HEIGHT = 100;
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

var LINE_STROKE_WIDTH = 5;
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

function Abacus(num_columns, n, on_update_callback) {
	var that = this;
	var SQUARE_BORDER_WIDTH = 5;
	var SQUARE_BORDER_COLOR = "black";
	var FILL_COLOR_5_THRU_9 = "black";
	var FILL_COLOR_0_THRU_4 = "white";

	var show_labels = false;

	var svg = window.d3.select("body")
		.append("svg")
		.attr("width", TOTAL_WIDTH)
		.attr("height", TOTAL_HEIGHT);

	// Top Line
	svg.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", TOP_LINE_HEIGHT)
		.attr("y2", TOP_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	// Bottom Line
	svg.append("line")
		.attr("x1", 0)
		.attr("x2", TOTAL_WIDTH)
		.attr("y1", BOTTOM_LINE_HEIGHT)
		.attr("y2", BOTTOM_LINE_HEIGHT)
		.attr("stroke-width", LINE_STROKE_WIDTH)
		.attr("stroke", "black");

	function Digit(params) {
		var that = this;
		this.val = params.val;
		var text_offset = (ROW_HEIGHT / 2);

		this.set_val = function (v) {
			this.val = v;
			this.redraw();
		}

		var fill_color = function () {
			return (that.val > 4) ? FILL_COLOR_5_THRU_9 : FILL_COLOR_0_THRU_4;
		};
		var text_color = function () {
			return (that.val > 4) ? FILL_COLOR_0_THRU_4 : FILL_COLOR_5_THRU_9;
		}
		this.row = function () {
			return (this.val < 5) ? (4 - this.val) : (9 - this.val);
		}

		this.move_to_row = function (r) {
			var diff = r - this.row();
			if (0 == diff) {
				this.val += (this.val >= 5) ? -5 : 5;
			} else {
				this.val -= diff;
			}
			this.redraw();
		}
		var labels_visibility = function () {
			return show_labels ? "visible" : "hidden";
		}

		this.redraw = function () {
			var r = this.row();
			rect.attr("y", params.rows[r]);
			rect.attr("fill", fill_color());
			text.attr("y", params.rows[r] + text_offset + 15);
			text.attr("fill", text_color());
			text.text(this.val);
			text.style("visibility", labels_visibility());
		}

		var rect = svg.append("rect")
			.attr("x", params.x)
			.attr("y", params.rows[this.row()])
			.attr("width", ROW_HEIGHT)
			.attr("height", ROW_HEIGHT)
			.attr("fill", fill_color())
			.attr("stroke", SQUARE_BORDER_COLOR)
			.attr("stroke-width", SQUARE_BORDER_WIDTH);

		var text = svg.append("text")
			.attr("text-anchor", "middle")
			.attr("x", params.x + text_offset)
			.attr("y", params.rows[this.row()] + text_offset + 15)
			.attr("font-family", "sans-serif")
			.attr("font-size", "50px")
			.attr("fill", text_color())
			.text(this.val)
			.style("visibility", labels_visibility());
	}

	this.set_number = function(num) {
		for (var i = 0; i < this.num_columns; i++) {
			var place = Math.pow(10, i);
			var d = Math.floor(num / place) % 10;

			digits[i].set_val(d);
		}
	};

	this.get_number = function() {
		var n = 0;

		for (var i = 0; i < this.num_columns; i++) {
			n += digits[i].val * Math.pow(10, i);
		}
		return n;
	}

	this.move_digit_from_click = function(coords) {
		var x = coords[0];
		var y = coords[1];
		var column = closest_column_to_cursor_x_position(x);
		var r = closest_row_to_cursor_y_position(y);
		var digit = digits[column];
		digit.move_to_row(r);
	}

	this.num_columns = num_columns;
	var digits = [];
	for (var i = 0; i < this.num_columns; i++) {
		digits[i] = new Digit({
			val: 0,
			x: COLUMNS[NUM_COLUMNS - i - 1] - (ROW_HEIGHT / 2),
			rows: ROWS
		});
	}
	this.set_number(n);

	svg.on('click', function() {
		var coords = d3.mouse(this);

		that.move_digit_from_click(coords);
		on_update_callback(that);
	});

	this.redraw = function() {
		this.set_number(this.get_number());
	}

	this.toggle_labels = function() {
		show_labels = !show_labels;
		this.redraw();
	}
}

function random_number(limit) {
	return Math.floor(Math.random() * limit);
}
