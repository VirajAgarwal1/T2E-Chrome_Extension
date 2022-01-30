

chrome.runtime.onMessage.addListener((message , sender , sendResponse)=>{
    if (message.txt == 'Popup_Opened') {
        console.log(message.txt);
        var requirements = []
        const table_subject = document.querySelectorAll('td.th_subject');
        for (let index = 0; index < table_subject.length; index++) {
            const element = table_subject[index];
            requirements.push(element.innerText);
        }
        
        
        var sender_name = []
        var sender_number = []
        var sender_org = []
        
        const table_sender_data = document.querySelectorAll('td.th_receiver');
        for (let index = 0; index < table_sender_data.length; index++) {
            const element = table_sender_data[index];
        
            const sender_name_particular = element.querySelector('span.nmibx');
            sender_name.push(sender_name_particular.innerText);
        
            const sender_number_particular = element.querySelector('span.th_receiver_span.numibx');
            sender_number.push(sender_number_particular.innerText);
        
            const sender_org_particular = element.querySelector('span.th_receiver_span.cmpibx');
            if (!sender_org_particular) {
                sender_org.push('-');
            }else {
                sender_org.push(sender_org_particular.innerText);
            }
        }
        
        
        //td.tip--bottom-right.th_conty.ctibx
        var location_data = []
        const table_location = document.querySelectorAll('td.tip--bottom-right.th_conty.ctibx');
        for (let index = 0; index < table_location.length; index++) {
            const element = table_location[index];
            location_data.push(element.innerText);
        }
        
        const months = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May','Jun', 'Jul' , 'Aug' , 'Sep' , 'Oct' , 'Nov' , 'Dec']
        const today = new Date();
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate()-1)
        var date_data = []
        const table_date = document.querySelectorAll('td.th_date');
        for (let index = 0; index < table_date.length; index++) {
            const element = table_date[index];
            if (element.innerText == 'Yesterday') {
                date_data.push(yesterday.getDate()+' '+ String(months[yesterday.getMonth()]));
            }
            else if (/^1?[0-9]:[0-5]?[0-9] (A|P)M$/.test(element.innerText)) {
                date_data.push(today.getDate()+ ' '+ String(months[today.getMonth()]));
            }
            else {
                date_data.push(element.innerText)
            }
        }
        
        
        // [
        //     {
        //         "requirement": --,
        //         "sender_name":--,
        //         "sender_number":--,
        //         "sender_org":--,
        //         "location":--,
        //         "date":--,
        //         "email": --,
        //         "catalog": --,
        //         "exact_location": --
        //     },
        //     {...},
        //     {...}
        // ]
    

        console.log('Content Script ready to go');

        arr = document.querySelectorAll('table.innertbl');

        var user_location_arr = []
        var user_emails_arr = []
        var user_catalogs_arr = []
        
        let asyncFunc = (index)=>{
        
        
            return new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    let text = document.getElementById('left-name_ibx').innerText;
        
                    let user_location
                    let emails
                    let catalogs
            
                    if (!document.getElementById('recv_address')  ||  document.getElementById('recv_address').innerText.length == 0) {
                        user_location = 'No Exact Location Provided';
                    }
                    else {
                        user_location = document.querySelector('#recv_address span').innerText;
                    }
            
                    if (!document.querySelector('.cdtlbrdr.c666.linrem')  ||  document.querySelector('.cdtlbrdr.c666.linrem').innerText.length == 0) {
                        emails = ['No Email Provided'];
                        catalogs = ['No Catalog Provided'];
                    }
                    else { 
                        
                        // https://www.indiamart.com/iguard-solution/
                        // https://www.indiamart.com/iguard-solution/
                        let email_and_or_catalog = document.querySelector('.cdtlbrdr.c666.linrem').innerText;
                        
                        emails_regex = /\S+[a-z0-9]@[a-z0-9\.]+/img
                        emails = ['no Email Provided']
                        if ( emails_regex.test(email_and_or_catalog)) {
                            emails = email_and_or_catalog.match(emails_regex)
                        }
        
                        catalog_regex = /https?:\/\/www\.indiamart\.com\/.+/img
                        catalogs = ['No Catalogs Provided'];
                        if ( catalog_regex.test(email_and_or_catalog) ) {
                            catalogs = email_and_or_catalog.match(catalog_regex)
                        }
                    }
                    
                    user_location_arr.push(user_location)
                    user_emails_arr.push(emails)
                    user_catalogs_arr.push(catalogs)
                    
                    resolve('On this page I found...'+text +"\n" +user_location + '\n'+emails+'\n'+catalogs);
                },1000)
            })
        
        }
        
        async function LoopAsync() {
        
            let index = 0
            for (const elm of arr) {
                arr[index].click();
        
        
                await asyncFunc(index)
        
                .catch((err)=>{
                    console.error(err);
                });
        
                await document.querySelector('span#detail_back_btn').click()
                index += 1;
            }

            var final_message = []
        
            for (let index = 0; index < sender_org.length; index++) {
                
                let temp = {};
                temp["requirements"] = requirements[index];
                temp["sender_name"] = sender_name[index];
                temp["sender_number"] = sender_number[index];
                temp["sender_org"] = sender_org[index];
                temp["location"] = location_data[index];
                temp["date"] = date_data[index];
                temp["email"] = user_emails_arr[index].join(' , ');
                temp["catalog"] = user_catalogs_arr[index].join(' , ');
                temp["exact_loaction"] = user_location_arr[index]
            
                final_message.push(temp);      
            }

            return(final_message)
        }

        LoopAsync()

        .then((final_message)=>{

            let today = new Date();
            let months = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , ' November' , ' December']

            today_day = today.getDate() + ' ' + months[today.getMonth()];


            let wb = XLSX.utils.book_new();
            wb.Props = {
                Title: today_day,
                Subject: "T2E",
                Author: "T2E",
                CreatedDate: today
            };
            wb.SheetNames.push("Test Sheet");

            let ws_data = final_message ; 
            let ws = XLSX.utils.json_to_sheet(ws_data);
            wb.Sheets["Test Sheet"] = ws;
            let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            function s2ab(s) { 
                var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
                var view = new Uint8Array(buf);  //create uint8array as viewer
                for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
                return buf;    
            }

            let file = new File([s2ab(wbout)], "test.xlsx");

            const url = URL.createObjectURL(file);            
            const a = document.createElement('a');
            a.href = url;   
            a.download = today_day+'.xlsx';
        
            const clickHandler = () => {
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    this.removeEventListener('click', clickHandler);
                }, 150);
            };
        
            a.addEventListener('click', clickHandler, false);
        
            a.click();
            return a;
        })
    }
})