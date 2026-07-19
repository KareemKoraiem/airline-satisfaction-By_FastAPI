6

const API_BASE_URL = "https://airline-satisfaction-byfastapi-production.up.railway.app";

const FIELD_MAP = {
  gender:      { male: "Male",              female: "Female" },
  customer:    { loyal: "Loyal Customer",   disloyal: "disloyal Customer" },
  travel:      { business: "Business travel", personal: "Personal Travel" },
  flightClass: { eco: "Eco", "eco-plus": "Eco Plus", business: "Business" }
};

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

function pick(groupId, btn) {
  document.querySelectorAll(`#${groupId} .tog`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

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

document.getElementById('predictionForm').addEventListener('submit', e => {
  e.preventDefault();
  runPrediction();
});

function activeVal(groupId) {
  const btn = document.querySelector(`#${groupId} .tog.active`);
  return btn ? btn.dataset.val : null;
}

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

function mapApiResponse(data) {

  const status = data.result === "Satisfied" ? 'satisfied' : 'unsatisfied';

  // API returns confidence already multiplied by 100 (e.g. 87.4)
  const raw = data.confidence;
  const confidence = (raw !== null && raw !== undefined && !isNaN(raw))
    ? Math.round(raw)
    : null;

  const level = confidence === null ? ''
    : confidence >= 80 ? 'high'
    : confidence >= 55 ? 'medium'
    : 'low';

  const desc = status === 'satisfied'
    ? level === 'high'   ? 'The passenger is very likely to be satisfied with the flight experience.'
    : level === 'medium' ? 'The passenger is likely to be satisfied with the flight experience.'
    :                      'The passenger may be satisfied, but the model is not very confident.'
    : level === 'high'   ? 'The passenger is very likely to be dissatisfied with the flight experience.'
    : level === 'medium' ? 'The passenger is likely to be dissatisfied with the flight experience.'
    :                      'The passenger may be dissatisfied, but the model is not very confident.';

  return { confidence: confidence ?? null, status, desc };
}

/* ═══════════════════════════════════════════
   SHOW RESULT
═══════════════════════════════════════════ */
function showResult({ confidence, status, desc }) {
  const hasConfidence = typeof confidence === 'number' && !isNaN(confidence);

  // Determine level label & color class based on confidence value
  let levelLabel = '';
  let levelClass = status; // default to status color
  if (hasConfidence) {
    if (confidence >= 80) {
      levelLabel = 'High Confidence';
      levelClass = 'high-conf';
    } else if (confidence >= 55) {
      levelLabel = 'Medium Confidence';
      levelClass = 'medium-conf';
    } else {
      levelLabel = 'Low Confidence';
      levelClass = 'low-conf';
    }
  }

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

  ['satisfied','neutral','unsatisfied','high-conf','medium-conf','low-conf'].forEach(c => {
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
  confLevel.classList.add(levelClass);

  // SVG face update
  if (faceSvg) faceSvg.innerHTML = FACES[status];

  statusTxt.textContent = status === 'unsatisfied' ? 'UNSATISFIED' : status.toUpperCase();
  descEl.textContent    = desc;
  pctEl.textContent     = hasConfidence ? `${confidence}%` : '—';
  confLevel.textContent = levelLabel;

  // Reset bar to 0 first, then animate to target width
  barFill.style.transition = 'none';
  barFill.style.width = '0%';

  requestAnimationFrame(() => {
    barFill.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
    barFill.style.width = hasConfidence ? `${confidence}%` : '0%';
  });

  card.style.animation = 'none';
  void card.offsetHeight;
  card.style.animation = 'fadeUp 0.45s ease both';

  // On mobile (stacked layout), scroll result panel into view
  if (window.innerWidth <= 1050) {
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
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

  // On mobile, scroll error card into view
  if (window.innerWidth <= 1050) {
    setTimeout(() => {
      errCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
