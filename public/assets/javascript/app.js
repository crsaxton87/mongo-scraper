// Set clicked nav option to active
$(".navbar-nav li").click(function() {
    $(".navbar-nav li").removeClass("active");
    $(this).addClass("active");
});

// Save Note
$(".saveNote").on("click", function() {
    let id = $(this).attr("data-id");
    if (!$("#noteText" + id).val()) {
        alert("Please enter text to save a note.")
    }else {
      $.ajax({
            method: "POST",
            url: "/articles/" + id,
            data: {
              title: $(this).attr("data-title"),
              body: $("#noteText" + id).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              $(".modal").modal("hide");
            //   window.location = "/saved";
              location.reload();
          });
    }
});

// Delete Note
$(".deleteNote").on("click", function() {
    let NoteId = $(this).attr("data-note-id");
    let ArtId = $(this).attr("data-article-id");
    console.log(`NOTEID ${NoteId} ARTID ${ArtId}`);
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + ArtId + "/" + NoteId
    }).done(function(data) {
        console.log(data);
        $("#noteText" + ArtId).text('');
        $(".modal").modal("hide");
        window.location = "/saved";
    });
});

// Save / Unsave Article
$(".status").on("click", function() {
    let id = $(this).val();
    console.log(`ARTICLE ID ${id}`);
    console.log($(this).attr("data-saved"));
    $.ajax({
        method: "POST",
        url: "/save/" + id,
    }).done(function(){
        if ($(this).attr("data-saved") === "unsaved") {
            window.location = "/saved";
        }
        else {
            window.location = "/";
        }
    });
}); 

// Handle scrape click
// $("#scrape-new").on("click", function() {
//     $.ajax({
//         method: "GET",
//         url: "/scrape",
//     }).done(function(data) {
//         console.log(data)
//         // alert(`Added ${data.added} articles`);
//         // window.location = "/";
//         bootbox.alert({
//             message: `Scraped ${data.added} articles!`,
//             backdrop: true,
//             buttons: {
//                 ok: {
//                     label: 'OK <i class="fa fa-check"></i>',
//                     callback: function(){
//                         location.reload();
//                     }
//                 }
//             }
//         });

//     });
// });


$("#scrape-new").on("click", function(e) {
    e.preventDefault();
    $.ajax({
        method: "GET",
        url: "/scrape",
        success: function (response) {
            let added = response.added;
            console.log(response);
            bootbox.alert({
                message: `Scraped ${added} articles!`,
                backdrop: true,
                buttons: {
                    ok: {
                        label: 'OK <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>',
                        callback: function(){
                            window.location = "/";
                        }
                    }
                }
            });
        }
    });
});


