// ----------------------------------------------------------------
//                        Useful functions
// ----------------------------------------------------------------

function deleteVis() {
  d3.select("g.vis").remove();
  if (d3.select("svg.datamap")) {
    d3.select("svg.datamap").remove();
    d3.select("div.datamaps-hoverover").remove();
  }
}

function formatNumber(number) {
  var numberStr = "" + number,
      newNumberStr = [],
      j = numberStr.length-1,
      i = 0;
  for (; j >= 0; j--) {
    newNumberStr.unshift(numberStr[j]);
    i++;
    if ((i%3 == 0) && j > 0) {
      newNumberStr.unshift(".");
    }
  }
  return newNumberStr.join("");
}
function scaleSvg(ratio) {
  d3.select("svg.vis")
    .attr("width", function() { return visConfig.width * ratio; })
    .attr("height", function() { return visConfig.height * ratio; });
}

function scaleRatio(windowWidth, visWidth, baseVisResolutionWidth) {
  var proportion = visWidth/baseVisResolutionWidth;
  var finalWidth = windowWidth * proportion;

  return finalWidth/visWidth;
}

function scaleVis(ratio) {
  d3.select("g.vis")
    .attr("transform", function() {
      return "scale(" + ratio + ")";
    });
}

function roundMultPowerTen(num) {
  var n = 0;
  while (num > Math.pow(10, n)) {
    n++;
  }
  var power = Math.pow(10, (n<=1) ? 1 : (n-1));
  return num + (power - (num % power));
}

// ----------------------------------------------------------------
//               Overview visualization functions
// ----------------------------------------------------------------

function returnCirclesData(dataset) {
    var newDataset = {};
    for (var year in dataset) {
      newDataset[year] = {};
      for (var title in dataset[year]) {
        if(!newDataset[year][dataset[year][title]["Mês"]]) {
          newDataset[year][dataset[year][title]["Mês"]] = {
            "Títulos": 1,
            "Público": dataset[year][title]["Público"],
            "Renda": dataset[year][title]["Renda"],
            "Gêneros": {
              "Ficção": 0,
              "Documentário": 0,
              "Animação": 0
            }
          };
          newDataset[year][dataset[year][title]["Mês"]]["Gêneros"][dataset[year][title]["Gênero"]]++;
        } else {
          newDataset[year][dataset[year][title]["Mês"]]["Títulos"] += 1;
          newDataset[year][dataset[year][title]["Mês"]]["Público"] += dataset[year][title]["Público"];
          newDataset[year][dataset[year][title]["Mês"]]["Renda"] += dataset[year][title]["Renda"];
          newDataset[year][dataset[year][title]["Mês"]]["Gêneros"][dataset[year][title]["Gênero"]]++;
        }
      }
    }
    return newDataset;
}

function returnMoviesData(dataset) {
    var newDataset = {};
    for (var year in dataset) {
      newDataset[year] = [[],[],[],[],[],[],[],[],[],[],[],[]];
      for (var title in dataset[year]) {
        newDataset[year][parseInt(dataset[year][title]["Mês"])-1].push(dataset[year][title]);
      }
      for (var month in newDataset[year]) {
        newDataset[year][month].sort(function(a,b) {
          return b["Público"] - a["Público"];
        });
      }
    }
    return newDataset;
}

function returnMaxDataCircles(dataset, property) {
  var max = 0;
  for (var year in dataset) {
    for (var month in dataset[year]) {
        if (dataset[year][month][property] > max)
          max = dataset[year][month][property];
    }
  }
  return max;
}

function returnMinDataCircles(dataset, property) {
  var min = Infinity;
  for (var year in dataset) {
    for (var month in dataset[year]) {
        if (dataset[year][month][property] < min)
          min = dataset[year][month][property];
    }
  }
  return min;
}

function returnXPosition(index) {
  return 64 + (index * ((visConfig.circleBiggerRadius * 2) + visConfig.wCircleMargin)) + visConfig.circleBiggerRadius;
}

function returnYPosition(index) {
  return visConfig.hMonthMargin + visConfig.hMonthBox + 4 + (index * ((visConfig.circleBiggerRadius * 2) + visConfig.hCircleMargin)) + visConfig.circleBiggerRadius;
}

function testXPosition(x) {
  var index = (x - 64 - visConfig.circleBiggerRadius) / ((visConfig.circleBiggerRadius * 2) + visConfig.wCircleMargin);
  if (Math.abs(index - Math.floor(index + 0.5)) <= 0.3) {
    return Math.floor(index + 0.5);
  }
  return false;
}

function testYPosition(y) {
  var index = (y - visConfig.hMonthMargin - visConfig.circleBiggerRadius - visConfig.hMonthBox - 4) / ((visConfig.circleBiggerRadius * 2) + visConfig.hCircleMargin);
  if (Math.abs(index - Math.floor(index + 0.5)) <= 0.3) {
    return Math.floor(index + 0.5);
  }
  return false;
}

function moveAllSpecificMonthDrag(index, month, dx) {
  d3.selectAll("rect.month[currentmonth='" + month + "']")
    .attr("x", function() {
      return returnXPosition(index) - visConfig.circleBiggerRadius + dx;
    });

  d3.select("text.month[currentmonth='" + month + "']")
    .attr("x", function() {
      return returnXPosition(index) + dx;
    });

  d3.selectAll("circle[currentmonth='" + month + "']")
    .attr("cx", function() {
      return returnXPosition(index) + dx;
    });
}


function moveMainElementsY(position, currentValue, duration) {
  d3.selectAll("text[currentyear='"+currentValue+"']")
    .transition("moveYmain")
    .duration(duration)
    .attr("y", function() {
      return position + (visConfig.yearTextSize/3);
    });

  d3.selectAll("circle[currentyear='"+currentValue+"']")
    .transition("moveYmain")
    .duration(duration)
    .attr("cy", function() {
      return position;
    });
}

function moveAllElementsY(indexShift, initialIndex, currentValue) {
  var shiftAux = d3.selectAll("[currentyear='"+initialIndex+"']");
  var selfCurrAux = d3.selectAll("[currentyear='"+currentValue+"']");

  d3.selectAll("text[currentyear='"+initialIndex+"']")
    .transition("moveYall")
    .duration(visConfig.monthMovingDuration)
    .attr("y", function() {
      return returnYPosition(indexShift) + (visConfig.yearTextSize/3);
    });

  d3.selectAll("circle[currentyear='"+initialIndex+"']")
    .transition("moveYall")
    .duration(visConfig.monthMovingDuration)
    .attr("cy", function() {
      return returnYPosition(indexShift);
    });

  shiftAux.attr("currentyear", indexShift);
  selfCurrAux.attr("currentyear", initialIndex);
}

function moveMainElementsX(position, currentValue, duration) {
  d3.selectAll("rect[currentmonth='"+currentValue+"']")
    .transition("moveXmain")
    .duration(duration)
    .attr("x", function() {
      return position - visConfig.circleBiggerRadius;
    });

  d3.selectAll("text[currentmonth='"+currentValue+"']")
    .transition("moveXmain")
    .duration(duration)
    .attr("x", function() {
      return position;
    });

  d3.selectAll("circle[currentmonth='"+currentValue+"']")
    .transition("moveXmain")
    .duration(duration)
    .attr("cx", function() {
      return position;
    });
}

function moveAllElementsX(indexShift, initialIndex, currentValue) {
  var shiftAux = d3.selectAll("[currentmonth='"+initialIndex+"']");
  var selfCurrAux = d3.selectAll("[currentmonth='"+currentValue+"']");

  d3.selectAll("rect[currentmonth='"+initialIndex+"']")
    .transition("moveXall")
    .duration(visConfig.monthMovingDuration)
    .attr("x", function() {
      return returnXPosition(indexShift) - visConfig.circleBiggerRadius;
    });

  d3.selectAll("text[currentmonth='"+initialIndex+"']")
    .transition("moveXall")
    .duration(visConfig.monthMovingDuration)
    .attr("x", function() {
      return returnXPosition(indexShift);
    });

  d3.selectAll("circle[currentmonth='"+initialIndex+"']")
    .transition("moveXall")
    .duration(visConfig.monthMovingDuration)
    .attr("cx", function() {
      return returnXPosition(indexShift);
    });

  shiftAux.attr("currentmonth", (indexShift));
  selfCurrAux.attr("currentmonth", initialIndex);
}


// ----------------------------------------------------------------
//             Nationalities visualization functions
// ----------------------------------------------------------------

function returnNationsData(datasetMovies, datasetNations) {
  var newDataset = {};
  for (var year in datasetMovies) {
    newDataset[year] = {};
    for (var title in datasetMovies[year]) {
      var country = datasetMovies[year][title]["País"];
      if (country.indexOf("/") != -1) {
        var arr = country.split("/");
        country = arr[0];
      }
      var continent = datasetNations[country]["continente"];

      if(!newDataset[year][continent]) {
        newDataset[year][continent] = {};
      }

      if(!newDataset[year][continent][country]) {
        newDataset[year][continent][country] = {
          "Títulos": 1,
          "Público": datasetMovies[year][title]["Público"],
          "Renda": datasetMovies[year][title]["Renda"],
          "Gêneros": {
            "Ficção": 0,
            "Documentário": 0,
            "Animação": 0
          }
        };
        newDataset[year][continent][country]["Gêneros"][datasetMovies[year][title]["Gênero"]]++;
      }
      else {
        newDataset[year][continent][country]["Títulos"] += 1;
        newDataset[year][continent][country]["Público"] += datasetMovies[year][title]["Público"];
        newDataset[year][continent][country]["Renda"] += datasetMovies[year][title]["Renda"];
        newDataset[year][continent][country]["Gêneros"][datasetMovies[year][title]["Gênero"]]++;
      }
    }
  }
  return newDataset;
}

function returnGraphData(datasetGraph, continentFilter, publicFilter) {
  var newDataset = {};
  for (var year in datasetGraph) {
    newDataset[year] = [[],[],[],[],[],[]];
    for (var continent in datasetGraph[year]) {
      if (!continentFilter[continent]) continue;
      for (var country in datasetGraph[year][continent]) {
        var countryPublic = datasetGraph[year][continent][country]["Público"];
        var countryTitles = datasetGraph[year][continent][country]["Títulos"];
        var average = countryPublic/countryTitles;
        if (average >= publicFilter.min && average <= publicFilter.max) {
          newDataset[year][visConfig.continents[continent]].push(
            {
              "País": country,
              "Dados": datasetGraph[year][continent][country]
            }
          );
        }
        else continue;
      }
      for (var i = 0; i < newDataset[year][visConfig.continents[continent]].length; i++) {
        newDataset[year][visConfig.continents[continent]][i]["Dados"]["Média"] =
          newDataset[year][visConfig.continents[continent]][i]["Dados"]["Público"] /
          newDataset[year][visConfig.continents[continent]][i]["Dados"]["Títulos"];
      }
    }
  }
  return newDataset;
}

// ----------------------------------------------------------------
//             Recordists visualization functions
// ----------------------------------------------------------------

function returnTreemapDecadeData(dataset) {
  var newObj = {
    "name": "decades",
    "children": []
  };

  for (var i in dataset) {
    newObj.children.push({
      "name": i,
      "size": 0
    });
    for (var j in dataset[i]) {
      newObj.children[newObj.children.length - 1].size += dataset[i][j].length;
    }
  }
  return newObj;
}

function returnTreemapYearsData(dataset, property) {
  var newObj = {
    "name": "years",
    "children": []
  };

  for (var i in dataset[property]) {
    newObj.children.push({
      "name": i,
      "size": dataset[property][i].length
    });
  }
  return newObj;
}


// ----------------------------------------------------------------
//             Production visualization functions
// ----------------------------------------------------------------

function returnRegionsData(dataset) {
  var newObj = {};
  for (var uf in dataset) {
    if (!newObj[visConfig.ufsData[uf]["Região"]]) {
      newObj[visConfig.ufsData[uf]["Região"]] = [];
    }
    for (var j = 0; j < dataset[uf].length; j++) {
      if (!newObj[visConfig.ufsData[uf]["Região"]][j] && newObj[visConfig.ufsData[uf]["Região"]][j] !== 0) {
        newObj[visConfig.ufsData[uf]["Região"]][j] = dataset[uf][j];
      } else  {
        newObj[visConfig.ufsData[uf]["Região"]][j] += dataset[uf][j];
      }
    }
  }
  return newObj;
}


// function a(dataset, bigger, smaller) {
//   obj = {};
//
//   for (var dec in dataset) {
//     if (!obj[dec]) {
//       obj[dec] = {
//         "quantidade": 0,
//         "lado": 0,
//         "xy": ["x", "y"]
//       };
//     }
//     for (var year in dataset[dec]) {
//       if (!obj[year]) {
//         obj[year] = {
//           "quantidade": dataset[dec][year].length,
//           "lado": 0,
//           "xy": ["x", "y"]
//         };
//       }
//       obj[dec].quantidade += dataset[dec][year].length;
//     }
//   }
//
//   var max = 0;
//   var min = Infinity;
//
//   for (var i in obj) {
//     if (obj[i].quantidade > max) {
//       max = obj[i].quantidade;
//     }
//     if (obj[i].quantidade < min) {
//       min = obj[i].quantidade;
//     }
//   }
//
//   for (var j in obj) {
//     var qtd = obj[j].quantidade;
//     console.log(qtd);
//     var range = max - min;
//     console.log(range);
//     var rangeSize = bigger - smaller;
//     console.log(rangeSize);
//
//     obj[j].lado = Math.sqrt(smaller + (qtd - min)*rangeSize/range);
//   }
//
//   return obj;
// }
//
// console.log(JSON.stringify(a(visConfig.recordistsData, visConfig.recDecBiggerArea, visConfig.recDecSmallerArea)));