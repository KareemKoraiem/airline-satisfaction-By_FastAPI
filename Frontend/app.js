/* ═══════════════════════════════════════════
   FASTAPI CONNECTION SETTINGS
   Change API_BASE_URL to wherever your FastAPI
   server is running (e.g. "http://127.0.0.1:8000"
   in development, or your deployed API URL in
   production). Leave it as an empty string "" if
   this page is served from the same origin/domain
   as the API.
═══════════════════════════════════════════ */
const API_BASE_URL = "https://airline-satisfaction-byfastapi-production.up.railway.app";

// Maps the toggle-button values used in the UI to the exact category
// labels the ML pipeline expects.
const FIELD_MAP = {
  gender:      { male: "Male",            female: "Female" },
  customer:    { loyal: "Loyal Customer", disloyal: "disloyal customer" },
  travel:      { business: "Business travel", personal: "Personal Travel" },
  flightClass: { eco: "Eco", "eco-plus": "Eco Plus", business: "Business" }
};

// Maps the rating widget ids used in the UI to the Passenger field names
// expected by the FastAPI /predict endpoint.
const RATING_FIELD_MAP = {
  wifi: "Inflight_wifi_service",
  depTime: "Departure_Arrival_time_convenient",
  onlineBook: "Ease_of_Online_booking",
  gate: "Gate_location",
  food: "Food_and_drink",
  onlineBoard: "Online_boarding",
  seat: "Seat_comfort",
  entertainment: "Inflight_entertainment",
  onboard: "On_board_service",
  legroom: "Leg_room_service",
  baggage: "Baggage_handling",
  checkin: "Checkin_service",
  inflightService: "Inflight_service",
  cleanliness: "Cleanliness"
};

/* ═══════════════════════════════════════════
   TOGGLE BUTTONS
═══════════════════════════════════════════ */
function pick(groupId, btn) {
  document.querySelectorAll(`#${groupId} .tog`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ═══════════════════════════════════════════
   SVG FACES
═══════════════════════════════════════════ */
const FACES = {
  satisfied: `
    <circle cx="40" cy="40" r="38" fill="none"/>
    <circle cx="27" cy="32" r="4.5" fill="white"/>
    <circle cx="53" cy="32" r="4.5" fill="white"/>
    <path d="M24 50 Q40 64 56 50" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  unsatisfied: `
    <circle cx="40" cy="40" r="38" fill="none"/>
    <circle cx="27" cy="32" r="4.5" fill="white"/>
    <circle cx="53" cy="32" r="4.5" fill="white"/>
    <path d="M24 58 Q40 44 56 58" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>`
};

/* ═══════════════════════════════════════════
   STAR RATINGS
═══════════════════════════════════════════ */
document.querySelectorAll('.stars').forEach(wrap => {
  wrap.querySelectorAll('.s').forEach(star => {
    star.addEventListener('click', () => {
      const v = +star.dataset.v;
      wrap.dataset.val = v;
      refreshStars(wrap, v);
    });
    star.addEventListener('mouseenter', () => hoverStars(wrap, +star.dataset.v));
    star.addEventListener('mouseleave', () => refreshStars(wrap, +wrap.dataset.val));
  });
});

function refreshStars(wrap, v) {
  wrap.querySelectorAll('.s').forEach(s => {
    s.classList.toggle('filled', +s.dataset.v <= v);
    s.style.color = '';
  });
}

function hoverStars(wrap, v) {
  wrap.querySelectorAll('.s').forEach(s => {
    s.style.color = +s.dataset.v <= v ? '#f59e0b' : '#a8bcd4';
  });
}

/* ═══════════════════════════════════════════
   PREDICTION HISTORY
═══════════════════════════════════════════ */
let predHistory = [];

function addHistory(entry) {
  predHistory.unshift(entry);
  const body = document.getElementById('historyBody');
  if (!body) return;
  body.innerHTML = predHistory.map((h) => `
    <div class="hist-item ${h.status}">
      <div class="hist-left">
        <span class="hist-badge ${h.status}">${h.status.toUpperCase()}</span>
        <span class="hist-time">${h.time}</span>
      </div>
      <span class="hist-pct">${typeof h.confidence === 'number' ? h.confidence + '%' : '—'}</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════
   FORM SUBMIT
═══════════════════════════════════════════ */
document.getElementById('predictionForm').addEventListener('submit', e => {
  e.preventDefault();
  runPrediction();
});

function activeVal(groupId) {
  const btn = document.querySelector(`#${groupId} .tog.active`);
  return btn ? btn.dataset.val : null;
}

/* ═══════════════════════════════════════════
   BUILD REQUEST PAYLOAD FOR THE FASTAPI /predict ENDPOINT
═══════════════════════════════════════════ */
function buildPayload() {
  const gender       = activeVal('genderGroup');
  const customerType = activeVal('customerGroup');
  const travelType   = activeVal('travelGroup');
  const flightClass  = activeVal('classGroup');

  const missing = [];
  if (!gender)       missing.push('Gender');
  if (!customerType) missing.push('Customer Type');
  if (!travelType)   missing.push('Type of Travel');
  if (!flightClass)  missing.push('Class');
  if (missing.length) {
    throw new Error(`Please select: ${missing.join(', ')}.`);
  }

  const ratings = {};
  document.querySelectorAll('.stars').forEach(s => {
    ratings[RATING_FIELD_MAP[s.dataset.id]] = +s.dataset.val || 0;
  });

  return {
    Gender: FIELD_MAP.gender[gender],
    Customer_Type: FIELD_MAP.customer[customerType],
    Age: +document.getElementById('age').value || 0,
    Type_of_Travel: FIELD_MAP.travel[travelType],
    Class: FIELD_MAP.flightClass[flightClass],
    Flight_Distance: +document.getElementById('flightDistance').value || 0,
    Arrival_Delay_in_Minutes: +document.getElementById('arrivalDelay').value || 0,
    ...ratings
  };
}

/* ═══════════════════════════════════════════
   CALL THE FASTAPI /predict ENDPOINT
═══════════════════════════════════════════ */
async function runPrediction() {
  const btn = document.getElementById('predictBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Predicting...';

  try {
    const payload = buildPayload();

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || `Server error (${response.status})`);
    }

    const data = await response.json();
    const result = mapApiResponse(data);

    showResult(result);
    addHistory({
      ...result,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    showError(err.message || 'Could not reach the prediction server. Please try again.');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Predict Satisfaction';
  }
}

/* Map the FastAPI /predict response { result, confidence }
   into the { confidence, status, desc } shape the UI expects. */
function mapApiResponse(data) {
  // API returns "Satisfied" or "Neutral or Dissatisfied"
  const status = data.result === "Satisfied" ? 'satisfied' : 'unsatisfied';

  const confidence = (data.confidence !== null && data.confidence !== undefined)
    ? Math.round(data.confidence)
    : null;

  const desc = status === 'satisfied'
    ? 'The passenger is likely to be satisfied with the flight experience.'
    : 'The passenger is likely to be dissatisfied with the flight experience.';

  return { confidence: confidence ?? '—', status, desc };
}

/* ═══════════════════════════════════════════
   SHOW RESULT
═══════════════════════════════════════════ */
function showResult({ confidence, status, desc }) {
  const hasConfidence = typeof confidence === 'number';
  const levelLabel = !hasConfidence ? ''
                   : confidence >= 80 ? 'High Confidence'
                   : confidence >= 55 ? 'Medium Confidence'
                   :                    'Low Confidence';

  document.getElementById('rpEmpty').style.display = 'none';
  document.getElementById('rpErrorCard') && (document.getElementById('rpErrorCard').style.display = 'none');
  const card = document.getElementById('rpCard');
  card.style.display = 'flex';

  const wrap      = document.getElementById('rpEmojiWrap');
  const inner     = document.getElementById('rpEmojiInner');
  const faceSvg   = document.getElementById('rpFacesvg');
  const statusTxt = document.getElementById('rpStatusText');
  const descEl    = document.getElementById('rpDesc');
  const pctEl     = document.getElementById('rpPct');
  const barFill   = document.getElementById('rpBarFill');
  const confLevel = document.getElementById('rpConfLevel');

  ['satisfied','neutral','unsatisfied'].forEach(c => {
    wrap.classList.remove(c);
    inner.classList.remove(c);
    statusTxt.classList.remove(c);
    barFill.classList.remove(c);
    confLevel.classList.remove(c);
  });

  wrap.classList.add(status);
  inner.classList.add(status);
  statusTxt.classList.add(status);
  barFill.classList.add(status);
  confLevel.classList.add(status);

  // SVG face update
  if (faceSvg) faceSvg.innerHTML = FACES[status];

  statusTxt.textContent = status === 'unsatisfied' ? 'UNSATISFIED' : status.toUpperCase();
  descEl.textContent    = desc;
  pctEl.textContent     = hasConfidence ? `${confidence}%` : '—';
  confLevel.textContent = levelLabel;

  barFill.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    barFill.style.width = hasConfidence ? `${confidence}%` : '0%';
  }));

  card.style.animation = 'none';
  void card.offsetHeight;
  card.style.animation = 'fadeUp 0.45s ease both';
}

/* ═══════════════════════════════════════════
   SHOW ERROR (e.g. API unreachable)
═══════════════════════════════════════════ */
function showError(message) {
  document.getElementById('rpEmpty').style.display = 'none';
  document.getElementById('rpCard').style.display = 'none';

  let errCard = document.getElementById('rpErrorCard');
  if (!errCard) {
    errCard = document.createElement('div');
    errCard.id = 'rpErrorCard';
    errCard.className = 'rp-error-card';
    errCard.innerHTML = `
      <div class="rp-error-icon"><i class="fas fa-triangle-exclamation"></i></div>
      <h3>Prediction Failed</h3>
      <p id="rpErrorMsg"></p>
    `;
    document.getElementById('rpCard').insertAdjacentElement('afterend', errCard);
  }
  document.getElementById('rpErrorMsg').textContent = message;
  errCard.style.display = 'flex';
}
