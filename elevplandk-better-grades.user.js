// ==UserScript==
// @id           elevplan.dk-better-grades@tyilo.com
// @name         Better grades view for elevplan.dk
// @version      2.3.2
// @namespace     
// @author       Tyilo
// @description  
// @include      https://www.elevplan.dk/app/moduler/uddannelsesbog/skolepapirer.asp*
// @run-at       document-start
// @updateURL    https://raw.github.com/Tyilo/userscripts/master/elevplandk-better-grades.user.js
// ==/UserScript==
function init() {
	function each(object, callback) {
		for(var key in object) {
			if(object.hasOwnProperty(key)) {
				callback(key, object[key]);
			}
		}
	}
	
	function clone(object, deep) {
		var newObject = {};
		each(object, function(key, value) {
			if(deep && Object.prototype.toString.call(value) !== '[object Array]' && value instanceof Object) {
				newObject[key] = value.clone(true);
			} else {
				newObject[key] = value;
			}
		});
		return newObject;
	}
	
	function addTo(object, object2) {
		each(object2, function(key, value) {
			if(object.hasOwnProperty(key)) {
				object[key] += value;
			}
		});
	}
	
	var addStyle = window.GM_addStyle || function addStyle(css) {
		var head = document.getElementsByTagName('head')[0];
		var style = document.createElement('style');
		style.textContent = css;
		style.type = 'text/css';
		head.appendChild(style);
	};
	
	function oldestToNewest(a, b) {
		var time1 = parseDate(a);
		var time2 = parseDate(b);
		return time1 - time2;
	}
	
	var months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
	
	function parseDate(date) {
		var words = date.split(' ');
		return Number(words[1]) * 100 + Number(months.indexOf(words[0]));
	}	
	
	function round(number, decimals) {
		var a = Math.pow(10, decimals);
		return Math.round(number * a) / a;
	}
	
	var defaultWeight = 2;
	var gradeWeight = {
		'A': 2,
		'B': 1.5,
		'C': 1
	};
	var types = {
		'MDT': 'Mundtlig',
		'SKR': 'Skriftlig',
		'SAM': 'Sammenlagt'
	};
	var tableTypes = ['EKS', 'STA', 'GST', 'IPR'];
	var tableNames = {
		'EKS': 'Eksamen',
		'GST': 'Gennemsnit',
		'IPR': 'Intern prøve',
		'STA': 'Standpunkt'
	};
	
	var dates = {};
	var data = {};
	var tables = document.querySelectorAll('table#fold_karakterer > tbody');
	for(var t = 1; t < tables.length; t += 2) {
		var rows = tables[t].querySelectorAll('tr.FormField');
		
		for(var i = 0; i < rows.length; i++) {
			var cells = rows[i].querySelectorAll('td');
			var date = cells[0].textContent;
			var subject = cells[1].textContent.replace(/(htx, )|(niveau )/g, '');
			
			// \u00a0 == nbsp;
			var typeValues = /([^,]*),\u00a0([^,]*),\u00a0([^,]*)/g.exec(cells[2].textContent);
			var shortType = typeValues[1];
			var type = types[shortType] || shortType;
			var tableType = typeValues[2];
			
			var grade = cells[3].textContent;
			
			data[tableType] = data[tableType] || {};
			data[tableType][subject] = data[tableType][subject] || {};
			data[tableType][subject][type] = data[tableType][subject][type] || {};
			
			data[tableType][subject][type][date] = grade;
			
			dates[tableType] = dates[tableType] || [];
			if(dates[tableType].indexOf(date) === -1) {
				dates[tableType].push(date);
			}
		}
	}
	
	// First child in body, before inserting tables
	var firstChild = document.body.firstChild;
	
	var grades = {};
	
	for(var tableIndex = 0; tableIndex < tableTypes.length; tableIndex++) {
		var tableType = tableTypes[tableIndex];
		if(Object.keys(dates).indexOf(tableType) === -1) {
			continue;
		}
		
		var content = '<h1>' + tableNames[tableType] + '</h1>';
		
		var tableDates = dates[tableType];
		// Makes the grades go from old to new
		tableDates.sort(oldestToNewest);
		
		grades[tableType] = {};
		var tableGrades = grades[tableType];
		
		var newestGrades = {};
		
		var thead = '<thead><tr><th>Fag</th><th>Type</th>';
		
		var noGrades = {
			sum: 0,
			count: 0,
			weightedSum: 0,
			weightedCount: 0
		};
		
		for(var i = 0; i < tableDates.length; i++) {
			thead += '<th>' + tableDates[i] + '</th>';
			
			tableGrades[tableDates[i]] = clone(noGrades);
		}
		thead += '<th>Nyeste</th>';
		thead += '</tr></thead>';
	
		var tbody = '<tbody>';
		
		var newestGradeCount = clone(noGrades);
		var tableData = data[tableType];
		for(var subject in tableData) {
			if(!tableData.hasOwnProperty(subject)) {
				continue;
			}
			
			var types = Object.keys(tableData[subject]).length;
			var totalWeight = (gradeWeight[subject.match(/.$/)] || defaultWeight);
			var weight = totalWeight / types;
			
			tbody += '<tr><td rowspan="' + types + '">' + subject + '</td>';
			var firstRow = true;
			for(var type in tableData[subject]) {
				if(!tableData[subject].hasOwnProperty(type)) {
					continue;
				}
				
				if(!firstRow) {
					tbody += '<tr>';
				}
				tbody += '<td>' + type + '</td>';
				var newestGrade;
				var newestGradeValue;
				for(var i = 0; i < tableDates.length; i++) {
					var grade = tableData[subject][type][tableDates[i]];
					if(grade) {
						var gradeValue = Number(grade);
						if(!isNaN(grade)) {
							var gradeAverage = {
								sum: gradeValue,
								count: 1,
								weightedSum: gradeValue * weight,
								weightedCount: weight
							};
							addTo(tableGrades[tableDates[i]], gradeAverage);
							
							newestGrade = grade;
							newestGradeValue = gradeAverage;
						}
					}
					else {
						grade = '-';
					}
					tbody += '<td>' + grade + '</td>';
				}
				if(newestGrade) {
					addTo(newestGradeCount, newestGradeValue);
				}
				else {
					newestGrade = '-';
				}
				tbody += '<td>' + newestGrade + '</td>';
				firstRow = false;
				tbody += '</tr>';
			}
		}
		
		tbody += '</tbody>';
		
		var values = [ {
			'title': 'Gennemsnit',
			'sumKey': 'sum',
			'countKey': 'count'
		}, {
			'title': 'Vægtet Gennemsnit',
			'sumKey': 'weightedSum',
			'countKey': 'weightedCount'
		}];
		
		tableGrades.newest = newestGradeCount;
		tableDates.push('newest');
		
		var tfoot = '<tfoot>';
		for(var n = 0; n < 2; n++) {
			tfoot += '<tr><td>' + values[n].title + '</td><td> - </td>';
			
			for(var i = 0; i < tableDates.length; i++) {
				var average = tableGrades[tableDates[i]][values[n].sumKey] / tableGrades[tableDates[i]][values[n].countKey];
				tfoot += '<td>' + round(average, 2) + '</td>';
			}
			
			tfoot += '</tr>';
		}
		tfoot += '</tfoot>';
		
		content += '<table>' + thead + tfoot + tbody + '</table>';
		var div = document.createElement('div');
		div.setAttribute('id', 'bettergrades');
		div.innerHTML = content;
		document.body.insertBefore(div, firstChild);
	}
	
	window.data = data;
	
	addStyle("\
	#bettergrades { \
		margin-top: 3em; \
	} \
	#bettergrades table { \
		margin: auto; \
		margin-top: 50px; \
		margin-bottom: 50px; \
		border-collapse: collapse; \
	} \
	#bettergrades thead, #bettergrades tfoot { \
		background-color: lightgray; \
	} \
	#bettergrades thead th:last-child, #bettergrades tfoot td:last-child { \
		background-color: mediumaquamarine; \
	} \
	#bettergrades tbody td:last-child { \
		background-color: lightgreen; \
	} \
	#bettergrades th, #bettergrades td { \
		padding: 0.5em; \
		border: 1px solid; \
	} \
	");
}

document.addEventListener('DOMContentLoaded', init);

if(document.readyState === 'interactive' || document.readyState === 'complete') {
	init();
}
