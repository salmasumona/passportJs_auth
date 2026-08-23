fetch("/api/auth/me")
        .then((r) => {
          if (!r.ok) location = "/login.html";
          return r.json();
        })
        .then(
          (d) =>
            (document.querySelector("#user").textContent = JSON.stringify(
              d.user,
              null,
              2
            ))
        );
      document.querySelector("#logout").onclick = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        location = "/login.html";
      };