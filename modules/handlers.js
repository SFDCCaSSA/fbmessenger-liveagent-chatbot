"use strict";

let salesforce = require('./salesforce'), 
	messenger = require('./messenger'),
	formatter = require('./formatter'),
	postbacks = require('./postbacks');

var rut;
var contacto;

exports.hola = (sender) => {
	messenger.getUserInfo(sender).then(response => {
		messenger.send({text : `Hola ${response.first_name}! Por favor proporcióname tu RUT sin puntos ni guiones.`}, sender);
	});
};

exports.ayuda = (sender) => {
	messenger.send({text : `Puedes preguntarme cosas como "Consulta de Cuentas", "Consulta de Saldos", "Transacción Rechazada"`}, sender);
};

exports.buscaContacto = (sender, values) => {
	console.log('Valor recibido: ' + values[0]);
	rut = values[0];
	messenger.send({text : `Gracias! Estoy validando tu RUT en nuestro sistema...`}, sender);
	salesforce.findContact(values[0]).then(contact => {
		contacto = contact[0];
		console.log('Variable global contacto: %j', contacto);
		messenger.send({text : `Listo! Por favor indícame tu nombre completo.`}, sender);
	})
};

exports.validaNombre = (sender, values) => {
	console.log('Contacto valida Nombre: %j', contacto);
	if(contacto){
		var nombre = contacto.get('firstname') + ' ' + contacto.get('lastname');
		console.log('Nombre contacto: ' + nombre);
		if(nombre == values[0]){
			messenger.send({text : `Muy bien! Por último, proporcióname tu token (multipass)`}, sender);
		} 
		else{
			messenger.send({text : `Lo lamento, el nombre que me indicas no coincide con nuestros registros. Por favor intenta nuevamente`}, sender);
		}
	}
};

exports.buscaCuentas = (sender) => {
	if(contacto){
		salesforce.findFinancialAccounts(contacto.get("accountid")).then(finAccounts => {
			messenger.send(formatter.formatAccounts(finAccounts), sender);
		});
	}	
};

exports.liveAgentMessage = (sender, values) => {
	console.log('LA session: %j', globalSession);
	console.log('LA sequence: ' + globalSequence);
	console.log('Text: ' + values);
	//postbacks.message(globalSession, globalSequence+1,sender);
	messenger.sendLAMessage(globalSession, values[0]);
};