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

const energiaData = {
  tensao: [15.3, 33.8, 55.0, 90.2, 127.9],
  corrente: [2.35, 3.37, 2.34, 5.36, 2.35],
  potencia: [17.1, 20.2, 29.8, 40.5, 100.2],
  timestamps: ["13:00", "13:10", "13:20", "13:30", "13:40"]
};

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

function criarGrafico(id, label, data, color) {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
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

function inicializarGraficos() {
  criarGrafico("tensaoChart", "Tensão", energiaData.tensao, "#60a5fa");
  criarGrafico("correnteChart", "Corrente", energiaData.corrente, "#34d399");
  criarGrafico("potenciaChart", "Potência", energiaData.potencia, "#f87171");
}

let modalChartInstance = null;

function abrirModalGrafico(tipo) {
  const modal = document.getElementById("modalGrafico");
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
  modal.classList.remove("hidden");
}

function criarGraficoSobreposto() {
  const canvas = document.getElementById("graficoSobrepostoCanvas");
  if (!canvas) return;

  if (window.sobrepostoChartInstance) {
    window.sobrepostoChartInstance.destroy();
  }

  window.sobrepostoChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: energiaData.timestamps,
      datasets: [
        {
          label: "Tensão (V)",
          data: energiaData.tensao,
          borderColor: "#60a5fa",
          backgroundColor: "#60a5fa33",
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: "#60a5fa",
          yAxisID: "yTensao"
        },
        {
          label: "Corrente (A)",
          data: energiaData.corrente,
          borderColor: "#34d399",
          backgroundColor: "#34d39933",
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: "#34d399",
          yAxisID: "yCorrente"
        },
        {
          label: "Potência (W)",
          data: energiaData.potencia,
          borderColor: "#f87171",
          backgroundColor: "#f8717133",
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: "#f87171",
          yAxisID: "yPotencia"
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: true, labels: { color: "#fff" } },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataset.label.includes("Potência")) return `${context.raw} W`;
              if (context.dataset.label.includes("Tensão")) return `${context.raw} V`;
              if (context.dataset.label.includes("Corrente")) return `${context.raw} A`;
              return context.raw;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#fff" } },
        yTensao: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Tensão (V)", color: "#60a5fa" },
          ticks: { color: "#60a5fa" },
          grid: { color: "#374151" }
        },
        yCorrente: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Corrente (A)", color: "#34d399" },
          ticks: { color: "#34d399" },
          grid: { drawOnChartArea: false }
        },
        yPotencia: {
          type: "linear",
          display: true,
          position: "right",
          offset: true,
          title: { display: true, text: "Potência (W)", color: "#f87171" },
          ticks: { color: "#f87171" },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  preencherDados();
  inicializarGraficos();
  criarGraficoSobreposto();

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

  document.querySelectorAll('.expand-chart').forEach(btn => {
    btn.onclick = () => abrirModalGrafico(btn.dataset.chart);
  });
  document.getElementById("fecharModalGrafico").onclick = () => {
    document.getElementById("modalGrafico").classList.add("hidden");
    if (modalChartInstance) {
      modalChartInstance.destroy();
      modalChartInstance = null;
    }
  };

  document.getElementById("aplicarFiltroGrafico").onclick = () => {
    mostrarAviso("Filtro aplicado.");
  };

  const btnSobreposto = document.getElementById("btnGraficoSobreposto");
  if (btnSobreposto) {
    btnSobreposto.onclick = criarGraficoSobreposto;
  }

  const fecharSobreposto = document.getElementById("fecharModalGraficoSobreposto");
  if (fecharSobreposto) {
    fecharSobreposto.onclick = () => {
      document.getElementById("modalGraficoSobreposto").classList.add("hidden");
      if (window.sobrepostoChartInstance) {
        window.sobrepostoChartInstance.destroy();
        window.sobrepostoChartInstance = null;
      }
    };
  }
});

function mostrarAviso(msg) {
  let aviso = document.getElementById("modalAviso");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "modalAviso";
    aviso.className = "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50";
    aviso.innerHTML = `
      <div class="bg-[#18181b] rounded-xl p-8 shadow-2xl border border-[#374151] w-full max-w-xs flex flex-col items-center">
        <span class="text-lg font-bold text-[#60a5fa] mb-2">Aviso</span>
        <div class="text-white text-center mb-4" id="modalAvisoMsg"></div>
        <button id="fecharModalAviso" class="px-4 py-2 rounded-lg bg-[#2563eb] text-white font-bold">OK</button>
      </div>
    `;
    document.body.appendChild(aviso);
    aviso.querySelector("#fecharModalAviso").onclick = () => {
      aviso.classList.add("hidden");
    };
  }
  aviso.querySelector("#modalAvisoMsg").textContent = msg;
  aviso.classList.remove("hidden");
}

