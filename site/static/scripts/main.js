// Retrieve your data from locaStorage
var saveData = JSON.parse(localStorage.saveData || null) || {};
if (saveData.theme == 0 || saveData.theme == null) {
  $("head").append(
    '<link rel="stylesheet" href="static/stylesheets/dark.css" type="text/css" />'
  );
  $("#themeEle").show();
} else {
  $("#theme").prop("checked", true);
  $("#themeEle").show();
  $("head").append(
    '<link rel="stylesheet" href="static/stylesheets/light.css" type="text/css" />'
  );
}

// Store your data.
function saveTheme(themeVal) {
  saveData.theme = themeVal;
  localStorage.saveData = JSON.stringify(saveData);
}

$(":checkbox").change(function () {
  if ($(this).attr("id") == "theme") {
    return;
  }

  if ($(this).attr("lastVal") == 0 || $(this).attr("lastVal") == null) {
    $(this).attr("lastVal", 1);
  } else if ($(this).attr("lastVal") == 1) {
    $(this).attr("lastVal", 2);
    $(this).prop("indeterminate", true);
  } else {
    $(this).attr("lastVal", 0);
    $(this).prop("checked", false);
    $(this).prop("indeterminate", false);
  }
  var DT = parseInt($("#DT").is(":checked") ? $("#DT").val() : 0);
  var HD = parseInt($("#HD").is(":checked") ? $("#HD").val() : 0);
  var HR = parseInt($("#HR").is(":checked") ? $("#HR").val() : 0);
  var EZ = parseInt($("#EZ").is(":checked") ? $("#EZ").val() : 0);
  var FL = parseInt($("#FL").is(":checked") ? $("#FL").val() : 0);
  var NO = parseInt($("#NO").is(":checked") ? $("#NO").val() : 0);
  var value = DT + HD + HR + EZ + FL + NO;

  var DTM = parseInt($("#DT").prop("indeterminate") ? $("#DT").val() : 0);
  var HDM = parseInt($("#HD").prop("indeterminate") ? $("#HD").val() : 0);
  var HRM = parseInt($("#HR").prop("indeterminate") ? $("#HR").val() : 0);
  var EZM = parseInt($("#EZ").prop("indeterminate") ? $("#EZ").val() : 0);
  var FLM = parseInt($("#FL").prop("indeterminate") ? $("#FL").val() : 0);
  var NOM = parseInt($("#NO").prop("indeterminate") ? $("#NO").val() : 0);
  var valueM = DTM + HDM + HRM + EZM + FLM + NOM;

  $("#mods").val(value);
  $("#modsMaybe").val(valueM);
});

var max_per_page = 10;
var map_data_all = null;
var map_data = [];
var map_data_filter = [];
var filter_on = false;
var filter_on_2 = false;
var current_page = 1;
var num_show = 0;
var img_loaded = 0;

$(function () {
  var $btn = $("#btnTop");
  var $home = $("#filterForm");
  var startpoint = $home.scrollTop() + $home.height();

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > startpoint) {
      $btn.show();
    } else {
      $btn.hide();
    }
  });
});

$("#pages")
  .bootpag()
  .on("page", function (event, num) {
    if (filter_on) {
      fillTable(map_data_filter, num);
    } else {
      fillTable(map_data, num);
    }
    current_page = num;
    $("#page").val(num);
  });

function parseCSV(csv) {
  map_data_all = d3.csvParse(csv, d3.autoType);
  delete map_data_all.columns;
  for (m in map_data_all) {
    map_data_all[m].time_str = str_time(map_data_all[m].length)
    map_data_all[m].mod_str = intToMods(map_data_all[m].pop_mod);
    map_data_all[m].name = atob(map_data_all[m].name);
    map_data_all[m].artist = atob(map_data_all[m].artist);
    map_data_all[m].mapper = atob(map_data_all[m].mapper);
    map_data_all[m].version = atob(map_data_all[m].version);
    map_data_all[m].all_title = (
      map_data_all[m].artist +
      " " +
      map_data_all[m].name +
      " " +
      map_data_all[m].version +
      " " +
      map_data_all[m].mapper
    ).toLowerCase();
    map_data.push(map_data_all[m]);
  }
  getTableData(1);
}

function fillDummy() {
  filter_on = false;
  table_dummy_data = "";
  table_dummy_mobile_data = "";
  for (i = 0; i < max_per_page; i++) {
    table_dummy_data +=
      "<tr><td><div class='ph-row'> <div class='ph-item ph-col-12 my-0'></div></div></td><td><div class='ph-item ph-picture img-placeholder my-0'></td><td><div class='ph-row'> <div class='ph-item ph-col-12 my-0'></div></div><p class='text-muted small'<td><div class='ph-row'> <div class='ph-item ph-col-6 my-0'></div></div></p></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td><td><div class='ph-row'> <div class='ph-item ph-col-12'></div></td></tr>";
    table_dummy_mobile_data +=
      '<div class="col">' +
      `<div class="row"><div class="col-auto mr-1 mb-1"><div class="row"><div class='ph-item ph-picture img-placeholder my-0'></div></div></div>
        <div class="col"><div class="row"><div class='ph-item ph-col-12 ph-row'> <div class='my-0'></div></div></div>
        <div class="row"><p class="text-muted small"><div class='ph-item ph-col-6 ph-row'> <div class='my-0'></div></div></p></div></div></div>
        <div class="row"><div class="col"><div class="row d-flex justify-content-center"><p class='my-0'><i class="fas fa-meteor"></i></p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col"><div class="row d-flex justify-content-center"><p class='my-0'>PP</p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col"><div class="row d-flex justify-content-center"><p class='my-0'>Acc</p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col"><div class="row d-flex justify-content-center"><p class='my-0'>Mods</p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col-auto"><div class="row d-flex justify-content-center"><p class='my-0'><i class="fas fa-clock"></i></p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col"><div class="row d-flex justify-content-center"><p class='my-0'>BPM</p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div>
        <div class="col"><div class="row d-flex justify-content-center"><p class='my-0'><i class="fas fa-star"></i></p></div><div class="row d-flex justify-content-center"><div class='ph-item ph-col-8 ph-row'> <div class='my-0'></div></div></div></div></div></div><hr>`;
  }
  $("#data_body").html(table_dummy_data);
  $("#tableMobile").html(table_dummy_mobile_data);
}

function loadData() {
  fillDummy();
  $.get("static/data/datemodified", function (data, status) {
    $("#date").text(data);
  }).fail(function (data, status) {
    console.log(data.responseText);
  });
  $.get("static/data/comp_maps.csv", function (data, status) {
    parseCSV(data);
  }).fail(function (data, status) {
    console.log(data.responseText);
  });
}

function getTableData(num) {
  fillDummy();
  map_data = [];
  var unindexed_array = $("#filterForm").serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n["name"]] = parseFloat(n["value"]);
  });
  for (m in map_data_all) {
    if (map_data_all[m].mode != indexed_array.m && indexed_array.m != 4) {
      continue;
    }
    if (
      map_data_all[m].ar < indexed_array.mar ||
      map_data_all[m].ar > indexed_array.xar
    ) {
      continue;
    }
    if (
      map_data_all[m].cs < indexed_array.mcs ||
      map_data_all[m].cs > indexed_array.xcs
    ) {
      continue;
    }
    if (
      map_data_all[m].diff < indexed_array.md ||
      map_data_all[m].diff > indexed_array.xd
    ) {
      continue;
    }
    if (
      map_data_all[m].length < indexed_array.ml ||
      map_data_all[m].length > indexed_array.xl
    ) {
      continue;
    }
    if (
      map_data_all[m].bpm < indexed_array.mb ||
      map_data_all[m].bpm > indexed_array.xb
    ) {
      continue;
    }
    if (
      map_data_all[m].avg_pp < indexed_array.mpp ||
      map_data_all[m].avg_pp > indexed_array.xpp
    ) {
      continue;
    }
    if (indexed_array.mods == 0) {
      map_data.push(map_data_all[m]);
      continue;
    }

    query_mod = indexed_array.mods;
    if (query_mod == -1) {
      query_mod = 0;
    } else if (query_mod % 2 != 0) {
      query_mod += 1;
    }
    query_mod_m = indexed_array.modsMaybe;
    if (query_mod_m == -1) {
      query_mod_m = 0;
    } else if (query_mod_m % 2 != 0) {
      query_mod_m += 1;
    }
    if (
      !(
        (map_data_all[m].pop_mod & ~(query_mod | query_mod_m)) == 0 &&
        (map_data_all[m].pop_mod & query_mod) == query_mod &&
        map_data_all[m].pop_mod != 0
      ) &&
      !(map_data_all[m].pop_mod == query_mod)
    ) {
      continue;
    }
    map_data.push(map_data_all[m]);
  }
  fillTable(map_data, num);
}

document
  .getElementById("filterBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
  });
document.getElementById("resetBtn").addEventListener("click", function (event) {
  event.preventDefault();
});
$("#filterForm").on("keyup keypress", function (e) {
  var keyCode = e.keyCode || e.which;
  if (keyCode === 13) {
    e.preventDefault();
    return false;
  }
});

$(function () {
  $("#min_len").datetimepicker({
    defaultDate: new Date(0, 0, 0, 0, 0, 0, 0),
    format: "HH:mm:ss",
  });
});

$(function () {
  $("#max_len").datetimepicker({
    defaultDate: new Date(0, 0, 0, 0, 0, 0, 0),
    format: "HH:mm:ss",
  });

  $("#min_len").on("change.datetimepicker", (e) => {
    var time = $("#min_len").datetimepicker("viewDate");
    var secs = time.hour() * 3600 + time.minute() * 60 + time.seconds();
    $("#ml").val(secs);
  });

  $("#max_len").on("change.datetimepicker", (e) => {
    var time = $("#max_len").datetimepicker("viewDate");
    var secs = time.hour() * 3600 + time.minute() * 60 + time.seconds();
    $("#xl").val(secs);
  });
});

function genTableHTML(pos, map_slice) {
  if (map_slice.mode == 3) {
    return (
      '<tr><td><p class="text-center">' +
      pos +
      '</p></td><td><a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '"><img src="https://b.ppy.sh/thumb/' +
      map_slice.sid +
      '.jpg"></a></td><td> <a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '">' +
      map_slice.artist +
      " - " +
      map_slice.name +
      " [" +
      map_slice.version +
      "]" +
      '</a><p class="text-muted small">Keys: ' +
      map_slice.cs +
      " OD: " +
      map_slice.od.toFixed(1) +
      '</p></td><td><p class="font-weight-bold text-center glow farm-score">' +
      map_slice.score.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.avg_pp.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      (map_slice.avg_acc * 100).toFixed(2) +
      '%</p></td><td><p class="text-center">' +
      map_slice.mod_str +
      '</p></td><td><p class="text-center">' +
      map_slice.time_str +
      '</p></td><td><p class="text-center">' +
      map_slice.bpm.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.diff.toFixed(2) +
      "</p></td></tr>"
    );
  } else if (map_slice.mode == 1) {
    return (
      '<tr><td><p class="text-center">' +
      pos +
      '</p></td><td><a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '"><img src="https://b.ppy.sh/thumb/' +
      map_slice.sid +
      '.jpg"></a></td><td> <a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '">' +
      map_slice.artist +
      " - " +
      map_slice.name +
      " [" +
      map_slice.version +
      "]" +
      '</a><p class="text-muted small">OD: ' +
      map_slice.od.toFixed(1) +
      '</p></td><td><p class="font-weight-bold text-center glow farm-score">' +
      map_slice.score.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.avg_pp.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      (map_slice.avg_acc * 100).toFixed(2) +
      '%</p></td><td><p class="text-center">' +
      map_slice.mod_str +
      '</p></td><td><p class="text-center">' +
      map_slice.time_str +
      '</p></td><td><p class="text-center">' +
      map_slice.bpm.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.diff.toFixed(2) +
      "</p></td></tr>"
    );
  } else {
    return (
      '<tr><td><p class="text-center">' +
      pos +
      '</p></td><td><a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '"><img src="https://b.ppy.sh/thumb/' +
      map_slice.sid +
      '.jpg"></a></td><td> <a href="https://osu.ppy.sh/b/' +
      map_slice.bid +
      '">' +
      map_slice.artist +
      " - " +
      map_slice.name +
      " [" +
      map_slice.version +
      "]" +
      '</a><p class="text-muted small">AR: ' +
      map_slice.ar.toFixed(1) +
      " CS: " +
      map_slice.cs.toFixed(1) +
      " OD: " +
      map_slice.od.toFixed(1) +
      '</p></td><td><p class="font-weight-bold text-center glow farm-score">' +
      map_slice.score.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.avg_pp.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      (map_slice.avg_acc * 100).toFixed(2) +
      '%</p></td><td><p class="text-center">' +
      map_slice.mod_str +
      '</p></td><td><p class="text-center">' +
      map_slice.time_str +
      '</p></td><td><p class="text-center">' +
      map_slice.bpm.toFixed(2) +
      '</p></td><td><p class="text-center">' +
      map_slice.diff.toFixed(2) +
      "</p></td></tr>"
    );
  }
}

function genTableMobileHTML(pos, map_slice) {
  if (map_slice.mode == 0 || map_slice.mode == 2) {
    diff_str =
      "AR: " +
      map_slice.ar.toFixed(1) +
      " CS: " +
      map_slice.cs.toFixed(1) +
      " OD: " +
      map_slice.od.toFixed(1);
  } else if (map_slice.mode == 1) {
    diff_str = "OD: " + map_slice.od.toFixed(1);
  } else if (map_slice.mode == 3) {
    diff_str =
      "Keys: " + map_slice.cs.toFixed(1) + " OD: " + map_slice.od.toFixed(1);
  }
  return (
    '<div class="col">' +
    `<div class="row"><div class="col-auto mr-1 mb-1"><div class="row"><a href="https://osu.ppy.sh/b/` +
    map_slice.bid +
    '"><img src="https://b.ppy.sh/thumb/' +
    map_slice.sid +
    `.jpg"></a></div> </div>
    <div class="col"><div class="row"><a class="mb-0" href="https://osu.ppy.sh/b/` +
    map_slice.bid +
    '">' +
    map_slice.artist +
    " - " +
    map_slice.name +
    " [" +
    map_slice.version +
    "]" +
    `</a></div>
    <div class="row"><p class="text-muted small">` +
    diff_str +
    `</p></div></div></div>
    <div class="row"><div class="col-auto mr-auto"><div class="row d-flex justify-content-center mx-0"><p class='my-0'><i class="fas fa-meteor"></i></p></div><div class="row d-flex justify-content-center"><p class="font-weight-bold my-0 glow">` +
    map_slice.score.toFixed(1) +
    `</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'>PP</p></div><div class="row d-flex justify-content-center"><p class='my-0'>` +
    map_slice.avg_pp.toFixed(0) +
    `</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'>Acc</p></div><div class="row d-flex justify-content-center"><p class='my-0'>` +
    (map_slice.avg_acc * 100).toFixed(2) +
    `%</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'>Mods</p></div><div class="row d-flex justify-content-center"><p class='my-0'> ` +
    map_slice.mod_str +
    `</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'><i class="fas fa-clock"></i></p></div><div class="row d-flex justify-content-center"><p class='my-0'> ` +
    map_slice.time_str +
    `</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'>BPM</p></div><div class="row d-flex justify-content-center"><p class='my-0'> ` +
    map_slice.bpm.toFixed(0) +
    `</p></div></div>
    <div class="col-auto mr-auto"><div class="row d-flex justify-content-center"><p class='my-0 font-weight-bold'><i class="fas fa-star"></i></p></div><div class="row d-flex justify-content-center"><p class='my-0'> ` +
    map_slice.diff.toFixed(2) +
    "</p></div></div></div></div><hr>"
  );
}

function doSearch(query) {
  query = query.toLowerCase()
  map_data_filter = [];
  if (query == "") {
    filter_on = false;
  } else {
    filter_on = true;
  }
  for (m_id in map_data) {
    if (query == "" || map_data[m_id].all_title.toLowerCase().includes(query)) {
      map_data_filter.push(map_data[m_id]);
    }
  }
  var map_slice = map_data_filter.slice(0, max_per_page);
  var tableData = "";
  var tableData_mobile = "";
  for (m in map_slice) {
    var pos = parseInt(m) + 1;
    tableData += genTableHTML(pos, map_slice[m]);
    tableData_mobile += genTableMobileHTML(pos, map_slice[m]);
  }
  if (map_data_filter.length) {
    var upper =
      map_data_filter.length < max_per_page
        ? map_data_filter.length
        : max_per_page;
    $("#numEntries").text(
      "Showing 1 to " + upper + " of " + map_data_filter.length + " entries"
    );
  } else {
    $("#numEntries").text("Showing 0 entries");
  }
  $("#data_body").empty();
  $("#data_body").html(tableData);
  $("#tableMobile").html(tableData_mobile);
  $("#pages").bootpag({
    total: Math.max(1, Math.ceil(map_data_filter.length / max_per_page)),
    firstLastUse: true,
    page: 1,
    maxVisible: 7,
  });
}

$("#searchBox1, #searchBox2").on("input", function (data) {
  if ($(this).attr("id") == "searchBox1") {
    $("#searchBox2").val($("#searchBox1").val());
  } else {
    $("#searchBox1").val($("#searchBox2").val());
  }
  var searchBox = data.target;
  doSearch($(searchBox).val().toLowerCase());
});

function fillTable(data, page) {
  if (filter_on_2) {
    doSearch($("#searchBox1").val());
    filter_on_2 = false;
    return;
  }
  page -= 1;
  var map_slice = data.slice(page * max_per_page, (page + 1) * max_per_page);
  var tableData = "";
  var tableData_mobile = "";
  var pos = 0;
  for (m in map_slice) {
    pos = page * max_per_page + parseInt(m) + 1;
    tableData += genTableHTML(pos, map_slice[m]);
    tableData_mobile += genTableMobileHTML(pos, map_slice[m]);
  }
  num_show = pos % max_per_page != 0 ? pos % max_per_page : max_per_page;
  var upper = page * max_per_page + num_show;
  img_loaded = 0;
  $("#data_body_dummy").html(tableData);
  if (pos) {
    $("#numEntries").text(
      "Showing " +
        (page * max_per_page + 1) +
        " to " +
        upper +
        " of " +
        data.length +
        " entries"
    );
    $("img").on("load error", function () {
      img_loaded += 1;
      if (img_loaded == num_show) {
        $("#data_body").html($("#data_body_dummy").html());
        $("#tableMobile").html(tableData_mobile);
      }
    });
  } else {
    $("#numEntries").text("Showing 0 entries");
    $("#data_body").html($("#data_body_dummy").html());
  }
  $("#pages").bootpag({
    total: Math.max(1, Math.ceil(data.length / max_per_page)),
    firstLastUse: true,
    page: page + 1,
    maxVisible: 7,
  });
}

$("#filterBtn").click(function () {
  filter_on_2 = true;
  getTableData(1);
});

$("#resetBtn").click(function () {
  filter_on = false;
  var curr_mod = $("[name='m']").val();
  $("#len_diff").slider("setValue", [0, 15]);
  $("#len_ar").slider("setValue", [0, 11]);
  $("#len_cs").slider("setValue", [0, 10]);
  $("#filterForm").trigger("reset");
  $("[name='m']").val(curr_mod);
  $("#min_len").datetimepicker("date", new Date(0, 0, 0, 0, 0, 0, 0));
  $("#max_len").datetimepicker("date", new Date(0, 0, 0, 0, 0, 0, 0));
  $("#xl").val(Number.MAX_SAFE_INTEGER);
  $("#DT").attr("lastVal", 0);
  $("#DT").prop("indeterminate", false);
  $("#HD").attr("lastVal", 0);
  $("#HD").prop("indeterminate", false);
  $("#HR").attr("lastVal", 0);
  $("#HR").prop("indeterminate", false);
  $("#EZ").attr("lastVal", 0);
  $("#EZ").prop("indeterminate", false);
  $("#FL").attr("lastVal", 0);
  $("#FL").prop("indeterminate", false);
  $("#NO").attr("lastVal", 0);
  $("#NO").prop("indeterminate", false);

  getTableData(1);
});

$("#dropdownMenuButton a.dropdown-item").click(function () {
  max_per_page = parseInt($(this).attr("num"));
  $("#pageNum").text(max_per_page);
  if (filter_on) {
    fillTable(map_data_filter, 1);
  } else {
    fillTable(map_data, 1);
  }
});

$("[name='mode'] a.dropdown-item").click(function () {
  mode = $(this).text();
  if ($("#searchBox2").val() != "") {
    filter_on_2 = true;
  }
  var y = document.getElementById("modes");
  $("#navbarDropdown").text(mode);
  if ($(this).attr("mode") == 3) {
    $("#csLabelMin").text("Min Keys");
    $("#csLabelMax").text("Max Keys");
    $("#len_cs").slider({
      min: 0,
      max: 10,
      step: 1,
      focus: true,
      formatter: function (value) {
        return value[0] + " Key" + "  -  " + value[1] + " Key";
      },
    });
    $("#len_cs").slider("refresh", { useCurrentValue: true });
  } else {
    $("#csLabelMin").text("Min CS");
    $("#csLabelMax").text("Max CS");
    $("#len_cs").slider({
      min: 0,
      max: 10,
      step: 0.1,
      value: [0, 10],
      focus: true,
      formatter: function (value) {
        return "CS " + value[0] + "  -  " + "CS " + value[1];
      },
    });
    $("#len_cs").slider("refresh", { useCurrentValue: true });
  }
  getTableData(1);
});

$("#len_diff").slider({
  min: 0,
  max: 15,
  step: 0.1,
  value: [0, 15],
  focus: true,
  formatter: function (value) {
    return value[0] + "\u2605" + "  -  " + value[1] + "\u2605";
  },
});
$("#len_ar").slider({
  min: 0,
  max: 11,
  step: 0.1,
  value: [0, 11],
  focus: true,
  formatter: function (value) {
    return "AR " + value[0] + "  -  " + "AR " + value[1];
  },
});
if ($("[name='mcs']").attr("mode") == 3) {
  $("#len_cs").slider({
    min: 0,
    max: 10,
    step: 1,
    value: [0, 10],
    focus: true,
    formatter: function (value) {
      return value[0] + " Key" + "  -  " + value[1] + " Key";
    },
  });
} else {
  $("#len_cs").slider({
    min: 0,
    max: 10,
    step: 0.1,
    value: [0, 10],
    focus: true,
    formatter: function (value) {
      return "CS " + value[0] + "  -  " + "CS " + value[1];
    },
  });
}

$("#len_diff")
  .slider()
  .on("slide", function (script) {
    $("[name='md']").val(script.value[0]);
    $("[name='xd']").val(script.value[1]);
  });

$("#len_ar")
  .slider()
  .on("slide", function (script) {
    $("[name='mar']").val(script.value[0]);
    $("[name='xar']").val(script.value[1]);
  });

$("#len_cs")
  .slider()
  .on("slide", function (script) {
    $("[name='mcs']").val(script.value[0]);
    $("[name='xcs']").val(script.value[1]);
  });

$("[name='md']").change(function () {
  if (parseFloat($("[name='md']").val()) > parseFloat($("[name='xd']").val())) {
    var tmp = $("[name='xd']").val();
    $("[name='xd']").val($("[name='md']").val());
    $("[name='md']").val(tmp);
  }
  $("#len_diff").slider("setValue", [
    parseFloat($(this).val()),
    parseFloat($("[name='xd']").val()),
  ]);
});
$("[name='xd']").change(function () {
  if (parseFloat($("[name='md']").val()) > parseFloat($("[name='xd']").val())) {
    var tmp = $("[name='xd']").val();
    $("[name='xd']").val($("[name='md']").val());
    $("[name='md']").val(tmp);
  }
  $("#len_diff").slider("setValue", [
    parseFloat($("[name='md']").val()),
    parseFloat($(this).val()),
  ]);
});

$("[name='mar']").change(function () {
  if (parseFloat($("[name='mar']").val()) > parseFloat($("[name='xar']").val())) {
    var tmp = $("[name='xar']").val();
    $("[name='xar']").val($("[name='mar']").val());
    $("[name='mar']").val(tmp);
  }
  $("#len_ar").slider("setValue", [
    parseFloat($(this).val()),
    parseFloat($("[name='xar']").val()),
  ]);
});
$("[name='xar']").change(function () {
  if (parseFloat($("[name='mar']").val()) > parseFloat($("[name='xar']").val())) {
    var tmp = $("[name='xar']").val();
    $("[name='xar']").val($("[name='mar']").val());
    $("[name='mar']").val(tmp);
  }
  $("#len_ar").slider("setValue", [
    parseFloat($("[name='mar']").val()),
    parseFloat($(this).val()),
  ]);
});

if($("#mode").val() == 3){
$("[name='mcs']").change(function () {
  if (parseInt($("[name='mcs']").val()) > parseInt($("[name='xcs']").val())) {
    var tmp = $("[name='xcs']").val();
    $("[name='xcs']").val($("[name='mcs']").val());
    $("[name='mcs']").val(tmp);
  }
  $("#len_cs").slider("setValue", [
    parseInt($(this).val()),
    parseInt($("[name='xcs']").val()),
  ]);
});
$("[name='xcs']").change(function () {
  if (parseInt($("[name='mcs']").val()) > parseInt($("[name='xcs']").val())) {
    var tmp = $("[name='xcs']").val();
    $("[name='xcs']").val($("[name='mcs']").val());
    $("[name='mcs']").val(tmp);
  }
    $("#len_cs").slider("setValue", [
      parseInt($("[name='mcs']").val()),
      parseInt($(this).val()),
    ]);

});
} else{
  $("[name='mcs']").change(function () {
    if (parseFloat($("[name='mcs']").val()) > parseFloat($("[name='xcs']").val())) {
      var tmp = $("[name='xcs']").val();
      $("[name='xcs']").val($("[name='mcs']").val());
      $("[name='mcs']").val(tmp);
    }
    $("#len_cs").slider("setValue", [
      parseFloat($(this).val()),
      parseFloat($("[name='xcs']").val()),
    ]);
  });
  $("[name='xcs']").change(function () {
    if (parseFloat($("[name='mcs']").val()) > parseFloat($("[name='xcs']").val())) {
      var tmp = $("[name='xcs']").val();
      $("[name='xcs']").val($("[name='mcs']").val());
      $("[name='mcs']").val(tmp);
    }
      $("#len_cs").slider("setValue", [
        parseFloat($("[name='mcs']").val()),
        parseFloat($(this).val()),
      ]);

  });
}

$("#theme").on("change", function (event, state) {
  if ($(event.target).is(":checked")) {
    $("link[href='static/stylesheets/dark.css']").remove();
    $("head").append(
      '<link rel="stylesheet" href="static/stylesheets/light.css" type="text/css" />'
    );
    saveTheme(1);
  } else {
    $("link[href='static/stylesheets/light.css']").remove();
    $("head").append(
      '<link rel="stylesheet" href="static/stylesheets/dark.css" type="text/css" />'
    );
    saveTheme(0);
  }
});

var intToMods = function (mod_int) {
  var mod_string = "";
  if (mod_int == -1) {
    mod_string += "NO";
  }
  if (mod_int & (1 << 0)) {
    mod_string += "NF";
  }
  if (mod_int & (1 << 1)) {
    mod_string += "EZ";
  }
  if (mod_int & (1 << 2)) {
    mod_string += "TD";
  }
  if (mod_int & (1 << 3)) {
    mod_string += "HD";
  }
  if (mod_int & (1 << 4)) {
    mod_string += "HR";
  }
  if (mod_int & (1 << 6) && !(mod_int & (1 << 9))) {
    mod_string += "DT";
  }
  if (mod_int & (1 << 7)) {
    mod_string += "RX";
  }
  if (mod_int & (1 << 8)) {
    mod_string += "HT";
  }
  if (mod_int & (1 << 9)) {
    mod_string += "NC";
  }
  if (mod_int & (1 << 10)) {
    mod_string += "FL";
  }
  if (mod_int & (1 << 5)) {
    mod_string += "SD";
  }
  if (mod_int & (1 << 11)) {
    mod_string += "AP";
  }
  if (mod_int & (1 << 12)) {
    mod_string += "SO";
  }
  if (mod_int & (1 << 13)) {
    mod_string += "RX";
  }
  if (mod_int & (1 << 14)) {
    mod_string += "PF";
  }
  if (mod_int & (1 << 15)) {
    mod_string += "4K";
  }
  if (mod_int & (1 << 16)) {
    mod_string += "5K";
  }
  if (mod_int & (1 << 17)) {
    mod_string += "6K";
  }
  if (mod_int & (1 << 18)) {
    mod_string += "7K";
  }
  if (mod_int & (1 << 19)) {
    mod_string += "8K";
  }
  if (mod_int & (1 << 20)) {
    mod_string += "FI";
  }
  if (mod_int & (1 << 21)) {
    mod_string += "RD";
  }
  if (mod_int & (1 << 22)) {
    mod_string += "CM";
  }
  if (mod_int & (1 << 23)) {
    mod_string += "TP";
  }
  if (mod_int & (1 << 24)) {
    mod_string += "9K";
  }
  if (mod_int & (1 << 25)) {
    mod_string += "CP";
  }
  if (mod_int & (1 << 26)) {
    mod_string += "1K";
  }
  if (mod_int & (1 << 27)) {
    mod_string += "3K";
  }
  if (mod_int & (1 << 28)) {
    mod_string += "2K";
  }
  if (mod_int & (1 << 30)) {
    mod_string += "MR";
  }
  if (mod_string == "") {
    mod_string = "None";
  }
  return mod_string;
};

var str_time = function (length) {
    minutes = Math.floor(length / 60);
    seconds = length % 60;
    seconds = ("00" + seconds)
    seconds = seconds.substring(seconds.length - 2, seconds.length)
    return minutes + ":" + seconds
}