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
  potenciaMaxima: "150 W",
  intervaloAtualizacao: "30 segundos"
};

const energiaData = {
  tensao: [127.5, 126.8, 128.0, 127.2, 127.9],
  corrente: [0.35, 0.37, 0.34, 0.36, 0.35],
  potencia: [40.1, 41.2, 39.8, 40.5, 40.2],
  timestamps: ["13:00", "13:10", "13:20", "13:30", "13:40"]
};

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

window.addEventListener("DOMContentLoaded", () => {
  preencherDados();
  inicializarGraficos();

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
    const horarios = (tempHorariosPermitidos || retornoAPI.horariosPermitidos).split(',');
    document.getElementById("modalHorarioInicio1").value = horarios[0]?.split('-')[0] || "07:00";
    document.getElementById("modalHorarioFim1").value = horarios[0]?.split('-')[1] || "12:10";
    document.getElementById("modalHorarioInicio2").value = horarios[1]?.split('-')[0] || "18:30";
    document.getElementById("modalHorarioFim2").value = horarios[1]?.split('-')[1] || "21:40";
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
      retornoAPI.potenciaMaxima = document.getElementById("potenciaMaxima").value;
      retornoAPI.intervaloAtualizacao = document.getElementById("intervaloAtualizacao").value;
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

window.addEventListener("DOMContentLoaded", startCreditTyping);