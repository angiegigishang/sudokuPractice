/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	const Grid = __webpack_require__(1);
	const PopupNumbers = __webpack_require__(6);
	
	const grid = new Grid($("#container"));
	grid.build();
	grid.layout();
	
	const popupNumbers = new PopupNumbers($("#popupNumbers"));
	grid.bindPopup(popupNumbers);
	
	$("#check").on("click", e => {
		grid.check();
	});
	$("#reset").on("click", e => {
		grid.reset();
	});
	$("#clear").on("click", e => {
		grid.clear();
	});
	
	$("#rebuild").on("click", e => {
		grid.rebuild();
	})

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	//生成九宫格
	const Toolkit = __webpack_require__(2);
	const Sudoku = __webpack_require__(3);
	const Checker = __webpack_require__(5);
	
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
			if(checker.check()) {
				return true;
			}	 
			//检查不成功，进行标记
			const marks = checker.matrixMarks;
			this._$container.children()
			    .each((rowIndex, div) => {
			    	$(div).children().each((colIndex, span) => {
			    		const $span = $(span);
			    		if($span.is(".fixed") || marks[rowIndex][colIndex]) {
			    			$span.removeClass("error");
			    		} else {
			    			$(span).addClass("error");		    			
			    		}
	
			    	});
			    });
		}
		//重置当前的迷盘到初始状态
		reset() {
			this._$container.find("span:not(.fixed)")
				.removeClass("error mark1 mark2")
				.addClass("empty")
				.text(0);
		}
		//清理错误标记
		clear() {
			this._$container.find("span.error")
				.removeClass("error")
		}
	
		rebuild() {
			this._$container.empty();
			this.build();
			this.layout();
		}
	
		bindPopup(popupNumbers) {
			this._$container.on("click", "span", e => {
				const $cell = $(e.target);
				if($cell.is(".fixed")) {
					return;
				}
				popupNumbers.popup($cell);
			})
		}
	}
	
	module.exports = Grid;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/*矩阵数组相关工具*/
	const matrixToolkit = {
		makeRow(v = 0) {
			const array = new Array(9);
			array.fill(v);
			return array;
		},
	
		makeMatrix(v = 0) {
			return Array.from({ length: 9 }, () => this.makeRow(v));
		},
	
		shuffle(array) {
			const endIndex = array.length - 2;
			for(let i = 0; i <= endIndex; i++) {
				const j = Math.floor(Math.random() * (array.length - i));
				[array[i], array[j]] = [array[j], array[i]];
			}
			return array;
		},
	
		checkFillable(matrix, n, rowIndex, colIndex) {
			const row = matrix[rowIndex];
			const column = this.makeRow().map((v, i) => matrix[i][colIndex]);
			const { boxIndex } = boxToolkit.convertToBoxIndex(rowIndex, colIndex);
			const box = boxToolkit.getBoxCells(matrix, boxIndex);
			for (let i = 0; i < 9; i++) {
				if (row[i] === n
					|| column[i] === n
					|| box[i] === n)
					return false;
			}
			return true;
		}
	};
	
	/*宫坐标系工具*/
	const boxToolkit = {
		getBoxCells(matrix, boxIndex) {
			const startRowIndex = Math.floor(boxIndex / 3) * 3;
			const startColIndex = boxIndex % 3 * 3;
			const result = [];
			for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
				const rowIndex = startRowIndex + Math.floor( cellIndex / 3);
				const colIndex = startColIndex + cellIndex % 3;
				result.push(matrix[rowIndex][colIndex]);
			}
			return result;
		},
		convertToBoxIndex(rowIndex, colIndex) {
			return {
				boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3),
				cellIndex: rowIndex % 3 * 3 + colIndex % 3
			};
		},
		convertFromBoxIndex(boxIndex, cellIndex) {
			return {
				rowIndex: Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
				colIndex: boxIndex % 3 * 3 + cellIndex % 3
			}
		}
	};
	
	//工具集
	
	
	module.exports = class Toolkit {
		/*矩阵和数据相关工具*/
		static get matrix() {
			return matrixToolkit;
		}
		/*宫坐标系相关工具*/
		static get box() {
			return boxToolkit;
		}
	};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	//生成数独游戏
	
	//1.生成完成的解决方案：Generator
	//2.随机去除部分数据：按比例
	
	const Generator = __webpack_require__(4);
	
	module.exports = class Sudoku {
		constructor () {
			//生成完成的解决方案
			const generator = new Generator();
			generator.generate();
			this.solutionMatrix = generator.matrix;
		}
	
		make (level = 5) {
			//const shouldRid = Math.random() * 9 < level;
			//生成迷盘
			this.puzzleMatrix = this.solutionMatrix.map(row => {
				return row.map(cell => Math.random() * 9 < level ? 0 : cell);
			});
		}
	}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	//生成数独解决方案
	const Toolkit = __webpack_require__(2);
	
	module.exports = class Generator {
		generate () {
			while (!this.internalGenerate()) {
				console.warn("try again");
			}
		}
		internalGenerate () {
			this.matrix = Toolkit.matrix.makeMatrix();
			this.orders = Toolkit.matrix.makeMatrix()
				.map(row => row.map((v, i) => i))
				.map(row => Toolkit.matrix.shuffle(row));
	
			for(let n = 1; n <= 9; n++) {
				if(!this.fillNumber(n)) {
					return false;
				}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
			}
			return true;
		}
	
		fillNumber(n) {
			return this.fillRow(n, 0);
		}
	
		fillRow(n, rowIndex) {
			if(rowIndex > 8) {
				return true;
			}
	
			const row = this.matrix[rowIndex];
			const orders = this.orders[rowIndex];
			for(let i = 0; i < 9; i++) {
				const colIndex = orders[i];
				//如果这个位置已经有值，跳过
				if(row[colIndex]) {
					continue;
				}
	
				//检查这个位置是否可以填n
				if(!Toolkit.matrix.checkFillable(this.matrix, n, rowIndex, colIndex)) {
					continue;
				}
	
				row[colIndex] = n;
				if(!this.fillRow(n, rowIndex + 1)) {
					row[colIndex] = 0;
					continue;
				}
				return true;
			}
			return false;
		}
	}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	
	function checkArray(array) {
		const length = array.length;
		const marks = new Array(length);
		marks.fill(true);
	
		for(let i = 0; i < length - 1; i++) {
			if(!marks[i]) {
				continue;
			}
	
			const v = array[i];
			//是否有效，0无效，1-9有效
			if(!v) {
				marks[i] = false;
				continue;
			}
			//是否有重复 i+1 ~ 9,是否和i位置的数据重复
			for(let j = i + 1; j < length; j++) {
				if(v === array[j]) {
					marks[i] = marks[j] = false;
				}
			}
		}
		return marks;
	}
	
	const Toolkit = __webpack_require__(2);
	//输入： matrix，用户完成的数独数据，9*9
	//处理： 对matrix行，列，宫进行检查，并填写marks
	//输出： 检查是否成功，marks
	module.exports = class Checker {
		constructor(matrix) {
			this._matrix = matrix;
			this._matrixMarks = Toolkit.matrix.makeMatrix(true);      		
		}
	
		get matrixMarks() {
			return this._matrixMarks;
		}
	
		get isSuccess() {
			return this._success;
		}
	
		check() {
			this.checkRows();
			this.checkCols();
			this.checkBoxes();
	
			//检查是否成功
			this._success = this._matrixMarks.every(row => row.every(mark => mark))
			return this._success;
		}
	
		checkRows() {
			for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
				const row = this._matrix[rowIndex];
				const marks = checkArray(row);
	
				for(let colIndex = 0; colIndex < marks.length; colIndex++) {
					if(!marks[colIndex]) {
						this._matrixMarks[rowIndex][colIndex] = false;
					}
				}
			}
		}
	
		checkCols() {
			for(let colIndex = 0; colIndex < 9; colIndex++) {
				const cols = [];
				for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
					cols[rowIndex] = this._matrix[rowIndex][colIndex];
				}
	
				const marks = checkArray(cols);
				for(let rowIndex = 0; rowIndex < marks.length; rowIndex++) {
					if(!marks[rowIndex]) {
						this._matrixMarks[rowIndex][colIndex] = false;
					}
				}
			}
		}
	
		checkBoxes() {
			for(let boxIndex = 0; boxIndex < 9; boxIndex++) {
				const boxes = Toolkit.box.getBoxCells(this._matrix, boxIndex);
				const marks = checkArray(boxes);
				for(let cellIndex = 0; cellIndex < 9; cellIndex++) {
					if(!marks[cellIndex]){
						const {rowIndex, colIndex} = Toolkit.box.convertFromBoxIndex(boxIndex, cellIndex);
						this.matrixMarks[rowIndex][colIndex] = false
					}			
				}	
			}
		}
	}
	
	
	
	


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = class PopupNumbers {
		constructor($panel) {
			this._$panel = $panel.hide().removeClass("hidden");
	
			this._$panel.on("click", "span", e => {
				const $cell = this._$targetCell;
	
				const $span = $(e.target);
	
				if($span.hasClass("mark1")) {
					if($cell.hasClass("mark1")) {
						$cell.removeClass("mark1");
					} else {
						$cell.removeClass("mark2")
						     .addClass("mark1");
					}
				} else if($span.hasClass("mark2")) {
					if($cell.hasClass("mark2")) {
						$cell.removeClass("mark2");
					} else {
						$cell.removeClass("mark1")
						     .addClass("mark2");
					}
				} else if($span.hasClass("empty")) {
					//empty取消数字填写,取消mark
					$cell.text(0)
						 .addClass("empty");
				} else {
					$cell.removeClass("empty").text($span.text());
				}
	
				this.hide();
	
			})
		}
	
		popup($cell) {
			this._$targetCell = $cell;
			const {left, top} = $cell.position();
			this._$panel.css({
				left: `${left}px`,
				top: `${top}px`
			})
			.show()
		}
	
		hide() {
			this._$panel.hide();
		}
	}

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map