const areas = {
  orlando: { label: "Orlando", latitude: 28.5383, longitude: -81.3792 },
  "winter-park": { label: "Winter Park", latitude: 28.599, longitude: -81.3392 },
  windermere: { label: "Windermere", latitude: 28.4956, longitude: -81.5345 },
  "winter-garden": { label: "Winter Garden", latitude: 28.5653, longitude: -81.5862 },
  "lake-nona": { label: "Lake Nona", latitude: 28.3803, longitude: -81.2381 },
  clermont: { label: "Clermont", latitude: 28.5494, longitude: -81.7729 },
  kissimmee: { label: "Kissimmee", latitude: 28.2919, longitude: -81.4076 },
};

const radians = (degrees) => (degrees * Math.PI) / 180;
const degrees = (radiansValue) => (radiansValue * 180) / Math.PI;

function julianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const a = Math.floor(year / 100);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + 2 - a + Math.floor(a / 4) - 1524.5;
}

function solarValues(julianDate) {
  const t = (julianDate - 2451545.0) / 36525;
  const geometricMeanLongitude = ((280.46646 + t * (36000.76983 + t * 0.0003032)) % 360 + 360) % 360;
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const equationCenter = Math.sin(radians(meanAnomaly)) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(radians(2 * meanAnomaly)) * (0.019993 - 0.000101 * t) + Math.sin(radians(3 * meanAnomaly)) * 0.000289;
  const trueLongitude = geometricMeanLongitude + equationCenter;
  const obliquity = 23 + (26 + ((21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60)) / 60;
  const declination = degrees(Math.asin(Math.sin(radians(obliquity)) * Math.sin(radians(trueLongitude))));
  const y = Math.tan(radians(obliquity) / 2) ** 2;
  const equationOfTime = 4 * degrees(y * Math.sin(2 * radians(geometricMeanLongitude)) - 2 * eccentricity * Math.sin(radians(meanAnomaly)) + 4 * eccentricity * y * Math.sin(radians(meanAnomaly)) * Math.cos(2 * radians(geometricMeanLongitude)) - 0.5 * y * y * Math.sin(4 * radians(geometricMeanLongitude)) - 1.25 * eccentricity * eccentricity * Math.sin(2 * radians(meanAnomaly)));
  return { declination, equationOfTime };
}

function sunsetUtcMinutes(julianDate, latitude, longitude) {
  let values = solarValues(julianDate);
  let hourAngle = Math.acos((Math.cos(radians(90.833)) / (Math.cos(radians(latitude)) * Math.cos(radians(values.declination)))) - Math.tan(radians(latitude)) * Math.tan(radians(values.declination)));
  let minutes = 720 - 4 * (longitude + degrees(hourAngle)) - values.equationOfTime;
  values = solarValues(julianDate + minutes / 1440);
  hourAngle = Math.acos((Math.cos(radians(90.833)) / (Math.cos(radians(latitude)) * Math.cos(radians(values.declination)))) - Math.tan(radians(latitude)) * Math.tan(radians(values.declination)));
  return 720 - 4 * (longitude + degrees(hourAngle)) - values.equationOfTime;
}

function easternOffset(year, month, day) {
  const probe = new Date(Date.UTC(year, month - 1, day, 12));
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(probe);
  const values = Object.fromEntries(parts.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
  return (Date.UTC(+values.year, +values.month - 1, +values.day, +values.hour, +values.minute) - probe.getTime()) / 60000;
}

function formatTime(totalMinutes) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function planLight(event) {
  event?.preventDefault();
  const dateValue = document.querySelector("#wedding-date").value;
  if (!dateValue) return;
  const [year, month, day] = dateValue.split("-").map(Number);
  const area = areas[document.querySelector("#wedding-area").value];
  const ceremonyLength = Number(document.querySelector("#ceremony-length").value);
  const sunset = sunsetUtcMinutes(julianDay(year, month, day), area.latitude, area.longitude) + easternOffset(year, month, day);
  const goldenHour = sunset - 60;
  const ceremonyStart = goldenHour - ceremonyLength - 10;
  document.querySelector("#light-result-title").textContent = `${area.label} timing, built around sunset.`;
  document.querySelector("#golden-hour").textContent = formatTime(goldenHour);
  document.querySelector("#sunset").textContent = formatTime(sunset);
  document.querySelector("#ceremony-start").textContent = formatTime(ceremonyStart);
  document.querySelector("#light-details").hidden = false;
  document.querySelector("#light-note").textContent = `For a ${ceremonyLength}-minute ceremony, this gives you a ten-minute reset before portraits begin around golden hour. If family photos happen after the ceremony, build in additional time.`;
}

const dateField = document.querySelector("#wedding-date");
const today = new Date();
dateField.min = today.toISOString().slice(0, 10);
dateField.value = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString().slice(0, 10);
document.querySelector("#light-planner-form").addEventListener("submit", planLight);
planLight();
