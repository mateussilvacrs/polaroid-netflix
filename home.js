let cropper;
let inputAtivo;
let boxAtivo;
let currentAspectRatio = NaN;
let isCroppingBanner = false;

document.addEventListener("DOMContentLoaded", () => {
  const pName = localStorage.getItem("primaryName");
  if (pName) {
    document.getElementById("primary-name").textContent = pName;
    document.getElementById("span-primary-name").textContent = pName;
  }
  const sName = localStorage.getItem("secondName");
  if (sName) {
    document.getElementById("second-name").textContent = sName;
    document.getElementById("span-second-name").textContent = sName;
  }
  const desc = localStorage.getItem("description");
  if (desc) document.getElementById("description").textContent = desc;
  
  const ano = localStorage.getItem("span-ano");
  if (ano) document.getElementById("span-ano").textContent = ano;
  
  const savedBg = localStorage.getItem("bannerBg");
  if(savedBg) {
    document.getElementById("bannerImg").style.backgroundImage = `url('${savedBg}')`;
  }
});

function mudarFundo(input) {
  if (input.files && input.files[0]) {
    inputAtivo = input;
    isCroppingBanner = true; 
    const reader = new FileReader();
    reader.onload = function(e) {
      const modal = document.getElementById("cropModal");
      const img = document.getElementById("cropImage");
      img.src = e.target.result;
      modal.style.display = "flex";
      if(cropper) cropper.destroy();
      
      document.getElementById("aspectRatioSelect").value = "NaN";
      currentAspectRatio = NaN;
      
      cropper = new Cropper(img, { aspectRatio: currentAspectRatio, viewMode: 1 });
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function abrirCropper(input) {
  if (input.files && input.files[0]) {
    inputAtivo = input;
    boxAtivo = input.closest(".photo-box");
    isCroppingBanner = false; 
    const reader = new FileReader();
    reader.onload = function(e) {
      const modal = document.getElementById("cropModal");
      const img = document.getElementById("cropImage");
      img.src = e.target.result;
      modal.style.display = "flex";
      if(cropper) cropper.destroy();
      
      // FORÇA A PROPORÇÃO RETRATO 3:4 AUTOMATICAMENTE
      document.getElementById("aspectRatioSelect").value = "0.75";
      currentAspectRatio = 0.75;
      
      cropper = new Cropper(img, { aspectRatio: currentAspectRatio, viewMode: 1 });
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function fecharCropper() {
  document.getElementById("cropModal").style.display = "none";
  if(cropper) { cropper.destroy(); cropper = null; }
  if(inputAtivo) inputAtivo.value = "";
}

function mudarProporcao() {
  const val = document.getElementById("aspectRatioSelect").value;
  currentAspectRatio = isNaN(val) ? eval(val) : parseFloat(val);
  if(cropper) cropper.setAspectRatio(currentAspectRatio);
}

function confirmarCorte() {
  if(!cropper) return;
  const canvas = cropper.getCroppedCanvas();
  const base64 = canvas.toDataURL("image/jpeg", 0.95);

  if (isCroppingBanner) {
    document.getElementById("bannerImg").style.backgroundImage = `url('${base64}')`;
    try { localStorage.setItem("bannerBg", base64); } catch(err) {}
  } else {
    // Usamos a tag <img> com dimensões preenchidas. O aspect-ratio no CSS blinda ela contra distorções.
    boxAtivo.innerHTML = `
      <img src="${base64}" style="display:block; width:100%; height:100%; object-fit:cover; border-radius:6px; cursor:pointer;" onclick="trocarImagem(this)">
    `;
  }
  fecharCropper();
}

function trocarImagem(el) {
  const box = el.closest(".photo-box");
  box.innerHTML = `<span>Nova Foto</span><input type="file" accept="image/*" onchange="abrirCropper(this)" />`;
  box.querySelector("input").click();
}

async function salvarPDF() {
  const btn = document.getElementById("salvarPDFBtn");
  btn.innerText = "Gerando PDF... Aguarde";
  btn.disabled = true;

  const { jsPDF } = window.jspdf;
  const area = document.getElementById("pagina");

  const photoBoxes = document.querySelectorAll(".photo-box");
  const caixasVazias = [];
  
  photoBoxes.forEach(box => {
    if (box.querySelector("span")) {
      caixasVazias.push({ el: box, displayOriginal: box.style.display });
      box.style.display = "none";
    }
  });

  const fotosContainer = document.getElementById("fotos-container");
  const justifyOriginal = fotosContainer.style.justifyContent;
  const overflowOriginal = fotosContainer.style.overflowX;
  
  fotosContainer.style.justifyContent = "center";
  fotosContainer.style.overflowX = "visible"; // Permite que a captura não corte elementos flex no html2canvas

  const origWidth = area.style.width;
  const origMaxWidth = area.style.maxWidth;
  const origHeight = area.style.height;
  const origMargin = area.style.margin;
  const origBg = area.style.backgroundColor;

  area.style.width = "1000px";
  area.style.maxWidth = "1000px";
  area.style.height = "1415px"; 
  area.style.margin = "0";
  area.style.backgroundColor = "#141414"; 

  await new Promise(r => setTimeout(r, 200)); 

  try {
    const canvas = await html2canvas(area, {
      scale: 2, 
      useCORS: true,
      logging: false,
      windowWidth: 1000,
      windowHeight: 1415
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Nosso_Filme_Paulo_Presentes.pdf");

  } catch (error) {
    console.error("Erro PDF:", error);
    alert("Erro ao gerar o PDF.");
  } finally {
    area.style.width = origWidth;
    area.style.maxWidth = origMaxWidth;
    area.style.height = origHeight;
    area.style.margin = origMargin;
    area.style.backgroundColor = origBg;
    
    fotosContainer.style.justifyContent = justifyOriginal;
    fotosContainer.style.overflowX = overflowOriginal;
    
    caixasVazias.forEach(item => {
      item.el.style.display = item.displayOriginal;
    });
    
    btn.innerText = "📄 Salvar em PDF";
    btn.disabled = false;
  }
}
