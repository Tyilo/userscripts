// ==UserScript==
// @id             elevplan.dk-better-grades@tyilo.com
// @name           Better grades view for elevplan.dk
// @version        1.1.2
// @namespace      
// @author         Tyilo
// @description    
// @include        https://www.elevplan.dk/app/moduler/uddannelsesbog/skolepapirer.asp*
// @run-at         document-start
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/elevplandk-better-grades.user.js
// ==/UserScript==
document.addEventListener('DOMContentLoaded', function()
{
	function addStyle(css)
	{
		var head = document.getElementsByTagName('head')[0];
		var style = document.createElement('style');
		style.textContent = css;
		style.type = 'text/css';
		head.appendChild(style);
	}
	
	var months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
	
	function parseDate(date)
	{
		var words = date.split(' ');
		return Number(words[1]) * 100 + Number(months.indexOf(words[0]));
	}
	
	function round(number, decimals)
	{
		var a = Math.pow(10, decimals);
		return Math.round(number * a) / a;
	}
	
	var defaultWeight = 2;
	var gradeWeight = {
		'A': 2,
		'B': 1.5,
		'C': 1
	};
	
	var dates = [];
	var data = {};
	var tables = document.querySelectorAll('table#fold_karakterer > tbody');
	for(var t = 1; t < tables.length; t += 2)
	{
		var rows = tables[t].querySelectorAll('tr.FormField');
		
		for(var i = 0; i < rows.length; i++)
		{
			var cells = rows[i].querySelectorAll('td');
			var date = cells[0].textContent;
			var subject = cells[1].textContent.replace(/(htx, )|(niveau )/g, '');
			var type = cells[2].textContent.match('MDT')? 'Mundtlig': 'Skriftlig';
			var grade = cells[3].textContent;
			
			if(!data[subject])
			{
				data[subject] = {};
			}
			
			if(!data[subject][type])
			{
				data[subject][type] = {};
			}
			
			data[subject][type][date] = grade;
			
			if(dates.indexOf(date) === -1)
			{
				dates.push(date);
			}
		}
	}
	
	// Makes the grades go from old to new
	dates.sort(function(a, b)
	{
		var time1 = parseDate(a);
		var time2 = parseDate(b);
		return time1 - time2;
	});
	
	var grades = {};
	
	var thead = '<thead><tr><th>Fag</th><th>Type</th>';
	for(var i = 0; i < dates.length; i++)
	{
		thead += '<th>' + dates[i] + '</th>';
		
		grades[dates[i]] = {
			sum: 0,
			count: 0
		};
	}
	thead += '</tr></thead>';
	
	var tbody = '<tbody>';
	
	for(var subject in data)
	{
		var types = Object.keys(data[subject]).length;
		var totalWeight = (gradeWeight[subject.match(/.$/)] || defaultWeight);
		var weight = totalWeight / types;
		
		tbody += '<tr><td rowspan="' + types + '">' + subject + '</td>';
		firstRow = true;
		for(var type in data[subject])
		{
			if(!firstRow)
			{
				tbody += '<tr>';
			}
			tbody += '<td>' + type + '</td>';
			for(var i = 0; i < dates.length; i++)
			{
				var grade = data[subject][type][dates[i]];
				if(grade)
				{
					grades[dates[i]].sum += Number(grade) * weight;
					grades[dates[i]].count += weight;
				}
				else
				{
					grade = '-';
				}
				tbody += '<td>' + grade + '</td>';
			}
			firstRow = false;
			tbody += '</tr>';
		}
	}
	
	tbody += '</tbody>';
	
	var tfoot = '<tfoot><tr><td>Gennemsnit</td><td> - </td>';
	
	for(var i = 0; i < dates.length; i++)
	{
		var average = grades[dates[i]].sum / grades[dates[i]].count;
		tfoot += '<td>' + round(average, 2) + '</td>';
	}
	
	tfoot += '</tr></tfoot>';
	
	var table = '<table>' + thead + tfoot + tbody + '</table>';
	var div = document.createElement('div');
	div.setAttribute('id', 'bettergrades');
	div.innerHTML = table;
	document.body.insertBefore(div, document.body.firstChild);
	
	addStyle("#bettergrades table { margin: auto; margin-top: 50px; margin-bottom: 50px; border-collapse: collapse; } #bettergrades thead, #bettergrades tfoot { background-color: lightgray; } #bettergrades th, #bettergrades td { padding: 0.5em; border: 1px solid; }");
	
});
