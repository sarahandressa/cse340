function togglePassword() {
    const passwordInput = document.getElementById("account_password");
    const showPasswordButton = document.getElementById("showPassword");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPasswordButton.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        showPasswordButton.textContent = "Show";
    }
}

document.addEventListener("DOMContentLoaded", function(){
    const showPasswordButton = document.getElementById("showPassword");
    if (showPasswordButton) {
        showPasswordButton.addEventListener("click", togglePassword);
    }
});