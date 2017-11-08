
// Math has no prototype.
Math.toRadians = function(deg) {
	return Math.PI * deg / 180;
};

Math.toDegrees = function(rad) {
	return rad * 180 / Math.PI;
};

/**
 * Computes the Increasing Latitude. Mercator formula.
 * @param lat in degrees
 * @return Increasing Latitude, in degrees.
 */
var getIncLat = function(lat) {
	var il = Math.log(Math.tan((Math.PI / 4) + (Math.toRadians(lat) / 2)));
	return Math.toDegrees(il);
};

var getInvIncLat = function(il) {
	var ret = Math.toRadians(il);
	ret = Math.exp(ret);
	ret = Math.atan(ret);
	ret -= (Math.PI / 4); // 0.78539816339744828D;
	ret *= 2;
	ret = Math.toDegrees(ret);
	return ret;
};

/**
 *
 * @param fromL start latitude, in degrees
 * @param fromG start longitude in degrees
 * @param heading heading
 * @param dist distance in nm
 * @returns { lat: L, lng: G }
 */
var deadReckoning = function(fromL, fromG, heading, dist) {
	var deltaL = (dist / 60) * Math.cos(Math.toRadians(heading));
	var l2 = fromL + deltaL;
	var lc1 = getIncLat(fromL);
	var lc2 = getIncLat(l2);
	var deltaLc = lc2 - lc1;
	var deltaG = deltaLc * Math.tan(Math.toRadians(heading));
	var g2 = fromG + deltaG;
	return { lat: l2, lng: g2 };
};

// Ratio on *one* degree, that is the trick.
var getIncLatRatio = function(lat) {
	if (lat === 0) {
		return 1;
	} else {
		var bottom = lat - 1;
		if (bottom < 0) {
			bottom = 0;
		}
		return ((lat - bottom) / (getIncLat(lat) - getIncLat(bottom)));
	}
};

var calculateEastG = function(nLat, sLat, wLong, canvasW, canvasH) {
	var deltaIncLat =  getIncLat(nLat) - getIncLat(sLat);

	var graphicRatio = canvasW / canvasH;
	var deltaG = deltaIncLat * graphicRatio;
	var eLong = wLong + deltaG;
	while (eLong > 180) {
		eLong -= 360;
	}
	return eLong;
};

// Main for tests
if (false) {
	var d = getIncLat(45);
	console.log("IncLat(45)=" + d);
	console.log("Rad(45)=" + Math.toRadians(45));

	console.log("IncLat(60)=" + getIncLat(60));
	console.log("Ratio at L=60:" + getIncLatRatio(60));

	console.log("-----------------------");
	for (var i = 0; i <= 90; i += 10) {
		console.log("Ratio at " + i + "=" + getIncLatRatio(i));
	}

	console.log("IncLat(90)=" + getIncLat(90));
}