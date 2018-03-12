
$(".back, .front").click(function() {
	buildCalendar($(this).attr("data-target"))
});

function buildCalendar(target) {
	
	var targetDate = moment(target+"-01")
	var date = moment(target+"-01")
	
	$(".back").attr("data-target", targetDate.clone().add(-1,"M").format("YYYY-MM"));
	$(".front").attr("data-target", targetDate.clone().add(1,"M").format("YYYY-MM"));
	
	$(".calendar h3 span").html(date.format("MMMM YYYY"))
	
	if (date.day() != 6) {
		date.day(-1);
	}
	$("table tbody").html("");
	while (date.month() == targetDate.month() || date.month() == targetDate.clone().day(-1).month()) {
		$("table tbody").last().append("<tr></tr>");
		for (var i=0; i<7; i++) {
			var newCell = $("<td class='clickable'><div class='stripe'><a data-day='"+date.format("DD.MM.YYYY")+"' href='#'>" + date.date() + "</a></div></td>")
			if (date.month() == targetDate.month()) {
				if (i == 0 || date.date() == 1) {
					newCell.find(".stripe").addClass("first")
				}
				if (i == 6 || date.month() != date.clone().add(1, "d").month()) {
					newCell.find(".stripe").addClass("last")
				}
				$("table tbody tr").last().append(newCell)		
			} else {
				$("table tbody tr").last().append("<td></td>")		
			}
			date.add(1, 'd')
		} 
	}
}

$(".available-list").on("click", "a", function() {
	$(this).parents(".available-list").find(".active").removeClass("active")
	$(this).parents("li").addClass("active")
	$(".next-button.toStep2 a").removeClass("disabled")
	return false;
});

$(".calendar").on("click", "a", function() {

	$(".available-list").html('')
	$(".next-button").hide()

	$(this).parents(".calendar").find(".current").removeClass("current")
	$(this).addClass("current")
	var day = $(this).attr("data-day");
	$.ajax({
		url: "https://"+host+".belbo.com/externalBooking/calcAvailableAppointments", 
		dataType: "jsonp",
		jsonp: "callback",
		data: {
			servicerGroupId: servicerGroupId,
			selectedProducts: service,
			numberOfDays: 1,
			offset: day
		},
		success: function(e) {
			if (e.generalAvailabilities[day]) {
				for (var date=0; date < e.generalAvailabilities[day].length; date++) {
					var s = e.generalAvailabilities[day][date]
					var startDate = moment(s.realDate, "DD.MM.YYYYHH:mm")
					$(".available-list").append("<li><a href='#' data-date='"+startDate.format("DD.MM.YYYY[T]HH:mm")+"'>"+s.startDate+" Uhr - "+startDate.add(30, 'm').format("HH:mm")+" Uhr</a></li> ")
				}
				$(".next-button.toStep2 a").addClass("disabled")
				$(".next-button").show()
			}
		}
	});	
	
});

$(".firstStep .next-button a").click(function() {
	$(".step1").removeClass("active")
	$(".step2").addClass("active");
	$(".firstStep").hide();
	$(".secondStep").show();
	
	return false;
});

$(".secondStep .next-button a").click(function() {

	$("#bookIt").click();
	return false;
});

$(".secondStep").submit(function() {
	$(".secondStep").css("opacity", "0.5")
	
	var date = $(".available-list .active a").attr("data-date")
	
	$.ajax({
		url: "https://"+host+".belbo.com/externalBooking/finalConfirmation", 
		dataType: "jsonp",
		jsonp: "callback",
		data: {
			servicerGroupId: servicerGroupId,
			selectedProducts: service,
			date: date,
			email: $("#email").val(),
			firstName: $("#firstName").val(),
			lastName: $("#lastName").val(),
			mobile: $("#mobile").val(),
		},
		success: function(e) {
			if (e.result == "GIVEN") {
				alert("Der Termin ist bereits vergeben.")
				$(".firstStep").show();
				$(".secondStep").hide();
			} else {
				$(".secondStep").hide();
				$(".menu").hide();
				$(".thirdStep").show();
			}
		}
	});	
	
	return false;
});

$(".backToStep1").click(function() {
	$(".firstStep").show();
	$(".secondStep").hide();
});