let socket = io();


socket.on('connect', function () {
    console.log('Connected to server');
    let skycons_main = new Skycons({"color": "white"});
    skycons_main.add("icon_main", Skycons.PARTLY_CLOUDY_DAY);
    skycons_main.play();
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();
    $(".weather_data").remove();
    jQuery('#button').attr('disabled','disabled').text('Searching...');
    let messageTextBox = jQuery('[name=message]');
    socket.emit('createMessage',messageTextBox.val().latinize());
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
    let messageTextBox = jQuery('[name=message]');
    messageTextBox.val('');
    let template = jQuery('#message-template').html();
    let time = moment.unix(message.time).format('MMMM Do YYYY, k:m');
    let html = Mustache.render(template,{
        city: message.add,
        temperature: message.temperature,
        meta: message.summary,
        time: time
    });
    jQuery("#message-form").append(html);
    let skycons = new Skycons({"color": "white"});
    let icon = message.icon;
    skycons.add("icon1", icon);
    skycons.play();
    jQuery("#button").removeAttr('disabled').text('Search');
});

socket.on('newMessageError', function(message) {
    console.log('new message', message);
    document.getElementById('p_message').textContent = message;
});

