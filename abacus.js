function Abacus(start, on_update_callback) {
	var that = this;

	var SVG_WIDTH = 1000;
	var SVG_HEIGHT = 600;

	var ROW_HEIGHT = 100;
	var ROW_BASE = 50;

	var COLUMN_SIZE = 175;
	var COLUMN_BASE = 100;

	var TEXT_SIZE = 50;
	var TEXT_OFFSET_X = (ROW_HEIGHT / 2);
	var TEXT_OFFSET_Y = (ROW_HEIGHT / 2) + 15; // 15 seems to make it look alright

	// rects are centered on each column
	var NUM_COLUMNS = 5;
	var COLUMNS = [
		COLUMN_BASE + (COLUMN_SIZE * 0),
		COLUMN_BASE + (COLUMN_SIZE * 1),
		COLUMN_BASE + (COLUMN_SIZE * 2),
		COLUMN_BASE + (COLUMN_SIZE * 3),
		COLUMN_BASE + (COLUMN_SIZE * 4),
	];

	var ROWS = [
		ROW_BASE + (ROW_HEIGHT * 0),
		ROW_BASE + (ROW_HEIGHT * 1),
		ROW_BASE + (ROW_HEIGHT * 2),
		ROW_BASE + (ROW_HEIGHT * 3),
		ROW_BASE + (ROW_HEIGHT * 4),
	];

	var digits = [0, 0, 0, 0, 0];
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
		var centering = (ROW_HEIGHT / 2);
		var offset = y - ROW_BASE - centering;
		var rounded = Math.round(offset / ROW_HEIGHT);

		return Math.max(0, Math.min(4, rounded));
	}

	function closest_column(x) {
		var centering = (ROW_HEIGHT / 2);
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
	topline.setAttribute("stroke-width", 5);
	svg.appendChild(topline);

	var bottomline = document.createElementNS(xmlns, "line");
	bottomline.setAttribute("x1", 0);
	bottomline.setAttribute("x2", SVG_WIDTH);
	bottomline.setAttribute("y1", ROWS[4]);
	bottomline.setAttribute("y2", ROWS[4]);
	bottomline.setAttribute("stroke", "black");
	bottomline.setAttribute("stroke-width", 5);
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
		rect.setAttribute("width", ROW_HEIGHT);
		rect.setAttribute("height", ROW_HEIGHT);
		rect.setAttribute("stroke", "black");
		rect.setAttribute("stroke-width", 5);
		rect.setAttribute("fill", "white");
		svg.appendChild(rect);

		var label = document.createElementNS(xmlns, "text");
		label.setAttribute("y", ROWS[4] + TEXT_OFFSET_Y);
		label.setAttribute("x", x + TEXT_OFFSET_X);
		label.setAttribute("text-anchor", "middle");
		label.setAttribute("font-family", "sans-serif");
		label.setAttribute("font-size", TEXT_SIZE);
		label.innerHTML = 0;

		var top_interior_line = document.createElementNS(xmlns, "line");
		top_interior_line.setAttribute("x1", x + (ROW_HEIGHT / 4));
		top_interior_line.setAttribute("x2", x + 3 * (ROW_HEIGHT / 4));
		top_interior_line.setAttribute("y1", ROWS[2]);
		top_interior_line.setAttribute("y2", ROWS[2]);
		top_interior_line.setAttribute("stroke", "black");
		top_interior_line.setAttribute("stroke-width", 5);

		var bottom_interior_line = document.createElementNS(xmlns, "line");
		bottom_interior_line.setAttribute("x1", x + (ROW_HEIGHT / 4));
		bottom_interior_line.setAttribute("x2", x + 3 * (ROW_HEIGHT / 4));
		bottom_interior_line.setAttribute("y1", ROWS[3]);
		bottom_interior_line.setAttribute("y2", ROWS[3]);
		bottom_interior_line.setAttribute("stroke", "black");
		bottom_interior_line.setAttribute("stroke-width", 5);

		interior_lines_group.appendChild(top_interior_line);
		interior_lines_group.appendChild(bottom_interior_line);
		svg.appendChild(rect);
		labelsgroup.appendChild(label);
		rects[i] = rect;
		labels[i] = label;
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
