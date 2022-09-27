 const socket =io.connect();


    function renderMsj(data){

        console.log('aca??')
        const html = data.map((elem,index)=> {
            return ('hola'+'<div><strong style="color:blue;" >' + elem.author +'</strong>: <em style="color:#7D6608" >[ ' + elem.date + ']</em><i style="color:#087D18">'+ elem.text +'</i></div>')
        }).join(" ");
        document.getElementById('messages').innerHTML = html;
        }
    
        socket.on('messages',data=>
            {renderMsj(data);     
            });
    
        function addMessage(e){
            console.log('entro acaS');
            const mensaje = {
                author : document.getElementById('username').value,
                date : new Date().toDateString(),
                text: document.getElementById('texto').value
            };
            socket.emit('new-message',mensaje);
            return false;
        }
        module.exports={
            renderMsj,
            addMessage
        }