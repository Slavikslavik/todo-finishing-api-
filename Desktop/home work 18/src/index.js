const Todo = function (form,list,template){
    this.form = form;
    this.list = list;
    this.template = template;
    this.notes = [];
};
//сохранение
Todo.prototype.save = function() {
    localStorage.setItem('notes',JSON.stringify(this.notes));
};

// completed
Todo.prototype.complete = function(id){
    //console.log(arguments);

    this.notes.find(note => {
        if(note._id == id){
            fetch(`https://todo.hillel.it/todo/${note._id}/toggle`,{
                method:'PUT',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${localStorage.getItem('access_token')}`
                }
            })
                .then(result => result.json())
                .then(result => {
                    //console.log(result);
                    if(result.checked){
                        document.querySelector(`[data-id="${note._id}"]`).classList.add('check');

                        document.querySelector('.note__button-done').disabled = true;
                        document.querySelector('.note__button--edit').disabled = true;
                    }else{
                        console.log('do this suka');
                    }
                });
        }
    });
};

//remove
Todo.prototype.remove = function(id){
    this.notes.find(note => {
        if(note._id == id){
            fetch(`https://todo.hillel.it/todo/${note._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })
                .then(result => result.json())
                .then(result=> {
                    this.notes.splice(this.notes.indexOf(note),1);
                    this.render();
                    //    console.log(result);
                    //    this.notes.push(result);
                });
        }else{
            console.log('suuuuuka');
        }
    });
};

//EDIIIIIIIIIIIIITT
Todo.prototype.edit = function(id) {
    const edit = document.querySelector('.edit');
    this.notes.find(note => {
        note._id = id;
        //console.log(note);


        edit.innerHTML =`<h1 class="header">  Make Changes 
            <input type="text" class="edit_value"  value="${note.value}">
            <div class="button1s">
            <button class="button1" data-action="save" >save</button>
            <button class="button1" data-action="cancel" >cancel</button>
            </div>
            </h1>`;

        fetch(`https://todo.hillel.it/todo/${note._id}`,{
            method: 'PUT',
            headers: {
                'Content-Type':'application/json',
                'Authorization':`Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(note)
        })
            .then(result => result.json())
            .then(result => {
                //console.log(result)

                document.querySelector('.button1s').addEventListener('click',e => {
                    e.preventDefault();
                    if(e.target.dataset.action === 'save'){
                    //console.log('save');

                        note.value = document.querySelector('.edit_value').value;
                        //alert('теперь нажмите EDIT');
                        this.render();
                    }
                    if (e.target.dataset.action === 'cancel'){
                        //edit.classList.toggle('hidden');
                        //console.log(edit);
                    }
                });
            });
    });
};



//рендеринг
Todo.prototype.render = function() {
    this.list.innerHTML = '';

    this.notes.forEach(note => {
        this.list.insertAdjacentHTML(
            'afterbegin',
            this.template(note)
        );
    });
};

Todo.prototype.append = function (note) {
    const task = {
        value: note,
        priority: 1
    };
    const options = {
        method:'POST',
        body:JSON.stringify(task),
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${localStorage.getItem('access_token')}`
        }
    };

    fetch('https://todo.hillel.it/todo',options)
        .then(response => response.json())
        .then(note => {
            //console.log(note);
            //console.log(note._id);
            this.notes.unshift(note);
            this.render();
            this.save();
            this.form.reset();

        })
        .catch(error=>alert('sorry, shit happends POST !!!!'));
};

// добавляем нашу заметку на страницу
Todo.prototype.getAccess = function(id){
    const options = {
        method:'POST',
        body:JSON.stringify({
            value: id
        }),
        headers: {
            'Content-Type':'application/json'
        }
    };
    fetch('https://todo.hillel.it/auth/login',options)
        .then(response => response.json())
        .then(result => {
        //console.log(result);     
            localStorage.setItem('access_token',result.access_token);
            this.getTask();
        })
        .catch(error => alert('sorry, shit happends'));
};

//забираем задачу с сервера "GET"

Todo.prototype.getTask = function(){
    const options = {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'Authorization':`Bearer ${localStorage.getItem('access_token')}`
        }
    };
    fetch('https://todo.hillel.it/todo',options)
        .then(result => result.json())
        .then(result => {
            //console.log(result);
            this.notes = result;
            this.render();
        })
        .catch(error => alert('Ooops..GET'));
};
//  добавление закладки на страницу
Todo.prototype.init = function() {
//если нет авторизации
    const token = localStorage.getItem('access_token');

    if(token){
        this.form.addEventListener('submit',e => {
            e.preventDefault();
            const note = document.querySelector('.form_task').value;
            //console.log(note);
            this.append(note);
        });
    } else {
        alert('write your id');
    }


    //события для трех кнопок

    this.list.addEventListener('click',({target}) => {
        const isCompleteBtn = target.tagName === 'BUTTON' && target.classList.contains('note__button-done');
        const editButton = target.tagName === 'BUTTON' && target.classList.contains('note__button--edit');
        const currentNoteId = target.closest('li').dataset.id;


        //console.log(editButton);
        //console.log(currentNoteId);


        if(isCompleteBtn) {

            this.complete(currentNoteId);

        } else if(editButton){

            this.edit(currentNoteId);

        } else {
            this.remove(currentNoteId);
        }

        this.render();
        // this.save();
    });
};
// const saveData = JSON.parse(localStorage.getItem(this.notes));

// if(saveData) {
//     this.notes = saveData;
//     this.render();


// };

const example = new Todo(
    document.querySelector('.note'),
    document.querySelector('.note_list'),
    note => `
    <li data-id="${note._id}"  >
    <span class="note__text"> ${note.value}</span>   
    <button class="note__button note__button-done"${note.checked } data-action ="done">DONE</button>
    <button class="note__button note__button--remove" data-action = "remove">Remove</button>
    <button class="note__button note__button--edit" data-action = "edit">EDIT</button>
    </li>`
);
//Форма регистрации

document.querySelector('.login').addEventListener('submit', e => {
    e.preventDefault();
    //console.log('qwe');
    const id = document.querySelector('.form_input').value;
    //console.log(typeof id);
    example.getAccess(id);

});
//запускаем
example.init();


