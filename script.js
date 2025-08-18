const dadosEnviados = {
  codigo: "123456",
  data: "2025-08-15",
  hora: "13:30:32",
  tensao: "127.47 V",
  corrente: "0.35 A",
  potencia: "40.11 W",
  status: "OK"
};

const retornoAPI = {
  status: "OK",
  diasMonitorados: "SEG, TER, QUA, QUI, SEX",
  horariosPermitidos: "7:00-12:10, 18:30-21:40",
  potenciaMaxima: 150, 
  intervaloAtualizacao: 30 
};

function gerarDadosReais(qtd, inicio) {
  const tensao = [];
  const corrente = [];
  const potencia = [];
  const timestamps = [];
  let data = inicio ? new Date(inicio) : new Date();
  data.setMinutes(0, 0, 0);

  for (let i = 0; i < qtd; i++) {
    const v = 127 + Math.sin(i / 20) * 2 + Math.random() * 1.5;
    const a = 0.2 + Math.abs(Math.sin(i / 13) * 0.5) + Math.random() * 0.1;
    const w = v * a * (0.97 + Math.random() * 0.03);

    tensao.push(Number(v.toFixed(2)));
    corrente.push(Number(a.toFixed(2)));
    potencia.push(Number(w.toFixed(2)));

    const h = data.getHours().toString().padStart(2, "0");
    const m = data.getMinutes().toString().padStart(2, "0");
    timestamps.push(`${h}:${m}`);
    data.setMinutes(data.getMinutes() + 2);
  }
  return { tensao, corrente, potencia, timestamps };
}
let energiaData = gerarDadosReais(60);
function atualizarDadosGrafico() {
  const ultIndex = energiaData.tensao.length - 1;
  const lastTime = energiaData.timestamps[ultIndex];
  let [h, m] = lastTime.split(":").map(Number);
  m += 2;
  if (m >= 60) { h++; m = m % 60; }
  if (h >= 24) h = 0;
  const novoTimestamp = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  const v = 127 + Math.sin(ultIndex / 20) * 2 + Math.random() * 1.5;
  const a = 0.2 + Math.abs(Math.sin(ultIndex / 13) * 0.5) + Math.random() * 0.1;
  const w = v * a * (0.97 + Math.random() * 0.03);

  energiaData.tensao.push(Number(v.toFixed(2)));
  energiaData.corrente.push(Number(a.toFixed(2)));
  energiaData.potencia.push(Number(w.toFixed(2)));
  energiaData.timestamps.push(novoTimestamp);

  if (energiaData.tensao.length > 120) {
    energiaData.tensao.shift();
    energiaData.corrente.shift();
    energiaData.potencia.shift();
    energiaData.timestamps.shift();
  }

  criarGraficoSobreposto();
}

function normalizarHora(hora) {
  if (!hora) return "";
  let [h, m] = hora.trim().split(":");
  if (!m) return "";
  h = h.padStart(2, "0");
  return `${h}:${m}`;
}

function preencherDados() {
  document.getElementById("codigo").textContent = dadosEnviados.codigo;
  document.getElementById("data").textContent = dadosEnviados.data;
  document.getElementById("hora").textContent = dadosEnviados.hora;
  document.getElementById("tensao").textContent = dadosEnviados.tensao;
  document.getElementById("corrente").textContent = dadosEnviados.corrente;
  document.getElementById("potencia").textContent = dadosEnviados.potencia;
  document.getElementById("apiStatus").value = retornoAPI.status;
  document.getElementById("potenciaMaxima").value = retornoAPI.potenciaMaxima;
  document.getElementById("intervaloAtualizacao").value = retornoAPI.intervaloAtualizacao;
  document.getElementById("diasMonitoradosLabel").textContent = retornoAPI.diasMonitorados;
  document.getElementById("horariosPermitidosLabel").textContent = retornoAPI.horariosPermitidos;
}

function abrirModalGrafico(tipo) {
  const titulo = document.getElementById("modalGraficoTitulo");
  const canvas = document.getElementById("modalGraficoCanvas");
  let label, data, color;
  if (tipo === "tensao") {
    label = "Tensão";
    data = energiaData.tensao;
    color = "#60a5fa";
    titulo.textContent = "Gráfico de Tensão";
  } else if (tipo === "corrente") {
    label = "Corrente";
    data = energiaData.corrente;
    color = "#34d399";
    titulo.textContent = "Gráfico de Corrente";
  } else {
    label = "Potência";
    data = energiaData.potencia;
    color = "#f87171";
    titulo.textContent = "Gráfico de Potência";
  }
  if (modalChartInstance) {
    modalChartInstance.destroy();
  }
  modalChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: energiaData.timestamps,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: color
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw} ${label === "Potência" ? "W" : label === "Tensão" ? "V" : "A"}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#fff" } },
        y: { grid: { color: "#374151" }, ticks: { color: "#fff" } }
      }
    }
  });
}

function criarGraficoSobreposto() {
  const canvas = document.getElementById("graficoSobrepostoCanvas");
  if (!canvas) return;

  if (window.sobrepostoChartInstance) {
    window.sobrepostoChartInstance.destroy();
  }
  
  const total = energiaData.timestamps.length;
  const initialPoints = 8;
  const initialMin = total > initialPoints ? total - initialPoints : 0;
  const initialMax = total - 1;

  window.sobrepostoChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: energiaData.timestamps,
      datasets: [
        {
          label: "Tensão (V)",
          data: energiaData.tensao,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96,165,250,0.12)",
          fill: false,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 6, 
          pointBackgroundColor: "#60a5fa",
          borderWidth: 3,
          yAxisID: "yTensao"
        },
        {
          label: "Corrente (A)",
          data: energiaData.corrente,
          borderColor: "#34d399",
          backgroundColor: "rgba(52,211,153,0.12)",
          fill: false,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: "#34d399",
          borderWidth: 3,
          yAxisID: "yCorrente"
        },
        {
          label: "Potência (W)",
          data: energiaData.potencia,
          borderColor: "#f87171",
          backgroundColor: "rgba(248,113,113,0.12)",
          fill: false,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: "#f87171",
          borderWidth: 3,
          yAxisID: "yPotencia"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#fff",
            font: { size: 16, family: "'Segoe UI','Roboto','Arial',sans-serif" },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: "#23232b",
          titleColor: "#60a5fa",
          bodyColor: "#fff",
          borderColor: "#60a5fa",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              if (context.dataset.label.includes("Potência")) return `${context.raw} W`;
              if (context.dataset.label.includes("Tensão")) return `${context.raw} V`;
              if (context.dataset.label.includes("Corrente")) return `${context.raw} A`;
              return context.raw;
            }
          }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            modifierKey: 'ctrl',
          },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
            drag: { enabled: true }
          },
          limits: {
            x: { minRange: 5 }
          }
        }
      },
      layout: {
        padding: { left: 10, right: 10, top: 10, bottom: 10 }
      },
      hover: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#cbd5e1",
            font: { size: 14, family: "'Segoe UI','Roboto','Arial',sans-serif" }
          },
          min: initialMin,
          max: initialMax
        },
        yTensao: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Tensão (V)", color: "#60a5fa", font: { size: 15, weight: "bold" } },
          ticks: { color: "#60a5fa", font: { size: 13 } },
          grid: { color: "#374151", borderDash: [4, 4] }
        },
        yCorrente: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Corrente (A)", color: "#34d399", font: { size: 15, weight: "bold" } },
          ticks: { color: "#34d399", font: { size: 13 } },
          grid: { drawOnChartArea: false }
        },
        yPotencia: {
          type: "linear",
          display: true,
          position: "right",
          offset: true,
          title: { display: true, text: "Potência (W)", color: "#f87171", font: { size: 15, weight: "bold" } },
          ticks: { color: "#f87171", font: { size: 13 } },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  function setZoomButtons() {
    const chart = window.sobrepostoChartInstance;
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetZoomBtn = document.getElementById("resetZoomBtn");
    if (chart && chart.resetZoom && zoomInBtn && zoomOutBtn && resetZoomBtn) {
      zoomInBtn.onclick = () => {
        chart.zoom({x: 1.2});
      };
      zoomOutBtn.onclick = () => {
        chart.zoom({x: 0.8});
      };
      resetZoomBtn.onclick = () => {
        chart.options.scales.x.min = undefined;
        chart.options.scales.x.max = undefined;
        chart.resetZoom();
        chart.update();
      };
    } else {
      setTimeout(setZoomButtons, 100);
    }
  }
  setZoomButtons();
}

window.addEventListener("DOMContentLoaded", () => {
  preencherDados();
  criarGraficoSobreposto();
  setInterval(atualizarDadosGrafico, 30000);

  const alterarBtn = document.getElementById("alterarBtn");
  const salvarBtn = document.getElementById("salvarBtn");
  const cancelarBtn = document.getElementById("cancelarBtn");
  const configForm = document.getElementById("configForm");
  const inputs = configForm.querySelectorAll("input");
  const btnDiasMonitorados = document.getElementById("btnDiasMonitorados");
  const btnHorariosPermitidos = document.getElementById("btnHorariosPermitidos");

  let tempDiasMonitorados = "";
  let tempHorariosPermitidos = "";

  alterarBtn.onclick = () => {
    configForm.classList.remove("pointer-events-none", "opacity-80");
    inputs.forEach(i => i.removeAttribute("readonly"));
    btnDiasMonitorados.disabled = false;
    btnHorariosPermitidos.disabled = false;
    alterarBtn.classList.add("hidden");
    salvarBtn.classList.remove("hidden");
    cancelarBtn.classList.remove("hidden");
    tempDiasMonitorados = retornoAPI.diasMonitorados;
    tempHorariosPermitidos = retornoAPI.horariosPermitidos;
  };

  cancelarBtn.onclick = () => {
    document.getElementById("diasMonitoradosLabel").textContent = retornoAPI.diasMonitorados;
    document.getElementById("horariosPermitidosLabel").textContent = retornoAPI.horariosPermitidos;
    preencherDados();
    configForm.classList.add("pointer-events-none", "opacity-80");
    inputs.forEach(i => i.setAttribute("readonly", true));
    btnDiasMonitorados.disabled = true;
    btnHorariosPermitidos.disabled = true;
    alterarBtn.classList.remove("hidden");
    salvarBtn.classList.add("hidden");
    cancelarBtn.classList.add("hidden");
  };

  btnDiasMonitorados.onclick = () => {
    const modal = document.getElementById("modalDias");
    modal.classList.remove("hidden");
    const diasAtuais = (tempDiasMonitorados || retornoAPI.diasMonitorados).split(',').map(d => d.trim());
    document.querySelectorAll('.dias-checkbox-modal').forEach(cb => {
      cb.checked = diasAtuais.includes(cb.value);
      cb.parentElement.classList.toggle('selected', cb.checked);
      cb.onchange = () => {
        cb.parentElement.classList.toggle('selected', cb.checked);
      };
    });
  };
  document.getElementById("cancelarDiasBtn").onclick = () => {
    document.getElementById("modalDias").classList.add("hidden");
  };
  document.getElementById("confirmarDiasBtn").onclick = () => {
    const selecionados = Array.from(document.querySelectorAll('.dias-checkbox-modal'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    document.getElementById("diasMonitoradosLabel").textContent = selecionados.join(', ');
    tempDiasMonitorados = selecionados.join(', ');
    document.getElementById("modalDias").classList.add("hidden");
  };

  btnHorariosPermitidos.onclick = () => {
    const modal = document.getElementById("modalHorarios");
    modal.classList.remove("hidden");

    let horarios = tempHorariosPermitidos || retornoAPI.horariosPermitidos;
    if (!horarios || !horarios.includes("-")) {
      horarios = "07:00-12:10,18:30-21:40";
    }
    const partes = horarios.split(',');

    document.getElementById("modalHorarioInicio1").value = normalizarHora(partes[0]?.split('-')[0]) || "07:00";
    document.getElementById("modalHorarioFim1").value   = normalizarHora(partes[0]?.split('-')[1]) || "12:10";
    document.getElementById("modalHorarioInicio2").value = normalizarHora(partes[1]?.split('-')[0]) || "18:30";
    document.getElementById("modalHorarioFim2").value   = normalizarHora(partes[1]?.split('-')[1]) || "21:40";
  };
  document.getElementById("cancelarHorariosBtn").onclick = () => {
    document.getElementById("modalHorarios").classList.add("hidden");
  };
  document.getElementById("confirmarHorariosBtn").onclick = () => {
    const h1 = document.getElementById("modalHorarioInicio1").value;
    const h2 = document.getElementById("modalHorarioFim1").value;
    const h3 = document.getElementById("modalHorarioInicio2").value;
    const h4 = document.getElementById("modalHorarioFim2").value;
    const horariosStr = `${h1}-${h2},${h3}-${h4}`;
    document.getElementById("horariosPermitidosLabel").textContent = horariosStr;
    tempHorariosPermitidos = horariosStr;
    document.getElementById("modalHorarios").classList.add("hidden");
  };

  salvarBtn.onclick = () => {
    document.getElementById("modalSenha").classList.remove("hidden");
    document.getElementById("senhaAdmin").value = "";
    document.getElementById("senhaErro").classList.add("hidden");
  };

  document.getElementById("cancelarSenhaBtn").onclick = () => {
    document.getElementById("modalSenha").classList.add("hidden");
  };

  document.getElementById("confirmarSenhaBtn").onclick = () => {
    const senha = document.getElementById("senhaAdmin").value;
    if (senha === "admin") {
      retornoAPI.status = document.getElementById("apiStatus").value;
      retornoAPI.diasMonitorados = tempDiasMonitorados || retornoAPI.diasMonitorados;
      retornoAPI.horariosPermitidos = tempHorariosPermitidos || retornoAPI.horariosPermitidos;
      retornoAPI.potenciaMaxima = parseInt(document.getElementById("potenciaMaxima").value, 10) || 1;
      retornoAPI.intervaloAtualizacao = parseInt(document.getElementById("intervaloAtualizacao").value, 10) || 1;
      preencherDados();
      configForm.classList.add("pointer-events-none", "opacity-80");
      inputs.forEach(i => i.setAttribute("readonly", true));
      btnDiasMonitorados.disabled = true;
      btnHorariosPermitidos.disabled = true;
      alterarBtn.classList.remove("hidden");
      salvarBtn.classList.add("hidden");
      cancelarBtn.classList.add("hidden");
      document.getElementById("modalSenha").classList.add("hidden");
      tempDiasMonitorados = "";
      tempHorariosPermitidos = "";
    } else {
      document.getElementById("senhaErro").classList.remove("hidden");
    }
  };
});
