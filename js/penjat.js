document.addEventListener("DOMContentLoaded", function () {
    var roomCode, lives = 5, gameStatus = {};
    var clueText = document.getElementById("clue").querySelector("span");
    var letters = document.getElementById("letters");
    var livesText = document.getElementById("lives");

    initializeGame();

    function initializeGame() {
        var join = confirm("El Penjat Online\n\n- Unir-se a una sala → Acceptar.\n\n- Crear una sala → Cancelar.");
        if (join) {
            joinGame();
        } else {
            createGame();
        }
    }

    function joinGame() {
        roomCode = prompt("Sala on et vols unir");
        clueText.innerHTML = "P2";
        ajaxRequest("joinGame", { "gameName": roomCode }, handleGameState);
    }

    function createGame() {
        roomCode = prompt("Nom de la sala que vols crear");
        clueText.innerHTML = "P1";
        ajaxRequest("createGame", { "gameName": roomCode, "gamePassword": "XXX" }, handleGameState);
    }

    function handleGameState(response) {
        if (response.status === "OK") {
            gameStatus = response.gameInfo;
            updateDisplay();
        } else {
            console.error("Game Error: " + response.error);
        }
    }

    function updateDisplay() {
        letters.innerHTML = gameStatus.wordCompleted || "________";
        livesText.innerHTML = lives + " Vides Restants";
    }

    function ajaxRequest(action, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://penjat.codifi.cat", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                callback(response);
            } else {
                console.error("Error de la sol·licitud: " + xhr.status);
            }
        };
        xhr.onerror = function () {
            console.error("Error de xarxa");
        };
        data.action = action;
        xhr.send(JSON.stringify(data));
    }

    document.addEventListener("keydown", function (event) {
        var key = event.key.toUpperCase();
        if (key.match(/^[A-Z]$/)) {
            ajaxRequest("playGame", { "gameName": roomCode, "word": key, "player": clueText.innerHTML }, handlePlayResponse);
        }
    });

    function handlePlayResponse(response) {
        if (response.status === "OK") {
            console.log("Paraula correcta. El jugador " + response.player + " ha salvat la seva vida fins ara.");
            updateDisplay();
        } else {
            console.log("Paraula incorrecta. El jugador " + response.player + " perd una vida.");
            lives--;
            if (lives === 0) {
                alert("Has perdut la partida!");
                window.location.reload();
            }
        }
    }

    document.getElementById("new_game").addEventListener("click", function () {
        window.location.reload();
    });
});
