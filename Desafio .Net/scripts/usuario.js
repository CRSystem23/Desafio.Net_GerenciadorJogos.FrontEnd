var tbody = document.querySelector('table tbody');
var usuario = {};

function Cadastrar() {
    usuario.Login = document.querySelector('#usuarioLogin').value;
    usuario.Senha = document.querySelector('#usuarioSenha').value;
    usuario.PessoaId = document.querySelector('#cboPessoa').value;

    if (usuario.PessoaId == 0) {
        window.alert('O nome é obrigatório');
        e.preventDefault();
    }

    if (usuario.Login == '') {
        window.alert('O login é obrigatório');
        e.preventDefault();
    }

    if (usuario.Senha == '') {
        window.alert('a senha é obrigatório');
        e.preventDefault();
    }

    if (usuario.Id === undefined || usuario.Id === 0) {
        this.SalvarPessoas('POST', 0, usuario);
    } else {
        this.SalvarPessoas('PUT', usuario.Id, usuario);
    }

    usuario = {};

    this.CarregarUsuarios();

    $('#myModal').modal('hide')
}

function NovoUsuario() {
    var btnSalvar = document.querySelector('#btnSalvar');
    var tituloModal = document.querySelector('#tituloModal');

    document.querySelector('#usuarioId').value = 0;
    document.querySelector('#usuarioLogin').value = '';


    document.querySelector('#usuarioSenha').value = '';
    document.querySelector('#usuarioSenha').style.visibility = "visible";
    document.querySelector('#lblSenha').style.visibility = "visible";

    document.querySelector('#cboPessoa').disabled = false;
    SelecionarOption('#cboPessoa', 0)
    SelecionarOption('#cboPerfil', 0)

    btnSalvar.textContent = 'Cadastrar';
    tituloModal.textContent = 'Cadastrar Usuário';

    $('#myModal').modal('show')
}

function Cancelar() {
    var btnSalvar = document.querySelector('#btnSalvar');
    var tituloModal = document.querySelector('#tituloModal');

    document.querySelector('#usuarioId').value = 0;
    document.querySelector('#usuarioLogin').value = '';

    document.querySelector('#usuarioSenha').value = '';
    document.querySelector('#usuarioSenha').style.visibility = "visible";
    document.querySelector('#lblSenha').style.visibility = "visible";

    document.querySelector('#cboPessoa').disabled = false;
    SelecionarOption('#cboPessoa', 0)
    SelecionarOption('#cboPerfil', 0)

    pessoa = {};

    btnSalvar.textContent = 'Cadastrar';
    tituloModal.textContent = 'Cadastrar Usuário';

    $('#myModal').modal('hide')
}

function CarregarUsuarios() {
    tbody.innerHTML = '';
    var xhr = new XMLHttpRequest();

    xhr.open(`GET`, `http://localhost:9010/api/usuario`, true);
    xhr.setRequestHeader('Authorization', 'bearer ' + sessionStorage.getItem('token'));

    xhr.onerror = function () {
        console.log('ERRO', xhr.readyState);
    }

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var usuarios = JSON.parse(this.responseText);
                for (var indice in usuarios) {
                    AdicionarLinhaTable(usuarios[indice]);
                }
            } else if (this.status == 500) {
                var erro = JSON.parse(this.responseText);
                console.log(erro);
            } else if (this.status == 401) {
                logout()
            }
        }
    }

    xhr.send();
}

function SalvarPessoas(metodo, id, corpo) {
    var xhr = new XMLHttpRequest();

    if (id === undefined || id === 0)
        id = '';

    xhr.open(metodo, `http://localhost:9010/api/usuario/${id}`, false);
    xhr.setRequestHeader('Authorization', 'bearer ' + sessionStorage.getItem('token'));

    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(corpo));
}


function ExcluirUsuario(id) {
    var xhr = new XMLHttpRequest();

    xhr.open('DELETE', `http://localhost:9010/api/usuario/${id}`, false);
    xhr.setRequestHeader('Authorization', 'bearer ' + sessionStorage.getItem('token'));

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                FecharModal();
            }
            else if (this.status == 403) {
                CallbackUsuarioSemPermissao()
            }
        }
    }

    xhr.send();
}

function Excluir(pessoa) {
    bootbox.confirm({
        message: `Tem certeza que deseja excluir o pessoa ${pessoa.Nome}`,
        buttons: {
            confirm: {
                label: 'SIM',
                className: 'btn-success'
            },
            cancel: {
                label: 'NÃO',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result) {
                ExcluirUsuario(pessoa.Id);
                CarregarUsuarios();
            }
        }
    });
}


this.CarregarUsuarios();
this.BuscarPessoasSelectOption();

function EditarUsuario(usuarioA) {
    var btnSalvar = document.querySelector('#btnSalvar');
    var tituloModal = document.querySelector('#tituloModal');

    document.querySelector('#usuarioId').value = usuarioA.Id;

    SelecionarOption('#cboPessoa', usuarioA.PessoaId)
    document.querySelector('#cboPessoa').disabled = true;
    document.querySelector('#usuarioLogin').value = usuarioA.Login;
    SelecionarOption('#cboPerfil', usuarioA.IsAdmin)
    document.querySelector('#usuarioSenha').value = usuarioA.Senha;
    document.querySelector('#usuarioSenha').style.visibility = "hidden";
    document.querySelector('#lblSenha').style.visibility = "hidden";

    btnSalvar.textContent = 'Salvar';
    tituloModal.textContent = `Editar Usuario ${usuarioA.Login}`;

    usuario = usuarioA;
}

function AdicionarLinhaTable(usuarioA) {
    var perfil = usuarioA.IsAdmin ? "Administrador" : "Usuário";
    var trow = `<tr>
                   <td style="display: none;">${usuarioA.Id}</td>
                   <td>${usuarioA.Login}</td>
                   <td style="display: none;">${usuarioA.Senha}</td>
                   <td>${perfil}</td>
                   <td style="display: none;">${usuarioA.IsAdmin}</td>
                   <td>${usuarioA.Pessoa.Nome}</td>
                   <td style="display: none;">${usuarioA.PessoaId}</td>
                   <td>
                       <button class="btn btn-info botoes" data-toggle="modal" data-target="#myModal" onClick='EditarUsuario(${JSON.stringify(usuarioA)})'>Editar</button>
                       <button class="btn btn-danger botoes" onClick='Excluir(${JSON.stringify(usuarioA)})'>Excluir</button>
                   </td>
               </tr>
               `
    tbody.innerHTML += trow;
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = "login.html";
}

function FecharModal() {
    $('#myModal').modal('hide')
}

function CallbackUsuarioSemPermissao() {
    bootbox.confirm({
        message: `Usuário não possui permissão para excluir pessoa`,
        buttons: {
            confirm: {
                label: 'Ok',
                className: 'btn-success'
            },
            cancel: {
                className: 'btn-danger visibility: hidden',
            }
        },
        callback: function (result) {
            if (result) {
                FecharModal();
            }
        }
    });
}

function BuscarPessoasSelectOption() {
    var pessoas_select = document.querySelector("#cboPessoa");

    var xhr = new XMLHttpRequest();

    xhr.open(`GET`, `http://localhost:9010/api/pessoa`, true);
    xhr.setRequestHeader('Authorization', 'bearer ' + sessionStorage.getItem('token'));
    var p_options = document.createElement('option');
    p_options.setAttribute('value', 0)
    p_options.innerHTML = '';
    pessoas_select.appendChild(p_options);

    xhr.onerror = function () {
        console.log('ERRO', xhr.readyState);
    }

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var pessoas = JSON.parse(this.responseText);
                for (var indice in pessoas) {
                    p_options = document.createElement('option');
                    p_options.setAttribute('value', pessoas[indice].Id)
                    p_options.innerHTML = pessoas[indice].Nome;
                    pessoas_select.appendChild(p_options);
                }
            }
        } else if (this.status == 500) {
            var erro = JSON.parse(this.responseText);
            console.log(erro);
        } else if (this.status == 401) {
            logout()
        }
    }

    xhr.send();
}


function SelecionarOption(elementId, cod) {
    var elt = document.querySelector(elementId);
    var opt = elt.getElementsByTagName("option");
    for (var i = 0; i < opt.length; i++) {
        if (opt[i].value == cod) {
            elt.value = cod;
        }
    }
    return null;
}








