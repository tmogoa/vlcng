const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
const menuable = document.querySelectorAll(".menuable");

const normalizePozition = (mouseX, mouseY) => {
    // ? compute what is the mouse position relative to the container element (scope)
    let { left: scopeOffsetX, top: scopeOffsetY } =
        scope.getBoundingClientRect();

    scopeOffsetX = scopeOffsetX < 0 ? 0 : scopeOffsetX;
    scopeOffsetY = scopeOffsetY < 0 ? 0 : scopeOffsetY;

    const scopeX = mouseX - scopeOffsetX;
    const scopeY = mouseY - scopeOffsetY;

    // ? check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + contextMenu.clientWidth > scope.clientWidth;

    const outOfBoundsOnY =
        scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // ? normalize on X
    if (outOfBoundsOnX) {
        normalizedX =
            scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
        normalizedY =
            scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
    }

    return { normalizedX, normalizedY };
};

// menuable.forEach((item) => {
//     item.addEventListener("contextmenu", (event) => {
//         event.preventDefault();

//         console.log("right-clicked");

//         const { clientX: mouseX, clientY: mouseY } = event;
//         const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

//         contextMenu.style.top = `${normalizedY}px`;

//         contextMenu.style.left = `${normalizedX}px`;

//         contextMenu.classList.remove("hide-menu");
//         setTimeout(() => {
//             contextMenu.classList.add("show-menu");
//         });
//     });
// });

/**
 *
 * @param {td} item table row
 * @param {string} mediaId passed from view - use this media id for work
 */

// function attachListener(item, mediaId) {
//     item.addEventListener("contextmenu", (event) => {
//         event.preventDefault();

//         console.log("right-clicked");

//         const { clientX: mouseX, clientY: mouseY } = event;
//         const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

//         contextMenu.style.top = `${normalizedY}px`;

//         contextMenu.style.left = `${normalizedX}px`;

//         contextMenu.classList.remove("hide-menu");
//         setTimeout(() => {
//             contextMenu.classList.add("show-menu");
//         });
//     });
// }
function showContextMenu(event, mediaId) {
    //event.preventDefault();

    console.log("right-clicked");

    const { clientX: mouseX, clientY: mouseY } = event;
    const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

    contextMenu.style.top = `${normalizedY}px`;

    contextMenu.style.left = `${normalizedX}px`;

    contextMenu.classList.remove("hide-menu");
    setTimeout(() => {
        contextMenu.classList.add("show-menu");
    });
    // item.addEventListener("contextmenu", (event) => {
    // });
}

scope.addEventListener("click", (e) => {
    if (e.target.offsetParent != contextMenu) {
        contextMenu.classList.add("hide-menu");
    }
});
