const apikey = '';
const apihost = 'https://todo-api.coderslab.pl';


document.addEventListener('DOMContentLoaded', function () {

    apiListTasks().then(jsonResponse => {
            if (!jsonResponse.error) {
                jsonResponse.data.forEach(task => {
                    renderTask(task.id, task.title, task.description, task.status);
                });
            }
        }
    );

    const addTaskForm = document.querySelector('form');

    addTaskForm.addEventListener('submit',function(e){
        e.preventDefault()
        apiCreateTask(this.title.value,this.description.value).then(jsonResponse=>{
            if(!jsonResponse.error) {
                const task = jsonResponse.data
                renderTask(task.id, task.title, task.description, task.status);
            }
            this.title.value = '';
            this.description.value = '';
        });
    });
});

function apiListTasks() {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: {Authorization: apikey}
        }
    ).then(resp => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    );
}

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';
    document.querySelector('main').appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click',function(){
            apiUpdateTask(taskId, title, description, 'closed').then(jsonResponse=>{
                if(!jsonResponse.error){
                    const toDelete = section.querySelectorAll('.js-task-open-only');
                    toDelete.forEach(element=>{
                        element.parentElement.removeChild(element);
                    });
                }
            });
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click',function(){
        apiDeleteTask(taskId).then(jsonResponse=>{
            if(!jsonResponse.error) {
                section.parentElement.removeChild(section);
            }
        });
    });

    const list = document.createElement('ul');
    section.appendChild(list);

    apiListOperationsForTask(taskId).then(jsonResponse => {
            if (!jsonResponse.error) {
                jsonResponse.data.forEach(operation => {
                    renderOperation(list, operation.id, status, operation.description, operation.timeSpent);
                });
            }
        }
    )
    if(status === 'open'){
        const formDiv = document.createElement('div');
        formDiv.classList.add('card-body');
        formDiv.classList.add('js-task-open-only');
        section.appendChild(formDiv);

        const form = document.createElement('form');
        formDiv.appendChild(form);

        const inputDiv = document.createElement('div');
        inputDiv.classList.add('input-group');
        form.appendChild(inputDiv);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Operation description';
        input.classList.add('form-control');
        input.minLength = 5;
        inputDiv.appendChild(input);

        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('input-group-append');
        inputDiv.appendChild(buttonDiv);

        const button = document.createElement('button');
        button.classList.add('btn');
        button.classList.add('btn-info');
        button.innerText = 'Add';
        buttonDiv.appendChild(button);

        form.addEventListener('submit',function(e){
            e.preventDefault();

            apiCreateOperationForTask(taskId, input.value).then(jsonResponse=>{
                if(!jsonResponse.error){
                    const operation = jsonResponse.data;
                    renderOperation(list, operation.id, status, operation.description, operation.timeSpent);
                }
                input.value='';
            });
        });
    }
}

function apiListOperationsForTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            headers: {
                Authorization : apikey
            }
        }
    ).then(resp => {
            if (!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    );
}

function renderOperation(operationsList, operationId, status, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    operationsList.appendChild(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = renderTime(timeSpent);
    descriptionDiv.appendChild(time);

    if (status === "open") {
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('js-task-open-only');
        li.appendChild(buttonDiv);

        const button15m = document.createElement('button');
        button15m.className = 'btn btn-outline-success btn-sm mr-2';
        button15m.innerText = '+15m';
        buttonDiv.appendChild(button15m);

        button15m.addEventListener('click',function(){
            apiUpdateOperation(operationId, operationDescription, timeSpent+15).then(jsonResponse=>{
                if(!jsonResponse.error){
                    timeSpent=jsonResponse.data.timeSpent;
                    time.innerText = renderTime(timeSpent);
                }
            });
        });

        const button1h = document.createElement('button');
        button1h.className = 'btn btn-outline-success btn-sm mr-2';
        button1h.innerText = '+1h';
        buttonDiv.appendChild(button1h);

        button1h.addEventListener('click',function(){
            apiUpdateOperation(operationId, operationDescription, timeSpent+60).then(jsonResponse=>{
                if(!jsonResponse.error){
                    timeSpent=jsonResponse.data.timeSpent;
                    time.innerText = renderTime(timeSpent);
                }
            });
        });

        const buttonDelete = document.createElement('button');
        buttonDelete.className = 'btn btn-outline-danger btn-sm';
        buttonDelete.innerText = 'Delete';
        buttonDiv.appendChild(buttonDelete);

        buttonDelete.addEventListener('click',function(){
            apiDeleteOperation(operationId).then(jsonResponse=>{
                if(!jsonResponse.error){
                    li.parentElement.removeChild(li);
                }
            });
        });
    }
}

function renderTime(time) {
    let minutes = parseInt(time);

    if (minutes >= 60) {
        return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
    } else {
        return minutes + 'm';
    }
}

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, description: description, status: 'open' }),
            method: 'POST'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

function apiDeleteTask(Id){
    return fetch(
        apihost+'/api/tasks/'+Id,
        {
            headers: {Authorization: apikey},
            method: 'DELETE'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: description, timeSpent: 0 }),
            method: 'POST'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

function apiUpdateOperation(operationId, description, timeSpent){
    return fetch(
        apihost + '/api/operations/'+operationId,
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: description, timeSpent: timeSpent }),
            method: 'PUT'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

function apiDeleteOperation(operationId){
    return fetch(
        apihost + '/api/operations/'+operationId,
        {
            headers: { Authorization: apikey},
            method: 'DELETE'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(
        apihost + '/api/tasks/'+taskId,
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, description: description, status: status }),
            method: 'PUT'
        }
    ).then(resp=>{
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}