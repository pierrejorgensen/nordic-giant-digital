(function () {
  function showFormSuccess(form, email) {
    form.classList.add("contact-form--success");
    form.setAttribute("role", "status");
    form.setAttribute("aria-live", "polite");
    form.replaceChildren();

    var heading = document.createElement("h3");
    heading.textContent = "Got it!";
    form.appendChild(heading);

    var message = document.createElement("p");
    message.append("We're on it. We\u2019ll take a look and get back to you at ");
    var emailSpan = document.createElement("span");
    emailSpan.textContent = email;
    message.appendChild(emailSpan);
    message.append(".");
    form.appendChild(message);
  }

  function showFormError(status, message) {
    status.hidden = false;
    status.className = "form-status error";
    status.textContent = message;
  }

  function initContactForm(form) {
    var status = form.nextElementSibling;
    if (!status || !status.classList.contains("form-status")) {
      return;
    }

    var endpoint = form.getAttribute("action") || "";
    if (
      !endpoint ||
      endpoint.indexOf("your_form_id_here") !== -1 ||
      endpoint.indexOf("your_second_opinion_form_id_here") !== -1
    ) {
      showFormError(
        status,
        "Contact form is not configured yet. Set the Formspree form ID in .env and rebuild."
      );
      var submitButton = form.querySelector("button[type=submit]");
      if (submitButton) {
        submitButton.disabled = true;
      }
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.hidden = true;
      status.className = "form-status";
      status.textContent = "";

      var emailField = form.querySelector('input[name="email"]');
      var submitButton = form.querySelector("button[type=submit]");
      var submittedEmail = emailField ? emailField.value.trim() : "";

      if (submitButton) {
        submitButton.disabled = true;
      }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            showFormSuccess(form, submittedEmail);
            return;
          }
          return response.json().then(function (data) {
            throw new Error(data.error || "Something went wrong.");
          });
        })
        .catch(function (error) {
          showFormError(
            status,
            error.message || "Could not send your message. Please try again."
          );
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
    });
  }

  document.querySelectorAll(".contact-form").forEach(initContactForm);
})();
