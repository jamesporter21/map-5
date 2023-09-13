mapboxgl.accessToken =
  "pk.eyJ1IjoiamFtZXNwb3J0ZXIyMSIsImEiOiJjbGxvN2lmazcwN3d4M2NuM2pnZHZsZTNwIn0.I70dWocAUtgPwOThih14DA";

var filterGroup = document.getElementById("ll");

var maxBounds = [
  [-74.27, 40.49], // Southwest coordinates
  [-73.68, 40.92], // Northeast coordinates
];

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/jamesporter21/cllqq02fy007w01r4bv7yal0h",
  center: [-96.7853964, 32.7846839],
  zoom: 10,
  // maxBounds: maxBounds,
  preserveDrawingBuffer: true,
  customAttribution:
    'created by <a style="padding: 0 3px 0 3px; color:#FFFFFF; background-color: #bf7f46;" target="_blank" href=http://www.geocadder.bg/en/portfolio.html>GEOCADDER</a>',
});

var nav = new mapboxgl.NavigationControl({ showCompass: false });
map.addControl(nav, "top-left");

// adding button for toggling layers list
// class MyCustomControl {
//   onAdd(map) {
//     this.map = map;
//     this.container = document.createElement("div");
//     this.container.className = "my-custom-control";
//     this.container.className = "mapboxgl-ctrl my-custom-control";
//     this.container.id = "layers-custom-control";
//     this.container.innerHTML = '<span class="material-icons">layers</span>';
//     return this.container;
//   }
//   onRemove() {
//     this.container.parentNode.removeChild(this.container);
//     this.map = undefined;
//   }
// }

// const myCustomControl = new MyCustomControl();

// map.addControl(myCustomControl, "top-left");

// var element = document.getElementById("layers-custom-control");
// element.addEventListener("click", function () {
//   var layersList = document.getElementById("menu");
//   if (layersList.style.display !== "none") {
//     layersList.style.display = "none";
//   } else {
//     layersList.style.display = "grid";
//   }
// });
// end adding button for toggling layers list

var markersAllIds = [];

var onlySelectedaccessibilityPoints = [];
var isinitialSelectedType = false;
var initialSelectedType = "";
var counter = 0;

var mainPointLatitude;
var mainPointLongitude;

var pointsForSearchArray = [];

/// loading POIs data from Google Sheets table///
$.getJSON(
  "https://sheets.googleapis.com/v4/spreadsheets/1SLtDR6js3Tf6e64iqDalmUI6NXg01SB-AZBpjmRB1OE/values/Sheet1!C2:M3000?majorDimension=ROWS&key=AIzaSyB-2fHh4Fu0Gw92XtN8U724FH1zoy5xWhs",
  function (response) {
    response.values.forEach(function (marker) {
      var campusName = marker[0];
      var address = marker[1];

      var latitude = parseFloat(marker[2]);
      var longitude = parseFloat(marker[3]);

      var districtCharterOperator = marker[5];
      var gradespan = marker[6];
      var accountabilityScore = marker[7];
      var accountabilityGrade = marker[8];
      var studentAchievementScore = marker[9];
      var studentAchievementGrade = marker[10];

      var firstFilterCheckboxValue = studentAchievementGrade
        .toLowerCase()
        .replace(/\s/g, "-");
      console.log(firstFilterCheckboxValue);

      var secondFilterCheckboxValue = studentAchievementGrade
        .toLowerCase()
        .replace(/\s/g, "-");

      var type = marker[4];
      var schoolType = "";
      if (type === "TRUE") {
        schoolType = "Charter";
      } else {
        schoolType = "DISD School";
      }

      var popupContent = "<div>";

      popupContent += "<div class='title'>" + campusName + "</div>";

      popupContent += "<hr>";

      popupContent += "<div class='details'>";

      popupContent += "<div>Address: <b>" + address + "</b></div>";
      popupContent += "<div>Charter: <b>" + schoolType + "</b></div>";
      popupContent +=
        "<div>District/Charter Operator Name: <b>" +
        districtCharterOperator +
        "</b></div>";
      popupContent += "<div>Gradespan: <b>" + gradespan + "</b></div>";

      popupContent +=
        "<div>2022 Accountability Score: <b>" +
        accountabilityScore +
        "</b></div>";
      popupContent +=
        "<div>2022 Accountability Grade: <b>" +
        accountabilityGrade +
        "</b></div>";
      popupContent +=
        "<div>2022 Student Achievement Score: <b>" +
        studentAchievementScore +
        "</b></div>";
      popupContent +=
        "<div>2022 Student Achievement Grade: <b>" +
        studentAchievementGrade +
        "</b></div>";

      popupContent += "</div>";

      popupContent += "</div>";

      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      }).setHTML(popupContent);

      var el = document.createElement("div");

      var schoolTypeSmallLetters = schoolType.toLowerCase().replace(/\s/g, "-");
      el.className = "marker " + schoolTypeSmallLetters;
      el.id = type;

      var markerObj = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      // const markerDiv = markerObj.getElement();

      if(type === "TRUE"){
        $(el).attr("data-first-type", "first-" + firstFilterCheckboxValue);
        $(el).attr("data-first-type-visible", "true");
      } else {
        $(el).attr("data-second-type", "second-" + secondFilterCheckboxValue);
        $(el).attr("data-second-type-visible", "true");
      }
      

      el.style.backgroundImage = "url(" + schoolTypeSmallLetters + ".svg)";
      el.style.backgroundColor = "#FFFFFF";
      el.style.border =
        "2px solid " + getIconBorderColorByType(schoolTypeSmallLetters);

      markersAllIds.push({
        schoolTypeSmallLetters: schoolTypeSmallLetters,
        type: type,
        schoolType: schoolType,
      });
      // }

      if (campusName) {
        pointsForSearchArray.push({
          campusName: campusName,
          schoolType: schoolType,
          latitude: latitude,
          longitude: longitude,
          type: type,
        });
      }
    });

    // map.fitBounds(bounds, { padding: 80 });

    var objectsJson = markersAllIds.map((object) => JSON.stringify(object));
    var objectsJsonSet = new Set(objectsJson);
    var uniqueJsonArray = Array.from(objectsJsonSet);
    var uniqueObjectsByContent = uniqueJsonArray.map((string) =>
      JSON.parse(string)
    );
    console.log(uniqueObjectsByContent);

    // for (const value of uniqueObjectsByContent) {
    //   $("#menu").append(
    //     "<a href='#' id='" +
    //       value["schoolTypeSmallLetters"] +
    //       "'><img src='" +
    //       value["schoolTypeSmallLetters"] +
    //       ".svg'><span>" +
    //       value["schoolType"] +
    //       "</span></a>"
    //   );

    //   $("#" + value["schoolTypeSmallLetters"]).click(function () {
    //     if (
    //       $("div." + value["schoolTypeSmallLetters"]).css("visibility") == "visible"
    //     ) {
    //       $("div." + value["schoolTypeSmallLetters"]).css("visibility", "hidden");
    //       $("a#" + value["schoolTypeSmallLetters"]).css(
    //         "background-color",
    //         "#e39a59"
    //       );
    //       $("a#" + value["schoolTypeSmallLetters"]).css("color", "#FFFFFF");
    //       $("a#" + value["schoolTypeSmallLetters"]).css(
    //         "border",
    //         "1px solid #e7e7e7"
    //       );
    //     } else {
    //       $("div." + value["schoolTypeSmallLetters"]).css("visibility", "visible");
    //       $("a#" + value["schoolTypeSmallLetters"]).css(
    //         "background-color",
    //         "#fefae0"
    //       );
    //       $("a#" + value["schoolTypeSmallLetters"]).css("color", "#21333f");
    //     }
    //   });

    //   $("a#" + value["schoolTypeSmallLetters"]).mouseenter(function () {
    //     $("a#" + value["schoolTypeSmallLetters"]).css("background-color", "#aba4a2");
    //     $("a#" + value["schoolTypeSmallLetters"]).css("color", "#FFFFFF");
    //   });

    //   $("a#" + value["schoolTypeSmallLetters"]).mouseleave(function () {
    //     if (
    //       $("div." + value["schoolTypeSmallLetters"]).css("visibility") == "visible"
    //     ) {
    //       $("a#" + value["schoolTypeSmallLetters"]).css(
    //         "background-color",
    //         "#fefae0"
    //       );
    //       $("a#" + value["schoolTypeSmallLetters"]).css("color", "#21333f");
    //     } else {
    //       $("a#" + value["schoolTypeSmallLetters"]).css(
    //         "background-color",
    //         "#e39a59"
    //       );
    //       $("a#" + value["schoolTypeSmallLetters"]).css("color", "#FFFFFF");
    //     }
    //   });
    // }

    // close all opened popups
    $(".marker").click(function () {
      $(".mapboxgl-popup").remove();
    });

    $(".mapboxgl-canvas").click(function () {
      $(".mapboxgl-popup").remove();
    });

    // map.fitBounds(bounds, { padding: 80 });
  }
);

// popup toggling //
function togglePopup() {
  var popup = this._popup;

  if (!popup) return;
  else if (popup.isOpen()) popup.remove();
  else popup.addTo(this._map);
}
// end popup toggling//

function getIconBorderColorByType(type) {
  var color = "red";
  switch (type) {
    case "disd-school":
      color = "red";
      break;
    case "charter":
      color = "blue";
      break;

    default:
      color = "green";
  }
  return color;
}

//////////////// open/close dropdown menu for first type filter
var checkList = document.getElementById("list1");
checkList.getElementsByClassName("anchor")[0].onclick = function (evt) {
  if (checkList.classList.contains("visible"))
    checkList.classList.remove("visible");
  else checkList.classList.add("visible");
};
//////////////

//////////// open/close dropdown menu for second type filter
var checkListTwo = document.getElementById("list2");
checkListTwo.getElementsByClassName("anchor")[0].onclick = function (evt) {
  if (checkListTwo.classList.contains("visible"))
    checkListTwo.classList.remove("visible");
  else checkListTwo.classList.add("visible");
};
////////////////

$("input[type='checkbox'][name='filter-by-first-type-input']").click(
  function () {
    var currentCountry = $(this).val();
    if ($(this).is(":checked")) {
      $("[data-first-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-first-type-visible", "true");
        $(this).css("display", "block");
      });
    } else {
      $("[data-first-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-first-type-visible", "false");
        $(this).css("display", "none");
      });
    }
  }
);

$("input[type='checkbox'][name='filter-by-second-type-input']").click(
  function () {
    var currentCountry = $(this).val();
    console.log(currentCountry);
    if ($(this).is(":checked")) {
      $("[data-second-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-second-type-visible", "true");
        $(this).css("display", "block");
      });
    } else {
      $("[data-second-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-second-type-visible", "false");
        $(this).css("display", "none");
      });
    }
  }
);
