/*
jQuery.sheet() The Web Based Spreadsheet
$Id: jquery.sheet.js 415 2011-09-06 00:08:28Z RobertLeePlummerJr $
http://code.google.com/p/jquerysheet/
		
Copyright (C) 2010 Robert Plummer
Dual licensed under the LGPL v2 and GPL v2 licenses.
http://www.gnu.org/licenses/
*/

/*
	Dimensions Info:
		When dealing with size, it seems that outerHeight is generally the most stable cross browser
		attribute to use for bar sizing.  We try to use this as much as possible.  But because col's
		don't have boarders, we subtract or add jS.s.boxModelCorrection for those browsers.
	tr/td column and row Index VS cell/column/row index
		DOM elements are all 0 based (tr/td/table)
		Spreadsheet elements are all 1 based (A1, A1:B4, TABLE2:A1, TABLE2:A1:B4)
		Column/Row/Cell
	DOCTYPE:
		It is recommended to use STRICT doc types on the viewing page when using sheet to ensure that the heights/widths of bars and sheet rows show up correctly
		Example of recommended doc type: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
*/
jQuery.fn.extend({
	sheet: function(settings) {
		jQuery(this).each(function() {
			var parent = jQuery(this);
			var set = jQuery.extend({
				urlGet: 			"sheets/enduser.documentation.html", //local url, if you want to get a sheet from a url
				urlSave: 			"save.html", 					//local url, for use only with the default save for sheet
				editable: 			true, 							//bool, Makes the jSheetControls_formula & jSheetControls_fx appear
				editableTabs:		true,							//bool, If sheet is editable, this allows users to change the tabs by second click
				barMenus:			true,							//bool, if sheet is editable, this will show the mini menu in barTop and barLeft for sheet manipulation
				freezableCells:		false,							//bool, if sheet is editable, this will show the barHandles and allow user to drag them to freeze cells, not yet working.
				allowToggleState: 	true,							//allows the function that changes the spreadsheet's state from static to editable and back
				urlMenu: 			"menu.html", 					//local url, for the menu to the left of title
				menu:			'',							//menu AS STRING!, overrides urlMenu
				newColumnWidth: 	120, 							//int, the width of new columns or columns that have no width assigned
				title: 				null, 							//html, general title of the sheet group
				inlineMenu:			null, 							//html, menu for editing sheet
				buildSheet: 		false,							//bool, string, or object
																		//bool true - build sheet inside of parent
																		//bool false - use urlGet from local url
																		//string  - '{number_of_cols}x{number_of_rows} (5x100)
																		//object - table
				calcOff: 			false, 							//bool, turns calculationEngine off (no spreadsheet, just grid)
				log: 				false, 							//bool, turns some debugging logs on (jS.log('msg'))
				lockFormulas: 		false, 							//bool, turns the ability to edit any formula off
				parent: 			parent, 					//object, sheet's parent, DON'T CHANGE
				colMargin: 			18, 							//int, the height and the width of all bar items, and new rows
				fnSave: 			function() { parent.getSheet().saveSheet(); }, //fn, default save function, more of a proof of concept
				fnOpen: 			function() { 					//fn, by default allows you to paste table html into a javascript prompt for you to see what it looks likes if you where to use sheet
										var t = prompt('Paste your table html here');
										if (t) {
											parent.getSheet().openSheet(t);
										}
				},
				fnClose: 			function() {}, 					//fn, default clase function, more of a proof of concept
				
				boxModelCorrection: 2, 								//int, attempts to correct the differences found in heights and widths of different browsers, if you mess with this, get ready for the must upsetting and delacate js ever
				calculations:		{},								//object, used to extend the standard functions that come with sheet
				cellSelectModel: 	'excel',						//string, 'excel' || 'oo' || 'gdocs' Excel sets the first cell onmousedown active, openoffice sets the last, now you can choose how you want it to be ;)
				autoAddCells:		true,							//bool, when user presses enter on the last row/col, this will allow them to add more cells, thus improving performance and optimizing modification speed
				resizable: 			true,							//bool, makes the $(obj).sheet(); object resizeable, also adds a resizable formula textarea at top of sheet
				autoFiller: 		false,							//bool, the little guy that hangs out to the bottom right of a selected cell, users can click and drag the value to other cells
				minSize: 			{rows: 15, cols: 5},			//object - {rows: int, cols: int}, Makes the sheet stay at a certain size when loaded in edit mode, to make modification more productive
				forceColWidthsOnStartup:true,						//bool, makes cell widths load from pre-made colgroup/col objects, use this if you plan on making the col items, makes widths more stable on startup
				alertFormulaErrors:	false
			}, settings);
			
			if (jQuery.sheet.instance) {
				parent.sheetInstance = jQuery.sheet.createInstance(set, jQuery.sheet.instance.length, parent);
				jQuery.sheet.instance.push(parent.sheetInstance);
			} else {
				parent.sheetInstance = jQuery.sheet.createInstance(set, 0, parent);
				jQuery.sheet.instance = [parent.sheetInstance];
			}
			parent.attr('sheetInstance', jQuery.sheet.instance.length - 1);
		});
		return this;
	},
	disableSelectionSpecial : function() { 
	        this.each(function() { 
	                this.onselectstart = function() { return false; }; 
	                this.unselectable = "on"; 
	                jQuery(this).css('-moz-user-select', 'none'); 
	        });
			return this;
	},
	getSheet: function() {
		var I = parseInt(jQuery(this).attr('sheetInstance'));
		if (!isNaN(I)) {
			return jQuery.sheet.instance[I];
		}
		return false;
	},
	getCellValue: function(row, col, sheet) {
		var jS = $(this).getSheet();
		sheet = (sheet ? sheet : 0);
		try {
			return jS.spreadsheets[sheet][row][col].value;
		} catch(e) {
			return "";
		}
	}
});

jQuery.sheet = {
	createInstance: function(s, I, origParent) { //s = jQuery.sheet settings, I = jQuery.sheet Instance Integer
		var jS = {
			version: '2.0.x trunk',
			i: 0,
			I: I,
			sheetCount: 0,
			spreadsheets: [], //the actual spreadsheets are going to be populated here
			obj: {//obj = object references
				//Please note, class references use the tag name because it's about 4 times faster
				autoFiller:			function() { return jQuery('#' + jS.id.autoFiller + jS.i); },
				barCorner:			function() { return jQuery('#' + jS.id.barCorner + jS.i); },
				barCornerAll:		function() { return s.parent.find('div.' + jS.cl.barCorner); },
				barCornerParent:	function() { return jQuery('#' + jS.id.barCornerParent + jS.i); },
				barCornerParentAll: function() { return s.parent.find('td.' + jS.cl.barCornerParent); },
				barHelper:			function() { return jQuery('div.' + jS.cl.barHelper); },
				barLeft: 			function() { return jQuery('#' + jS.id.barLeft + jS.i); },
				barLeftAll:			function() { return s.parent.find('div.' + jS.cl.barLeft); },
				barLeftParent: 		function() { return jQuery('#' + jS.id.barLeftParent + jS.i); },
				barLeftParentAll:	function() { return s.parent.find('div.' + jS.cl.barLeftParent); },
				barLeftHandle:		function() { return jQuery('#' + jS.id.barLeftHandle); },
				barLeftMenu:		function() { return jQuery('#' + jS.id.barLeftMenu); },
				barTop: 			function() { return jQuery('#' + jS.id.barTop + jS.i); },
				barTopAll:			function() { return s.parent.find('div.' + jS.cl.barTop); },
				barTopParent: 		function() { return jQuery('#' + jS.id.barTopParent + jS.i); },
				barTopParentAll:	function() { return s.parent.find('div.' + jS.cl.barTopParent); },
				barTopHandle:		function() { return jQuery('#' + jS.id.barTopHandle); },
				barTopMenuParent:	function() { return jQuery('#' + jS.id.barTopMenuParent); },
				barTopMenu:			function() { return jQuery('#' + jS.id.barTopMenu); },
				cellActive:			function() { return jQuery(jS.cellLast.td); },
				cellMenu:			function() { return jQuery('#' + jS.id.cellMenu); },
				cellHighlighted:	function() { return jQuery(jS.highlightedLast.td); },
				chart:				function() { return jQuery('div.' + jS.cl.chart); },
				controls:			function() { return jQuery('#' + jS.id.controls); },
				formula: 			function() { return jQuery('#' + jS.id.formula); },
				fullScreen:			function() { return jQuery('div.' + jS.cl.fullScreen); },
				inlineMenu:			function() { return jQuery('#' + jS.id.inlineMenu); },
				inPlaceEdit:		function() { return jQuery('#' + jS.id.inPlaceEdit); },
				label: 				function() { return jQuery('#' + jS.id.label); },
				menu:				function() { return jQuery('#' + jS.id.menu); },
				pane: 				function() { return jQuery('#' + jS.id.pane + jS.i); },
				paneAll:			function() { return s.parent.find('div.' + jS.cl.pane); },
				parent: 			function() { return s.parent; },
				sheet: 				function() { return jQuery('#' + jS.id.sheet + jS.i); },
				sheetAll: 			function() { return s.parent.find('table.' + jS.cl.sheet); },
				tab:				function() { return jQuery('#' + jS.id.tab + jS.i); },
				tabAll:				function() { return this.tabContainer().find('a.' + jS.cl.tab); },
				tabContainer:		function() { return jQuery('#' + jS.id.tabContainer); },
				tableBody: 			function() { return document.getElementById(jS.id.sheet + jS.i); },
				tableControl:		function() { return jQuery('#' + jS.id.tableControl + jS.i); },
				tableControlAll:	function() { return s.parent.find('table.' + jS.cl.tableControl); },
				title:				function() { return jQuery('#' + jS.id.title); },
				ui:					function() { return jQuery('#' + jS.id.ui); },
				uiActive:			function() { return s.parent.find('div.' + jS.cl.uiActive); }
			},
			id: {
				/*
					id = id's references
					Note that these are all dynamically set
				*/
				autoFiller:			'jSheetAutoFiller_' + I + '_',
				barCorner:			'jSheetBarCorner_' + I + '_',
				barCornerParent:	'jSheetBarCornerParent_' + I + '_',
				barLeft: 			'jSheetBarLeft_' + I + '_',
				barLeftParent: 		'jSheetBarLeftParent_' + I + '_',
				barLeftHandle:		'jSheetBarLeftHandle_' + I,
				barLeftMenu:		'jSheetBarLeftMenu_' + I,
				barTop: 			'jSheetBarTop_' + I + '_',
				barTopParent: 		'jSheetBarTopParent_' + I + '_',
				barTopHandle:		'jSheetBarTopHandle',
				barTopMenu:			'jSheetBarTopMenu_' + I,
				barTopMenuParent:	'jSheetBarTopMenuParent_' + I,
				cellMenu:			'jSheetCellMenu_' + I,
				controls:			'jSheetControls_' + I,
				formula: 			'jSheetControls_formula_' + I,
				inlineMenu:			'jSheetInlineMenu_' + I,
				inPlaceEdit:		'jSheetInPlaceEdit_' + I,
				label: 				'jSheetControls_loc_' + I,
				menu:				'jSheetMenu_' + I,
				pane: 				'jSheetEditPane_' + I + '_',
				sheet: 				'jSheet_' + I + '_',
				tableControl:		'tableControl_' + I + '_',
				tab:				'jSheetTab_' + I + '_',
				tabContainer:		'jSheetTabContainer_' + I,
				title:				'jSheetTitle_' + I,
				ui:					'jSheetUI_' + I
			},
			cl: {
				/*
					cl = class references
				*/
				autoFiller:				'jSheetAutoFiller',
				autoFillerHandle:		'jSheetAutoFillerHandle',
				autoFillerConver:		'jSheetAutoFillerCover',
				barCorner:				'jSheetBarCorner',
				barCornerParent:		'jSheetBarCornerParent',
				barHelper:				'jSheetBarHelper',
				barLeftTd:				'jSheetBarLeftTd',
				barLeft: 				'jSheetBarLeft',
				barLeftHandle:			'jSheetBarLeftHandle',
				barLeftParent: 			'jSheetBarLeftParent',
				barTop: 				'jSheetBarTop',
				barTopHandle:			'jSheetBarTopHandle',
				barTopParent: 			'jSheetBarTopParent',
				barTopTd:				'jSheetBarTopTd',
				cellActive:				'jSheetCellActive',
				cellHighlighted: 		'jSheetCellHighighted',
				chart:					'jSheetChart',
				controls:				'jSheetControls',
				error:					'jSheetError',
				formula: 				'jSheetControls_formula',
				formulaParent:			'jSheetControls_formulaParent',
				inlineMenu:				'jSheetInlineMenu',
				fullScreen:				'jSheetFullScreen',
				inPlaceEdit:			'jSheetInPlaceEdit',
				menu:					'jSheetMenu',
				parent:					'jSheetParent',
				sheet: 					'jSheet',
				sheetPaneTd:			'sheetPane',
				label: 					'jSheetControls_loc',
				pane: 					'jSheetEditPane',
				tab:					'jSheetTab',
				tabContainer:			'jSheetTabContainer',
				tabContainerFullScreen: 'jSheetFullScreenTabContainer',
				tableControl:			'tableControl',
				title:					'jSheetTitle',
				toggle:					'cellStyleToggle',
				ui:						'jSheetUI',
				uiAutoFiller:			'ui-state-active',
				uiActive:				'ui-state-active',
				uiBar: 					'ui-widget-header',
				uiBarHighlight: 		'ui-state-highlight',
				uiBarLeftHandle:		'ui-state-default',
				uiBarLeftMenu:			'ui-state-default ui-corner-top',
				uiBarTopHandle:			'ui-state-default',
				uiBarTopMenu:			'ui-state-default ui-corner-top',
				uiCellActive:			'ui-state-active',
				uiCellHighlighted: 		'ui-state-highlight',
				uiControl: 				'ui-widget-header ui-corner-top',
				uiControlTextBox:		'ui-widget-content',
				uiError:				'ui-state-error',
				uiFullScreen:			'ui-widget-content ui-corner-all',
				uiInPlaceEdit:			'ui-state-active',
				uiMenu:					'ui-state-default',
				uiMenuUl: 				'ui-widget-header',
				uiMenuLi: 				'ui-widget-header',
				uiMenuHighlighted: 		'ui-state-highlight',
				uiPane: 				'ui-widget-content',
				uiParent: 				'ui-widget-content ui-corner-all',
				uiSheet:				'ui-widget-content',
				uiTab:					'ui-widget-header',
				uiTabActive:			'ui-state-highlight'
			},
			msg: { /*msg = messages used throught sheet, for easy access to change them for other languages*/
				addRowMulti: 			"How many rows would you like to add?",
				addColumnMulti: 		"How many columns would you like to add?",
				newSheet: 				"What size would you like to make your spreadsheet? Example: '5x10' creates a sheet that is 5 columns by 10 rows.",
				openSheet: 				"Are you sure you want to open a different sheet?  All unsaved changes will be lost.",
				cellFind: 				"No results found.",
				toggleHideRow:			"No row selected.",
				toggleHideColumn: 		"Now column selected.",
				merge:					"Merging is not allowed on the first row.",
				evalError:				"Error, functions as formulas not supported.",
				menuInsertColumnAfter: 	"Insert column after",
				menuInsertColumnBefore: "Insert column before",
				menuAddColumnEnd:		"Add column to end",
				menuDeleteColumn:		"Delete this column",
				menuInsertRowAfter: 	"Insert row after",
				menuInsertRowBefore:	"Insert row before",
				menuAddRowEnd:			"Add row to end",
				menuDeleteRow:			"Delete this row",
				menuAddSheet:			"Add spreadsheet",
				menuDeleteSheet:		"Delete spreadsheet"
			},
			kill: function() { /* For ajax manipulation, kills this instance of sheet entirley */
				jS.obj.tabContainer().remove();
				jS.obj.fullScreen().remove();
				jS.obj.inPlaceEdit().remove();
				origParent
					.removeClass(jS.cl.uiParent)
					.html('')
					.removeAttr('sheetInstance');
				cE = s = jQuery.sheet.instance[I] = jS = null;
				delete cE;
				delete s;
				delete jQuery.sheet.instance[I];
				delete jS;
			},
			trigger: function(eventType, extraParameters) {
				//wrapper for jQuery trigger of origParent, in case of further mods in the future
				extraParameters = (extraParameters ? extraParameters : []);
				origParent.trigger(eventType, [jS].concat(extraParameters));
			},
			spreadsheetsToArray: function(forceRebuild) {
				if (forceRebuild || jS.spreadsheets.length == 0) {
					jS.cycleCellsAll(function(sheet, row, col) {
						var td = jQuery(this);
						jS.createCell(sheet, row, col, td.text(), td.attr('formula'));
					});
				}
				return jS.spreadsheets;
			},
			spreadsheetToArray: function(forceRebuild, i) {
				i = (i ? i : jS.i);
				if (forceRebuild || !jS.spreadsheets[i]) {
					jS.cycleCells(function(sheet, row, col) {
						var td = jQuery(this);
						jS.createCell(sheet, row, col, td.text(), td.attr('formula'));
					});
				}
			},
			createCell: function(sheet, row, col, value, formula, calcCount, calcLast) {
				if (!jS.spreadsheets[sheet]) jS.spreadsheets[sheet] = [];
				if (!jS.spreadsheets[sheet][row]) jS.spreadsheets[sheet][row] = [];
				

				jS.spreadsheets[sheet][row][col] = {
					formula: formula,
					value: value,
					calcCount: (calcCount ? calcCount : 0),
					calcLast: (calcLast ? calcLast : -1)
				};
				
				return jS.spreadsheets[sheet][row][col];
			},
			nav: false,
			setNav: function(nav) {
				jQuery(jQuery.sheet.instance).each(function() {
					this.nav = false;
				});
			
				jS.nav = nav;
			},
			controlFactory: { /* controlFactory creates the different objects requied by sheet */
				addRowMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi rows
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
															skipFormulaReparse: bool, re-parses formulas if needed
														*/
					if (!qty) {
						qty = prompt(jS.msg.addRowMulti);
					}
					if (qty) {
						if (!isNaN(qty))
							jS.controlFactory.addCells(null, isBefore, null, parseInt(qty), 'row', skipFormulaReparse);
					}
				},
				addColumnMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi columns
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
															skipFormulaReparse: bool, re-parses formulas if needed
														*/
					if (!qty) {
						qty = prompt(jS.msg.addColumnMulti);
					}
					if (qty) {
						if (!isNaN(qty))
							jS.controlFactory.addCells(null, isBefore, null, parseInt(qty), 'col', skipFormulaReparse);
					}
				},
				addCells: function(eq, isBefore, eqO, qty, type, skipFormulaReparse) { /*creates cells for sheet and the bars that go along with them
																		eq: int, position where cells should be added;
																		isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end;
																		eq0: no longer used, kept for legacy;
																		qty: int, how many rows/columsn to add;
																		type: string - "col" || "row", determans the type of cells to add;
																		skipFormulaReparse: bool, re-parses formulas if needed
																*/
					//hide the autoFiller, it can get confused
					if (s.autoFiller) {
						jS.obj.autoFiller().hide();
					}
					
					jS.setDirty(true);
					jS.obj.barHelper().remove();
					
					var sheet = jS.obj.sheet();
					var sheetWidth = sheet.width();
					
					//jS.evt.cellEditAbandon();
					
					qty = (qty ? qty : 1);
					type = (type ? type : 'col');
					
					//var barLast = (type == 'row' ? jS.rowLast : jS.colLast);
					var cellLastBar = (type == 'row' ? jS.cellLast.row : jS.cellLast.col);
					
					if (!eq) {
						if (cellLastBar == -1) {
							eq = ':last';
						} else {
							eq = ':eq(' + cellLastBar + ')';
						}
					} else if (!isNaN(eq)){
						eq = ':eq(' + (eq) + ')';
					}
					
					var o;
					switch (type) {
						case "row":
							o = {
								bar: jS.obj.barLeft().children('div' + eq),
								barParent: jS.obj.barLeft(),
								cells: function() {
									return sheet.find('tr' + eq);
								},
								col: function() { return ''; },
								newBar: '<div class="' + jS.cl.uiBar + '" style="height: ' + (s.colMargin - s.boxModelCorrection) + 'px;" />',
								size: function() {
									return jS.getTdLocation(o.cells().find('td:last'));
								},
								loc: function() {
									return jS.getTdLocation(o.cells().find('td:first'));
								},
								newCells: function() {
									var j = o.size().col;
									var newCells = '';
									
									for (var i = 0; i <= j; i++) {
										newCells += '<td />';
									}
									
									return '<tr style="height: ' + s.colMargin + 'px;">' + newCells + '</tr>';
								},
								newCol: '',
								reLabel: function() {								
									o.barParent.children().each(function(i) {
										jQuery(this).text(i + 1);
									});
								},
								dimensions: function(bar, cell, col) {
									bar.height(cell.height(s.colMargin).outerHeight() - s.boxModelCorrection);
								},
								offset: {row: qty,col: 0}
							};
							break;
						case "col":
							o = {
								bar: jS.obj.barTop().children('div' + eq),
								barParent: jS.obj.barTop(),
								cells: function() {
									var cellStart = sheet.find('tr:first').children(eq);
									var cellEnd = sheet.find('td:last');
									var loc1 = jS.getTdLocation(cellStart);
									var loc2 = jS.getTdLocation(cellEnd);
									
									//we get the first cell then get all the other cells directly... faster ;)
									var cells = jQuery(jS.getTd(jS.i, loc1.row, loc1.col));
									var cell;
									for (var i = 1; i <= loc2.row; i++) {
										cells.push(jS.getTd(jS.i, i, loc1.col));
									}
									
									return cells;
								},
								col: function() {
									return sheet.find('col' + eq);
								},
								newBar: '<div class="' + jS.cl.uiBar + '"/>',
								newCol: '<col />',
								loc: function(cells) {
									cells = (cells ? cells : o.cells());
									return jS.getTdLocation(cells.first());
								},
								newCells: function() {
									return '<td />';
								},
								reLabel: function() {
									o.barParent.children().each(function(i) {
										jQuery(this).text(jSE.columnLabelString(i));
									});
								},
								dimensions: function(bar, cell, col) {								
									var w = s.newColumnWidth;
									col
										.width(w)
										.css('width', w + 'px')
										.attr('width', w + 'px');
									
									bar
										.width(w - s.boxModelCorrection);
									
									sheet.width(sheetWidth + (w * qty));
								},
								offset: {row: 0, col: qty}
							};
							break;
					}
					
					//make undoable
					jS.cellUndoable.add(jQuery(sheet).add(o.barParent));
					
					var cells = o.cells();
					var loc = o.loc(cells);	
					var col = o.col();
					
					var newBar = o.newBar;
					var newCell = o.newCells();
					var newCol = o.newCol;
					
					var newCols = '';
					var newBars = '';
					var newCells = '';
					
					for (var i = 0; i < qty; i++) { //by keeping these variables strings temporarily, we cut down on using system resources
						newCols += newCol;
						newBars += newBar;
						newCells += newCell;
					}
					
					newCols = jQuery(newCols);
					newBars = jQuery(newBars);
					newCells = jQuery(newCells);
					
					if (isBefore) {
						cells.before(newCells);
						o.bar.before(newBars);
						jQuery(col).before(newCols);
					} else {
						cells.after(newCells);
						o.bar.after(newBars);
						jQuery(col).after(newCols);
					}
					
					jS.setTdIds(sheet, jS.i);
					
					o.dimensions(newBars, newCells, newCols);
					o.reLabel();

					jS.obj.pane().scroll();
					
					if (!skipFormulaReparse && eq != ':last') {
						//offset formulas
						jS.offsetFormulas(loc, o.offset, isBefore);
					}
					
					//Because the line numbers get bigger, it is possible that the bars have changed in size, lets sync them
					jS.sheetSyncSize();
					
					//Let's make it redoable
					jS.cellUndoable.add(jQuery(sheet).add(o.barParent));
				},
				addRow: function(atRow, isBefore, atRowQ) {/* creates single row
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
														*/
					jS.controlFactory.addCells(atRow, isBefore, atRowQ, 1, 'row');
					jS.trigger('addRow', [atRow, isBefore, atRowQ, 1]);
				},
				addColumn: function(atColumn, isBefore, atColumnQ) {/* creates single column
															qty: int, the number of cells you'd like to add, if not specified, a dialog will ask; 
															isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
														*/
					jS.controlFactory.addCells(atColumn, isBefore, atColumnQ, 1, 'col');
					jS.trigger('addColumn', [atRow, isBefore, atRowQ, 1]);
				},
				barLeft: function(reloadHeights, o) { /* creates all the bars to the left of the spreadsheet
															reloadHeights: bool, reloads all the heights of each bar from the cells of the sheet;
															o: object, the table/spreadsheeet object
													*/
					jS.obj.barLeft().remove();
					var barLeft = jQuery('<div border="1px" id="' + jS.id.barLeft + jS.i + '" class="' + jS.cl.barLeft + '" />');
					var heightFn;
					if (reloadHeights) { //This is our standard way of detecting height when a sheet loads from a url
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.outerHeight()) - s.boxModelCorrection);
						};
					} else { //This way of detecting height is used becuase the object has some problems getting
							//height because both tr and td have height set
							//This corrects the problem
							//This is only used when a sheet is already loaded in the pane
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.css('height').replace('px','')) - s.boxModelCorrection);
						};
					}
					
					o.find('tr').each(function(i) {
						var child = jQuery('<div>' + (i + 1) + '</div>');
						barLeft.append(child);
						heightFn(i, jQuery(this), child);
					});
					
					jS.evt.barMouseDown.height(
						jS.obj.barLeftParent().append(barLeft)
					);
				},
				barTop: function(reloadWidths, o) { /* creates all the bars to the top of the spreadsheet
															reloadWidths: bool, reloads all the widths of each bar from the cells of the sheet;
															o: object, the table/spreadsheeet object
													*/
					jS.obj.barTop().remove();
					var barTop = jQuery('<div id="' + jS.id.barTop + jS.i + '" class="' + jS.cl.barTop + '" />');
					barTop.height(s.colMargin);
					
					var parents;
					var widthFn;
					
					if (reloadWidths) {
						parents = o.find('tr:first').children();
						widthFn = function(obj) {
							return jS.attrH.width(obj);
						};
					} else {
						parents = o.find('col');
						widthFn = function(obj) {

							return parseInt(jQuery(obj).css('width').replace('px','')) - s.boxModelCorrection;
						};
					}
					
					parents.each(function(i) {
						var v = jSE.columnLabelString(i);
						var w = widthFn(this);
						
						var child = jQuery("<div>" + v + "</div>")
							.width(w)
							.height(s.colMargin);
						barTop.append(child);
					});
					
					jS.evt.barMouseDown.width(
						jS.obj.barTopParent().append(barTop)
					);
				},
				barTopHandle: function(bar, i) {
					if (jS.busy) return false;
					if (i != 0) return false;
					jS.obj.barHelper().remove();
					
					var target = jS.obj.barTop().children().eq(i);
					
					var pos = target.position();

					var barTopHandle = jQuery('<div id="' + jS.id.barTopHandle + '" class="' + jS.cl.uiBarTopHandle + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopHandle + '" />')
						.height(s.colMargin - 2)
						.css('left', pos.left + 'px')
						.appendTo(bar);
					
					jS.draggable(barTopHandle, {
						axis: 'x',
						start: function() {
							jS.busy = true;
						},
						stop: function() {
							jS.busy = false;
						}
					});
				},
				barLeftHandle: function(bar, i) {
					if (jS.busy) return false;
					if (i != 0) return false;
					jS.obj.barHelper().remove();
					
					var target = jS.obj.barLeft().children().eq(i);
					
					var pos = target.position();

					var barLeftHandle = jQuery('<div id="' + jS.id.barLeftHandle + '" class="' + jS.cl.uiBarLeftHandle + ' ' + jS.cl.barHelper + ' ' + jS.cl.barLeftHandle + '" />')
						.width(s.colMargin - 6)
						.height(s.colMargin / 3)
						.css('top', pos.top + 'px')
						.appendTo(bar);
					
					jS.draggable(barLeftHandle, {
						axis: 'y',
						start: function() {
							jS.busy = true;
						},
						stop: function() {
							jS.busy = false;
						}
					});
				},
				makeMenu: function(bar, menuItems) {
					var menu;
					function addLink(msg, fn) {
						switch (msg) {
							case "line":
								jQuery('<hr />').appendTo(menu);
								break;
							default:
								jQuery('<div>' + msg + '</div>').click(function() {
									fn();
									return false;
								}).appendTo(menu);
						}
							
					}
					
					switch (bar) {
						case "top":
							menu = jQuery('<div id="' + jS.id.barTopMenu + '" class="' + jS.cl.uiMenu + ' ' + jS.cl.barHelper + '" />');
							break;
						case "left":
							menu = jQuery('<div id="' + jS.id.barLeftMenu + '" class="' + jS.cl.uiMenu + ' ' + jS.cl.barHelper + '" />');
							break;
						case "cell":
							menu = jQuery('<div id="' + jS.id.cellMenu + '" class="' + jS.cl.uiMenu + ' ' + jS.cl.barHelper + '" />');
							break;
					}
					
					menu
						.width(s.newColumnWidth)
						.mouseleave(function() {
							menu.hide();
						})
						.appendTo('body')
						.hide();
					
					jQuery(menuItems).each(function() {
						addLink(this.msg, this.fn);
					});
					
					return menu;
				},
				barTopMenu: function(e, i, target) {
					if (jS.busy) return false;
					var menu = jS.obj.barTopMenu().hide();
					
					if (i) jS.obj.barTopHandle().remove();
					var menu;
					
					if (!menu.length) {
						menu = jS.controlFactory.makeMenu('top', [{
							msg: jS.msg.menuInsertColumnAfter,
							fn: function(){
								jS.controlFactory.addColumn();
								return false;
							}
						}, {
							msg: jS.msg.menuInsertColumnBefore,
							fn: function(){
								jS.controlFactory.addColumn(null, true);
								return false;
							}
						}, {
							msg: jS.msg.menuAddColumnEnd,
							fn: function(){
								jS.controlFactory.addColumn(':last');
								return false;
							}
						}, {
							msg: jS.msg.menuDeleteColumn,
							fn: function(){
								jS.deleteColumn();
								return false;
							}
						}]);
					}
					
					if (!target) {
						menu
							.css('left', (e.pageX - 5) + 'px')
							.css('top', (e.pageY - 5) + 'px')
							.show();
						return menu;
					}

					var barTopMenuParent = jS.obj.barTopMenuParent().hide();
					
					if (!barTopMenuParent.length) {
					
						barTopMenuParent = jQuery('<div id="' + jS.id.barTopMenuParent + '" class="' + jS.cl.uiBarTopMenu + ' ' + jS.cl.barHelper + '">' +
								'<span class="ui-icon ui-icon-triangle-1-s" /></span>' +
							'</div>')
							.click(function(e) {
								barTopMenuParent.parent()
									.mousedown()
									.mouseup();
								
								var offset = barTopMenuParent.offset();
								
								menu
									.css('left', (offset.left - (s.newColumnWidth - s.colMargin)) + 'px')
									.css('top', (offset.top + (s.colMargin * .8)) + 'px')
									.show();
							})
							.blur(function() {
								if (menu) menu.hide();
							})
							.height(s.colMargin);
					}
					
					barTopMenuParent
						.appendTo(target)
						.show();
				},
				barLeftMenu: function(e, i) {
					if (jS.busy) return false;
					jS.obj.barLeftMenu().hide();
					
					if (i) jS.obj.barLeftHandle().remove();
					var menu;
					
					menu = jS.obj.barLeftMenu();
					
					if (!menu.length) {
						menu = jS.controlFactory.makeMenu('left', [{
								msg: jS.msg.menuInsertRowAfter,
								fn: function(){
									jS.controlFactory.addRow();
									return false;
								}
							}, {
								msg: jS.msg.menuInsertRowBefore,
								fn: function(){
									jS.controlFactory.addRow(null, true);
									return false;
								}
							}, {
								msg: jS.msg.menuAddRowEnd,
								fn: function(){
									jS.controlFactory.addRow(':last');
									return false;
								}
							}, {
								msg: jS.msg.menuDeleteRow,
								fn: function(){
									jS.deleteRow();
									return false;
								}
							}]);
					}
					
					menu
						.css('left', (e.pageX - 5) + 'px')
						.css('top', (e.pageY - 5) + 'px')
						.show();
				},
				cellMenu: function(e) {
					if (jS.busy) return false;
					jS.obj.cellMenu().hide();
					
					var menu = jS.obj.cellMenu();
					
					if (!menu.length) {
						menu = jS.controlFactory.makeMenu('cell', [{
								msg: jS.msg.menuInsertColumnAfter,
								fn: function(){
									jS.controlFactory.addColumn();
									return false;
								}
							}, {
								msg: jS.msg.menuInsertColumnBefore,
								fn: function(){
									jS.controlFactory.addColumn(null, true);
									return false;
								}
							}, {
								msg: jS.msg.menuAddColumnEnd,
								fn: function(){
									jS.controlFactory.addColumn(':last');
									return false;
								}
							}, {
								msg: jS.msg.menuDeleteColumn,
								fn: function(){
									jS.deleteColumn();
									return false;
								}
							}, {
								msg: "line"
							},{
								msg: jS.msg.menuInsertRowAfter,
								fn: function(){
									jS.controlFactory.addRow();
									return false;
								}
							}, {
								msg: jS.msg.menuInsertRowBefore,
								fn: function(){
									jS.controlFactory.addRow(null, true);
									return false;
								}
							}, {
								msg: jS.msg.menuAddRowEnd,
								fn: function(){
									jS.controlFactory.addRow(':last');
									return false;
								}
							}, {
								msg: jS.msg.menuDeleteRow,
								fn: function(){
									jS.deleteRow();
									return false;
								}
							}, {
								msg: 'line'
							}, {
								msg: jS.msg.menuAddSheet,
								fn: function() {
									jS.addSheet('5x10');
								}
							}, {
								msg: jS.msg.menuDeleteSheet,
								fn: function() {
									jS.deleteSheet();
								}
							}]);
					}
					
					menu
						.css('left', (e.pageX - 5) + 'px')
						.css('top', (e.pageY - 5) + 'px')
						.show();
				},
				header: function() { /* creates the control/container for everything above the spreadsheet */
					jS.obj.controls().remove();
					jS.obj.tabContainer().remove();
					
					var header = jQuery('<div id="' + jS.id.controls + '" class="' + jS.cl.controls + '"></div>');
					
					var firstRow = jQuery('<table cellpadding="0" cellspacing="0" border="0"><tr /></table>').prependTo(header);
					var firstRowTr = jQuery('<tr />');
					
					if (s.title) {
						var title;
						if (jQuery.isFunction(s.title)) {
							title = jS.title(jS);
						} else {
							title = s.title;
						}
						firstRowTr.append(jQuery('<td id="' + jS.id.title + '" class="' + jS.cl.title + '" />').html(title));
					}
					
					if (s.inlineMenu && jS.isSheetEditable()) {
						var inlineMenu;
						if (jQuery.isFunction(s.inlineMenu)) {
							inlineMenu = s.inlineMenu(jS);
						} else {
							inlineMenu = s.inlineMenu;
						}
						firstRowTr.append(jQuery('<td id="' + jS.id.inlineMenu + '" class="' + jS.cl.inlineMenu + '" />').html(inlineMenu));
					}
					
					if (jS.isSheetEditable()) {
						//Sheet Menu Control
						function makeMenu(ulMenu) {
							var menu = jQuery('<td id="' + jS.id.menu + '" class="' + jS.cl.menu + '" />')
								.html(
									ulMenu
										.replace(/sheetInstance/g, "jQuery.sheet.instance[" + I + "]")
										.replace(/menuInstance/g, I));
										
								menu
									.prependTo(firstRowTr)
									.find("ul").hide()
									.addClass(jS.cl.uiMenuUl)
									.first().show();
								
								menu
									.find("li")
										.addClass(jS.cl.uiMenuLi)
										.hover(function(){
											jQuery(this).find('ul:first')
												.hide()
												.show();
										},function(){
											jQuery(this).find('ul:first')
												.hide();
										});
							return menu;
						}
						
						if (s.menu) {
							makeMenu(s.menu);
						} else {
							jQuery('<div />').load(s.urlMenu, function() {
								makeMenu(jQuery(this).html());
							});
						}
						
						//Edit box menu
						var secondRow = jQuery('<table cellpadding="0" cellspacing="0" border="0">' +
								'<tr>' +
									'<td id="' + jS.id.label + '" class="' + jS.cl.label + '"></td>' +
									'<td class="' + jS.cl.formulaParent + '">' +
										'<textarea id="' + jS.id.formula + '" class="' + jS.cl.formula + '"></textarea>' +
									'</td>' +
								'</tr>' +
							'</table>')
							.appendTo(header)
							.find('textarea')
								.keydown(jS.evt.keyDownHandler.formulaKeydown)
								.keyup(function() {
									jS.obj.inPlaceEdit().val(jS.obj.formula().val());
								})
								.change(function() {
									jS.obj.inPlaceEdit().val(jS.obj.formula().val());
								})
								.bind('paste', jS.evt.pasteOverCells)
								.focus(function() {
									jS.setNav(false);
								})
								.focusout(function() {
									jS.setNav(true);
								})
								.blur(function() {
									jS.setNav(true);
								});
						
						jQuery(jQuery.sheet.instance).each(function() {
							this.nav = false;
						});
						
						jS.setNav(true);
						
						jQuery(document)
							.unbind('keydown')
							.keydown(jS.evt.keyDownHandler.documentKeydown);
					}
					
					firstRowTr.appendTo(firstRow);
					
					var tabParent = jQuery('<div id="' + jS.id.tabContainer + '" class="' + jS.cl.tabContainer + '" />')
						.mousedown(function(e) {
							jS.trigger('switchSpreadsheet', [jQuery(e.target).attr('i') * 1]);
							return false;
						})
						.dblclick(function(e) {
							jS.trigger('renameSpreadsheet', [jQuery(e.target).attr('i') * 1]);
							return 
						});
					
					
					if (jS.isSheetEditable()) {
						var addSheet = jQuery('<span class="' + jS.cl.uiTab + ' ui-corner-bottom" title="Add a spreadsheet" i="-1">+</span>').appendTo(tabParent);
						
						if (jQuery.fn.sortable) {
							var startPosition;
							
							tabParent.sortable({
								placeholder: 'ui-state-highlight',
								axis: 'x',
								forceHelperSize: true,
								forcePlaceholderSize: true,
								opacity: 0.6,
								cancel: 'span[i="-1"]',
								start: function(e, ui) {
									startPosition = ui.item.index();
									jS.trigger('tabSortstart', [e, ui]);
								},
								update: function(e, ui) {
									jS.trigger('tabSortupdate', [e, ui, startPosition]);
								}
							});
						}
					} else {
						jQuery('<span />').appendTo(tabParent);
					}

					s.parent
						.html('')
						.append(header) //add controls header
						.append('<div id="' + jS.id.ui + '" class="' + jS.cl.ui + '">') //add spreadsheet control
						.after(tabParent);
				},
				sheetUI: function(o, i, fn, reloadBars) { /* creates the spreadsheet user interface
															o: object, table object to be used as a spreadsheet;
															i: int, the new count for spreadsheets in this instance;
															fn: function, called after the spreadsheet is created and tuned for use;
															reloadBars: bool, if set to true reloads id bars on top and left;
														*/
					if (!i) {
						jS.sheetCount = 0;
						jS.i = 0;
					} else {
						jS.sheetCount = parseInt(i);
						jS.i = jS.sheetCount;
						i = jS.i;
					}
					
					o = jS.tuneTableForSheetUse(o);
					
					jS.readOnly[i] = o.hasClass('readonly');
					
					var objContainer = jS.controlFactory.table().appendTo(jS.obj.ui());
					var pane = jS.obj.pane().html(o);
					
					if (s.autoFiller && jS.isSheetEditable()) {
						pane.append(jS.controlFactory.autoFiller());
					}
								
					jS.sheetDecorate(o);
					
					jS.controlFactory.barTop(reloadBars, o);
					jS.controlFactory.barLeft(reloadBars, o);
				
					jS.sheetTab(true);
					
					if (jS.isSheetEditable()) {
						var formula = jS.obj.formula();
						pane
							.mousedown(function(e) {
								if (jS.isTd(e.target)) {
										jS.evt.cellOnMouseDown(e);
										return false;
									}
							})
							.bind('contextmenu', function(e) {
								jS.controlFactory.cellMenu(e);
								return false;
							})
							.disableSelectionSpecial()
							.dblclick(jS.evt.cellOnDblClick);
					}
					
					jS.themeRoller.start(i);

					jS.setTdIds(o, jS.i);
					
					jS.checkMinSize(o);
					
					jS.evt.scrollBars(pane);
					
					jS.addTab();
					
					if (fn) {
						fn(objContainer, pane);
					}
					
					//jS.log('Sheet Initialized');
					
					return objContainer;
				},
				table: function() { /* creates the table control the will contain all the other controls for this instance */
					return jQuery('<table cellpadding="0" cellspacing="0" border="0" id="' + jS.id.tableControl + jS.i + '" class="' + jS.cl.tableControl + '">' +
						'<tbody>' +
							'<tr>' + 
								'<td id="' + jS.id.barCornerParent + jS.i + '" class="' + jS.cl.barCornerParent + '">' + //corner
									'<div style="height: ' + s.colMargin + '; width: ' + s.colMargin + ';" id="' + jS.id.barCorner + jS.i + '" class="' + jS.cl.barCorner +'"' + (jS.isSheetEditable() ? ' onClick="jQuery.sheet.instance[' + I + '].cellSetActiveBar(\'all\');"' : '') + ' title="Select All">&nbsp;</div>' +
								'</td>' + 
								'<td class="' + jS.cl.barTopTd + '">' + //barTop
									'<div id="' + jS.id.barTopParent + jS.i + '" class="' + jS.cl.barTopParent + '"></div>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td class="' + jS.cl.barLeftTd + '">' + //barLeft
									'<div style="width: ' + s.colMargin + ';" id="' + jS.id.barLeftParent + jS.i + '" class="' + jS.cl.barLeftParent + '"></div>' +
								'</td>' +
								'<td class="' + jS.cl.sheetPaneTd + '">' + //pane
									'<div id="' + jS.id.pane + jS.i + '" class="' + jS.cl.pane + '"></div>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>');
				},
				chartCache: [],
				safeImg: function(src, row) { /* creates and image and then resizes the cell's row for viewing
												src: string, location of image;
												row: int, the row number where the image is located;
											*/
					return jQuery('<img />')
						.hide()
						.load(function() { //prevent the image from being too big for the row
							jQuery(this).fadeIn(function() {
								jQuery(this).addClass('safeImg');
								jS.attrH.setHeight(parseInt(row), 'cell', false);
							});
						})
						.attr('src', src);
				},
				inPlaceEdit: function(td) { /* creates a teaxtarea for a user to put a value in that floats on top of the current selected cell
												td: object, the cell to be edited
											*/
					jS.obj.inPlaceEdit().remove();
					var formula = jS.obj.formula();					
					var offset = td.offset();
					var style = td.attr('style');
					var w = td.width();
					var h = td.height();
					var textarea = jQuery('<textarea id="' + jS.id.inPlaceEdit + '" class="' + jS.cl.inPlaceEdit + ' ' + jS.cl.uiInPlaceEdit + '" />')
						.css('left', offset.left)
						.css('top', offset.top)
						.width(w)
						.height(h)
						.keydown(jS.evt.inPlaceEditOnKeyDown)
						.keyup(function() {
							formula.val(textarea.val());
						})
						.change(function() {
							formula.val(textarea.val());
						})
						.focus(function() {
							jS.setNav(false);
						})
						.focusout(function() {
							jS.setNav(true);
						})
						.blur(function() {
							jS.setNav(true);
						})
						.bind('paste', jS.evt.pasteOverCells)
						.appendTo('body')
						.val(formula.val())
						.focus()
						.select();
					
					//Make the textarrea resizable automatically
					if (jQuery.fn.elastic) {
						textarea.elastic();
					}
				},
				autoFiller: function() { /* created the autofiller object */
					return jQuery('<div id="' + (jS.id.autoFiller + jS.i) + '" class="' + jS.cl.autoFiller + ' ' + jS.cl.uiAutoFiller + '">' +
									'<div class="' + jS.cl.autoFillerHandle + '" />' +
									'<div class="' + jS.cl.autoFillerCover + '" />' +
							'</div>')
							.mousedown(function(e) {
								var td = jS.cellLast.td;
								if (td) {
									var loc = jS.getTdLocation(td);
									jS.cellSetActive(td, loc, true, jS.autoFillerNotGroup, function() {										
										var hlighted = jS.obj.cellHighlighted();
										var hLoc = jS.getTdLocation(hlighted.first());
										jS.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
										jS.autoFillerGoToTd(hlighted.last());
										jS.autoFillerNotGroup = false;
									});
								}
							});
				}
			},
			autoFillerNotGroup: true,
			sizeSync: { /* future location of all deminsion sync/mods */
			
			},
			updateCellsAfterPasteToFormula: function(oldVal) { /* oldVal is what formula should be when this is done working with all the values */
				var newValCount = 0;
				var formula = jS.obj.formula();
				
				oldVal = (oldVal ? oldVal : formula.val());
				
				var loc = {row: jS.cellLast.row,col: jS.cellLast.col};								
				var val = formula.val(); //once ctrl+v is hit formula now has the data we need
				var firstValue = val;
		
				if (loc.row == -1 && loc.col == -1) return false; //at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
		
				var tdsBefore = jQuery('<div />');
				var tdsAfter = jQuery('<div />');
		
				var row = val.split(/\n/g); //break at rows
		
				for (var i = 0; i < row.length; i++) {
					var col = row[i].split(/\t/g); //break at columns
					for (var j = 0; j < col.length; j++) {
						newValCount++;
						var td = jQuery(jS.getTd(jS.i, i + loc.row, j + loc.col));

						if (td.length) {
							var cell = jS.spreadsheets[jS.i][i + loc.row][j + loc.col];
							tdsBefore.append(td.clone());
				
							if ((col[j] + '').charAt(0) == '=') { //we need to know if it's a formula here
								cell.formula = col[j];
								td.attr('formula', col[j]);
							} else {
								cell.formula = null;
								cell.value = col[j];
					
								td
									.html(col[j])
									.removeAttr('formula');
							}
				
							tdsAfter.append(td.clone());
				
							if (i == 0 && j == 0) { //we have to finish the current edit
								firstValue = col[j];
							}
						}
					}
				}
				
				if (val != firstValue) {
					formula.val(firstValue);
				}
				
				jS.cellUndoable.add(tdsBefore.children());
				jS.fillUpOrDown(false, false, firstValue);
				jS.cellUndoable.add(tdsAfter.children());
		
				jS.setDirty(true);
				jS.evt.cellEditDone(true);
			},
			evt: { /* event handlers for sheet; e = event */
				keyDownHandler: {
					enterOnInPlaceEdit: function(e) {
						if (!e.shiftKey) {
							return jS.evt.cellSetFocusFromKeyCode(e);
						} else {
							return true;
						}
					},
					enter: function(e) {
						if (!jS.cellLast.isEdit && !e.ctrlKey) {
							jS.cellLast.td.dblclick();
							return false;
						} else {
							return this.enterOnInPlaceEdit(e);
						}
					},
					tab: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					findCell: function(e) {
						if (e.ctrlKey) { 
							jS.cellFind();
							return false;
						}
						return true;
					},
					redo: function(e) {
						if (e.ctrlKey && !jS.cellLast.isEdit) { 
							jS.cellUndoable.undoOrRedo();
							return false;
						}
						return true;
					},
					undo: function(e) {
						if (e.ctrlKey && !jS.cellLast.isEdit) {
							jS.cellUndoable.undoOrRedo(true);
							return false;
						}
						return true;
					},
					pageUpDown: function(reverse) {
						var pane = jS.obj.pane();
						var left = jS.cellLast.td.position().left;
						var top = 0;
						
						if (reverse) {
							top = 0;
							pane.scrollTop(pane.scrollTop() - pane.height());
							
						} else {
							top = pane.height() - (s.colMargin * 3);
							pane.scrollTop(pane.scrollTop() + top);

						}
						
						return jS.evt.cellSetFocusFromXY(left, top);
					},
					formulaKeydown: function(e) {
						switch (e.keyCode) {
							case key.ESCAPE: 	jS.evt.cellEditAbandon();
								break;
							case key.ENTER:		jS.evt.cellSetFocusFromKeyCode(e); return false;
								break;							
							default: 			jS.cellLast.isEdit = true;
						}
					},
					documentKeydown: function(e) {
						if (jS.nav) {
							switch (e.keyCode) {
								case key.TAB: 		jS.evt.keyDownHandler.tab(e);
									break;
								case key.ENTER:
								case key.LEFT:
								case key.UP:
								case key.RIGHT:
								case key.DOWN:		(e.shiftKey ? jS.evt.cellSetHighlightFromKeyCode(e) : jS.evt.cellSetFocusFromKeyCode(e));
									break;
								case key.PAGE_UP:	jS.evt.keyDownHandler.pageUpDown(true);
									break;
								case key.PAGE_DOWN:	jS.evt.keyDownHandler.pageUpDown();
									break;
								case key.HOME:
								case key.END:		jS.evt.cellSetFocusFromKeyCode(e);
									break;
								case key.V:		jS.evt.pasteOverCells(e);
									break;
								case key.Y:		jS.evt.keyDownHandler.redo(e);
									break;
								case key.Z:		jS.evt.keyDownHandler.undo(e);
									break;
								case key.ESCAPE: 	jS.evt.cellEditAbandon();
									break;
								case key.F:		jS.evt.keyDownHandler.findCell(e);
									break;
								case key.CONTROL: //we need to filter these to keep cell state
								case key.CAPS_LOCK:
								case key.SHIFT:
								case key.ALT:
									break;
								default:		jS.obj.cellActive().dblclick(); return true;
							}
							return false;
						}
					}
				},
				pasteOverCells: function(e) { //used for pasting from other spreadsheets
					if (e.ctrlKey || e.type == "paste") {
						var fnAfter = function() {
							jS.updateCellsAfterPasteToFormula();
						};
						
						var doc = jQuery(document)
							.one('keyup', function() {
								fnAfter();
								fnAfter = function() {};
								doc.mouseup();
							})
							.one('mouseup', function() {
								fnAfter();
								fnAfter = function() {};
								doc.keyup();
							});
						
						return true;
					}
				},
				inPlaceEditOnKeyDown: function(e) {
					switch (e.keyCode) {
						case key.ENTER: 	return jS.evt.keyDownHandler.enterOnInPlaceEdit(e);
							break;
						case key.TAB: 		return jS.evt.keyDownHandler.tab(e);
							break;
						case key.ESCAPE:	jS.evt.cellEditAbandon(); return false;
							break;
					}
				},
				formulaChange: function(e) {
					jS.obj.inPlaceEdit().val(jS.obj.formula().val());
				},
				inPlaceEditChange: function(e) {
					jS.obj.formula().val(jS.obj.inPlaceEdit().val());
				},
				cellEditDone: function(forceCalc) { /* called to edit a cells value from jS.obj.formula(), afterward setting "fnAfterCellEdit" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
														forceCalc: bool, if set to true forces a calculation of the selected sheet
													*/
					switch (jS.cellLast.isEdit || forceCalc) {
						case true:
							jS.obj.inPlaceEdit().remove();
							var formula = jS.obj.formula();
							//formula.unbind('keydown'); //remove any lingering events from inPlaceEdit
							var td = jS.cellLast.td;
							switch(jS.isFormulaEditable(td)) {
								case true:
									//Lets ensure that the cell being edited is actually active
									if (td && jS.cellLast.row > -1 && jS.cellLast.col > -1) {
										//first, let's make it undoable before we edit it
										jS.cellUndoable.add(td);
										
										//This should return either a val from textbox or formula, but if fails it tries once more from formula.
										var v = formula.val();
										var prevVal = td.text();
										var cell = jS.spreadsheets[jS.i][jS.cellLast.row][jS.cellLast.col];
										if (v.charAt(0) == '=') {
											td
												.attr('formula', v)
												.html('');
											cell.value = v;
											cell.formula = v;
										} else {
											td
												.removeAttr('formula')
												.html(v);
											cell.value = v;
											cell.formula = null;
										}
										
										//reset the cell's value
										cell.calcCount = 0;
										
										if (v != prevVal || forceCalc) {
											jS.calc();
										}
										
										jS.attrH.setHeight(jS.cellLast.row, 'cell');
										
										//Save the newest version of that cell
										jS.cellUndoable.add(td);
										
										//formula.focus().select();
										jS.cellLast.isEdit = false;
										
										jS.setDirty(true);
										
										//perform final function call
										jS.trigger('afterCellEdit', [{
											td: jS.cellLast.td,
											row: jS.cellLast.row,
											col: jS.cellLast.col,
											spreadsheetIndex: jS.i,
											sheetIndex: I
										}]);
									}
							}
							break;
						default:
							jS.attrH.setHeight(jS.cellLast.row, 'cell', false);
					}
				},
				cellEditAbandon: function(skipCalc) { /* removes focus of a selected cell and doesn't change it's value
															skipCalc: bool, if set to true will skip sheet calculation;
														*/
					jS.obj.inPlaceEdit().remove();
					jS.themeRoller.cell.clearActive();
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
					
					if (!skipCalc) {
						jS.calc();
					}
					
					jS.cellLast.td = jQuery('<td />');
					jS.cellLast.row = -1;
					jS.cellLast.col = -1;
					jS.rowLast = -1;
					jS.colLast = -1;
					
					jS.labelUpdate('', true);
					jS.obj.formula()
						.val('');
					
					if (s.autoFiller) {
						jS.obj.autoFiller().hide();
					}
					
					return false;
				},
				cellSetFocusFromXY: function(left, top, skipOffset) { /* a handy function the will set a cell active by it's location on the browser;
																		left: int, pixels left;
																		top: int, pixels top;
																		skipOffset: bool, skips offset;
																	*/
					var td = jS.getTdFromXY(left, top, skipOffset);
					
					if (jS.isTd(td)) {
						jS.themeRoller.cell.clearHighlighted();
						
						jS.cellEdit(td);
						return false;
					} else {
						return true;
					}
				},
				cellSetHighlightFromKeyCode: function(e) {
					var c = jS.highlightedLast.colLast;
					var r = jS.highlightedLast.rowLast;
					var size = jS.sheetSize();
					jQuery(jS.cellLast.td).mousedown();
					
					switch (e.keyCode) {
						case key.UP: 		r--; break;
						case key.DOWN: 		r++; break;
						case key.LEFT: 		c--; break;
						case key.RIGHT: 	c++; break;
					}
					
					function keepInSize(i, size) {
						if (i < 0) return 0;
						if (i > size) return size;
						return i;
					}
					r = keepInSize(r, size.height);
					c = keepInSize(c, size.width);
					
					td = jS.getTd(jS.i, r, c);
					jQuery(td).mousemove().mouseup();
					
					jS.highlightedLast.rowLast = r;
					jS.highlightedLast.colLast = c;
					return false;
				},
				cellSetFocusFromKeyCode: function(e) { /* invoke a click on next/prev cell */
					var c = jS.cellLast.col; //we don't set the cellLast.col here so that we never go into indexes that don't exist
					var r = jS.cellLast.row;
					var overrideIsEdit = false;
					switch (e.keyCode) {
						case key.UP: 		r--; break;
						case key.DOWN: 		r++; break;
						case key.LEFT: 		c--; break;
						case key.RIGHT: 	c++; break;
						case key.ENTER:		r++;
							overrideIsEdit = true;
							if (jS.highlightedLast.td.length > 1) {
								var inPlaceEdit = jS.obj.inPlaceEdit();
								var v = inPlaceEdit.val();
								inPlaceEdit.remove();
								jS.updateCellsAfterPasteToFormula(v);
								return true;
							} else if (s.autoAddCells) {
								if (jS.cellLast.row == jS.sheetSize().height) {
									jS.controlFactory.addRow(':last');
								}
							}
							break;
						case key.TAB:
							overrideIsEdit = true;
							if (e.shiftKey) {
								c--;
							} else {
								c++;
							}
							if (s.autoAddCells) {
								if (jS.cellLast.col == jS.sheetSize().width) {
									jS.controlFactory.addColumn(':last');
								}
							}
							break;
						case key.HOME:		c = 0; break;
						case key.END:		c = jS.cellLast.td.parent().find('td').length - 1; break;
					}
					
					//we check here and make sure all values are above -1, so that we get a selected cell
					c = (c < 0 ? 0 : c);
					r = (r < 0 ? 0 : r);
					
					//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
					if (!jS.cellLast.isEdit || overrideIsEdit) {
						//get the td that we want to go to
						var td = jS.getTd(jS.i, r, c);
					
						//if the td exists, lets go to it
						if (td) {
							jS.themeRoller.cell.clearHighlighted();
							td = jQuery(td);
							if (td.is(':hidden')) {
								function getNext(o, reverse) {
									if (reverse) {
										c++;
										o = o.next()
									}
									else {
										c--;
										o = o.prev();
									}
									
									if (o.is(':hidden') && o.length) {
										return getNext(o, reverse);
									}
									return o;
								}
								
								td = getNext(td, c > jS.cellLast.col);
							}
							jS.cellEdit(td);
							return false;
						}
					}
					
					//default, can be overridden above
					return true;
				},
				cellOnMouseDown: function(e) {


					jS.obj.formula().blur();
					if (e.shiftKey) {
						jS.getTdRange(e, jS.obj.formula().val());
					} else {
						jS.cellEdit(jQuery(e.target), true);
					}			
				},
				cellOnDblClick: function(e) {
					jS.cellLast.isEdit = jS.isSheetEdit = true;
					jS.controlFactory.inPlaceEdit(jS.cellLast.td);
					//jS.log('click, in place edit activated');
				},
				scrollBars: function(pane) { /* makes the bars scroll as the sheet is scrolled
												pane: object, the sheet's pane;
											*/
					var o = { //cut down on recursion, grab them once
						barLeft: jS.obj.barLeftParent(), 
						barTop: jS.obj.barTopParent()
					};
					
					pane.scroll(function() {
						o.barTop.scrollLeft(pane.scrollLeft());//2 lines of beautiful jQuery js
						o.barLeft.scrollTop(pane.scrollTop());
						
						jS.trigger('paneScroll');
					});
				},
				barMouseDown: { /* handles bar events, including resizing */
					select: function(o, e, selectFn) {		
						selectFn(e.target);
						o
							.unbind('mouseover')
							.mouseover(function(e) {
								selectFn(e.target);
							});
							
						jQuery(document)
							.one('mouseup', function() {
								o
									.unbind('mouseover')
									.unbind('mouseup');
							});
						
						return false;
					},
					first: 0,
					last: 0,
					height: function(o) {			
						var selectRow = function () {};

						o //let any user resize
							.unbind('mousedown')
							.mousedown(function(e) {
								var i = jS.getBarLeftIndex(e.target);
								if (i == -1) return false;
								
								jS.evt.barMouseDown.first = jS.evt.barMouseDown.last = jS.rowLast = i;
								jS.evt.barMouseDown.select(o, e, selectRow);
								return false;
							})
							.bind('contextmenu', function(e) {
								if (!jS.isSheetEditable()) return false;
								
								var i = jS.getBarLeftIndex(e.target);
								if (i == -1) return false;
								
								o.parent()
									.mousedown()
									.mouseup();
								
								jS.controlFactory.barLeftMenu(e, i);
								
								return false;
							})
							.parent()
							.mouseover(function(e) {
								if (jQuery(e.target).attr('id')) return false;
								var i = jS.getBarLeftIndex(e.target);
								if (i == -1) return false;
								
								jS.resizeBarLeft(e);
								
								if (jS.isSheetEditable())
									jS.controlFactory.barLeftHandle(o, i);
							});
							
						if (jS.isSheetEditable()) { //only let editable select
							selectRow = function(o) {
								if (!o) return false;
								if (jQuery(o).attr('id')) return false;
								var i = jS.getBarLeftIndex(o);
								if (i == -1) return false;
								
								jS.rowLast = i; //keep track of last row for inserting new rows
								jS.evt.barMouseDown.last = i;
								
								jS.cellSetActiveBar('row', jS.evt.barMouseDown.first, jS.evt.barMouseDown.last);
							};
						}
					},
					width: function(o) {
						var selectColumn = function() {};
						var w = 0;
						o //let any user resize
							.unbind('mousedown')
							.mousedown(function(e) {
								var i = jS.getBarTopIndex(e.target);
								if (i == -1) return false;
									
								jS.evt.barMouseDown.first = jS.evt.barMouseDown.last = jS.colLast = i;
								jS.evt.barMouseDown.select(o, e, selectColumn);

								return false;
							})
							.bind('contextmenu', function(e) {
								if (!jS.isSheetEditable()) return false;
								
								var i = jS.getBarTopIndex(e.target);
								if (i == -1) return false;
								o.parent()
									.mousedown()
									.mouseup();
									
								jS.controlFactory.barTopMenu(e, i);
								
								return false;
							})
							.parent()
							.mouseover(function(e) {
								if (jQuery(e.target).attr('id')) return false;
								var i = jS.getBarTopIndex(e.target);
								if (i == -1) return false;
								//jS.log('Column: ' +i);
								jS.resizeBarTop(e);
								
								if (jS.isSheetEditable()) {
									jS.controlFactory.barTopHandle(o, i);
									jS.controlFactory.barTopMenu(e, i, jQuery(e.target));
								}
								
								return false;
							});
						if (jS.isSheetEditable()) { //only let editable select
							selectColumn = function(o) {
								if (!o) return false;
								if (jQuery(o).attr('id')) return false;
								var i = jS.getBarTopIndex(o);
								if (i == -1) return false;
								
								jS.colLast = i; //keep track of last column for inserting new columns
								jS.evt.barMouseDown.last = i;
								
								jS.cellSetActiveBar('col', jS.evt.barMouseDown.first, jS.evt.barMouseDown.last);
							};
						}
					}
				}
			},
			isTd: function(o) { /* ensures the the object selected is actually a td that is in a sheet
									o: object, cell object;
								*/
				o = (o[0] ? o[0] : [o]);
				if (o[0]) {
					if (!isNaN(o[0].cellIndex)) { 
						return true;
					}
				}
				return false;
			},
			readOnly: [],
			isSheetEditable: function(i) {
				i = (i == null ? jS.i : i);
				return (
					s.editable == true && !jS.readOnly[i]
				);
			},
			isFormulaEditable: function(o) { /* ensures that formula attribute of an object is editable
													o: object, td object being used as cell
											*/
				if (s.lockFormulas) {
					if(o.attr('formula') !== undefined) {
						return false;
					}
				}
				return true;
			},
			toggleFullScreen: function() { /* toggles full screen mode */
				if (jS.obj.fullScreen().is(':visible')) { //here we remove full screen
					jQuery('body').removeClass('bodyNoScroll');
					s.parent = origParent;
					
					var w = s.parent.width();
					var h = s.parent.height();
					s.width = w;
					s.height = h;
					
					jS.obj.tabContainer().insertAfter(
						s.parent.append(jS.obj.fullScreen().children())
					).removeClass(jS.cl.tabContainerFullScreen);
					
					jS.obj.fullScreen().remove();
					
					jS.sheetSyncSize();
				} else { //here we make a full screen
					jQuery('body').addClass('bodyNoScroll');
					
					var w = $window.width() - 15;
					var h = $window.height() - 35;
					
					
					s.width = w;
					s.height = h;
					
					jS.obj.tabContainer().insertAfter(
						jQuery('<div class="' + jS.cl.fullScreen + ' ' + jS.cl.uiFullScreen + '" />')
							.append(s.parent.children())
							.appendTo('body')
					).addClass(jS.cl.tabContainerFullScreen);
					
					s.parent = jS.obj.fullScreen();
					
					jS.sheetSyncSize();
				}
			},
			renameSpreadsheet: function(i) {
				if (isNaN(i)) return false;
				
				if (i > -1)
					jS.sheetTab();
			},
			switchSpreadsheet: function(i) {
				if (isNaN(i)) return false;
				
				if (i == -1) {
					jS.addSheet('5x10');
				} else if (i != jS.i) {
					jS.setActiveSheet(i);
					jS.calc(i);
				}
				
				jS.trigger('switchSheet', [i]);
				return false;
			},
			tuneTableForSheetUse: function(o) { /* makes table object usable by sheet
													o: object, table object;
												*/
				o
					.addClass(jS.cl.sheet)
					.attr('id', jS.id.sheet + jS.i)
					.attr('border', '1px')
					.attr('cellpadding', '0')
					.attr('cellspacing', '0');
					
				o.find('td.' + jS.cl.cellActive).removeClass(jS.cl.cellActive);
				
				return o;
			},
			attrH: {/* Attribute Helpers
						I created this object so I could see, quickly, which attribute was most stable.
						As it turns out, all browsers are different, thus this has evolved to a much uglier beast
					*/
				width: function(o, skipCorrection) {
					return jQuery(o).outerWidth() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				widthReverse: function(o, skipCorrection) {
					return jQuery(o).outerWidth() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				height: function(o, skipCorrection) {
					return jQuery(o).outerHeight() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				heightReverse: function(o, skipCorrection) {
					return jQuery(o).outerHeight() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				syncSheetWidthFromTds: function(o) {
					var w = 0;
					o = (o ? o : jS.obj.sheet());
					o.find('col').each(function() {
						w += jQuery(this).width();
					});
					o.width(w);
					return w;
				},
				setHeight: function(i, from, skipCorrection, o) {
					var correction = 0;
					var h = 0;
					var fn;
					
					switch(from) {
						case 'cell':
							o = (o ? o : jS.obj.barLeft().children().eq(i));
							h = jS.attrH.height(jQuery(jS.getTd(jS.i, i, 0)).parent().andSelf(), skipCorrection);
							break;
						case 'bar':
							if (!o) {
								var tr = jQuery(jS.getTd(jS.i, i, 0)).parent();
								var td = tr.children();
								o = tr.add(td);
							} 
							h = jS.attrH.heightReverse(jS.obj.barLeft().children().eq(i), skipCorrection);
							break;
					}
					
					if (h) {
						jQuery(o)
							.height(h)
							.css('height', h + 'px')
							.attr('height', h + 'px');
					}

					return o;
				}
			},
			setTdIds: function(sheet, i) { /* cycles through all the td in a sheet and sets their id & virtual spreadsheet so it can be quickly referenced later
										sheet: object, table object;
										i: integer, sheet index
									*/
				if (!o || !sheet) {
					sheet = jS.obj.sheet();
					i = jS.i;
				}
				
				jS.spreadsheets[i] = []; //reset the sheet's spreadsheet
				
				sheet.find('tr').each(function(row) {
					jQuery(this).children().each(function(col) {
						var td = jQuery(this).attr('id', jS.getTdId(i, row, col));
						jS.createCell(i, row, col, td.text(), td.attr('formula'));
					});
				});
			},
			setControlIds: function() { /* resets the control ids, useful for when adding new sheets/controls between sheets/controls :) */
				var resetIds = function(o, id) {
					o.each(function(i) {
						jQuery(this).attr('id', id + i);
					});
				};
				
				resetIds(jS.obj.sheetAll().each(function(i) {
					jS.setTdIds(jQuery(this), i);
				}), jS.id.sheet);
				
				resetIds(jS.obj.barTopAll(), jS.id.barTop);
				resetIds(jS.obj.barTopParentAll(), jS.id.barTopParent);
				resetIds(jS.obj.barLeftAll(), jS.id.barLeft);
				resetIds(jS.obj.barLeftParentAll(), jS.id.barLeftParent);
				resetIds(jS.obj.barCornerAll(), jS.id.barCorner);
				resetIds(jS.obj.barCornerParentAll(), jS.id.barCornerParent);
				resetIds(jS.obj.tableControlAll(), jS.id.tableControl);
				resetIds(jS.obj.paneAll(), jS.id.pane);
				resetIds(jS.obj.tabAll().each(function(j) {
					jQuery(this).attr('i', j);
				}), jS.id.tab);
			},
			toggleHide: {//These are not ready for prime time
				row: function(i) {
					if (!i) {//If i is empty, lets get the current row
						i = jS.obj.cellActive().parent().attr('rowIndex');
					}
					if (i) {//Make sure that i equals something
						var o = jS.obj.barLeft().children().eq(i);
						if (o.is(':visible')) {//This hides the current row
							o.hide();
							jS.obj.sheet().find('tr').eq(i).hide();
						} else {//This unhides
							//This unhides the currently selected row
							o.show();
							jS.obj.sheet().find('tr').eq(i).show();
						}
					} else {
						alert(jS.msg.toggleHideRow);
					}
				},
				rowAll: function() {
					jS.obj.sheet().find('tr').show();
					jS.obj.barLeft().children().show();
				},
				column: function(i) {
					if (!i) {
						i = jS.obj.cellActive().attr('cellIndex');
					}
					if (i) {
						//We need to hide both the col and td of the same i
						var o = jS.obj.barTop().children().eq(i);
						if (o.is(':visible')) {
							jS.obj.sheet().find('tbody tr').each(function() {
								jQuery(this).children().eq(i).hide();
							});
							o.hide();
							jS.obj.sheet().find('colgroup col').eq(i).hide();
							jS.toggleHide.columnSizeManage();
						}
					} else {
						alert(jS.msg.toggleHideColumn);
					}
				},
				columnAll: function() {
				
				},
				columnSizeManage: function() {
					var w = jS.obj.barTop().width();
					var newW = 0;
					var newW = 0;
					jS.obj.barTop().children().each(function() {
						var o = jQuery(this);
						if (o.is(':hidden')) {
							newW += o.width();
						}
					});
					jS.obj.barTop().width(w);
					jS.obj.sheet().width(w);
				}
			},
			merge: function() { /* merges cells */
				var cellsValue = "";
				var cellValue = "";
				var cells = jS.obj.cellHighlighted();
				var formula;
				var cellFirstLoc = jS.getTdLocation(cells.first());
				var cellLastLoc = jS.getTdLocation(cells.last());
				var colI = (cellLastLoc.col - cellFirstLoc.col) + 1;
				
				if (cells.length > 1 && cellFirstLoc.row) {
					for (var i = cellFirstLoc.col; i <= cellLastLoc.col; i++) {
						var td = jQuery(jS.getTd(jS.i, cellFirstLoc.row, i)).hide();
						var cell = jS.spreadsheets[jS.i][cellFirstLoc.row][i];
						
						cellsValue = (cell.formula ? "(" + cell.formula.replace('=', '') + ")" : cell.value) + cellsValue;
						
						if (i != cellFirstLoc.col) {
							cell.formula = null;
							cell.value;
							td
								.attr('formula', '')
								.html('')
								.hide();
						}
					}
					
					var cell = cells.first()
						.show()
						.attr('colspan', colI)
						.html(cellsValue);
					
					jS.setDirty(true);
					jS.calc();
				} else if (!cellFirstLoc.row) {
					alert(jS.msg.merge);
				}
			},
			unmerge: function() { /* unmerges cells */
				var cell = jS.obj.cellHighlighted().first();
				var loc = jS.getTdLocation(cell);
				var formula = cell.attr('formula');
				var v = cell.text();
				v = (formula ? formula : v);
				
				var rowI = cell.attr('rowspan');
				var colI = cell.attr('colspan');
				
				//rowI = parseInt(rowI ? rowI : 1); //we have to have a minimum here;
				colI = parseInt(colI ? colI : 1);
				
				var td = '<td />';
				
				var tds = '';
				
				if (colI) {
					for (var i = 0; i < colI; i++) {
						tds += td;
					}
				}
				
				for (var i = loc.col; i < colI; i++) {
					jQuery(jS.getTd(jS.i, loc.row, i)).show();
				}
				
				cell.removeAttr('colspan');
				
				jS.setDirty(true);
				jS.calc();
			},
			fillUpOrDown: function(goUp, skipOffsetForumals, v) { /* fills values down or up to highlighted cells from active cell;
																	goUp: bool, default is down, when set to true value are filled from bottom, up;
																	skipOffsetForumals: bool, default is formulas will offest, when set to true formulas will stay static;
																	v: string, the value to set cells to, if not set, formula will be used;
																*/
				var cells = jS.obj.cellHighlighted();
				var cellActive = jS.obj.cellActive();
				//Make it undoable
				jS.cellUndoable.add(cells);
				
				var startFromActiveCell = cellActive.hasClass(jS.cl.uiCellHighlighted);
				var startLoc = jS.getTdLocation(cells.first());
				var endLoc = jS.getTdLocation(cells.last());
				
				v = (v ? v : jS.obj.formula().val()); //allow value to be overridden
				
				var offset = {
					row: 0,
					col: 0
				};
				var td;
				var newV = v;
				var fn;
				if (v.charAt(0) == '=') {
					fn = function(sheet, row, col){
						td = jQuery(this);
						
						if (goUp) {
							offset.row = -endLoc.row + row;
							offset.col = -endLoc.col + col;
						}
						else {
							offset.row = row - startLoc.row;
							offset.col = col - startLoc.col;
						}
						
						newV = jS.reparseFormula(v, offset);
						
						jS.spreadsheets[sheet][row][col].formula = newV;
						
						td.attr('formula', newV).html('');
					};
				} else {
					if (goUp && !isNaN(newV)) {
						newV *= 1;
						newV -= endLoc.row;
						newV -= endLoc.col;
					}
					fn = function(sheet, row, col){
						td = jQuery(this);
						
						jS.spreadsheets[sheet][row][col].formula = null;
						jS.spreadsheets[sheet][row][col].value = newV;
						
						td.removeAttr('formula').html(newV);
						
						if (!isNaN(newV)) 
							newV++;
					};
				}
				
				jS.cycleCells(fn, startLoc, endLoc);
				
				jS.setDirty(true);
				jS.calc();
				
				//Make it redoable
				jS.cellUndoable.add(cells);
			},
			offsetFormulas: function(loc, offset, isBefore) {/* makes cell formulas increment in a range
																						loc: {row: int, col: int}
																						offset: {row: int,col: int} offsets increment;
																						isBefore: bool, inserted before location
																					*/
				var size = jS.sheetSize();
				//shifted range is the range of cells that are moved
				var shiftedRange = {
					first: loc,
					last: {
						row: size.height,
						col: size.width
					}
				};
				//effected range is the entire spreadsheet
				var affectedRange = {
					first: {
						row: 0,
						col: 0
					},
					last: {
						row: size.height,
						col: size.width
					}
				};
				
				jS.log("offsetFormulas from - Col:" + loc.col + ',Row:' + loc.row);
				jS.log("Is before loc:" + (isBefore ? 'true' : 'false'));
				jS.log("Offset: - Col:" + offset.col + ',Row:' + offset.row);
				
				function isInFormula(thisLoc, rowOrCol) {
					var move = false;
					
					if (isBefore) {
						if (thisLoc >= rowOrCol)
							move = true;
					} else {
						if (thisLoc > rowOrCol) 
							move = true;
					}
					
					return move;
				}

				jS.cycleCells(function (sheet, row, col) {
					var td = jQuery(this);
					var formula = td.attr('formula');

					if (formula && jS.isFormulaEditable(td)) {
						formula = jS.reparseFormula(formula, offset, function(thisLoc){
							return {
								row: isInFormula(thisLoc.row, loc.row),
								col: isInFormula(thisLoc.col, loc.col)
							};
						});
						
						jS.spreadsheets[sheet][row][col].formula = formula;
						td.attr('formula', formula);
					}

				}, affectedRange.first, affectedRange.last);
				
				
				jS.evt.cellEditDone();
				jS.calc();
			},
			reparseFormula: function(formula, offset, fn) {
				return formula.replace(jSE.regEx.cell, function(ignored, col, row, pos) {
						var loc = jSE.parseLocation(ignored);
						
						if (fn) {
							var move = fn(loc);
							
							
							if (move.col || move.row) {
								if (move.col) loc.col += offset.col;
								if (move.row) loc.row += offset.row;
								
								return jS.makeFormula(loc);
							}
						} else {
							return jS.makeFormula(loc, offset);
						}
												
						return ignored;
				});
			},
			makeFormula: function(loc, offset) {
				offset = jQuery.extend({row: 0, col: 0}, offset);
				
				//set offsets
				loc.col += offset.col;
				loc.row += offset.row;
				
				//0 based now
				if (loc.col < 0) loc.col = 0;
				if (loc.row < 0) loc.row = 0;
				
				return jSE.parseCellName(loc.col, loc.row);
			},
			cycleCells: function(fn, firstLoc, lastLoc, sheet) { /* cylces through a certain group of cells in a spreadsheet and applies a function to them
															fn: function, the function to apply to a cell;
															firstLoc: array of int - [col, row], the group to start;
															lastLoc: array of int - [col, row], the group to end;
														*/
				sheet = (sheet ? sheet : jS.i);
				firstLoc = (firstLoc ? firstLoc : {row: 0, col: 0});
				
				if (!lastLoc) {
					var size = jS.sheetSize(jQuery('#' + jS.id.sheet + sheet));
					lastLoc = {row: size.height, col: size.width};
				}
				
				for (var row = firstLoc.row; row <= lastLoc.row; row++) {
					for (var col = firstLoc.col; col <= lastLoc.col; col++) {
						var td = jS.getTd(sheet, row, col);
						if (td) {
							fn.apply(td, [sheet, row, col]);
						}
					}
				}
			},
			cycleCellsAll: function(fn) {
				for (var i = 0; i <= jS.sheetCount; i++) {
					var size = jS.sheetSize(jQuery('#' + jS.id.sheet + i));
					var endLoc = {row: size.height, col: size.width};
					jS.cycleCells(fn, {row: 0, col: 0}, endLoc, i);
				}
			},
			cycleCellsAndMaintainPoint: function(fn, firstLoc, lastLoc) { /* cylces through a certain group of cells in a spreadsheet and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
																			fn: function, the function to apply to a cell;
																			firstLoc: array of int - [col, row], the group to start;
																			lastLoc: array of int - [col, row], the group to end;
																		*/
				var o = [];
				for (var i = (firstLoc.row < lastLoc.row ? firstLoc.row : lastLoc.row) ; i <= (firstLoc.row > lastLoc.row ? firstLoc.row : lastLoc.row); i++) {
					for (var j = (firstLoc.col < lastLoc.col ? firstLoc.col : lastLoc.col); j <= (firstLoc.col > lastLoc.col ? firstLoc.col : lastLoc.col); j++) {
						o.push(jS.getTd(jS.i, i, j));
						fn(o[o.length - 1]);
					}
				}
				return o;
			},
			addTab: function() { /* Adds a tab for navigation to a spreadsheet */
				jQuery('<span class="' + jS.cl.uiTab + ' ui-corner-bottom">' + 
						'<a class="' + jS.cl.tab + '" id="' + jS.id.tab + jS.i + '" i="' + jS.i + '">' + jS.sheetTab(true) + '</a>' + 
					'</span>')
						.insertBefore(
							jS.obj.tabContainer().find('span:last')
						);
			},
			sheetDecorate: function(o) { /* preps a table for use as a sheet;
											o: object, table object;
										*/
				jS.formatSheet(o);
				jS.sheetSyncSizeToCols(o);
				jS.sheetDecorateRemove();
			},
			formatSheet: function(o) { /* adds tbody, colgroup, heights and widths to different parts of a spreadsheet
											o: object, table object;
										*/
				var tableWidth = 0;
				if (o.find('tbody').length < 1) {
					o.wrapInner('<tbody />');
				}
				
				if (o.find('colgroup').length < 1 || o.find('col').length < 1) {
					o.remove('colgroup');
					var colgroup = jQuery('<colgroup />');
					o.find('tr:first').children().each(function() {
						var w = s.newColumnWidth;
						jQuery('<col />')
							.width(w)
							.css('width', (w) + 'px')
							.attr('width', (w) + 'px')
							.appendTo(colgroup);
						
						tableWidth += w;
					});
					o.find('tr').each(function() {
						jQuery(this)
							.height(s.colMargin)
							.css('height', s.colMargin + 'px')
							.attr('height', s.colMargin + 'px');
					});
					colgroup.prependTo(o);
				}
				
				o
					.removeAttr('width')
					.css('width', '')
					.width(tableWidth);
			},
			checkMinSize: function(o) { /* ensure sheet minimums have been met, if not add columns and rows
											o: object, table object;
										*/
				var size = jS.sheetSize();
				
				var addRows = 0;
				var addCols = 0;
				
				if ((size.width) < s.minSize.cols) {
					addCols = s.minSize.cols - size.width - 1;
				}
				
				if (addCols) {
					jS.controlFactory.addColumnMulti(addCols, false, true);
				}
				
				if ((size.height) < s.minSize.rows) {
					addRows = s.minSize.rows - size.height - 1;
				}
				
				if (addRows) {
					jS.controlFactory.addRowMulti(addRows, false, true);
				}
			},
			themeRoller: { /* jQuery ui Themeroller integration	*/
				start: function() {
					//Style sheet			
					s.parent.addClass(jS.cl.uiParent);
					jS.obj.sheet().addClass(jS.cl.uiSheet);
					//Style bars
					jS.obj.barLeft().children().addClass(jS.cl.uiBar);
					jS.obj.barTop().children().addClass(jS.cl.uiBar);
					jS.obj.barCornerParent().addClass(jS.cl.uiBar);
					
					jS.obj.controls().addClass(jS.cl.uiControl);
					jS.obj.label().addClass(jS.cl.uiControl);
					jS.obj.formula().addClass(jS.cl.uiControlTextBox);
				},
				cell: {
					setActive: function() {
						this.clearActive();
						this.setHighlighted(
							jS.cellLast.td
								.addClass(jS.cl.cellActive)
						);
					},
					setHighlighted: function(td) {
						jQuery(td)
							.addClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
					},
					clearActive: function() {
						jS.obj.cellActive()
							.removeClass(jS.cl.cellActive);
					},
					isHighlighted: function() {
						return (jS.highlightedLast.td ? true : false);
					},
					clearHighlighted: function() {
						if (jS.themeRoller.cell.isHighlighted()) {
							jS.obj.cellHighlighted()
								.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
						}
						
						jS.highlightedLast.rowStart = -1;
						jS.highlightedLast.colStart = -1;
						jS.highlightedLast.rowEnd = -1;

						jS.highlightedLast.colEnd = -1;
						jS.highlightedLast.td = jQuery('<td />');
					}
				},
				bar: {
					style: function(o) {
						jQuery(o).addClass(jS.cl.uiBar);
					},
					setActive: function(direction, i) {
						//We don't clear here because we can have multi active bars
						switch(direction) {
							case 'top': jS.obj.barTop().children().eq(i).addClass(jS.cl.uiActive);
								break;
							case 'left': jS.obj.barLeft().children().eq(i).addClass(jS.cl.uiActive);
								break;
						}
					},
					clearActive: function() {
						jS.obj.barTop().add(jS.obj.barLeft()).children('.' + jS.cl.uiActive)
							.removeClass(jS.cl.uiActive);
					}
				},
				tab: {
					setActive: function(o) {
						this.clearActive();
						jS.obj.tab().parent().addClass(jS.cl.uiTabActive);
					},
					clearActive: function () {
						jS.obj.tabContainer().find('span.' + jS.cl.uiTabActive)
							.removeClass(jS.cl.uiTabActive);
					}
				},
				resize: function() {// add resizable jquery.ui if available
					// resizable container div
					jS.resizable(s.parent, {
						minWidth: s.width * 0.5,
						minHeight: s.height * 0.5,

						start: function() {
							jS.obj.ui().hide();
						},
						stop: function() {
							jS.obj.ui().show();
							s.width = s.parent.width();
							s.height = s.parent.height();
							jS.sheetSyncSize();
						}
					});
					// resizable formula area - a bit hard to grab the handle but is there!
					var formulaResizeParent = jQuery('<span />');
					jS.resizable(jS.obj.formula().wrap(formulaResizeParent).parent(), {
						minHeight: jS.obj.formula().height(), 
						maxHeight: 78,
						handles: 's',
						resize: function(e, ui) {
							jS.obj.formula().height(ui.size.height);
							jS.sheetSyncSize();
						}
					});
				}
			},
			resizable: function(o, settings) { /* jQuery ui resizeable integration
													o: object, any object that neds resizing;
													settings: object, the settings used with jQuery ui resizable;
												*/
				if (o.attr('resizable')) {
					o.resizable("destroy");
				}
					
				o
					.resizable(settings)
					.attr('resizable', true);
			},
			busy: false,
			draggable: function(o, settings) {
				if (o.attr('draggable')) {
					o.resizable("destroy");
				}
				
				o
					.draggable(settings)
					.attr('draggable', true)
			},
			resizeBarTop: function(e) {
					jS.resizable(jQuery(e.target), {
						handles: 'e',
						start: function() {
							jS.busy = true;
							jS.obj.barHelper().remove();
						},
						stop: function(e, ui) {
							jS.busy = false;
							var i = jS.getBarTopIndex(this);
							jS.sheetSyncSizeToDivs();
							var w = jS.attrH.width(this, true);
							jS.obj.sheet().find('col').eq(i)
								.width(w)
								.css('width', w + 'px')
								.attr('width', w + 'px');
							
							jS.followMe();
							jS.obj.pane().scroll();
						}
					});
			},
			resizeBarLeft: function(e) {
					jS.resizable(jQuery(e.target), {
						handles: 's',
						start: function() {
							jS.busy = true;
							jS.obj.barHelper().remove();
						},
						stop: function(e, ui) {
							jS.busy = false;
							var i = jS.getBarLeftIndex(jQuery(this));
							jS.attrH.setHeight(i, 'bar', true);
							jS.attrH.setHeight(i, 'cell');
							
							jS.followMe();
							jS.obj.pane().scroll();
						}
					});
			},
			sheetDecorateRemove: function(makeClone) { /* removes sheet decorations
															makesClone: bool, creates a clone rather than the actual object;
														*/
				var o = (makeClone ? jS.obj.sheetAll().clone() : jS.obj.sheetAll());
				
				//Get rid of highlighted cells and active cells
				jQuery(o).find('td.' + jS.cl.cellActive)
					.removeClass(jS.cl.cellActive + ' ' + jS.cl.uiCellActive);
					
				jQuery(o).find('td.' + jS.cl.cellHighlighted)
					.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
				/*
				//IE Bug, match width with css width
				jQuery(o).find('col').each(function(i) {
					var v = jQuery(this).css('width');
					v = ((v + '').match('px') ? v : v + 'px');
					jQuery(o).find('col').eq(i).attr('width', v);
				});
				*/
				return o;
			},
			labelUpdate: function(v, setDirect) { /* updates the label so that the user knows where they are currently positioned
													v: string or array of ints, new location value;
													setDirect: bool, converts the array of a1 or [0,0] to "A1";
												*/
				if (!setDirect) {
					jS.obj.label().html(jSE.parseCellName(v.col, v.row));
				} else {
					jS.obj.label().html(v);
				}
			},
			cellEdit: function(td, isDrag, skipFocus) { /* starts cell to be edited
												td: object, td object;

												isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
												*/
				jS.autoFillerNotGroup = true; //make autoFiller directional again.
				//This finished up the edit of the last cell
				jS.evt.cellEditDone();
				jS.followMe(td);
				jS.obj.pane().scroll();
				var loc = jS.getTdLocation(td);
				
				//Show where we are to the user
				jS.labelUpdate(loc);
				
				var v = td.attr('formula');
				if (!v) {
					v = td.text();
				}
				
				var formula = jS.obj.formula()
					.val(v)
					.blur();
				
				if (!skipFocus) {
					//formula
						//.focus()
						//.select();
				}
				
				jS.cellSetActive(td, loc, isDrag);
			},
			cellSetActive: function(td, loc, isDrag, directional, fnDone) { /* cell cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
																				td: object, td object;
																				loc: array of ints - [col, row];
																				isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
																				directional: bool, makes highlighting directional, only left/right or only up/down;
																				fnDone: function, called after the cells are set active;
																			*/
				if (typeof(loc.col) != 'undefined') {
					jS.cellLast.td = td; //save the current cell/td
					
					jS.cellLast.row = jS.rowLast = loc.row;
					jS.cellLast.col = jS.colLast = loc.col;
					
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
					
					jS.highlightedLast.td = td;
					
					jS.themeRoller.cell.setActive(); //themeroll the cell and bars
					jS.themeRoller.bar.setActive('left', jS.cellLast.row);
					jS.themeRoller.bar.setActive('top', jS.cellLast.col);
					
					var selectModel;
					var clearHighlightedModel;
					
					jS.highlightedLast.rowStart = loc.row;
					jS.highlightedLast.colStart = loc.col;
					jS.highlightedLast.rowLast = loc.row;
					jS.highlightedLast.colLast = loc.col;
					
					switch (s.cellSelectModel) {
						case 'excel':
						case 'gdocs':
							selectModel = function() {};
							clearHighlightedModel = jS.themeRoller.cell.clearHighlighted;
							break;
						case 'oo':
							selectModel = function(target) {
								var td = jQuery(target);
								if (jS.isTd(td)) {
									jS.cellEdit(td);
								}
							};
							clearHighlightedModel = function() {};
							break;
					}
					
					if (isDrag) {
						var lastLoc = loc; //we keep track of the most recent location because we don't want tons of recursion here
						jS.obj.pane()
							.mousemove(function(e) {
								var endLoc = jS.getTdLocation([e.target]);
								var ok = true;
								
								if (directional) {
									ok = false;
									if (loc.col == endLoc.col || loc.row == endLoc.row) {
										ok = true;
									}
								}
								
								if ((lastLoc.col != endLoc.col || lastLoc.row != endLoc.row) && ok) { //this prevents this method from firing too much
									//clear highlighted cells if needed
									clearHighlightedModel();
									
									//set current bars
									jS.highlightedLast.colEnd = endLoc.col;
									jS.highlightedLast.rowEnd = endLoc.row;
									
									//select active cell if needed
									selectModel(e.target);
									
									//highlight the cells
									jS.highlightedLast.td = jS.cycleCellsAndMaintainPoint(jS.themeRoller.cell.setHighlighted, loc, endLoc);
								}
								
								lastLoc = endLoc;
							});
						
						jQuery(document)
							.one('mouseup', function() {
	
								jS.obj.pane()
									.unbind('mousemove')
									.unbind('mouseup');
								
								if (jQuery.isFunction(fnDone)) {
									fnDone();
								}
							});
					}
				}
			},
			colLast: 0, /* the most recent used column */
			rowLast: 0, /* the most recent used row */
			cellLast: { /* the most recent used cell */
				td: jQuery('<td />'), //this is a dud td, so that we don't get errors
				row: -1,
				col: -1,
				isEdit: false
			}, /* the most recent highlighted cells */
			highlightedLast: {
				td: jQuery('<td />'),
				rowStart: -1,
				colStart: -1,
				rowEnd: -1,
				colEnd: -1
			},
			cellStyleToggle: function(setClass, removeClass) { /* sets a cells class for styling
																	setClass: string, class(es) to set cells to;
																	removeClass: string, class(es) to remove from cell if the setClass would conflict with;
																*/
				//Lets check to remove any style classes
				var uiCell = jS.obj.cellHighlighted();
				
				jS.cellUndoable.add(uiCell);
				
				if (removeClass) {
					uiCell.removeClass(removeClass);
				}
				//Now lets add some style
				if (uiCell.hasClass(setClass)) {
					uiCell.removeClass(setClass);
				} else {
					uiCell.addClass(setClass);
				}
				
				jS.cellUndoable.add(uiCell);
				
				//jS.obj.formula()
					//.focus()
					//.select();
				return false;
			},
			fontReSize: function (direction) { /* resizes fonts in a cell by 1 pixel
													direction: string, "up" || "down"
												*/
				var resize=0;
				switch (direction) {
					case 'up':
						resize=1;
						break;
					case 'down':
						resize=-1;
						break;    
				}
				
				//Lets check to remove any style classes
				var uiCell = jS.obj.cellHighlighted();
				
				jS.cellUndoable.add(uiCell);
				
				uiCell.each(function(i) {
					cell = jQuery(this);
					var curr_size = (cell.css("font-size") + '').replace("px","")
					var new_size = parseInt(curr_size ? curr_size : 10) + resize;
					cell.css("font-size", new_size + "px");
				});
				
				jS.cellUndoable.add(uiCell);
			},
			callStack: 0,
			updateCellValue: function(sheet, row, col) {
				//first detect if the cell exists if not return nothing
				if (!jS.spreadsheets[sheet]) return 'Error: Sheet not found';
				if (!jS.spreadsheets[sheet][row]) return 'Error: Row not found';
				if (!jS.spreadsheets[sheet][row][col]) return 'Error: Column not found';
				
				var cell = jS.spreadsheets[sheet][row][col];
				cell.oldValue = cell.value; //we detect the last value, so that we don't have to update all cell, thus saving resources
				
				if (cell.state) throw("Error: Loop Detected");
				cell.state = "red";
				
				if (cell.calcCount < 1 && cell.calcLast != jS.calcLast) {
					cell.calcLast = jS.calcLast;
					cell.calcCount++;
					if (cell.formula) {
						try {
							if (cell.formula.charAt(0) == '=') {
								cell.formula = cell.formula.substring(1, cell.formula.length);
							}
							
							var Parser;
							if (jS.callStack) { //we prevent parsers from overwriting each other
								if (!cell.parser) { //cut down on un-needed parser creation
									cell.parser = (new jS.parser);
								}
								Parser = cell.parser
							} else {//use the sheet's parser if there aren't many calls in the callStack
								Parser = jS.Parser;
							}
							
							jS.callStack++
							Parser.lexer.cell = {
								sheet: sheet,
								row: row,
								col: col,
								cell: cell,
								s: s,
								editable: s.editable,
								jS: jS
							};
							Parser.lexer.cellHandler = jS.cellHandlers;
							cell.value = Parser.parse(cell.formula);
						} catch(e) {
							cell.value = e.toString().replace(/\n/g, '<br />'); //error
							
							origParent.one('calculation', function() { // the error size may be bigger than that of the cell, so adjust the height accordingly
								jS.attrH.setHeight(row, 'cell', false);
							});
							
							jS.alertFormulaError(cell.value);
						}
						jS.callStack--;
					}
				
					if (cell.html) { //if cell has an html front bring that to the value but preserve it's value
						jQuery(jS.getTd(sheet, row, col)).html(cell.html);					
					} else {
						jQuery(jS.getTd(sheet, row, col)).html(cell.value);
					}
				}
				
				
				cell.state = null;
				
				return cell.value;
			},
			cellHandlers: {
				cellValue: function(id) { //Example: A1
					var loc = jSE.parseLocation(id);
					return jS.updateCellValue(this.sheet, loc.row, loc.col);
				},
				cellRangeValue: function(ids) {//Example: A1:B1
					ids = ids.split(':');
					var start = jSE.parseLocation(ids[0]);
					var end = jSE.parseLocation(ids[1]);
					var result = [];
					
					for (var i = start.row; i <= end.row; i++) {
						for (var j = start.col; j <= end.col; j++) {
							result.push(jS.updateCellValue(this.sheet, i, j));
						}
					}
					return [result];
				},
				fixedCellValue: function(id) {
					return jS.cellHandlers.cellValue.apply(this, [(id + '').replace(/[$]/g, '')]);
				},
				fixedCellRangeValue: function(ids) {
					return jS.cellHandlers.cellRangeValue.apply(this, [(ids + '').replace(/[$]/g, '')]);
				},
				remoteCellValue: function(id) {//Example: SHEET1:A1
					var sheet, loc;
					id = id.replace(jSE.regEx.remoteCell, function(ignored1, ignored2, I, col, row) {
						sheet = (I * 1) - 1;
						loc = jSE.parseLocation(col + row);
						return ignored1;
					});
					return jS.updateCellValue(sheet, loc.row, loc.col);
				},
				remoteCellRangeValue: function(ids) {//Example: SHEET1:A1:B2
					var sheet, start, end;
					ids = ids.replace(jSE.regEx.remoteCellRange, function(ignored1, ignored2, I, startCol, startRow, endCol, endRow) {
						sheet = (I * 1) - 1;
						start = jSE.parseLocation(startCol + startRow);
						end = jSE.parseLocation(endCol + endRow);
						return ignored1;
					});
					
					var result = [];
					
					for (var i = start.row; i <= end.row; i++) {
						for (var j = start.col; j <= end.col; j++) {
							result.push(jS.updateCellValue(sheet, i, j));
						}
					}

					return [result];
				},
				callFunction: function(fn, args, cell) {					
					if (!args) {
						args = [''];
					} else if (jQuery.isArray(args)) {
						args = args.reverse();
					} else {
						args = [args];
					}
						
					return (jQuery.sheet.fn[fn] ? jQuery.sheet.fn[fn].apply(cell, args) : "Error: Function Not Found");
				}
			},
			alertFormulaError: function(msg) {
				alert(
					'cell:' + row + ' ;' + col + '\n' +
					'value: "' + cell.formula + '"\n' + 
					'error: \n' + e
				);
			},
			context: {},
			calcLast: 0,
			calc: function(tableI) { /* harnesses calculations engine's calculation function
												tableI: int, the current table integer;
												fuel: variable holder, used to prevent memory leaks, and for calculations;
											*/
				tableI = (tableI ? tableI : jS.i);
				if (jS.readOnly[tableI]) return; //readonly is no calc at all
				
				jS.log('Calculation Started');
				jS.calcLast = new Date();
				jSE.calc(tableI, jS.spreadsheetsToArray()[tableI], jS.updateCellValue);
				jS.trigger('calculation');
				jS.isSheetEdit = false;
				jS.log('Calculation Ended');
			},
			refreshLabelsColumns: function(){ /* reset values inside bars for columns */
				var w = 0;
				jS.obj.barTop().children().each(function(i) {
					jQuery(this).text(jSE.columnLabelString(i));
					w += jQuery(this).width();
				});
				return w;
			},
			refreshLabelsRows: function(){ /* resets values inside bars for rows */
				jS.obj.barLeft().children().each(function(i) {
					jQuery(this).text((i + 1));
				});
			},
			addSheet: function(size) { /* adds a spreadsheet
											size: string example "10x100" which means 10 columns by 100 rows;
										*/
				size = (size ? size : prompt(jS.msg.newSheet));
				if (size) {
					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					var newSheetControl = jS.controlFactory.sheetUI(jQuery.sheet.makeTable.fromSize(size), jS.sheetCount + 1, function(o) { 
						jS.setActiveSheet(jS.sheetCount);
					}, true);
					
					jS.trigger('addSheet', [jS.i]);
				}
			},
			deleteSheet: function() { /* removes the currently selected sheet */
				var oldI = jS.i;
				
				jS.obj.barHelper().remove();

				jS.obj.tableControl().remove();
				jS.obj.tabContainer().children().eq(jS.i).remove();
				jS.i = 0;
				jS.sheetCount--;
				
				jS.setControlIds();
				
				jS.setActiveSheet(jS.i);
				jS.setDirty(true);
				
				jS.trigger('deleteSheet', [oldI]);
			},
			deleteRow: function(skipCalc) { /* removes the currently selected row */
				var lastRow = jS.rowLast;
				jS.obj.barLeft().children().eq(jS.rowLast).remove();
				jQuery(jS.getTd(jS.i, jS.rowLast, 0)).parent().remove();
				
				jS.refreshLabelsRows();
				jS.setTdIds();
				jS.obj.pane().scroll();
				
				jS.offsetFormulas({
					row: jS.rowLast,
					col: 0
				}, {
					row: -1,
					col: 0
				});
				
				jS.setDirty(true);
				
				jS.evt.cellEditAbandon();
				
				jS.trigger('deleteRow', lastRow);
			},
			deleteColumn: function(skipCalc) { /* removes the currently selected column */
				var colLast = jS.colLast;
				jS.obj.barHelper().remove();
				jS.obj.barTop().children().eq(jS.colLast).remove();
				jS.obj.sheet().find('colgroup col').eq(jS.colLast).remove();
				
				var size = jS.sheetSize();
				for (var i = 0; i <= size.height; i++) {
					jQuery(jS.getTd(jS.i, i, jS.colLast)).remove();
				}
				
				var w = jS.refreshLabelsColumns();
				jS.setTdIds();
				jS.obj.sheet().width(w);
				jS.obj.pane().scroll();
				
				jS.offsetFormulas({
					row: 0,
					col: jS.colLast
				}, {
					row: 0,
					col: -1
				});
				
				jS.setDirty(true);
				
				jS.evt.cellEditAbandon();
				
				jS.trigger('deleteColumn', lastCol);
			},
			sheetTab: function(get) { /* manages a tabs inner value
											get: bool, makes return the current value of the tab;
										*/
				var sheetTab = '';
				if (get) {
					sheetTab = jS.obj.sheet().attr('title');
					sheetTab = (sheetTab ? sheetTab : 'Spreadsheet ' + (jS.i + 1));
				} else if (jS.isSheetEditable() && s.editableTabs) { //ensure that the sheet is editable, then let them change the sheet's name
					var newTitle = prompt("What would you like the sheet's title to be?", jS.sheetTab(true));
					if (!newTitle) { //The user didn't set the new tab name
						sheetTab = jS.obj.sheet().attr('title');
						newTitle = (sheetTab ? sheetTab : 'Spreadsheet' + (jS.i + 1));
					} else {
						jS.setDirty(true);
						jS.obj.sheet().attr('title', newTitle);
						jS.obj.tab().html(newTitle);
						
						sheetTab = newTitle;
					}
				}
				return jQuery('<div />').text(sheetTab).html();
			},
			print: function(o) { /* prints a value in a new window
									o: string, any string;
								*/
				var w = window.open();
				w.document.write("<html><body><xmp>" + o + "\n</xmp></body></html>");
				w.document.close();
			},
			viewSource: function(pretty) { /* prints the source of a sheet for a user to see
												pretty: bool, makes html a bit easier for the user to see;
											*/
				var sheetClone = jS.sheetDecorateRemove(true);
				
				var s = "";
				if (pretty) {
					jQuery(sheetClone).each(function() {
						s += jS.HTMLtoPrettySource(this);
					});
				} else {
					s += jQuery('<div />').html(sheetClone).html();
				}
				
				jS.print(s);
				
				return false;
			},
			saveSheet: function() { /* saves the sheet */
				var v = jS.sheetDecorateRemove(true);
				var d = jQuery('<div />').html(v).html();

				jQuery.ajax({
					url: s.urlSave,
					type: 'POST',
					data: 's=' + d,
					dataType: 'html',
					success: function(data) {
						jS.setDirty(false);
						jS.trigger('saveSheet');
					}
				});
			},
			HTMLtoCompactSource: function(node) { /* prints html to 1 line
													node: object;
												*/
				var result = "";
				if (node.nodeType == 1) {
					// ELEMENT_NODE
					result += "<" + node.tagName;
					hasClass = false;
					
					var n = node.attributes.length;
					for (var i = 0, hasClass = false; i < n; i++) {
						var key = node.attributes[i].name;
						var val = node.getAttribute(key);
						if (val) {
							if (key == "contentEditable" && val == "inherit") {
								continue;
								// IE hack.
							}
							if (key == "class") {
								hasClass = true;
							}
							
							if (typeof(val) == "string") {
								result += " " + key + '="' + val.replace(/"/g, "'") + '"';
							} else if (key == "style" && val.cssText) {
								result += ' style="' + val.cssText + '"';
							}
						}
					}

					if (node.tagName == "COL") {
						// IE hack, which doesn't like <COL..></COL>.
						result += '/>';
					} else {
						result += ">";
						var childResult = "";
						jQuery(node.childNodes).each(function() {
							childResult += jS.HTMLtoCompactSource(this);
						});
						result += childResult;
						result += "</" + node.tagName + ">";
					}

				} else if (node.nodeType == 3) {
					// TEXT_NODE
					result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
				}
				return result;
			},
			HTMLtoPrettySource: function(node, prefix) {/* prints html to manu lines, formatted for easy viewing
															node: object;
															prefix: string;
														*/
				if (!prefix) {
					prefix = "";
				}
				var result = "";
				if (node.nodeType == 1) {
					// ELEMENT_NODE
					result += "\n" + prefix + "<" + node.tagName;
					var n = node.attributes.length;
					for (var i = 0; i < n; i++) {
						var key = node.attributes[i].name;
						var val = node.getAttribute(key);
						if (val) {
							if (key == "contentEditable" && val == "inherit") {
								continue; // IE hack.
							}
							if (typeof(val) == "string") {
								result += " " + key + '="' + val.replace(/"/g, "'") + '"';
							} else if (key == "style" && val.cssText) {
								result += ' style="' + val.cssText + '"';
							}
						}
					}
					if (node.childNodes.length <= 0) {
						result += "/>";
					} else {
						result += ">";
						var childResult = "";
						var n = node.childNodes.length;
						for (var i = 0; i < n; i++) {
							childResult += jS.HTMLtoPrettySource(node.childNodes[i], prefix + "  ");
						}
						result += childResult;
						if (childResult.indexOf('\n') >= 0) {
							result += "\n" + prefix;
						}
						result += "</" + node.tagName + ">";
					}
				} else if (node.nodeType == 3) {
					// TEXT_NODE
					result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
				}
				return result;
			},
			followMe: function(td) { /* scrolls the sheet to the selected cell
										td: object, td object;
									*/
				td = (td ? td : jQuery(jS.cellLast.td));
				var pane = jS.obj.pane();
				var panePos = pane.offset();
				var paneWidth = pane.width();
				var paneHeight = pane.height();

				var tdPos = td.offset();
				var tdWidth = td.width();
				var tdHeight = td.height();
				
				var margin = 20;
				
				//jS.log('td: [' + tdPos.left + ', ' + tdPos.top + ']');
				//jS.log('pane: [' + panePos.left + ', ' + panePos.top + ']');
				
				if ((tdPos.left + tdWidth + margin) > (panePos.left + paneWidth)) { //right
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50,
						offset: - ((paneWidth - tdWidth) - margin)
					});
				} else if (tdPos.left < panePos.left) { //left
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50
					});
				}
				
				if ((tdPos.top + tdHeight + margin) > (panePos.top + paneHeight)) { //bottom
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50,
						offset: - ((paneHeight - tdHeight) - margin)
					});
				} else if (tdPos.top < panePos.top) { //top
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50
					});
				}

				
				jS.autoFillerGoToTd(td, tdHeight, tdWidth);
			},
			autoFillerGoToTd: function(td, tdHeight, tdWidth) { /* moves autoFiller to a selected cell
																	td: object, td object;
																	tdHeight: height of a td object;
																	tdWidth: width of a td object;
																*/
				td = (td ? td : jQuery(jS.cellLast.td));
				tdHeight = (tdHeight ? tdHeight : td.height());
				tdWidth = (tdWidth ? tdWidth : td.width());
				
				if (s.autoFiller) {
					if (td.attr('id')) { //ensure that it is a usable cell
						tdPos = td.position();
						jS.obj.autoFiller()
							.show()
							.css('top', ((tdPos.top + (tdHeight ? tdHeight : td.height()) - 3) + 'px'))
							.css('left', ((tdPos.left + (tdWidth ? tdWidth : td.width()) - 3) + 'px'));
					}
				}
			},
			isRowHeightSync: [],
			setActiveSheet: function(i) { /* sets active a spreadsheet inside of a sheet instance 
											i: int, a sheet integer desired to show;
											*/
				i = (i ? i : 0);

				jS.obj.tableControlAll().hide().eq(i).show();
				jS.i = i;			
				
				jS.themeRoller.tab.setActive();
				
				if (!jS.isRowHeightSync[i]) { //this makes it only run once, no need to have it run every time a user changes a sheet
					jS.isRowHeightSync[i] = true;
					jS.obj.sheet().find('tr').each(function(j) {
						jS.attrH.setHeight(j, 'cell');
						/*
						fixes a wired bug with height in chrome and ie
						It seems that at some point during the sheet's initializtion the height for each
						row isn't yet clearly defined, this ensures that the heights for barLeft match 
						that of each row in the currently active sheet when a user uses a non strict doc type.
						*/
					});
				}
				
				jS.readOnly[i] = jS.obj.sheet().hasClass('readonly');
				
				jS.sheetSyncSize();
				//jS.replaceWithSafeImg();
			},
			openSheetURL: function ( url ) { /* opens a table object from a url, then opens it
												url: string, location;
											*/
				s.urlGet = url;
				return jS.openSheet();
			},
			openSheet: function(o, reloadBarsOverride) { /* opens a spreadsheet into the active sheet instance \
															o: object, a table object;
															reloadBarsOverride: if set to true, foces bars on left and top not be reloaded;
														*/
				if (!jS.isDirty ? true : confirm(jS.msg.openSheet)) {
					jS.controlFactory.header();
					
					var fnAfter = function(i, l) {
						if (i == (l - 1)) {
							jS.i = 0;
							jS.setActiveSheet();
							jS.themeRoller.resize();
							for (var i = 0; i <= jS.sheetCount; i++) {
								jS.calc(i);
							}
							
							jS.trigger('sheetOpened', [i]);
						}
					};
					
					if (!o) {
						jQuery('<div />').load(s.urlGet, function() {
							var sheets = jQuery(this).find('table');
							sheets.each(function(i) {
								jS.controlFactory.sheetUI(jQuery(this), i, function() { 
									fnAfter(i, sheets.length);
								}, true);
							});
						});
					} else {
						var sheets = jQuery('<div />').html(o).children('table');
						sheets.show().each(function(i) {
							jS.controlFactory.sheetUI(jQuery(this), i,  function() { 
								fnAfter(i, sheets.length);
							}, (reloadBarsOverride ? true : false));
						});
					}
					
					jS.setDirty(false);
					
					return true;
				} else {
					return false;
				}
			},
			newSheet: function() { /* creates a new shet from size */
				var size = prompt(jS.msg.newSheet);
				if (size) {
					jS.openSheet(jQuery.sheet.makeTable.fromSize(size));
				}
			},
			importRow: function(rowArray) { /* creates a new row and then applies an array's values to each of it's new values
												rowArray: array;
											*/
				jS.controlFactory.addRow(null, null, ':last');

				var error = "";
				jS.obj.sheet().find('tr:last td').each(function(i) {
					jQuery(this).removeAttr('formula');
					try {
						//To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
						if ((rowArray[i] + '').charAt(0) == "=") {
							jQuery(this).attr('formula', rowArray[i]);					
						} else {
							jQuery(this).html(rowArray[i]);
						}
					} catch(e) {
						//We want to make sure that is something bad happens, we let the user know
						error += e + ';\n';
					}
				});
				
				if (error) {//Show them the errors
					alert(error);
				}
				//Let's recalculate the sheet just in case
				jS.setTdIds();
				jS.calc();
			},
			importColumn: function(columnArray) { /* creates a new column and then applies an array's values to each of it's new values
													columnArray: array;
												*/
				jS.controlFactory.addColumn();

				var error = "";
				jS.obj.sheet().find('tr').each(function(i) {
					var o = jQuery(this).find('td:last');
					try {
						//To test this, we need to first make sure it's a string, so converting is done by adding an empty character.
						if ((columnArray[i] + '').charAt(0) == "=") {
							o.attr('formula', columnArray[i]);					
						} else {
							o.html(columnArray[i]);
						}
					} catch(e) {
						//We want to make sure that is something bad happens, we let the user know
						error += e + ';\n';
					}
				});
				
				if (error) {//Show them the errors
					alert(error);
				}
				//Let's recalculate the sheet just in case
				jS.setTdIds();
				jS.calc();
			},
			exportSheet: { /* exports sheets into xml, json, or html formats */
				xml: function (skipCData) {
					var sheetClone = jS.sheetDecorateRemove(true);			
					var document = "";
					
					var cdata = ['<![CDATA[',']]>'];
					
					if (skipCData) {
						cdata = ['',''];
					}

					jQuery(sheetClone).each(function() {
						var row = '';
						var table = jQuery(this);
						var colCount = 0;
						var col_widths = '';

						table.find('colgroup').children().each(function (i) {
							col_widths += '<c' + i + '>' + (jQuery(this).attr('width') + '').replace('px', '') + '</c' + i + '>';
						});
						
						var trs = table.find('tr');
						var rowCount = trs.length;
						
						trs.each(function(i){
							var col = '';
							
							var tr = jQuery(this);
							var h = tr.attr('height');
							var height = (h ? h : s.colMargin);
							var tds = tr.find('td');
							colCount = tds.length;
							
							tds.each(function(j){
								var td = jQuery(this);
								var colSpan = td.attr('colspan');
								colSpan = (colSpan > 1 ? colSpan : '');
								
								var formula = td.attr('formula');
								var text = (formula ? formula : td.text());
								var cl = td.attr('class');
								var style = td.attr('style');
									
								//Add to current row
								col += '<c' + j +
									(style ? ' style=\"' + style + '\"' : '') + 
									(cl ? ' class=\"' + cl + '\"' : '') + 
									(colSpan ? ' colspan=\"' + colSpan + '\"' : '') +
								'>' + text + '</c' + j + '>';
							});
							
							row += '<r' + i + ' h=\"' + height + '\">' + col + '</r' + i + '>';
						});

						document += '<document title="' + table.attr('title') + '">' +
									'<metadata>' +
										'<columns>' + colCount + '</columns>' +  //length is 1 based, index is 0 based
										'<rows>' + rowCount + '</rows>' +  //length is 1 based, index is 0 based
										'<col_widths>' + col_widths + '</col_widths>' +
									'</metadata>' +
									'<data>' + row + '</data>' +
								'</document>';
					});

					return '<documents>' + document + '</documents>';
				},
				json: function() {
					var sheetClone = jS.sheetDecorateRemove(true);
					var documents = []; //documents
					
					jQuery(sheetClone).each(function() {
						var document = {}; //document
						document['metadata'] = {};
						document['data'] = {};
						
						var table = jQuery(this);
						
						var trs = table.find('tr');
						var rowCount = trs.length;
						var colCount = 0;
						var col_widths = '';
						
						trs.each(function(i) {
							var tr = jQuery(this);
							var tds = tr.find('td');
							colCount = tds.length;
							
							document['data']['r' + i] = {};
							document['data']['r' + i]['h'] = tr.attr('height');
							
							tds.each(function(j) {
								var td = jQuery(this);
								var colSpan = td.attr('colspan');
								colSpan = (colSpan > 1 ? colSpan : null);
								var formula = td.attr('formula');

								document['data']['r' + i]['c' + j] = {
									'value': (formula ? formula : td.text()),
									'style': td.attr('style'),
									'colspan': colSpan,
									'cl': td.attr('class')
								};
							});
						});
						document['metadata'] = {
							'columns': colCount, //length is 1 based, index is 0 based
							'rows': rowCount, //length is 1 based, index is 0 based
							'title': table.attr('title'),
							'col_widths': {}
						};
						
						table.find('colgroup').children().each(function(i) {
							document['metadata']['col_widths']['c' + i] = (jQuery(this).attr('width') + '').replace('px', '');
						});
						
						documents.push(document); //append to documents
					});
					return documents;
				},
				html: function() {
					return jS.sheetDecorateRemove(true);
				}
			},
			sheetSyncSizeToDivs: function() { /* syncs a sheet's size from bars/divs */
				var newSheetWidth = 0;
				jS.obj.barTop().children().each(function() {
					newSheetWidth += jQuery(this).width() - s.boxModelCorrection;
				});
				jS.obj.sheet()
					.width(newSheetWidth)
					.attr('width', newSheetWidth + 'px')
					.css('width', newSheetWidth + 'px');
				return newSheetWidth;
			},
			sheetSyncSizeToCols: function(o) { /* syncs a sheet's size from it's col objects
													o: object, sheet object;
												*/
				var newSheetWidth = 0;
				o = (o ? o : jS.obj.sheet());
				o.find('colgroup col').each(function() {
					newSheetWidth += jQuery(this).width();
				});
				o.width(newSheetWidth);
			},
			sheetSyncSize: function() { /* syncs a sheet's size to that of the jQuery().sheet() caller object */
				var h = s.height;
				if (!h) {
					h = 400; //Height really needs to be set by the parent
				} else if (h < 200) {
					h = 200;
				}
				s.parent
					.height(h)
					.width(s.width);
					
				var w = s.width - jS.attrH.width(jS.obj.barLeftParent()) - (s.boxModelCorrection);
				
				h = h - jS.attrH.height(jS.obj.controls()) - jS.attrH.height(jS.obj.barTopParent()) - (s.boxModelCorrection * 2);
				
				jS.obj.pane()
					.height(h)
					.width(w)
					.parent()
						.width(w);
				
				jS.obj.ui()
					.width(w + jS.attrH.width(jS.obj.barLeftParent()));
						
				jS.obj.barLeftParent()
					.height(h);
				
				jS.obj.barTopParent()
					.width(w)
					.parent()
						.width(w);
			},
			cellChangeStyle: function(style, value) { /* changes a cell's style and makes it undoable/redoable
														style: string, css style name;
														value: string, css setting;
													*/
				jS.cellUndoable.add(jS.obj.cellHighlighted()); //save state, make it undoable
				jS.obj.cellHighlighted().css(style, value);
				jS.cellUndoable.add(jS.obj.cellHighlighted()); //save state, make it redoable

			},
			cellFind: function(v) { /* finds a cell in a sheet from a value
										v: string, value in a cell to find;
									*/
				if(!v) {
					v = prompt("What are you looking for in this spreadsheet?");
				}
				if (v) {//We just do a simple uppercase/lowercase search.
					var o = jS.obj.sheet().find('td:contains("' + v + '")');
					
					if (o.length < 1) {
						o = jS.obj.sheet().find('td:contains("' + v.toLowerCase() + '")');
					}
					
					if (o.length < 1) {
						o = jS.obj.sheet().find('td:contains("' + v.toUpperCase() + '")');
					}
					
					o = o.eq(0);
					if (o.length > 0) {
						jS.cellEdit(o);
					} else {
						alert(jS.msg.cellFind);
					}
				}
			},
			cellSetActiveBar: function(type, start, end) { /* sets a bar active
																type: string, "col" || "row" || "all";
																start: int, int to start highlighting from;
																start: int, int to end highlighting to;
															*/
				var size = jS.sheetSize(jQuery('#' + jS.id.sheet + jS.i));
				var first = (start < end ? start : end);
				var last = (start < end ? end : start);
				
				var setActive = function(td, rowStart, colStart, rowFollow, colFollow) {
					switch (s.cellSelectModel) {
						case 'oo': //follow cursor behavior
							jS.cellEdit(jQuery(jS.getTd(jS.i, rowFollow, colFollow)));
							break;
						default: //stay at initial cell
							jS.cellEdit(jQuery(jS.getTd(jS.i, rowStart, colStart)));
							break;
					}
					
					setActive = function(td) { //save resources
						return td;
					};
					
					return td;
				};

				var cycleFn;

				var td = [];
				
				switch (type) {
					case 'col':
						cycleFn = function() {
							for (var i = 0; i <= size.height; i++) { //rows
								for (var j = first; j <= last; j++) { //cols
									td.push(jS.getTd(jS.i, i, j));
									jS.themeRoller.cell.setHighlighted(setActive(td[td.length - 1], 0, start, 0, end));
								}
							}
						};
						break;
					case 'row':
						cycleFn = function() {
							for (var i = first; i <= last; i++) { //rows
								for (var j = 0; j <= size.width; j++) { //cols
									td.push(jS.getTd(jS.i, i, j));
									jS.themeRoller.cell.setHighlighted(setActive(td[td.length - 1], start, 0, end, 0));
								}
							}
						};
						break;
					case 'all':
						cycleFn = function() {
							setActive = function(td) {
								jS.cellEdit(jQuery(td));
								setActive = function() {};
							};
							for (var i = 0; i <= size.height; i++) {
								for (var j = 0; j <= size.width; j++) {
									td.push(jS.getTd(jS.i, i, j));
									setActive(td[td.length - 1]);
									jS.themeRoller.cell.setHighlighted(td[td.length - 1]);
								}
							}
							first = {row: 0,col: 0};
							last = {
								row: size.height,
								col: size.width
							}
						};
						break;
				}
				
				cycleFn();
				
				jS.highlightedLast.td = td;
				jS.highlightedLast.rowStart = first.row;
				jS.highlightedLast.colStart = first.col;
				jS.highlightedLast.rowEnd = last.row;
				jS.highlightedLast.colEnd = last.col;
			},
			sheetClearActive: function() { /* clears formula and bars from being highlighted */
				jS.obj.formula().val('');
				jS.obj.barSelected().removeClass(jS.cl.barSelected);
			},
			getTdRange: function(e, v, newFn, notSetFormula) { /* gets a range of selected cells, then returns it */
				jS.cellLast.isEdit = true;
				
				var range = function(loc) {
					if (loc.first.col > loc.last.col ||
						loc.first.row > loc.last.row
					) {
						return {
							first: jSE.parseCellName(loc.last.col, loc.last.row),
							last: jSE.parseCellName(loc.first.col, loc.first.row)
						};
					} else {
						return {
							first: jSE.parseCellName(loc.first.col, loc.first.row),
							last: jSE.parseCellName(loc.last.col, loc.last.row)
						};
					}
				};
				var label = function(loc) {
					var rangeLabel = range(loc);
					var v2 = v + '';
					v2 = (v2.match(/=/) ? v2 : '=' + v2); //make sure we can use this value as a formula
					
					if (newFn || v2.charAt(v2.length - 1) != '(') { //if a function is being sent, make sure it can be called by wrapping it in ()
						v2 = v2 + (newFn ? newFn : '') + '(';
					}
					
					var formula;
					var lastChar = '';
					if (rangeLabel.first != rangeLabel.last) {
						formula = rangeLabel.first + ':' + rangeLabel.last;
					} else {
						formula = rangeLabel.first;
					}
					
					if (v2.charAt(v2.length - 1) == '(') {
						lastChar = ')';
					}
					
					return v2 + formula + lastChar;
				};
				var newVal = '';
				
				if (e) { //if from an event, we use mousemove method
					var loc = {
						first: jS.getTdLocation([e.target])
					};
					
					var sheet = jS.obj.sheet().mousemove(function(e) {
						loc.last = jS.getTdLocation([e.target]);
						
						newVal = label(loc);
						
						if (!notSetFormula) {
							jS.obj.formula().val(newVal);
							jS.obj.inPlaceEdit().val(newVal);
						}
					});
					
					jQuery(document).one('mouseup', function() {
						sheet.unbind('mousemove');
						return newVal;
					});
				} else {
					var cells = jS.obj.cellHighlighted().not(jS.obj.cellActive());
					
					if (cells.length) {
						var loc = { //tr/td column and row index
							first: jS.getTdLocation(cells.first()),
							last: jS.getTdLocation(cells.last())
						};
						
						newVal = label(loc);
						
						if (!notSetFormula) {
							jS.obj.formula().val(newVal);
							jS.obj.inPlaceEdit().val(newVal);
						}
						
						return newVal;
					} else {
						return '';
					}
				}
			},
			getTdId: function(tableI, row, col) { /* makes a td if from values given
													tableI: int, table integer;
													row: int, row integer;
													col: int, col integer;
												*/
				return I + '_table' + tableI + '_cell_c' + col + '_r' + row;
			},
			getTd: function(tableI, row, col) { /* gets a td
													tableI: int, table integer;
													row: int, row integer;
													col: int, col integer;
												*/
				return document.getElementById(jS.getTdId(tableI, row, col));
			},
			getTdLocation: function(td) { /* gets td column and row int
												td: object, td object;
											*/
				if (!td || !td[0]) return {col: 0, row: 0};
				return {
					col: parseInt(td[0].cellIndex),
					row: parseInt(td[0].parentNode.rowIndex)
				}
			},
			getTdFromXY: function(left, top, skipOffset) { /* gets cell from point
																left: int, pixels left;
																top: int, pixels top;
																skipOffset: bool, skips pane offset;
															*/
				var pane = jS.obj.pane();
				var paneOffset = (skipOffset ? {left: 0, top: 0} : pane.offset());
				
				top += paneOffset.top + 2;
				left += paneOffset.left + 2;
				
				//here we double check that the coordinates are inside that of the pane, if so then we can continue
				if ((top >= paneOffset.top && top <= paneOffset.top + pane.height()) &&
					(left >= paneOffset.left && left <= paneOffset.left + pane.width())) {
					var td = jQuery(document.elementFromPoint(left - $window.scrollLeft(), top - $window.scrollTop()));
					
					
					//I use this snippet to help me know where the point was positioned
					/*jQuery('<div class="ui-widget-content" style="position: absolute;">TESTING TESTING</div>')
						.css('top', top + 'px')
						.css('left', left + 'px')
						.appendTo('body');
					*/
					
					if (jS.isTd(td)) {
						return td;
					}
					return false;
				}
			},
			getBarLeftIndex: function(o) { /* get's index from object */
				var i = jQuery.trim(jQuery(o).text());
				if (isNaN(i)) {
					return -1;
				} else {
					return i - 1;
				}
			},
			getBarTopIndex: function(o) { /* get's index from object */
				var v = jQuery.trim(jQuery(o).text());
				if (!v) return -1;
				
				var i = jSE.columnLabelIndex(v);
				i = parseInt(i);
				
				if (isNaN(i)) {
					return -1;
				} else {
					return i;
				}
			},
			EMPTY_VALUE: {},
			time: { /* time loggin used with jS.log, useful for finding out if new methods are faster */
				now: new Date(),
				last: new Date(),
				diff: function() {
					return Math.abs(Math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
				},
				set: function() {
					this.last = this.now;
					this.now = new Date();
				},
				get: function() {
					return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
				}
			},
			log: function(msg) {  //The log prints: {Current Time}, {Seconds from last log};{msg}
				jS.time.set();
				console.log(jS.time.get() + ', ' + jS.time.diff() + '; ' + msg);
			},
			replaceWithSafeImg: function(o) {  //ensures all pictures will load and keep their respective bar the same size.
				(o ? o : jS.obj.sheet().find('img')).each(function() {			
					var src = jQuery(this).attr('src');
					jQuery(this).replaceWith(jS.controlFactory.safeImg(src, jS.getTdLocation(jQuery(this).parent()).row));
				});
			},
			
			isDirty:  false,
			setDirty: function(dirty) { jS.isDirty = dirty; },
			appendToFormula: function(v, o) {
				var formula = jS.obj.formula();
				
				var fV = formula.val();
				
				if (fV.charAt(0) != '=') {
					fV = '=' + fV;
				}
				
				formula.val(fV + v);
			},
			cellUndoable: { /* makes cell editing undoable and redoable
								there should always be 2 cellUndoable.add()'s every time used, one to save the current state, the second to save the new
							*/
				undoOrRedo: function(undo) {
					//hide the autoFiller, it can get confused
					if (s.autoFiller) {
						jS.obj.autoFiller().hide();
					}
					
					if (undo && this.i > 0) {
						this.i--;
						this.i--;
					} else if (!undo && this.i < this.stack.length) {
						this.i++;
						this.i++;
					}
					
					this.get().clone().each(function() {
						var o = jQuery(this);
						var id = o.attr('undoable');
						if (id) {
							jQuery('#' + id).replaceWith(
								o
									.removeAttr('undoable')
									.attr('id', id)
							);
						} else {
							jS.log('Not available.');
						}
					});
					
					jS.themeRoller.cell.clearActive();
					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();
					
					jS.calc();
				},
				get: function() { //gets the current cell
					return jQuery(this.stack[this.i]);
				},
				add: function(tds) {
					var oldTds = tds.clone().each(function() {
						var o = jQuery(this);
						var id = o.attr('id');
						if (!id) return;
						o
							.removeAttr('id') //id can only exist in one location, on the sheet, so here we use the id as the attr 'undoable'
							.attr('undoable', id)
							.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
					});
					
					this.stack[this.i++] = oldTds;
						
					if (this.stack.length > this.i) {
						for (var i = this.stack.length; i > this.i; i--) {
							this.stack.pop();
						}
					}
					
					
					if (this.stack.length > 20) { //undoable count, we want to be careful of too much memory consumption
						this.stack.shift(); //drop the first value
					}
						
				},
				i: 0,
				stack: []
			},
			sheetSize: function(o) {
				var loc = jS.getTdLocation((o ? o : jS.obj.sheet()).find('td:last'));
				return {
					width: loc.col,
					height: loc.row
				};
			},
			toggleState:  function(replacementSheets) {
				if (s.allowToggleState) {
					if (s.editable) {
						jS.evt.cellEditAbandon();
						jS.saveSheet();
					}
					jS.setDirty(false);
					s.editable = !s.editable;
					jS.obj.tabContainer().remove();
					var sheets = (replacementSheets ? replacementSheets : jS.obj.sheetAll().clone());
					origParent.children().remove();
					jS.openSheet(sheets, true);
				}
			},
			setCellRef: function(ref) {
				var td = jS.obj.cellActive();
				loc = jS.getTdLocation(td);
				
				cellRef = (ref ? ref : prompt('Enter the name you would like to reference the cell by.'));
				
				if (cellRef) {
					jS.spreadsheets[cellRef] = jS.spreadsheets[jS.i][loc.row][loc.col];
				}
				
				jS.calc();
			}
		};

		var $window = jQuery(window);
		
		var o; var emptyFN = function() {};
		
		//ready the sheet's parser
		jS.lexer = function() {};
		jS.lexer.prototype = parser.lexer;
		jS.parser = function() {
			this.lexer = new jS.lexer();
			this.yy = {};
		};
		jS.parser.prototype = parser;
		
		jS.Parser = new jS.parser;
		
		if (s.buildSheet) {//override urlGet, this has some effect on how the topbar is sized
			if (typeof(s.buildSheet) == 'object') {
				o = s.buildSheet;
			} else if (s.buildSheet == true || s.buildSheet == 'true') {
				o = jQuery(s.parent.html());
			} else if (s.buildSheet.match(/x/i)) {
				o = jQuery.sheet.makeTable.fromSize(s.buildSheet);
			}
		}
		
		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
		//jQuery(this).html(s.loading);
		s.origParent = origParent;
		s.parent
			.html('')
			.addClass(jS.cl.parent);
		
		origParent
			.bind('switchSpreadsheet', function(e, js, i){
				jS.switchSpreadsheet(i);
			})
			.bind('renameSpreadsheet', function(e, js, i){
				jS.renameSpreadsheet(i);
			});
		
		//Use the setting height/width if they are there, otherwise use parent's
		s.width = (s.width ? s.width : s.parent.width());
		s.height = (s.height ? s.height : s.parent.height());
		
		
		// Drop functions if they are not needed & save time in recursion
		if (!s.log) {
			jS.log = emptyFN;
		}
		
		if (!jQuery.ui || !s.resizable) {
			jS.resizable = jS.draggable = emptyFN;
		}
		
		if (!jQuery.support.boxModel) {
			s.boxModelCorrection = 0;
		}
		
		if (!jQuery.scrollTo) {
			jS.followMe = emptyFN;
		}
		
		if (!s.barMenus) {
			jS.controlFactory.barTopMenu = jS.controlFactory.barLeftMenu = emptyFN;
		}
		
		if (!s.freezableCells) { //this feature does not yet work
			jS.controlFactory.barTopHandle = jS.controlFactory.barLeftHandle = emptyFN;
		}
		
		if (s.calcOff) {
			jS.calc = emptyFN;
		}
		
		if (!Raphael) {
			jSE.chart = emptyFN;
		}
		
		//jS.log('Startup');
		
		$window
			.resize(function() {
				if (jS) { //We check because jS might have been killed
					s.width = s.parent.width();
					s.height = s.parent.height();
					jS.sheetSyncSize();
				}
			});
		
		
		if (jQuery.sheet.fn) { //If the new calculations engine is alive, fill it too, we will remove above when no longer needed.
			//Extend the calculation engine plugins
			jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, s.calculations);
		
			//Extend the calculation engine with advanced functions
			if (jQuery.sheet.advancedfn) {
				jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, jQuery.sheet.advancedfn);
			}
		
			//Extend the calculation engine with finance functions
			if (jQuery.sheet.financefn) {
				jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, jQuery.sheet.financefn);
			}
		}
		
		if (!s.alertFormulaErrors) {
			jS.alertFormulaError = emptyFN;
		}
		
		jS.openSheet(o, s.forceColWidthsOnStartup);
		jS.s = s;
		
		return jS;
	},
	makeTable : {
		xml: function (data) { /* creates a table from xml, note: will not accept CDATA tags
								data: object, xml object;
								*/
			var tables = jQuery('<div />');
		
			jQuery(data).find('document').each(function(i) { //document
				var table = jQuery('<table />');
				var tableWidth = 0;
				var colgroup = jQuery('<colgroup />').appendTo(table);
				var tbody = jQuery('<tbody />');
			
				var metaData = jQuery(this).find('metadata');
				var columnCount = metaData.find('columns').text();
				var rowCount = metaData.find('rows').text();
				var title = jQuery(this).attr('title');
				var data = jQuery(this).find('data');
				var col_widths = metaData.find('col_widths').children();
				
				//go ahead and make the cols for colgroup
				for (var i = 0; i < parseInt(jQuery.trim(columnCount)); i++) {
					var w = parseInt(col_widths.eq(i).text().replace('px', ''));
					w = (w ? w : 120); //if width doesn't exist, grab default
					tableWidth += w;
					colgroup.append('<col width="' + w + 'px" style="width: ' + w + 'px;" />');
				}
				
				table
					.width(tableWidth)
					.attr('title', title);
				
				for (var i = 0; i < rowCount; i++) { //rows
					var tds = data.find('r' + i);
					var height = (data.attr('h') + '').replace('px', '');
					height = parseInt(height);
					
					var thisRow = jQuery('<tr height="' + (height ? height : 18) + 'px" />');
					
					for (var j = 0; j < columnCount; j++) { //cols, they need to be counted because we don't send them all on export
						var newTd = '<td />'; //we give td a default empty td
						var td = tds.find('c' + j);
						
						if (td) {
							var text = td.text() + '';
							var cl = td.attr('class');
							var style = td.attr('style');
							var colSpan = td.attr('colspan');

							
							var formula = '';
							if (text.charAt(0) == '=') {
								formula = ' formula="' + text + '"';
							}
							
							newTd = '<td' + formula + 
								(style ? ' style=\"' + style + '\"' : '') + 
								(cl ? ' class=\"' + cl + '\"' : '') +
								(colSpan ? ' colspan=\"' + colSpan + '\"' : '') +
								(height ? ' height=\"' + height + 'px\"' : '') +
							'>' + text + '</td>';
						}
						thisRow.append(newTd);
					}	
					tbody.append(thisRow);
				}
				table
					.append(tbody)
					.appendTo(tables);
			});
			
			return tables.children();
		},
		json: function(data, makeEval) { /* creates a sheet from json data, for format see top
											data: json;
											makeEval: bool, if true evals json;
										*/
			sheet = (makeEval == true ? eval('(' + data + ')') : data);
			
			var tables = jQuery('<div />');
			
			sheet = (jQuery.isArray(sheet) ? sheet : [sheet]);
			
			for (var i = 0; i < sheet.length; i++) {
				var colCount = parseInt(sheet[i].metadata.columns);
				var rowCount = parseInt(sheet[i].metadata.rows);
				title = sheet[i].metadata.title;
				title = (title ? title : "Spreadsheet " + i);
			
				var table = jQuery("<table />");
				var tableWidth = 0;
				var colgroup = jQuery('<colgroup />').appendTo(table);
				var tbody = jQuery('<tbody />');
				
				//go ahead and make the cols for colgroup
				if (sheet[i]['metadata']['col_widths']) {
					for (var x = 0; x < colCount; x++) {
						var w = 120;
						if (sheet[i]['metadata']['col_widths']['c' + x]) {
							var newW = parseInt(sheet[i]['metadata']['col_widths']['c' + x].replace('px', ''));
							w = (newW ? newW : 120); //if width doesn't exist, grab default
							tableWidth += w;
						}
						colgroup.append('<col width="' + w + 'px" style="width: ' + w + 'px;" />');
					}
				}
				
				table
					.attr('title', title)
					.width(tableWidth);
				
				for (var x = 0; x < rowCount; x++) { //tr
					var tr = jQuery('<tr />').appendTo(table);
					tr.attr('height', (sheet[i]['data']['r' + x].h ? sheet[i]['data']['r' + x].h : 18));
					
					for (var y = 0; y < colCount; y++) { //td
						var cell = sheet[i]['data']['r' + x]['c' + y];
						var cur_val;
						var colSpan;
						var style;
						var cl;
						
						if (cell) {
							cur_val = cell.value + '';
							colSpan = cell.colSpan + '';
							style = cell.style + '';
							cl = cell.cl + '';
						}

						var cur_td = jQuery('<td' + 
								(style ? ' style=\"' + style + '\"' : '' ) + 
								(cl ? ' class=\"' + cl + '\"' : '' ) + 
								(colSpan ? ' colspan=\"' + colSpan + '\"' : '' ) + 
							' />');
						try {
							if(typeof(cur_val) == "number") {
								cur_td.html(cur_val);
							} else {
								if (cur_val.charAt(0) == '=') {
									cur_td.attr("formula", cur_val);
								} else {
									cur_td.html(cur_val);
								}
							}
						} catch (e) {}
					
						tr.append(cur_td);

					}
				}
				
				tables.append(table);
			}
			return tables.children();
		},
		fromSize: function(size, h, w) { /* creates a spreadsheet object from a size given 
											size: string, example "10x100" which means 10 columns by 100 rows;
											h: int, height for each new row;
											w: int, width of each new column;
										*/
			if (!size) {
				size = "5x10";
			}
			size = size.toLowerCase().split('x');

			var columnsCount = parseInt(size[0]);
			var rowsCount = parseInt(size[1]);
			
			//Create elements before loop to make it faster.
			var newSheet = jQuery('<table />');
			var standardTd = '<td></td>';
			var tds = '';
			
			//Using -- is many times faster than ++
			for (var i = columnsCount; i >= 1; i--) {
				tds += standardTd;
			}

			var standardTr = '<tr' + (h ? ' height="' + h + 'px" style="height: ' + h + 'px;"' : '') + '>' + tds + '</tr>';
			var trs = '';
			for (var i = rowsCount; i >= 1; i--) {
				trs += standardTr;
			}
			
			newSheet.html('<tbody>' + trs + '</tbody>');
			
			if (w) {
				newSheet.width(columnsCount * w);
			}
			
			return newSheet;
		}
	},
	killAll: function() { /* removes all sheets */
		if (jQuery.sheet) {
			if (jQuery.sheet.instance) {
				for (var i = 0; i < jQuery.sheet.instance.length; i++) {
					if (jQuery.sheet.instance[i]) {
						if (jQuery.sheet.instance[i].kill) {
							jQuery.sheet.instance[i].kill();
						}
					}
				}
			}
		}
	},
	paneScrollLocker: function(e, jS) { //This can be used with setting fnPaneScroll to lock all loaded sheets together when scrolling, useful in history viewing
		var pane = jS.obj.pane();
		
		jQuery(jQuery.sheet.instance).each(function(i) {
			if (jS.I == i) return;
			
			this.obj.pane()
				.scrollLeft(pane.scrollLeft())
				.scrollTop(pane.scrollTop());
		});
	},
	switchSheetLocker: function(e, jS) { //This can be used with event switchSheet to locks sheets together when switching, useful in history viewing
		jQuery(jQuery.sheet.instance).each(function(i) {
			if (jS.I == i) return;
			
			this.setActiveSheet(jS.i);
		});
	},
	I: function() {
		var I = 0;
		if ( this.instance ) {
			I = (this.instance.length === 0 ? 0 : this.instance.length - 1); //we use length here because we havent yet created sheet, it will append 1 to this number thus making this the effective instance number
		} else {
			this.instance = [];
		}
		return I;
	}
};

var jSE = jQuery.sheet.engine = { //Calculations Engine
	calc: function(tableI, spreadsheets, ignite, freshCalc) { //spreadsheets are array, [spreadsheet][row][cell], like A1 = o[0][0][0];
		for (var j = 0; j < spreadsheets.length; j++) {
			for (var k = 0; k < spreadsheets[j].length; k++) {
				spreadsheets[j][k].calcCount = 0;
			}
		}
		
		for (var j = 0; j < spreadsheets.length; j++) {
			for (var k = 0; k < spreadsheets[j].length; k++) {
				ignite(tableI, j, k);
			}
		}
	},
	parseLocation: function(locStr) { // With input of "A1", "B4", "F20", will return {row: 0,col: 0}, {row: 3,col: 1}, {row: 19,col: 5}.
		for (var firstNum = 0; firstNum < locStr.length; firstNum++) {
			if (locStr.charCodeAt(firstNum) <= 57) {// 57 == '9'
				break;
			}
		}
		return {
			row: parseInt(locStr.substring(firstNum)) - 1, 
			col: this.columnLabelIndex(locStr.substring(0, firstNum))
		};
	},
	parseCellName: function(col, row){
		return jSE.columnLabelString(col) + (row + 1);
	},
	columnLabelIndex: function(str) {
		// Converts A to 0, B to 1, Z to 25, AA to 26.
		var num = 0;
		for (var i = 0; i < str.length; i++) {
			var digit = str.toUpperCase().charCodeAt(i) - 65;	   // 65 == 'A'.
			num = (num * 26) + digit;
		}
		return (num >= 0 ? num : 0);
	},
	columnLabelString: function(index) {//0 = A, 1 = B
		var b = (index).toString(26).toUpperCase();   // Radix is 26.
		var c = [];
		for (var i = 0; i < b.length; i++) {
			var x = b.charCodeAt(i);
			if (i <= 0 && b.length > 1) {				   // Leftmost digit is special, where 1 is A.
				x = x - 1;
			}
			if (x <= 57) {								  // x <= '9'.
				c.push(String.fromCharCode(x - 48 + 65)); // x - '0' + 'A'.
			} else {
				c.push(String.fromCharCode(x + 10));
			}
		}
		return c.join("");
	},
	cFN: {//cFN = compiler functions, usually mathmatical
		sum: 	function(x, y) { return x + y; },
		max: 	function(x, y) { return x > y ? x: y; },
		min: 	function(x, y) { return x < y ? x: y; },
		count: 	function(x, y) { return (y != null) ? x + 1: x; },
		divide: function(x, y) { return x / y; },
		clean: function(v) {
			if (typeof(v) == 'string') {
				v = v.replace(jSE.regEx.amp, '&')
					.replace(jSE.regEx.nbsp, ' ')
					.replace(/\n/g,'')
					.replace(/\r/g,'');
			}
			return v;
		},
		sanitize: function(v) {
			if (v) {
				if (isNaN(v)) {
					return v;
				} else {
					return v * 1;
				}
			}
			return "";
		}
	},
	regEx: {
		n: 			/[\$,\s]/g,
		cell: 			/\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1
		range: 			/\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1:a4
		remoteCell:		/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1
		remoteCellRange: 	/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1:b4
		sheet:			/SHEET/i,
		amp: 			/&/g,
		gt: 			/</g,
		lt: 			/>/g,
		nbsp: 			/&nbsp;/g
	},
	str: {
		amp: 	'&amp;',
		lt: 	'&lt;',
		gt: 	'&gt;',
		nbsp: 	'&nbps;'
	},
	chart: function(o) { /* creates a chart for use inside of a cell
													piggybacks RaphealJS
							options:
								type

								data
								legend
								title
								x {data, legend}

								y {data, legend}
								owner
												*/
		var jS = this.jS;
		var owner = this;
		
		function sanitize(v, toNum) {
			if (!v) {
				if (toNum) {
					v = 0;
				} else {
					v = "";
				}
			} else {
				if (toNum) {
					v = arrHelpers.toNumbers(v);
				} else {
					v = arrHelpers.flatten(v);
				}
			}
			return v;
		}
		
		o = jQuery.extend({
			x: { legend: "", data: [0]},
			y: { legend: "", data: [0]},
			title: "",
			data: [0],
			legend: "",
			chart: jQuery('<div class="' + jS.cl.chart + '" />')
				.mousedown(function() {
					jQuery(this).parent().mousedown();
				})
				.mousemove(function() {
					jQuery(this).parent().mousemove();
					return false;
				})
		}, o);
	
		o.data = sanitize(o.data, true);
		o.x.data = sanitize(o.x.data, true);
		o.y.data = sanitize(o.y.data, true);
		o.legend = sanitize(o.legend);
		o.x.legend = sanitize(o.x.legend);
		o.y.legend = sanitize(o.y.legend);
	
		o.legend = (o.legend ? o.legend : o.data);

		this.s.origParent.one('calculation', function() {
			var width = o.chart.width();
			var height = o.chart.height();
			var r = Raphael(o.chart[0]);
			if (r.g) {
				if (o.title) r.g.text(width / 2, 10, o.title).attr({"font-size": 20});
				switch (o.type) {
				case "bar":
					r.g.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
						.hover(function () {
							this.flag = r.g.popup(
								this.bar.x,
								this.bar.y,
								this.bar.value || "0"
							).insertBefore(this);
						},function () {
							this.flag.animate({
								opacity: 0
								},300, 

								function () {
									this.remove();
									}
								);
							});
					break;
				case "hbar":
					r.g.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
						.hover(function () {
							this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
						},function () {
							this.flag.animate({
								opacity: 0
								},300, 
								function () {
									this.remove();
									}
								);
							});
					break;
				case "line":
					r.g.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
						nostroke: false, 
						axis: "0 0 1 1", 
						symbol: "o", 
						smooth: true
					})
					.hoverColumn(function () {
						this.tags = r.set();
						try {
							for (var i = 0; i < this.y.length; i++) {
								this.tags.push(r.g.tag(this.x, this.y[i], this.values[i], 0, 10).insertBefore(this).attr([{
									fill: "#fff"
								}, {
									fill: this.symbols[i].attr("fill")
								}]));
							}
						} catch (e) {}
					}, function () {
						this.tags && this.tags.remove();
					});
			
					break;
				case "pie":
					var pie = r.g.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend: o.legend})
						.hover(function () {
							this.sector.stop();
							this.sector.scale(1.1, 1.1, this.cx, this.cy);
							if (this.label) {
								this.label[0].stop();
								this.label[0].scale(1.5);
								this.label[1].attr({"font-weight": 800});
							}
						}, function () {
							this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
							if (this.label) {
								this.label[0].animate({scale: 1}, 500, "bounce");
								this.label[1].attr({"font-weight": 400});
							}
						});
					break;
				case "dot":
					r.g.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
						symbol: "o", 
						max: 10, 
						heat: true, 
						axis: "0 0 1 1", 
						axisxstep: o.x.data.length - 1, 
						axisystep: o.y.data.length - 1, 
						axisxlabels: (o.x.legend ? o.x.legend : o.x.data),
						axisylabels: (o.y.legend ? o.y.legend : o.y.data),
						axisxtype: " ", 
						axisytype: " "
					})
						.hover(function () {
							this.tag = this.tag || r.g.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
							this.tag.show();
						}, function () {
							this.tag && this.tag.hide();
						});
					break;
				}
			
				jS.attrH.setHeight(owner.row, 'cell', false);
			}
		});
		
		return o.chart;
	}
};

var jFN = jQuery.sheet.fn = {//fn = standard functions used in cells
	VERSION: function() {
		return this.jS.version;
	},
	IMG: function(v) {
		return jQuery('<img />')
			.attr('src', v);
	},
	AVERAGE:	function(values) { 
		var arr = arrHelpers.foldPrepare(values, arguments);
		return jFN.SUM(arr) / jFN.COUNT(arr); 
	},
	AVG: 		function(values) { 
		return jFN.AVERAGE(values);
	},
	COUNT: 		function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.count, 0); },
	COUNTA:		function() {
		var count = 0;
		var args = arrHelpers.flatten(arguments);
		for (var i = 0; i < args.length; i++) {
			if (args[i]) {
				count++;
			}
		}
		return count;
	},
	SUM: 		function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.sum, 0, true, jFN.N); },
	MAX: 		function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.max, Number.MIN_VALUE, true, jFN.N); },
	MIN: 		function(values) { return arrHelpers.fold(arrHelpers.foldPrepare(values, arguments), jSE.cFN.min, Number.MAX_VALUE, true, jFN.N); },
	MEAN:		function(values) { return this.SUM(values) / values.length; },
	ABS	: 		function(v) { return Math.abs(jFN.N(v)); },
	CEILING: 	function(v) { return Math.ceil(jFN.N(v)); },
	FLOOR: 		function(v) { return Math.floor(jFN.N(v)); },
	INT: 		function(v) { return Math.floor(jFN.N(v)); },
	ROUND: 		function(v, decimals) {
		return jFN.FIXED(v, (decimals ? decimals : 0), false);
	},
	RAND: 		function() { return Math.random(); },
	RND: 		function() { return Math.random(); },
	TRUE: 		function() { return 'TRUE'; },
	FALSE: 		function() { return 'FALSE'; },
	NOW: 		function() { return new Date ( ); },
	TODAY: 		function() { return Date( Math.floor( new Date ( ) ) ); },
	DAYSFROM: 	function(year, month, day) { 
		return Math.floor( (new Date() - new Date (year, (month - 1), day)) / 86400000);
	},
	DAYS: function(v1, v2) {
		var date1 = new Date(v1);
		var date2 = new Date(v2);
		var ONE_DAY = 1000 * 60 * 60 * 24;
		return Math.round(Math.abs(date1.getTime() - date2.getTime()) / ONE_DAY);
	},
	DATEVALUE: function(v) {
		var d = new Date(v);
		return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
	},
	IF: function(expression, resultTrue, resultFalse){
		//return [expression, resultTrue, resultFalse] + "";
		return (expression ? resultTrue : resultFalse);
	},
	FIXED: 		function(v, decimals, noCommas) { 
		if (decimals == null) {
			decimals = 2;
		}
		var x = Math.pow(10, decimals);
		var n = String(Math.round(jFN.N(v) * x) / x); 
		var p = n.indexOf('.');
		if (p < 0) {
			p = n.length;
			n += '.';
		}
		for (var i = n.length - p - 1; i < decimals; i++) {
			n += '0';
		}
		if (noCommas == true) {// Treats null as false.
			return n;
		}
		var arr	= n.replace('-', '').split('.');
		var result = [];
		var first  = true;
		while (arr[0].length > 0) { // LHS of decimal point.
			if (!first) {
				result.unshift(',');
			}
			result.unshift(arr[0].slice(-3));
			arr[0] = arr[0].slice(0, -3);
			first = false;
		}
		if (decimals > 0) {
			result.push('.');
			var first = true;
			while (arr[1].length > 0) { // RHS of decimal point.
				if (!first) {
					result.push(',');
				}
				result.push(arr[1].slice(0, 3));
				arr[1] = arr[1].slice(3);
				first = false;
			}
		}
		if (v < 0) {
			return '-' + result.join('');
		}
		return result.join('');
	},
	TRIM: function(v) { 
		if (typeof(v) == 'string') {
			v = jQuery.trim(v);
		}
		return v;
	},
	HYPERLINK: function(link, name) {
		name = (name ? name : 'LINK');
		return jQuery('<a href="' + link + '" target="_new">' + name + '</a>');
	},
	DOLLAR: function(v, decimals, symbol) { 
		if (decimals == null) {
			decimals = 2;
		}
		
		if (symbol == null) {
			symbol = '$';
		}
		
		var r = jFN.FIXED(v, decimals, false);
		
		if (v >= 0) {
			this.cell.html = symbol + r;
		} else {
			this.cell.html = '-' + symbol + r.slice(1);
		}
		return v;
	},
	VALUE: function(v) { return parseFloat(v); },
	N: function(v) {
		if (v == null) {return 0;}
		if (v instanceof Date) {return v.getTime();}
		if (typeof(v) == 'object') {v = v.toString();}
		if (typeof(v) == 'string') {v = parseFloat(v.replace(jSE.regEx.n, ''));}
		if (isNaN(v)) {return 0;}
		if (typeof(v) == 'number') {return v;}
		if (v == true) {return 1;}
		return 0;
	},
	PI: function() { return Math.PI; },
	POWER: function(x, y) {
		return Math.pow(x, y);
	},
	SQRT: function(v) {
		return Math.sqrt(v);
	},
	DROPDOWN: function(v, noBlank) {
		v = arrHelpers.foldPrepare(v, arguments, true);
		var cell = this.cell;
		var jS = this.jS;
		
		if (this.s.editable) {
			
			var id = "dropdown" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
			var o = jQuery('<select style="width: 100%;" name="' + id + '" id="' + id + '" />')
				.mousedown(function() {
					jS.cellEdit(jQuery(this).parent(), null, true);
				});
		
			if (!noBlank) {
				o.append('<option value="">Select a value</option>');
			}
		
			for (var i = 0; i < (v.length <= 50 ? v.length : 50); i++) {
				if (v[i]) {
					o.append('<option value="' + v[i] + '">' + v[i] + '</option>');
				}
			}
			
			
			//here we find out if it is on initial calc, if it is, the value we an use to set the dropdown
			if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('#' + id).length == 0) {
				cell.selectedValue = jS.spreadsheets[this.sheet][this.row][this.col].value;
			}
			
			jS.s.origParent.one('calculation', function() {
				jQuery('#' + id)
					.change(function() {
						cell.selectedValue = jQuery(this).val();
						jS.calc();
					});
				jS.attrH.setHeight(jS.getTdLocation(o.parent()).row, 'cell', false);
			});
					
			o.val(cell.selectedValue);
			
			this.cell.html = o;
		}
		return cell.selectedValue;
	},
	RADIO: function(v) {
		v = arrHelpers.foldPrepare(v, arguments, true);
		var cell = this.cell;
		var jS = this.jS;
		
		if (this.s.editable) {
			var id = "radio" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
			
			var o = jQuery('<span />')
				.mousedown(function() {
					jS.cellEdit(jQuery(this).parent());
				});
			
			for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
				if (v[i]) {
					var input = jQuery('<input type="radio" name="' + id + '" class="' + id + '" />')
						.val(v[i]);
					
					if (v[i] == cell.selectedValue) {
						input.attr('checked', 'true');
					}
					
					o
						.append(input)
						.append('<span>' + v[i] + '</span>')
						.append('<br />');
					
					jS.s.origParent.one('calculation', function() {
						jQuery('.' + id)
							.change(function() {
								cell.selectedValue = jQuery(this).val();
								jS.calc();
							});
						jS.attrH.setHeight(jS.getTdLocation(o.parent()).row, 'cell', false);
					});
				}
			}
			
			//here we find out if it is on initial calc, if it is, the value we an use to set the radio
			if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('.' + id).length == 0) {
				cell.selectedValue = jS.spreadsheets[this.sheet][this.row][this.col].value;
			}
			
			this.cell.html = o;
		}
		return cell.selectedValue;
	},
	CHECKBOX: function(v) {
		v = arrHelpers.foldPrepare(v, arguments)[0];
		var cell = this.cell;
		var jS = this.jS;
		
		if (this.s.editable) {
			
			var id = "checkbox" + this.sheet + "_" + this.row + "_" + this.col + '_' + this.jS.I;
			var checkbox = jQuery('<input type="checkbox" name="' + id + '" class="' + id + '" />')
				.val(v);
				
			var o = jQuery('<span />')
				.append(checkbox)
				.append('<span>' + v + '</span><br />')
				.mousedown(function() {
					jS.cellEdit(jQuery(this).parent());
				});
			
			if (v == cell.selectedValue) {
				checkbox.attr('checked', true);
			}
			
			var td = jQuery(jS.getTd(this.sheet, this.row, this.col));
			if (!td.children().length) {
				if (td.text() == cell.selectedValue) {
					checkbox.attr('checked', true);
				}
			}
			
			jS.s.origParent.one('calculation', function() {
				jQuery('.' + id)
					.change(function() {
						cell.selectedValue = (jQuery(this).is(':checked') ? jQuery(this).val() : '');
						jS.calc();
					});
			});
			
			//here we find out if it is on initial calc, if it is, the value we an use to set the checkbox
			if (jQuery(jS.getTd(this.sheet, this.row, this.col)).find('.' + id).length == 0) {
				var checked = jS.spreadsheets[this.sheet][this.row][this.col].value;
				cell.selectedValue = (checked == 'true' || checked == true ? v : '');
			}

			this.cell.html = o;
		}
		return cell.selectedValue;
	},
	BARCHART:	function(values, legend, title) {
		return jSE.chart.apply(this, [{
			type: 'bar',
			data: values,
			legend: legend,
			title: title
		}]);
	},
	HBARCHART:	function(values, legend, title) {
		return jSE.chart.apply(this, [{
			type: 'hbar',
			data: values,
			legend: legend,
			title: title
		}]);
	},
	LINECHART:	function(valuesX, valuesY) {
		return jSE.chart.apply(this, [{
			type: 'line',
			x: {
				data: valuesX
			},
			y: {
				data: valuesY
			},
			title: ""
		}]);
	},
	PIECHART:	function(values, legend, title) {
		return jSE.chart.apply(this, [{
			type: 'pie',
			data: values,
			legend: legend,
			title: title
		}]);
	},
	DOTCHART:	function(valuesX, valuesY, values, legendX, legendY, title) {
		return jSE.chart.apply(this, [{
			type: 'dot',
			data: (values ? values : valuesX),
			x: {
				data: valuesX,
				legend: legendX
			},
			y: {
				data: (valuesY ? valuesY : valuesX),
				legend: (legendY ? legendY : legendX)
			},
			title: title
		}]);
	},
	CELLREF: function(v) {
		return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
	},
	CALCTIME: function() {
		var owner = this;
		this.s.origParent.one('calculation', function() {
			jQuery(owner.jS.getTd(owner.sheet, owner.row, owner.col))
				.text(owner.jS.time.diff());
		});
		return "";
	}
};

var key = { /* key objects, makes it easier to develop */
	BACKSPACE: 			8,
	CAPS_LOCK: 			20,
	COMMA: 				188,
	CONTROL: 			17,
	ALT:				18,
	DELETE: 			46,
	DOWN: 				40,
	END: 				35,
	ENTER: 				13,
	ESCAPE: 			27,
	HOME: 				36,
	INSERT: 			45,
	LEFT: 				37,
	NUMPAD_ADD: 		107,
	NUMPAD_DECIMAL: 	110,
	NUMPAD_DIVIDE: 		111,
	NUMPAD_ENTER: 		108,
	NUMPAD_MULTIPLY: 	106,
	NUMPAD_SUBTRACT: 	109,
	PAGE_DOWN: 			34,
	PAGE_UP: 			33,
	PERIOD: 			190,
	RIGHT: 				39,
	SHIFT: 				16,
	SPACE: 				32,
	TAB: 				9,
	UP: 				38,
	F:					70,
	V:					86,
	Y:					89,
	Z:					90
};

var arrHelpers = {
	foldPrepare: function(firstArg, theArguments, unique) { // Computes the best array-like arguments for calling fold().
		var result;
		if (firstArg != null &&
			firstArg instanceof Object &&
			firstArg["length"] != null) {
			result = firstArg;
		} else {
			result = theArguments;
		}
		
		if (unique) {
			result = this.unique(result);
		}
		
		return result;
	},
	fold: function(arr, funcOfTwoArgs, result, castToN, N) {
		for (var i = 0; i < arr.length; i++) {
			result = funcOfTwoArgs(result, (castToN == true ? N(arr[i]): arr[i]));
		}
		return result;
	},
	toNumbers: function(arr) {
		arr = this.flatten(arr);
		
		for (var i = 0; i < arr.length; i++) {
			if (arr[i]) {
				arr[i] = jQuery.trim(arr[i]);
				if (isNaN(arr[i])) {
					arr[i] = 0;
				} else {
					arr[i] = arr[i] * 1;
				}
			} else {
				arr[i] = 0;
			}
		}
		
		return arr;
	},
	unique: function(arr) {
		var a = [];
		var l = arr.length;
		for (var i=0; i<l; i++) {
			for(var j=i+1; j<l; j++) {
				// If this[i] is found later in the array
				if (arr[i] === arr[j])
					j = ++i;
			}
			a.push(arr[i]);
		}
		return a;
	},
	flatten: function(arr) {
		var flat = [];
		for (var i = 0, l = arr.length; i < l; i++){
			var type = Object.prototype.toString.call(arr[i]).split(' ').pop().split(']').shift().toLowerCase();
			if (type) {
				flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? this.flatten(arr[i]) : arr[i]);
			}
		}
		return flat;
	},
	insertAt: function(arr, val, index){
		jQuery(val).each(function(){
			if (index > -1 && index <= arr.length) {
				arr.splice(index, 0, this);
			}
		});
		return arr;
	}
};
