function Abacus(start, on_update_callback) {
	var that = this;

	// THE CONTROLS
	var NUM_COLUMNS = 6;
	var RECT_DIM = 100;
	var HORIZONTAL_SPACE_BETWEEN_RECTS = 3 * (RECT_DIM / 4);

	var ROW_BASE = 10;
	var COLUMN_BASE = HORIZONTAL_SPACE_BETWEEN_RECTS / 2;
	var COLUMN_SIZE = RECT_DIM + HORIZONTAL_SPACE_BETWEEN_RECTS;

	var SVG_WIDTH = COLUMN_SIZE * NUM_COLUMNS;
	var SVG_HEIGHT = 600;

	var TEXT_SIZE = 50;
	var TEXT_OFFSET_X = (RECT_DIM / 2);
	var TEXT_OFFSET_Y = (RECT_DIM / 2) + 15; // 15 seems to make it look alright

	var MAIN_LINE_STROKE_WIDTH = 6;
	var INTERIOR_LINE_STROKE_WIDTH = 3;
	var RECT_STROKE_WIDTH = 6;

	var COLUMNS = [];
	for (var i = 0; i < NUM_COLUMNS; i++) {
		COLUMNS[i] = COLUMN_BASE + (COLUMN_SIZE * i);
	}

	var ROWS = [
		ROW_BASE + (RECT_DIM * 0),
		ROW_BASE + (RECT_DIM * 1),
		ROW_BASE + (RECT_DIM * 2),
		ROW_BASE + (RECT_DIM * 3),
		ROW_BASE + (RECT_DIM * 4),
	];

	var digits = [];
	for (var i = 0; i < NUM_COLUMNS; i++) {
		digits[i] = 0;
	}

	var rects = [];
	var labels = [];
	var show_labels = false;
	var show_interior_lines = true;

	this.toggle_labels = function () {
		show_labels = !show_labels;
		labelsgroup.setAttribute("visibility", show_labels ? "visible" : "hidden");
	}
	this.toggle_interior_lines = function () {
		show_interior_lines = !show_interior_lines;
		interior_lines_group.setAttribute("visibility", show_interior_lines ? "visible" : "hidden");
	}

	function closest_row(y) {
		var centering = (RECT_DIM / 2);
		var offset = y - ROW_BASE - centering;
		var rounded = Math.round(offset / RECT_DIM);

		return Math.max(0, Math.min(4, rounded));
	}

	function closest_column(x) {
		var centering = (RECT_DIM / 2);
		var offset = x - COLUMN_BASE - centering;
		var rounded = Math.round(offset / COLUMN_SIZE);

		return Math.max(0, Math.min(COLUMNS.length - 1, rounded));
	}

	function digit_row(val) {
		return 4 - (val % 5);
	}

	function fill(val) {
		return (val > 4) ? "black" : "white";
	}
	function text_fill(val) {
		return (val > 4) ? "white" : "black";
	}

	this.get_number = function () {
		var dlen = digits.length;
		var n = 0;
		for (var i = 0; i < dlen; i++) {
			var idx = dlen - i - 1;
			n += digits[idx] * Math.pow(10, i);
		}
		return n;
	}

	this.set_number = function (num) {
		var dlen = digits.length;
		for (var i = 0; i < dlen; i++) {
			var idx = dlen - i - 1;
			var place = Math.pow(10, i);
			var d = Math.floor(num / place) % 10;

			digits[idx] = d;
			var row = digit_row(d);
			var y = ROWS[row];
			var r = rects[idx];
			r.setAttribute("fill", fill(d));
			r.setAttribute("y", y);
			var l = labels[idx];
			l.setAttribute("fill", text_fill(d));
			l.setAttribute("y", y + TEXT_OFFSET_Y);
			l.innerHTML = d;
		}
	}

	function abacus_click(evt) {
		var row = closest_row(evt.offsetY);
		var col = closest_column(evt.offsetX)
		var prev_val = digits[col];

		var diff = row - digit_row(prev_val);
		if (0 == diff) {
			var new_val = (prev_val + 5) % 10;
			digits[col] = new_val;
			rects[col].setAttribute("fill", fill(new_val));
			var l = labels[col];
			l.innerHTML = new_val;
			l.setAttribute("fill", text_fill(new_val));
		} else {
			var new_val = prev_val - diff;
			digits[col] = new_val;
			rects[col].setAttribute("y", ROWS[row]);
			var l = labels[col];
			l.innerHTML = new_val;
			l.setAttribute("y", ROWS[row] + TEXT_OFFSET_Y);
		}

		on_update_callback(that);
	}

	var svg = document.getElementById("abacus-svg");
	svg.setAttribute("width", SVG_WIDTH);
	svg.setAttribute("height", SVG_HEIGHT);
	svg.addEventListener("click", abacus_click);

	var xmlns = "http://www.w3.org/2000/svg";

	var topline = document.createElementNS(xmlns, "line");
	topline.setAttribute("x1", 0);
	topline.setAttribute("x2", SVG_WIDTH);
	topline.setAttribute("y1", ROWS[1]);
	topline.setAttribute("y2", ROWS[1]);
	topline.setAttribute("stroke", "black");
	topline.setAttribute("stroke-width", MAIN_LINE_STROKE_WIDTH);
	svg.appendChild(topline);

	var bottomline = document.createElementNS(xmlns, "line");
	bottomline.setAttribute("x1", 0);
	bottomline.setAttribute("x2", SVG_WIDTH);
	bottomline.setAttribute("y1", ROWS[4]);
	bottomline.setAttribute("y2", ROWS[4]);
	bottomline.setAttribute("stroke", "black");
	bottomline.setAttribute("stroke-width", MAIN_LINE_STROKE_WIDTH);
	svg.appendChild(bottomline);

	var labelsgroup = document.createElementNS(xmlns, "g");
	labelsgroup.setAttribute("visibility", show_labels ? "visible" : "hidden");

	var interior_lines_group = document.createElementNS(xmlns, "g");
	interior_lines_group.setAttribute("visibility", show_interior_lines ? "visible" : "hidden");

	for (var i = 0; i < NUM_COLUMNS; i++) {
		var x = COLUMNS[i];

		var rect = document.createElementNS(xmlns, "rect");
		rect.setAttribute("y", ROWS[4]);
		rect.setAttribute("x", x);
		rect.setAttribute("width", RECT_DIM);
		rect.setAttribute("height", RECT_DIM);
		rect.setAttribute("stroke", "black");
		rect.setAttribute("stroke-width", RECT_STROKE_WIDTH);
		rect.setAttribute("fill", "white");
		svg.appendChild(rect);

		var label = document.createElementNS(xmlns, "text");
		label.setAttribute("y", ROWS[4] + TEXT_OFFSET_Y);
		label.setAttribute("x", x + TEXT_OFFSET_X);
		label.setAttribute("text-anchor", "middle");
		label.setAttribute("font-family", "sans-serif");
		label.setAttribute("font-size", TEXT_SIZE);
		label.innerHTML = 0;

		var INTERIOR_LINE_LENGTH = RECT_DIM / 3;

		var center = RECT_DIM / 2;
		var interior_x1_offset = center - (INTERIOR_LINE_LENGTH / 2);
		var interior_x2_offset = center + (INTERIOR_LINE_LENGTH / 2);

		var top_interior_line = document.createElementNS(xmlns, "line");
		top_interior_line.setAttribute("x1", x + interior_x1_offset);
		top_interior_line.setAttribute("x2", x + interior_x2_offset);
		top_interior_line.setAttribute("y1", ROWS[2]);
		top_interior_line.setAttribute("y2", ROWS[2]);
		top_interior_line.setAttribute("stroke", "black");
		top_interior_line.setAttribute("stroke-width", INTERIOR_LINE_STROKE_WIDTH);

		var bottom_interior_line = document.createElementNS(xmlns, "line");
		bottom_interior_line.setAttribute("x1", x + interior_x1_offset);
		bottom_interior_line.setAttribute("x2", x + interior_x2_offset);
		bottom_interior_line.setAttribute("y1", ROWS[3]);
		bottom_interior_line.setAttribute("y2", ROWS[3]);
		bottom_interior_line.setAttribute("stroke", "black");
		bottom_interior_line.setAttribute("stroke-width", INTERIOR_LINE_STROKE_WIDTH);

		interior_lines_group.appendChild(top_interior_line);
		interior_lines_group.appendChild(bottom_interior_line);
		svg.appendChild(rect);
		labelsgroup.appendChild(label);
		rects[i] = rect;
		labels[i] = label;
	}

	var DIVIDER_COLOR = "red";
	var DIVIDER_RADIUS = 10;
	var DIVIDER_XS = [3 * COLUMN_SIZE];
	for (var i = 0; i < DIVIDER_XS.length; i++) {
		var x = DIVIDER_XS[i];
		var l = document.createElementNS(xmlns, "circle");
		l.setAttribute("cx", x);
		l.setAttribute("cy", ROW_BASE + (2.5 * RECT_DIM));
		l.setAttribute("r", DIVIDER_RADIUS);
		l.setAttribute("fill", DIVIDER_COLOR);
		svg.appendChild(l);
	}

	// Add labelsgroup to svg after rectangles to ensure the labels appear in
	// front.
	svg.appendChild(labelsgroup);
	svg.appendChild(interior_lines_group);

	this.set_number(start);
}

function random_number(limit) {
	return Math.floor(Math.random() * limit);
}
