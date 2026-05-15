function nomecasal() {
  const primaryName = document.getElementById("primary-name").value;
  localStorage.setItem("primaryName", primaryName);
  const secondName = document.getElementById("second-name").value;
  localStorage.setItem("secondName", secondName);
  const description = document.getElementById("description").value;
  localStorage.setItem("description", description);
  const ano = document.getElementById("span-ano").value;
  localStorage.setItem("span-ano", ano);
  window.location.href = "home.html";
}

function atualizarContador() {
  const textarea = document.getElementById("description");
  const contador = document.getElementById("contador");
  const barra = document.getElementById("barraPreenchida");

  const max = 400;
  const atual = textarea.value.length;
  const percentual = (atual / max) * 100;

  contador.textContent = atual;
  barra.style.width = `${percentual}%`;
}

function formatarTodasPalavras(input) {
  const valor = input.value.trim();
  if (valor === "") return;
  const palavras = valor
    .toLowerCase()
    .split(" ")
    .filter((p) => p !== "")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1));
  input.value = palavras.join(" ");
}