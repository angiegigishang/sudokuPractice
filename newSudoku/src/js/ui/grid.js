//生成九宫格
const Toolkit = require("../core/toolkit");
const Sudoku = require("../core/sudoku");
const Checker = require("../core/checker");

class Grid {
	constructor(container) {
		this._$container = container;
	}

	build() {
		const sudoku = new Sudoku();
		sudoku.make();
		const matrix = sudoku.puzzleMatrix;
		// const generator = new Generator();
		// generator.generate();
		// const matrix = generator.matrix;

		const rowGroupClasses = ["row_g_top", "row_g_middle", "row_g_bottom"];
		const colGroupClasses = ["col_g_left", "col_g_center", "col_g_right"];

		const $cells = matrix.map(rowValues => rowValues
			.map((cellValue, colIndex) => {
				return $("<span>")
					.addClass(colGroupClasses[colIndex % 3])
					.addClass(cellValue ? "fixed" : "empty")
					.text(cellValue);
			}));

		const $divArray = $cells.map(($spanArray, rowIndex) => {
			return $("<div>")
				.addClass("row")
				.addClass(rowGroupClasses[rowIndex % 3])
				.append($spanArray);
		});	

		this._$container.append($divArray);	
	}
	layout() {
		const width = $("span:first", this._$container).width();
		$("span", this._$container) 
			.height(width)
			.css({
				"line-height": `${width}px`,
				"font-size": width < 32 ? `${width / 2}px` : ""
			});
	}

	//检查用户解谜的结果，成功则进行提示，失败显示错误的位置标记
	check() {
		const $rows = this._$container.children();
		const data = $rows.map((rowIndex, div) => {
			return $(div).children()
			    .map((colIndex, span) => parseInt($(span).text()) || 0)
		})
		.toArray()
		.map($data => $data.toArray());

	console.log(data);

		const checker = new Checker(data); 
	}
	//重置当前的迷盘到初始状态
	reset() {

	}

	clear() {

	}

	rebuild() {
		this._$container.empty();
		this.build();
		this.layout();
	}

	bindPopup(popupNumbers) {
		this._$container.on("click", "span", e => {
			const $cell = $(e.target);
			popupNumbers.popup($cell);
		})
	}
}

module.exports = Grid;