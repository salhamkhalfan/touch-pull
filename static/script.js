/* TOUCH GRASS - client logic */
(function () {
  "use strict";

  var PHASES = [
    [0, "PLANTING SEED..."],
    [15, "DETECTING VEINS..."],
    [35, "SKELETONIZING..."],
    [55, "BUILDING GRAPH..."],
    [75, "COMPUTING R (N+E)xMU+L..."],
    [90, "ASKING NATURE FOR A VIDEO..."],
  ];

  var dz = document.getElementById("dropzone");
  var fileInput = document.getElementById("file");
  var loading = document.getElementById("loading");
  var loadText = document.getElementById("load-text");
  var bar = document.getElementById("progress-bar");
  var errorBox = document.getElementById("error");
  var results = document.getElementById("results");
  var again = document.getElementById("again");

  document.getElementById("year").textContent = new Date().getFullYear();

  function setPhase(i) {
    loadText.textContent = PHASES[i][1];
    bar.style.width = PHASES[i][0] + "%";
  }

  function showLoading() {
    dz.hidden = true;
    errorBox.hidden = true;
    errorBox.textContent = "";
    results.hidden = true;
    loading.hidden = false;
    setPhase(0);
    var i = 0;
    window._phaseTimer = setInterval(function () {
      i = Math.min(i + 1, PHASES.length - 1);
      setPhase(i);
    }, 2600);
  }

  function hideLoading() {
    clearInterval(window._phaseTimer);
    loading.hidden = true;
    dz.hidden = false;
  }

  function showError(msg) {
    hideLoading();
    errorBox.hidden = false;
    errorBox.textContent = "!! " + (msg || "Oops, something went wrong.");
  }

  function upload(file) {
    showLoading();

    var data = new FormData();
    data.append("file", file);

    fetch("/analyze", { method: "POST", body: data })
      .then(function (resp) {
        return resp.json().then(function (body) {
          return { ok: resp.ok, body: body };
        });
      })
      .then(function (res) {
        hideLoading();
        if (!res.ok) {
          showError(res.body.error);
          return;
        }
        render(res.body);
      })
      .catch(function (err) {
        showError("Network error: " + err.message);
      });
  }

  function render(body) {
    var imgs = body.images, s = body.stats;

    document.getElementById("img-original").src = imgs.original;
    document.getElementById("img-skeleton").src = imgs.skeleton;
    document.getElementById("img-overlay").src = imgs.overlay;
    document.getElementById("img-clean").src = imgs.clean;

    document.getElementById("stat-N").textContent = s.N;
    document.getElementById("stat-E").textContent = s.E;
    document.getElementById("stat-C").textContent = s.C;
    document.getElementById("stat-mu").textContent = s.mu;
    document.getElementById("stat-L").textContent = s.L;
    document.getElementById("stat-R").textContent = s.R;

    var steps = document.getElementById("steps");
    steps.innerHTML = "";
    body.steps.forEach(function (step) {
      var li = document.createElement("li");
      li.innerHTML = step[0] + " <span>" + step[1] + "</span>";
      steps.appendChild(li);
    });

    renderVideo(body.video);

    var filename = fileInput.files[0] && fileInput.files[0].name;
    var meta = document.getElementById("video-meta");
    meta.textContent = "analyzed in " + body.elapsed + "s" +
      (filename ? " from " + filename : "") +
      " | R = " + s.R +
      " | method " + s.method + " thr " + s.threshold +
      " | connectivity " + (s.connectivity * 100).toFixed(1) + "%";

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderVideo(v) {
    var vb = document.getElementById("video-body");
    vb.classList.remove("ready");
    vb.innerHTML = "";

    if (v.mode === "embed") {
      var ifr = document.createElement("iframe");
      ifr.className = "video-frame";
      ifr.src = v.embed + "?rel=0";
      ifr.allowFullscreen = true;
      ifr.setAttribute("allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      vb.appendChild(ifr);

      var link = document.createElement("a");
      link.href = v.watch;
      link.target = "_blank";
      link.textContent = '"' + v.title + '" - ' + v.channel;
      vb.appendChild(link);
      link.style.display = "block";
      link.style.marginTop = "12px";
      link.style.fontSize = "9px";
      link.style.color = "var(--lime)";
      vb.classList.add("ready");
    } else {
      var hint = document.createElement("div");
      hint.className = "video-hint";
      var p = document.createElement("p");
      p.textContent = v.error || "Searching long nature videos...";
      hint.appendChild(p);
      var a = document.createElement("a");
      a.className = "pix-link";
      a.href = v.search_url;
      a.target = "_blank";
      a.textContent = "OPEN YOUTUBE: " + v.query;
      hint.appendChild(a);
      vb.appendChild(hint);
      vb.classList.add("ready");
    }
  }

  /* upload triggers */
  dz.addEventListener("click", function () { fileInput.click(); });
  ["dragover", "drop"].forEach(function (evt) {
    dz.addEventListener(evt, function (e) {
      e.preventDefault();
    });
  });
  dz.addEventListener("dragover", function () {
    dz.classList.add("dragover");
  });
  dz.addEventListener("dragleave", function () {
    dz.classList.remove("dragover");
  });
  dz.addEventListener("drop", function (e) {
    dz.classList.remove("dragover");
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length) upload(fileInput.files[0]);
  });
  again.addEventListener("click", function () {
    results.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();