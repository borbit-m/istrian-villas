document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form");
  const messageBox = document.getElementById("form-message");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
      })
        .then(response => response.text())
        .then(result => {
          messageBox.textContent = result;
          messageBox.style.display = "block";
          messageBox.style.background = "#d4edda";
          messageBox.style.color = "#155724";
          messageBox.style.padding = "10px";
          messageBox.style.border = "1px solid #c3e6cb";
          messageBox.style.marginTop = "15px";
          form.reset();
        })
        .catch(error => {
          messageBox.textContent = "Error sending message.";
          messageBox.style.display = "block";
          messageBox.style.background = "#f8d7da";
          messageBox.style.color = "#721c24";
          messageBox.style.padding = "10px";
          messageBox.style.border = "1px solid #f5c6cb";
          messageBox.style.marginTop = "15px";
        });
    });
  }
});