function minutesFromTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function roundedHalfHour(hours) {
  return Math.ceil(hours * 2) / 2;
}

function planCoverage(event) {
  event.preventDefault();
  const ceremony = minutesFromTime(document.querySelector("#ceremony-time").value);
  let receptionEnd = minutesFromTime(document.querySelector("#reception-end").value);
  if (receptionEnd <= ceremony) receptionEnd += 1440;
  const gettingReady = document.querySelector("#getting-ready").value === "yes";
  const sendOff = document.querySelector("#send-off").value === "yes";
  const arrival = ceremony - (gettingReady ? 150 : 55);
  const wrap = receptionEnd - (sendOff ? 0 : 45);
  const hours = roundedHalfHour((wrap - arrival) / 60);
  const moments = [];
  moments.push(gettingReady ? "the beginning of the day" : "a calm pre-ceremony arrival");
  moments.push("the ceremony and the words that happen there");
  moments.push(sendOff ? "the final dance or exit" : "the main reception energy before the final stretch");
  document.querySelector("#coverage-result-title").textContent = `A ${hours}-hour window gives your day room.`;
  document.querySelector("#suggested-arrival").textContent = formatTime(arrival);
  document.querySelector("#suggested-wrap").textContent = formatTime(wrap);
  document.querySelector("#coverage-hours").textContent = `${hours} hours`;
  document.querySelector("#coverage-details").hidden = false;
  document.querySelector("#coverage-note").textContent = `This starting point includes ${moments.join(", ")}. Share it with your planner and film team, then adjust for travel, first looks, cultural events, or extra locations.`;
}

document.querySelector("#coverage-planner-form").addEventListener("submit", planCoverage);
planCoverage(new Event("submit"));
