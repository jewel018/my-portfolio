console.log("Portfolio loaded!");

document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(
        document.querySelectorAll("main > section")
    );

    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!sections.length) return;

    // Respect the user's reduced-motion preference.
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return;

    let activeSection = null;
    let animationFrame = null;
    let clickTimeout = null;

    // Start with every section clear.
    sections.forEach(section => {
        section.classList.remove(
            "section-focused",
            "section-blurred"
        );
    });

    // Apply focus to one section and blur the others.
    function focusSection(targetSection) {
        if (!targetSection) return;

        activeSection = targetSection;

        sections.forEach(section => {
            const isFocused = section === targetSection;

            section.classList.toggle(
                "section-focused",
                isFocused
            );

            section.classList.toggle(
                "section-blurred",
                !isFocused
            );
        });
    }

    // Find the section closest to the viewport's center.
    function updateScrollFocus() {
        animationFrame = null;

        const scrollPosition =
            window.scrollY + window.innerHeight;

        const pageHeight =
            document.documentElement.scrollHeight;

        // IMPORTANT: At the bottom of the page, focus Contact.
        if (scrollPosition >= pageHeight - 5) {
            focusSection(sections[sections.length - 1]);
            return;
        }

        const viewportCenter = window.innerHeight / 2;

        let closestSection = null;
        let smallestDistance = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();

            let distance;

            if (viewportCenter < rect.top) {
                distance = rect.top - viewportCenter;
            } else if (viewportCenter > rect.bottom) {
                distance = viewportCenter - rect.bottom;
            } else {
                // The viewport center is inside this section.
                distance = 0;
            }

            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestSection = section;
            }
        });

        focusSection(closestSection);
    }

    // Avoid running the focus calculation excessively.
    function requestFocusUpdate() {
        if (animationFrame !== null) return;

        animationFrame = requestAnimationFrame(
            updateScrollFocus
        );
    }

    // Update focus while scrolling without fighting navbar clicks.
let navigationTarget = null;
let scrollEndTimer = null;

window.addEventListener(
    "scroll",
    () => {
        // If a navbar link was clicked, wait until scrolling settles.
        if (navigationTarget) {
            clearTimeout(scrollEndTimer);

            scrollEndTimer = setTimeout(() => {
                focusSection(navigationTarget);
                navigationTarget = null;
            }, 180);

            return;
        }

        requestFocusUpdate();
    },
    { passive: true }
);

    // Handle navigation clicks.
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const targetSection = document.querySelector(targetId);

            if (!targetSection || !sections.includes(targetSection)) {
                return;
            }

            // Focus the selected section immediately.
            navigationTarget = targetSection;
            focusSection(targetSection);

            // Keep the clicked section focused during smooth scrolling.
clearTimeout(clickTimeout);

clickTimeout = setTimeout(() => {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            focusSection(targetSection);
        });
    });
}, 1000);
        });
    });

    // Recalculate after resizing the browser.
    window.addEventListener(
        "resize",
        requestFocusUpdate,
        { passive: true }
    );
});

// =========================================
// FUNCTIONAL CONTACT FORM
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    const submitButton = document.getElementById("contact-submit");

    // Stop if the contact form is not on this page.
    if (!form || !status || !submitButton) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Clear the previous message.
        status.textContent = "";
        status.className = "contact-status";

        const buttonText = submitButton.querySelector("span");

        submitButton.disabled = true;
        buttonText.textContent = "Sending...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Form submission failed.");
            }

            status.textContent =
                "Message sent successfully! Thank you for reaching out.";

            status.classList.add("success");

            form.reset();

        } catch (error) {
            status.textContent =
                "Sorry, your message could not be sent. Please try again or email me directly.";

            status.classList.add("error");

            console.error("Contact form error:", error);

        } finally {
            submitButton.disabled = false;
            buttonText.textContent = "Send Message";
        }
    });
});