(function () {
  function initContactForm(form) {
    var status = form.nextElementSibling;
    if (!status || !status.classList.contains("form-status")) {
      return;
    }

    var endpoint = form.getAttribute("action") || "";
    if (!endpoint || endpoint.indexOf("your_form_id_here") !== -1) {
      status.hidden = false;
      status.className = "form-status error";
      status.textContent =
        "Contact form is not configured yet. Set FORMSPREE_FORM_ID in .env and rebuild.";
      form.querySelector("button[type=submit]").disabled = true;
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.hidden = true;
      status.className = "form-status";
      status.textContent = "";

      var submitButton = form.querySelector("button[type=submit]");
      submitButton.disabled = true;

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            status.hidden = false;
            status.className = "form-status success";
            status.textContent = "Thanks — your message was sent.";
            return;
          }
          return response.json().then(function (data) {
            throw new Error(data.error || "Something went wrong.");
          });
        })
        .catch(function (error) {
          status.hidden = false;
          status.className = "form-status error";
          status.textContent =
            error.message || "Could not send your message. Please try again.";
        })
        .finally(function () {
          submitButton.disabled = false;
        });
    });
  }

  document.querySelectorAll(".contact-form").forEach(initContactForm);
})();
