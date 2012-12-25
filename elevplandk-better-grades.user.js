// ==UserScript==
// @id             elevplan.dk-better-grades@tyilo.com
// @name           Better grades view for elevplan.dk
// @version        1.1.2
// @namespace      
// @author         Tyilo
// @description    
// @include        https://www.elevplan.dk/app/moduler/uddannelsesbog/skolepapirer.asp*
// @run-at         document-start
// @updateURL      http://tyilo.com/userscripts/elevplandk-better-grades.user.js
// ==/UserScript==
document.addEventListener('DOMContentLoaded', function()
{
	var tables = document.querySelectorAll('table#fold_karakterer > tbody');
	for(var t = 1; t < tables.length; t += 2)
	{
		var data = {};
		
		var rows = tables[t].querySelectorAll('tr.FormField');
		var uniqueIds = [];
		var uniqueRows = [];
		for(var i = 0; i < rows.length; i++)
		{
			var cells = rows[i].querySelectorAll('td');
			var date = cells[0].textContent;
			if(!data[date])
			{
				data[date] = {};
			}
			var id = cells[1].textContent + '@' + cells[2].textContent;
			data[date][id] = cells[3].textContent;
			if(uniqueIds.indexOf(id) === -1)
			{
				uniqueIds.push(id);
				uniqueRows.push(rows[i]);
			}
			else
			{
				tables[t].removeChild(rows[i]);
			}
		}
		
		var head = tables[t].querySelector('tr');
		var months = 0;
		
		var averageRow = document.createElement('tr');
		averageRow.classList.add('FormField');
		
		for(var i = 0; i < 2; i++)
		{
			var textCell = document.createElement('td');
			textCell.classList.add('FormField');
			textCell.appendChild(document.createTextNode(i === 0? 'Average': '-'));
			averageRow.appendChild(textCell);
		}
		
		for(var month in data)
		{
			if(data.hasOwnProperty(month))
			{
				var  grades = 0;
				var sum = 0;
				
				var header = document.createElement('td');
				header.classList.add('SearchResultHeader');
				var text = document.createElement('h6');
				text.appendChild(document.createTextNode(month));
				header.appendChild(text);
				head.insertBefore(header, head.querySelector('td:nth-of-type(4)'));
				
				for(var i = 0; i < uniqueRows.length; i++)
				{
					if(months === 0)
					{
						uniqueRows[i].removeChild(uniqueRows[i].querySelector('td'));
						uniqueRows[i].removeChild(uniqueRows[i].querySelector('td:last-of-type'));
					}
					var cells = uniqueRows[i].querySelectorAll('td');
					var id = cells[0].textContent + '@' + cells[1].textContent;
					var cell = document.createElement('td');
					cell.classList.add('FormField');
					cell.setAttribute('align', 'center');
					var grade = data[month][id];
					if(grade)
					{
						cell.appendChild(document.createTextNode(grade));
						grades++;
						sum += Number(grade);
					}
					else
					{
						cell.appendChild(document.createTextNode('-'));
					}
					uniqueRows[i].insertBefore(cell, cells[2]);
				}
				
				var averageCell = document.createElement('td');
				averageCell.classList.add('FormField');
				averageCell.setAttribute('align', 'center');
				averageCell.appendChild(document.createTextNode(sum / grades));
				averageRow.insertBefore(averageCell, averageRow.querySelector('td:nth-of-type(3)'));
				
				months++;
			}
		}
		
		tables[t].appendChild(averageRow);
		
		head.removeChild(head.querySelector('td'));
		head.removeChild(head.querySelector('td:last-of-type'));
		
		tables[t - 1].querySelector('td').setAttribute('colspan', months + 2);
	}
	
	if(typeof window.unsafeWindow !== 'undefined')
	{
		window.unsafeWindow.ShowAll(true);
	}
});
