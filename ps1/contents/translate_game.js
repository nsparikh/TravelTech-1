// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
$(function() {
	var lang_to				= "English";
	var lang_from			= "Spanish";
	var current_dict		= dicts[lang_to][lang_from]; // keys: words in @lang_to, values: corresponding words in @lang_from

	
	// Labels
	$("#lang_from").text(lang_from + " ");
	$("#lang_to").text(lang_to);
	
	// Random word
	var keys = [];
	for (var key in current_dict) {
		if (current_dict.hasOwnProperty(key)) {
			keys.push(key);
		}
	}
	
	var current_key = keys[Math.floor(Math.random() * keys.length)];
	var current_word = current_dict[current_key];
	
	$("#word").text(current_word);
	
	// Focus
	$("#autocomplete").val("");
	$("#autocomplete").focus();
	
	// Autocomplete	
	$("#autocomplete").autocomplete({
		minLength: 2,
		autoFocus: true,
		source: function(request, response) {
			var guess = request.term;
			var suggestions = [];
			for (var key in current_dict) {
				if (key.indexOf(guess) != -1) {
					suggestions.push(key);
				}
			}
			response(suggestions);
		},
		delay: 0, 
		select: function(event, ui) {
			$("#autocomplete").val(ui.item.value);
			return false;
		}
	});
	
	// Enter = clicking button
	$("#autocomplete").keyup(function(event) {
		if (event.keyCode == 13) {
			submit($("#autocomplete").val());
			$("#autocomplete").autocomplete("close");
		}	
	});
	
	// Button
	$("#button").click(function() {
		submit($("#autocomplete").val());
	});
	
	// Function called when submit occurs
	function submit(guess) {
		var new_key = keys[Math.floor(Math.random() * keys.length)];
		var new_word = current_dict[new_key];
		
		$("#word").text(new_word);
		$("#autocomplete").val("");
		$("#autocomplete").focus();
		
		var isCorrect = false;
		if (current_key == guess) {
			isCorrect = true;
		}
		
		var returnValue;
		if (isCorrect) {
			returnValue = $(
				"<tr class='blue'>" +
					"<td>"+ current_word + "</td>" +
					"<td>"+ guess + "</td>" +
					"<td><div class='ui-icon ui-icon-check'></div></td>" +
				"</tr>");
		}
		else {
			returnValue = $(
					"<tr class='red'>" +
						"<td>"+ current_word + "</td>" +
						"<td id='strike'>"+ guess + "</td>" +
						"<td>"+ current_key + "</td>" +
					"</tr>");
		}
		
		var new_row = returnValue;

		new_row.insertAfter($("#top"));
		
		current_key = new_key;
		current_word = new_word;
	}
	
});
