const urlResumo = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=997277030";
const urlBase = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=297052327";

const MESES_GRAFICO = [
  "mar-26", "abr-26", "mai-26", "jun-26", "jul-26", "ago-26",
  "set-26", "out-26", "nov-26", "dez-26", "jan-27", "fev-27"
];

function parseCSV(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map(linha => linha.split(/,|;/));
}

function limparNumero(valor) {
  if (!valor) return 0;

  let texto = valor.toString()
    .replace(/"/g, "")
    .replace("R$", "")
    .replace(/\s/g, "")
    .trim();

  if (texto.includes("%")) {
    texto = texto.replace("%", "");
  }

  texto = texto.replace(/\./g, "").replace(",", ".");

  return Number(texto) || 0;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarPercentual(valor) {
  return `${Number(valor).toFixed(2).replace(".", ",")}%`;
}

function corPorPercentual(valor) {
  if (valor >= 100) return "#20c06b";
  if (valor >= 80) return "#f1c40f";
  return "#e74c3c";
}

function gradientePorCor(cor) {
  if (cor === "#20c06b") return "linear-gradient(to top, #18b35d, #8de7b7)";
  if (cor === "#f1c40f") return "linear-gradient(to top, #ddb400, #ffe37a)";
  return "linear-gradient(to top, #d8342d, #ff8f86)";
}

function aplicarBarraVertical(id, valor) {
  const numero = Number(valor) || 0;
  const percentualVisual = Math.min(numero, 100);
  const cor = corPorPercentual(numero);

  const el = document.getElementById(id);
  if (!el) return;

  el.style.height = `${percentualVisual}%`;
  el.style.background = gradientePorCor(cor);
}

function normalizarMes(texto) {
  return (texto || "")
    .toLowerCase()
    .replace("/", "-")
    .trim();
}

function formatarMesTopo(mes) {
  const mapa = {
    "mar-26": "mar.-26",
    "abr-26": "abr.-26",
    "mai-26": "mai.-26",
    "jun-26": "jun.-26",
    "jul-26": "jul.-26",
    "ago-26": "ago.-26",
    "set-26": "set.-26",
    "out-26": "out.-26",
    "nov-26": "nov.-26",
    "dez-26": "dez.-26",
    "jan-27": "jan.-27",
    "fev-27": "fev.-27"
  };

  const chave = normalizarMes(mes);
  return mapa[chave] || mes || "--";
}

let mesAtualResumo = "";

fetch(urlResumo)
  .then(res => {
    if (!res.ok) throw new Error("Falha ao carregar resumo");
    return res.text();
  })
  .then(data => {
    const rows = parseCSV(data);
    const valores = {};

    rows.slice(1).forEach(r => {
      const chave = (r[0] || "").replace(/"/g, "").trim();
      const valor = (r[1] || "").replace(/"/g, "").trim();
      if (chave) valores[chave] = valor;
    });

    mesAtualResumo = (valores["mes_atual"] || "").replace(/"/g, "").trim();

    const metaMes = limparNumero(valores["meta_mes"]);
    const faturamentoMes = limparNumero(valores["faturamento_mes"]);
    const percentualMes = limparNumero(valores["percentual_mes"]);
    const percentualAcumulado = limparNumero(valores["percentual_acumulado"]);
    const backlog = limparNumero(valores["backlog"]);

    document.getElementById("meta").innerText = formatarMoeda(metaMes);
    document.getElementById("faturamento").innerText = formatarMoeda(faturamentoMes);
    document.getElementById("percentual").innerText = formatarPercentual(percentualMes);
    document.getElementById("backlog").innerText = formatarMoeda(backlog);

    document.getElementById("termometroMesTexto").innerText = formatarPercentual(percentualMes);
    document.getElementById("termometroTemporadaTexto").innerText = formatarPercentual(percentualAcumulado);

    document.getElementById("mesAtualTopo").innerText = formatarMesTopo(mesAtualResumo);

    aplicarBarraVertical("termometroMes", percentualMes);
    aplicarBarraVertical("termometroTemporada", percentualAcumulado);
  })
  .catch(error => {
    console.error("Erro ao carregar resumo:", error);
  });

fetch(urlBase)
  .then(res => {
    if (!res.ok) throw new Error("Falha ao carregar base");
    return res.text();
  })
  .then(data => {
    const rows = parseCSV(data);

    const labels = [];
    const metas = [];
    const faturamentos = [];
    const tbody = document.querySelector("#tabelaMetas tbody");

    rows.slice(1).forEach(r => {
      const mesOriginal = (r[0] || "").replace(/"/g, "").trim();
      if (!mesOriginal) return;

      const mes = normalizarMes(mesOriginal);

      const metaValor = limparNumero(r[1]);
      const entradaPedidos = limparNumero(r[2]);
      const faturamentoValor = limparNumero(r[3]);
      const realizado = limparNumero(r[4]);
      const acumulado = limparNumero(r[5]);
      const projetado = limparNumero(r[6]);

      const tr = document.createElement("tr");

      if (mesOriginal.toLowerCase().includes("total ytd")) {
        tr.classList.add("linha-total");
      }

      if (mesOriginal.toLowerCase().includes("backlog")) {
        tr.classList.add("linha-backlog");
      }

      if (mesAtualResumo && normalizarMes(mesAtualResumo) === mes) {
        tr.classList.add("linha-mes-atual");
      }

      tr.innerHTML = `
        <td>${mesOriginal}</td>
        <td>${formatarMoeda(metaValor)}</td>
        <td>${formatarMoeda(entradaPedidos)}</td>
        <td>${formatarMoeda(faturamentoValor)}</td>
        <td>${formatarPercentual(realizado)}</td>
        <td>${formatarPercentual(acumulado)}</td>
        <td>${formatarPercentual(projetado)}</td>
      `;

      tbody.appendChild(tr);

      if (MESES_GRAFICO.includes(mes)) {
        labels.push(mesOriginal);
        metas.push(metaValor);
        faturamentos.push(faturamentoValor);
      }
    });

    new Chart(document.getElementById("grafico"), {
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: "Meta",
            data: metas,
            backgroundColor: "#2d6cdf",
            borderRadius: 6,
            maxBarThickness: 30
          },
          {
            type: "line",
            label: "Faturamento",
            data: faturamentos,
            borderColor: "#2eb67d",
            backgroundColor: "#2eb67d",
            tension: 0.35,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 5,
              callback: function(value) {
                return value.toLocaleString("pt-BR");
              }
            },
            grid: {
              color: "#e8edf3"
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("Erro ao carregar base:", error);
  });
