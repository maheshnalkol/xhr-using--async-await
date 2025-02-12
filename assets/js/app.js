const BASE_URL=`https://xhr-crud-default-rtdb.firebaseio.com/`
const POST_URL=`${BASE_URL}/posts.json`

//form and buttons
const postForm=document.getElementById("postForm")
const addPostbtn=document.getElementById("addPostbtn")
const updatePostbtn=document.getElementById("updatePostbtn")
const reset=document.getElementById("reset")

// controls
const titleControl=document.getElementById("title")
const contentControl=document.getElementById("content")
const userIDControl=document.getElementById("userID")


// show on ui
const showData=document.getElementById("showData");
const loader=document.getElementById("loader")

const snackBar=(msg,icon)=>{
    Swal.fire({
        title:msg,
        timer:1500,
        icon:icon
    })
}

const onReset=()=>{
    postForm.reset()
    addPostbtn.classList.remove("d-none")
    updatePostbtn.classList.add("d-none")
}

reset.addEventListener("click",onReset)

const makeApiCall=(method,apiURL,data)=>{
    return new Promise((resolve,reject)=>{
        let xhr=new XMLHttpRequest();
        xhr.open(method,apiURL)
        xhr.send(data?JSON.stringify(data):null)
        xhr.onload=()=>{
            if(xhr.status >=200 && xhr.status <=299){
                let data=JSON.parse(xhr.response)
                resolve(data)
            }else{
                reject(`found error ${xhr.statusText}`)
            }
        }
    })
}
const templating=(arr)=>{
    let result=``;
    arr.forEach(ele => {
        result+=`<div class="col-md-4 mb-2" id="${ele.id}">
                <div class="card h-100">
                    <div class="card-header">${ele.title}</div>
                    <div class="card-body">${ele.content}</div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div>
            </div>`
        
    });
    showData.innerHTML=result;
}

const createCard=(obj,res)=>{
    let card=document.createElement("div")
    card.className="col-md-4 mb-2"
    card.id=res.name,
    card.innerHTML=`<div class="card h-100">
                    <div class="card-header">${obj.title}</div>
                    <div class="card-body">${obj.content}</div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary"onclick="onEdit{this}">Edit</button>
                        <button class="btn btn-danger"onclick="onRemove{this}">Remove</button>
                    </div>
                </div>`
    showData.append(card)
}

const objToArr=(obj)=>{
    let arr=[];
    for (const key in obj) {
        
        arr.push({...obj[key],id:key})            
        }
    return arr
}



const fectchAllData=async()=>{
    loader.classList.remove("d-none")
    try{
        let res=await makeApiCall("GET",POST_URL)
        // console.log(res);
        let data=objToArr(res);
        templating(data)
    }
    catch(err){
        console.log(err);
        
    }
    finally{
loader.classList.add('d-none')
    }
}
fectchAllData()

const onEdit=async(ele)=>{
    let editID=ele.closest(".col-md-4").id;
    localStorage.setItem("editID",editID)
    let EDIT_URL=`${BASE_URL}/posts/${editID}.json`
    try{
        let res= await makeApiCall("GET",EDIT_URL)
        titleControl.value=res.title,
        contentControl.value=res.content,
        userIDControl.value=res.userID
        addPostbtn.classList.add("d-none")
        updatePostbtn.classList.remove("d-none")
    }
    catch(err){
        console.log(err);
        snackBar(err,"error")
    }
    finally{
    }
}


const onUpdate=async(ele)=>{
loader.classList.remove("d-none")
let updateID=localStorage.getItem("editID")
console.log(updateID);

let UPDATE_URL=`${BASE_URL}/posts/${updateID}.json`
let updatedObj={
    title:titleControl.value,
    content:contentControl.value,
    userID:userIDControl.value
}
try{
    let res=await makeApiCall("PATCH",UPDATE_URL,updatedObj)
    let cardChild=document.getElementById(updateID)
    cardChild.innerHTML=`<div class="card h-100">
                    <div class="card-header">${res.title}</div>
                    <div class="card-body">${res.content}</div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary"onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-danger"onclick="onRemove(this)">Remove</button>
                    </div>
                </div>`
                postForm.reset();

         onReset();
         snackBar("Post Updated Successfully","success")
            
}
catch(err){
    console.log(err);
    snackBar(err,"error")
}
finally{
    loader.classList.add("d-none")
}
}
updatePostbtn.addEventListener("click",onUpdate)




const onRemove=async(ele)=>{
    let removeID=ele.closest(".col-md-4").id;
    let REMOVE_URL=`${BASE_URL}/posts/${removeID}.json`

    try{
        let result=await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          })

        if (result.isConfirmed) {
        await makeApiCall("DELETE",REMOVE_URL)
        document.getElementById(removeID).remove()
        snackBar("Post Removed Successfully","success")     
    }
    }
    catch(err){
        console.log(err);
        
    }
}



const onPostSubmit=async(eve)=>{
    eve.preventDefault();
    let newObj={
        title:titleControl.value,
        content:contentControl.value,
        userID:userIDControl.value
    }
   postForm.reset()
    loader.classList.remove("d-none")
    try{
        let res=await makeApiCall("POST",POST_URL,newObj)
        createCard(newObj,res)
        snackBar("Post Added Successfully","success")
        postForm.reset()

    }
    catch(err){
        console.log(err);
        snackBar(err,"error")
        
    }
    finally{
        loader.classList.add("d-none")
    }

}

postForm.addEventListener("submit", onPostSubmit)




