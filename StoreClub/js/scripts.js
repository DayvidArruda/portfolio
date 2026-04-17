const prevButton = document.getElementById('prev') // Selecionando o botão "prev"
const nexButton = document.getElementById('next') // Selecionando o botão "next"
const items = document.querySelectorAll('.item') // Selecionando todos com a class "." item
const dots = document.querySelectorAll('.dot') // Selecionando todos com a class "." dot
const numberIndicator = document.querySelector('.numbers') // Selecionando a class "." numbers
const list = document.querySelector('.list') // Selecionando a class "." list
//querySelector para selecionar apenas um
//querySelectoAll para selecionar mais de um
let active = 0;
const total = items.length //.length informa quantos items foi encontrado no HTML
let timer;

function update(direction) {

    document.querySelector('.item.active').classList.remove('active')
    document.querySelector('.dot.active').classList.remove('active')

    if(direction > 0){
        active = active + 1
        
        if(active == total){
            active = 0
        }
    } 
    else if(direction < 0){
        active = active -1

        if(active < 0){
            active = total -1
        }
    }

    items[active].classList.add('active')
    dots[active].classList.add('active')

    numberIndicator.textContent = String(active + 1).padStart(2,'0')

}

clearInterval(timer)
timer = setInterval(() => {
    update(1)
}, 5000);


prevButton.addEventListener('click', function() {
    update(-1)
})

nexButton.addEventListener('click', function() {
    update(+1)
})




