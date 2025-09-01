document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Função para buscar e exibir as atividades
  async function carregarAtividades() {
    const resposta = await fetch("/activities");
    const atividades = await resposta.json();
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = ""; // Limpa opções antigas
    Object.entries(atividades).forEach(([nome, dados]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = dados.max_participants - dados.participants.length;

      // Cria lista de participantes
      const participantesList = dados.participants.length
        ? `<ul class="participants-list">
              ${dados.participants.map(email => `<li>${email}</li>`).join("")}
           </ul>`
        : `<div class="no-participants">Nenhum participante ainda.</div>`;

      activityCard.innerHTML = `
          <h4>${nome}</h4>
          <p>${dados.description}</p>
          <p><strong>Schedule:</strong> ${dados.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participantes:</strong>
            ${participantesList}
          </div>
          <form onsubmit="inscrever(event, '${nome}')">
            <input type="email" name="email" placeholder="Seu e-mail" required>
            <button type="submit">Inscrever-se</button>
          </form>
          <div class="mensagem"></div>
        `;

      activitiesList.appendChild(activityCard);

      // Add option to select dropdown
      const option = document.createElement("option");
      option.value = nome;
      option.textContent = nome;
      activitySelect.appendChild(option);
    });
  }

  // Função para inscrever o aluno em uma atividade
  async function inscrever(event, atividade) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const mensagemDiv = form.nextElementSibling;
    mensagemDiv.textContent = "";
    try {
      const resposta = await fetch(
        `/activities/${encodeURIComponent(atividade)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      if (!resposta.ok) {
        const erro = await resposta.json();
        mensagemDiv.textContent = erro.detail;
        mensagemDiv.style.color = "red";
      } else {
        const dados = await resposta.json();
        mensagemDiv.textContent = dados.message;
        mensagemDiv.style.color = "green";
        carregarAtividades();
      }
    } catch (e) {
      mensagemDiv.textContent = "Erro ao inscrever.";
      mensagemDiv.style.color = "red";
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  carregarAtividades();
});
